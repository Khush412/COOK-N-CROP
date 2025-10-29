const User = require('../models/User');
const Order = require('../models/Order');

// Calculate Harvest Coins based on order total and user tier
const calculateHarvestCoins = (orderTotal, userTier) => {
  // Harvest Coins percentage based on tier:
  // Bronze: 3%
  // Silver: 5%
  // Gold: 8%
  let percentage = 3; // Default bronze tier
  if (userTier === 'silver') {
    percentage = 5;
  } else if (userTier === 'gold') {
    percentage = 8;
  }
  
  return Math.floor(orderTotal * (percentage / 100));
};

// Determine user tier based on spending and order count
const getUserTier = async (userId) => {
  try {
    // Get user's order history
    const userOrders = await Order.find({ 
      user: userId, 
      status: 'Delivered' 
    });

    // Calculate user's total spending
    const totalSpent = userOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Calculate user's order count
    const orderCount = userOrders.length;

    // Determine user tier based on new requirements:
    // Silver: ₹2000+ spent OR 5+ orders
    // Gold: ₹8000+ spent OR 10+ orders
    let userTier = 'bronze';
    if (totalSpent >= 8000 || orderCount >= 10) {
      userTier = 'gold';
    } else if (totalSpent >= 2000 || orderCount >= 5) {
      userTier = 'silver';
    }
    
    return userTier;
  } catch (error) {
    console.error('Error determining user tier:', error);
    return 'bronze'; // Default to bronze on error
  }
};

// Award Harvest Coins to user after order completion
const awardHarvestCoins = async (userId, orderTotal) => {
  try {
    // Get user's tier
    const userTier = await getUserTier(userId);
    
    // Calculate coins to award based on tier
    const coinsToAward = calculateHarvestCoins(orderTotal, userTier);
    
    // Update user's Harvest Coins balance
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove the 10 orders enrollment requirement - all users can earn Harvest Coins
    user.activity.harvestCoins += coinsToAward;
    user.activity.totalSpent += orderTotal;
    user.activity.totalOrders += 1;
    
    await user.save();
    
    return {
      success: true,
      coinsAwarded: coinsToAward,
      newBalance: user.activity.harvestCoins,
      userTier: userTier
    };
  } catch (error) {
    console.error('Error awarding Harvest Coins:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Redeem Harvest Coins for discount
const redeemHarvestCoins = async (userId, coinsToRedeem, orderValue) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user has enough coins
    if (user.activity.harvestCoins < coinsToRedeem) {
      throw new Error('Insufficient Harvest Coins');
    }
    
    // Conversion rate: 200 coins = ₹100 discount
    const discountValue = (coinsToRedeem / 200) * 100;
    
    // Maximum discount is 5% of order value
    const maxDiscount = orderValue * 0.05;
    
    // If discount exceeds maximum, adjust coins to redeem
    if (discountValue > maxDiscount) {
      throw new Error('Discount exceeds maximum allowed (5% of order value)');
    }
    
    // Update user's Harvest Coins balance
    user.activity.harvestCoins -= coinsToRedeem;
    await user.save();
    
    return {
      success: true,
      discountValue: discountValue,
      coinsRemaining: user.activity.harvestCoins
    };
  } catch (error) {
    console.error('Error redeeming Harvest Coins:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's Harvest Coins balance
const getHarvestCoinsBalance = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get user's tier
    const userTier = await getUserTier(userId);
    
    // Calculate Harvest Coins percentage based on tier
    let harvestCoinsPercentage = 3; // Default bronze tier
    if (userTier === 'silver') {
      harvestCoinsPercentage = 5;
    } else if (userTier === 'gold') {
      harvestCoinsPercentage = 8;
    }
    
    return {
      success: true,
      balance: user.activity.harvestCoins,
      totalSpent: user.activity.totalSpent,
      totalOrders: user.activity.totalOrders,
      tier: userTier,
      harvestCoinsPercentage: harvestCoinsPercentage
    };
  } catch (error) {
    console.error('Error getting Harvest Coins balance:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  calculateHarvestCoins,
  getUserTier,
  awardHarvestCoins,
  redeemHarvestCoins,
  getHarvestCoinsBalance
};