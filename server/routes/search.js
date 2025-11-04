const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Product = require('../models/Product');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

// Helper function to get the first image URL for a product
const getProductImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return null;
};

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
      $or: [{ title: searchRegex }, { tags: searchRegex }, { hashtags: searchRegex }, { content: searchRegex }],
    };
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('blockedUsers');
      postMatchQuery.user = { $nin: currentUser.blockedUsers };
    }

    const postsPromise = Post.find(postMatchQuery)
      .limit(limit)
      .populate('user', 'username profilePic')
      .select('title content user tags hashtags upvoteCount commentCount createdAt isFeatured')
      .lean();

    const productsPromise = Product.find({
      $or: [{ name: searchRegex }, { category: searchRegex }, { description: searchRegex }],
    })
      .limit(limit)
      .select('name images price rating numReviews _id countInStock') // Updated to use images instead of image
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

    // Process products to ensure they have proper image data
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images || []
    }));

    res.json({ posts, products: processedProducts, users });
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

    // Check if this is a hashtag search (starts with #)
    const isHashtagSearch = q.startsWith('#');
    const cleanQuery = isHashtagSearch ? q.substring(1) : q;

    let postMatchQuery;
    if (isHashtagSearch) {
      // For hashtag searches, look in both tags and hashtags fields
      postMatchQuery = {
        $or: [
          { tags: cleanQuery },
          { hashtags: cleanQuery }
        ]
      };
    } else {
      // For regular text searches, use text index
      postMatchQuery = { $text: { $search: q } };
    }

    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('blockedUsers');
      postMatchQuery.user = { $nin: currentUser.blockedUsers };
    }

    const countPromise = Post.countDocuments(postMatchQuery);
    
    const postsPromise = Post.find(postMatchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'username profilePic')
      .populate('group', 'name slug')
      .select('title content user tags hashtags isRecipe isFeatured flair group createdAt upvotes comments')
      .lean();

    const [totalPosts, posts] = await Promise.all([countPromise, postsPromise]);

    res.json({ posts, page: pageNum, pages: Math.ceil(totalPosts / limitNum) });
  } catch (error) {
    console.error('Search posts error:', error);
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

    const productMatchQuery = { $text: { $search: q } };

    const countPromise = Product.countDocuments(productMatchQuery);
    
    const productsPromise = Product.find(productMatchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('name images price rating numReviews _id countInStock') // Updated to use images instead of image
      .lean();

    const [totalProducts, products] = await Promise.all([countPromise, productsPromise]);

    // Process products to ensure they have proper image data
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images || []
    }));

    res.json({ products: processedProducts, page: pageNum, pages: Math.ceil(totalProducts / limitNum) });
  } catch (error) {
    console.error('Search products error:', error);
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

    const userMatchQuery = { 
      username: { $regex: q, $options: 'i' },
      isActive: true
    };

    const countPromise = User.countDocuments(userMatchQuery);
    
    const usersPromise = User.find(userMatchQuery)
      .sort({ followers: -1 }) // Sort by most followers first
      .skip(skip)
      .limit(limitNum)
      .select('username profilePic bio followers')
      .lean();

    const [totalUsers, users] = await Promise.all([countPromise, usersPromise]);

    res.json({ users, page: pageNum, pages: Math.ceil(totalUsers / limitNum) });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Search posts by hashtag
// @route   GET /api/search/hashtag/:hashtag
// @access  Public
router.get('/hashtag/:hashtag', optionalAuth, async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 9 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Create match query for posts with the specified hashtag
    const postMatchQuery = {
      $or: [
        { tags: hashtag },
        { hashtags: hashtag }
      ]
    };

    // Exclude blocked users if logged in
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('blockedUsers');
      postMatchQuery.user = { $nin: currentUser.blockedUsers };
    }

    const countPromise = Post.countDocuments(postMatchQuery);
    
    const postsPromise = Post.find(postMatchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'username profilePic')
      .populate('group', 'name slug')
      .select('title content user tags hashtags isRecipe isFeatured flair group createdAt upvotes comments')
      .lean();

    const [totalPosts, posts] = await Promise.all([countPromise, postsPromise]);

    res.json({ posts, page: pageNum, pages: Math.ceil(totalPosts / limitNum), total: totalPosts });
  } catch (error) {
    console.error('Search hashtag error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get trending hashtags
// @route   GET /api/search/trending-hashtags
// @access  Public
router.get('/trending-hashtags', async (req, res) => {
  try {
    // Get trending hashtags from posts in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const hashtags = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, hashtags: { $ne: null, $not: { $size: 0 } } } }, // Keep the date filter
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, tag: '$_id', count: 1 } }
    ]);
    
    res.json(hashtags);
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;