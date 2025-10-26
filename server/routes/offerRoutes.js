const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @desc    Get personalized offers for current user
// @route   GET /api/offers/personalized
// @access  Private
router.get('/personalized', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's order history
    const userOrders = await Order.find({ 
      user: userId, 
      status: 'Delivered' 
    });

    // Get user data
    const user = await User.findById(userId);

    // Calculate user's total spending
    const totalSpent = userOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Calculate user's order frequency (orders per month)
    const orderCount = userOrders.length;
    const firstOrderDate = userOrders.length > 0 ? new Date(userOrders[userOrders.length - 1].createdAt) : new Date();
    const monthsSinceFirstOrder = Math.max(1, (new Date() - firstOrderDate) / (1000 * 60 * 60 * 24 * 30));
    const orderFrequency = orderCount / monthsSinceFirstOrder;

    // Determine user tier based on spending and frequency
    let userTier = 'bronze';
    if (totalSpent > 5000 || orderFrequency > 3) {
      userTier = 'gold';
    } else if (totalSpent > 2000 || orderFrequency > 2) {
      userTier = 'silver';
    }

    // Get all active coupons
    const allCoupons = await Coupon.find({ 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    // Filter coupons based on user tier and other criteria
    const personalizedCoupons = allCoupons.filter(coupon => {
      // For gold tier users, show all coupons
      if (userTier === 'gold') return true;
      
      // For silver tier users, exclude high-value coupons
      if (userTier === 'silver') {
        if (coupon.discountType === 'percentage' && coupon.discountValue > 25) return false;
        if (coupon.discountType === 'fixed' && coupon.discountValue > 500) return false;
      }
      
      // For bronze tier users, only show moderate coupons
      if (userTier === 'bronze') {
        if (coupon.discountType === 'percentage' && coupon.discountValue > 15) return false;
        if (coupon.discountType === 'fixed' && coupon.discountValue > 300) return false;
      }
      
      return true;
    });

    // Sort by relevance (higher value first, but not too high for lower tiers)
    personalizedCoupons.sort((a, b) => {
      const getValue = (coupon) => {
        if (coupon.discountType === 'percentage') return coupon.discountValue;
        return coupon.discountValue / 100; // Normalize fixed discounts
      };
      return getValue(b) - getValue(a);
    });

    // Limit to top 5 personalized coupons
    const topCoupons = personalizedCoupons.slice(0, 5);

    res.status(200).json({ 
      success: true, 
      data: {
        coupons: topCoupons,
        userTier,
        totalSpent,
        orderCount
      }
    });
  } catch (error) {
    console.error('Get personalized offers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get dynamic pricing for a product based on user behavior
// @route   GET /api/offers/dynamic-pricing/:productId
// @access  Private
router.get('/dynamic-pricing/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    // Get user's order history
    const userOrders = await Order.find({ 
      user: userId, 
      status: 'Delivered',
      'orderItems.product': productId
    });

    // Get all orders with this product to determine popularity
    const allProductOrders = await Order.find({
      status: 'Delivered',
      'orderItems.product': productId
    });

    // Calculate base price (this would typically come from the Product model)
    // For now, we'll simulate this
    const basePrice = 1000; // This should come from the actual product
    
    // Calculate dynamic price based on user loyalty and product popularity
    let dynamicPrice = basePrice;
    
    // Loyalty discount (repeat customers get better prices)
    if (userOrders.length > 0) {
      const loyaltyDiscount = Math.min(10, userOrders.length * 2); // Max 10% discount
      dynamicPrice = basePrice * (1 - loyaltyDiscount / 100);
    }
    
    // Popularity adjustment (popular products might have higher prices)
    const popularityFactor = Math.min(1.2, 1 + (allProductOrders.length / 1000));
    dynamicPrice = dynamicPrice * popularityFactor;
    
    // Round to nearest 10
    dynamicPrice = Math.round(dynamicPrice / 10) * 10;

    res.status(200).json({ 
      success: true, 
      data: {
        basePrice,
        dynamicPrice,
        userOrdersCount: userOrders.length,
        productPopularity: allProductOrders.length
      }
    });
  } catch (error) {
    console.error('Get dynamic pricing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;