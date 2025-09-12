const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Post = require('../models/Post');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $nin: ['Pending', 'Canceled'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

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

    // Get sales data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $nin: ['Pending', 'Canceled'] }
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedSales = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const found = salesData.find(item => item._id === dateString);
      formattedSales.push({ date: dateString, sales: found ? found.sales : 0 });
    }

    // Get user role distribution
    const userRoleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $match: { status: { $nin: ['Pending', 'Canceled'] } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalQuantitySold: { $sum: '$orderItems.qty' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          name: '$productDetails.name',
          totalQuantitySold: 1,
          _id: 0
        }
      }
    ]);

    // Get top customers by spending
    const topCustomers = await Order.aggregate([
      { $match: { status: { $in: ['Delivered', 'Shipped', 'Processing'] } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          username: '$userDetails.username',
          totalSpent: 1,
          orderCount: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalPosts,
        totalOrders,
        totalRevenue,
        userSignups: formattedSignups,
        salesData: formattedSales,
        userRoleDistribution,
        topSellingProducts,
        topCustomers,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Send a broadcast message to all users
// @route   POST /api/admin/broadcast
// @access  Private/Admin
router.post('/broadcast', protect, authorize('admin'), async (req, res) => {
  try {
    const { message, link } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const users = await User.find({ isActive: true }).select('_id');
    const userIds = users.map(user => user._id);

    const notificationsToInsert = userIds.map(userId => {
      const notification = {
        recipient: userId,
        sender: req.user.id, // Add the admin as the sender
        type: 'broadcast',
        message,
      };
      if (link) notification.link = link; // Only add link if it's not an empty string
      return notification;
    });

    if (notificationsToInsert.length > 0) {
      await Notification.insertMany(notificationsToInsert);
    }

    // Emit a global event to all connected clients to notify them of the broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('broadcast_received', { message });
    }

    res.status(200).json({ success: true, message: `Broadcast sent to ${userIds.length} users.` });
  } catch (error) {
    console.error('Broadcast message error:', error);
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