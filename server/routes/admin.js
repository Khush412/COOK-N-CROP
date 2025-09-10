const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Post = require('../models/Post');
const Order = require('../models/Order');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Get user signups for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userSignups = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format data for the chart
    const formattedSignups = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const found = userSignups.find(item => item._id === dateString);
      formattedSignups.push({
        date: dateString,
        count: found ? found.count : 0,
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalPosts,
        totalOrders,
        userSignups: formattedSignups,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;