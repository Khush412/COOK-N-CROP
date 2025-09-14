const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Product = require('../models/Product');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

// @desc    Global search for posts, products, and users
// @route   GET /api/search
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.json({ posts: [], products: [], users: [] });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const limit = 5; // Limit for initial "All" results view

    // Base query for posts, excluding blocked users if logged in
    const postMatchQuery = {
      $or: [{ title: searchRegex }, { tags: searchRegex }, { content: searchRegex }],
    };
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('blockedUsers');
      postMatchQuery.user = { $nin: currentUser.blockedUsers };
    }

    const postsPromise = Post.find(postMatchQuery)
      .limit(limit)
      .populate('user', 'username profilePic')
      .select('title content user tags upvoteCount commentCount createdAt isFeatured')
      .lean();

    const productsPromise = Product.find({
      $or: [{ name: searchRegex }, { category: searchRegex }, { description: searchRegex }],
    })
      .limit(limit)
      .select('name price image rating numReviews _id countInStock')
      .lean();

    const usersPromise = User.find({
      username: searchRegex,
      isActive: true, // Only find active users
    })
      .limit(limit)
      .select('username profilePic bio followers')
      .lean();

    const [posts, products, users] = await Promise.all([
      postsPromise,
      productsPromise,
      usersPromise,
    ]);

    res.json({ posts, products, users });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Paginated search for posts
// @route   GET /api/search/posts
// @access  Public
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { q = '', page = 1, limit = 9 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const postMatchQuery = { $text: { $search: q } };
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('blockedUsers');
      postMatchQuery.user = { $nin: currentUser.blockedUsers };
    }

    const posts = await Post.find(postMatchQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limitNum)
      .skip(skip)
      .populate('user', 'username profilePic')
      .select('title content user tags upvoteCount commentCount createdAt isFeatured')
      .lean();

    const totalPosts = await Post.countDocuments(postMatchQuery);

    res.json({ posts, page: pageNum, pages: Math.ceil(totalPosts / limitNum) });
  } catch (error) {
    console.error('Paginated post search error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Paginated search for products
// @route   GET /api/search/products
// @access  Public
router.get('/products', async (req, res) => {
  try {
    const { q = '', page = 1, limit = 12 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const productMatchQuery = { $or: [{ name: { $regex: q, $options: 'i' } }, { category: { $regex: q, $options: 'i' } }] };

    const products = await Product.find(productMatchQuery)
      .limit(limitNum)
      .skip(skip)
      .lean();

    const totalProducts = await Product.countDocuments(productMatchQuery);

    res.json({ products, page: pageNum, pages: Math.ceil(totalProducts / limitNum) });
  } catch (error) {
    console.error('Paginated product search error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Paginated search for users
// @route   GET /api/search/users
// @access  Public
router.get('/users', async (req, res) => {
  try {
    const { q = '', page = 1, limit = 12 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const userMatchQuery = { username: { $regex: q, $options: 'i' }, isActive: true };

    const users = await User.find(userMatchQuery)
      .limit(limitNum)
      .skip(skip)
      .select('username profilePic bio followers')
      .lean();

    const totalUsers = await User.countDocuments(userMatchQuery);

    res.json({ users, page: pageNum, pages: Math.ceil(totalUsers / limitNum) });
  } catch (error) {
    console.error('Paginated user search error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;