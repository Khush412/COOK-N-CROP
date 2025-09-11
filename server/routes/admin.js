const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
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

// @desc    Export users to CSV
// @route   GET /api/admin/users/export
// @access  Private/Admin
router.get('/users/export', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password -__v').lean();

    const fields = [
      { label: 'User ID', value: '_id' },
      { label: 'Username', value: 'username' },
      { label: 'Email', value: 'email' },
      { label: 'Role', value: 'role' },
      { label: 'Is Active', value: 'isActive' },
      { label: 'Is Email Verified', value: 'isEmailVerified' },
      { label: 'Joined Date', value: 'createdAt' },
      { label: 'Last Login', value: 'lastLogin' },
      { label: 'Login Count', value: 'loginCount' },
      { label: 'Subscription Plan', value: 'subscription.plan' },
      { label: 'Subscription Active', value: 'subscription.isActive' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(users);

    res.header('Content-Type', 'text/csv');
    res.attachment('users-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;