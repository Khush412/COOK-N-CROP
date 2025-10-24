const User = require('../models/User');
const Order = require('../models/Order');

// Calculate Harvest Coins based on order total (2% of order value)
const calculateHarvestCoins = (orderTotal) => {
  return Math.floor(orderTotal * 0.02);
};

// Award Harvest Coins to user after order completion
const awardHarvestCoins = async (userId, orderTotal) => {
  try {
    const coinsToAward = calculateHarvestCoins(orderTotal);
    
    // Update user's Harvest Coins balance
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Admins can also earn Harvest Coins (no enrollment requirement)
    user.activity.harvestCoins += coinsToAward;
    user.activity.totalSpent += orderTotal;
    user.activity.totalOrders += 1;
    
    await user.save();
    
    return {
      success: true,
      coinsAwarded: coinsToAward,
      newBalance: user.activity.harvestCoins
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
    
    return {
      success: true,
      balance: user.activity.harvestCoins,
      totalSpent: user.activity.totalSpent,
      totalOrders: user.activity.totalOrders
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
  awardHarvestCoins,
  redeemHarvestCoins,
  getHarvestCoinsBalance
};