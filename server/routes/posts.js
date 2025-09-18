const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Import User model
const multer = require('multer');
const path = require('path');

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads/recipes'); // Corrected path for recipe images
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
}

const upload = multer({ storage, fileFilter: function(req, file, cb) { checkFileType(file, cb); } });

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, content, tags, isRecipe, recipeDetails, taggedProducts } = req.body;

    const postData = {
      user: req.user.id,
      title,
      content,
      image: req.file ? `/uploads/recipes/${req.file.filename}` : null,
      tags,
      isRecipe,
      taggedProducts: isRecipe ? taggedProducts : [],
    };

    if (isRecipe && recipeDetails) { // recipeDetails is now a stringified JSON
      let parsedDetails;
      try {
        parsedDetails = JSON.parse(recipeDetails);
      } catch (e) { return res.status(400).json({ message: 'Invalid recipe details format.' }); }

      const parseNumericDetail = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };
      postData.recipeDetails = {
        ...parsedDetails,
        prepTime: parseNumericDetail(parsedDetails.prepTime),
        cookTime: parseNumericDetail(parsedDetails.cookTime),
        servings: parseNumericDetail(parsedDetails.servings),
      };
    }

    const newPost = new Post(postData);
    const post = await newPost.save();
    const populatedPost = await Post.findById(post._id).populate('user', 'username profilePic');

    // Emit real-time event to admins
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('new_activity', {
        type: 'post',
        id: populatedPost._id,
        title: `New post by ${populatedPost.user.username}: "${populatedPost.title}"`,
        timestamp: populatedPost.createdAt
      });
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { sort = 'new', page = 1, limit = 9, isRecipe, search, tags, maxPrepTime, minServings } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [];
    const matchConditions = {};

    // Exclude posts from users that the current user has blocked
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('blockedUsers');
      matchConditions.user = { $nin: currentUser.blockedUsers };
    }

    if (isRecipe === 'true') {
      matchConditions.isRecipe = true;
    } else if (isRecipe === 'false') {
      matchConditions.isRecipe = false;
    }

    if (search) {
      matchConditions.$text = { $search: search };
    }

    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagsArray.length > 0) {
        matchConditions.tags = { $in: tagsArray };
      }
    }

    if (maxPrepTime) {
      matchConditions['recipeDetails.prepTime'] = { $lte: Number(maxPrepTime) };
    }
    if (minServings) {
      matchConditions['recipeDetails.servings'] = { $gte: Number(minServings) };
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add sorting stages
    if (sort === 'relevance' && search) {
      pipeline.push({ $sort: { score: { $meta: 'textScore' } } });
    } else if (sort === 'top') {
      pipeline.push({ $addFields: { sortScore: { $size: { $ifNull: ['$upvotes', []] } } } });
      pipeline.push({ $sort: { isFeatured: -1, sortScore: -1, createdAt: -1 } });
    } else if (sort === 'discussed') {
      pipeline.push({ $addFields: { sortScore: { $size: { $ifNull: ['$comments', []] } } } });
      pipeline.push({ $sort: { isFeatured: -1, sortScore: -1, createdAt: -1 } });
    } else { // Default to 'new'
      pipeline.push({ $sort: { isFeatured: -1, createdAt: -1 } });
    }

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // Add lookups and final shaping
    pipeline.push({ $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } });
    pipeline.push({ $unwind: '$user' });

    // Final projection stage
    const projectStage = {
      title: 1,
      content: 1,
      image: 1,
      tags: 1,
      isRecipe: 1,
      isFeatured: 1,
      recipeDetails: 1,
      taggedProducts: 1,
      createdAt: 1,
      updatedAt: 1,
      upvotes: 1,
      user: { _id: '$user._id', username: '$user.username', profilePic: '$user.profilePic' },
      upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
      commentCount: { $size: { $ifNull: ['$comments', []] } },
    };

    if (search) {
      projectStage.score = { $meta: 'textScore' };
    }

    pipeline.push({ $project: projectStage });

    // Execute pipeline to get posts and a separate query for the total count
    const posts = await Post.aggregate(pipeline);
    const totalPosts = await Post.countDocuments(matchConditions);

    res.json({ posts, page: pageNum, pages: Math.ceil(totalPosts / limitNum) });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all reported posts (Admin only)
// @route   GET /api/posts/reported
// @access  Private/Admin
router.get('/reported', protect, authorize('admin'), async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('user', 'username')
      .populate('reports.user', 'username');
    res.json(posts);
  } catch (error) {
    console.error('Get reported posts error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get posts from users the current user is following
// @route   GET /api/posts/feed
// @access  Private
router.get('/feed', protect, async (req, res) => { // protect middleware already provides req.user
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const followingIds = req.user.following;

    if (followingIds.length === 0) {
      return res.json({ posts: [], page: 1, pages: 0 });
    }

    // Also exclude blocked users from the feed
    const blockedIds = req.user.blockedUsers || [];

    const posts = await Post.find({ user: { $in: followingIds, $nin: blockedIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'username profilePic');

    const totalPosts = await Post.countDocuments({ user: { $in: followingIds, $nin: blockedIds } });

    res.json({ posts, page: pageNum, pages: Math.ceil(totalPosts / limitNum) });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get trending tags
// @route   GET /api/posts/tags/trending
// @access  Public
router.get('/tags/trending', async (req, res) => {
  try {
    // Get tags from posts in the last 30 days to keep it fresh
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tags = await Post.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, tags: { $ne: null, $not: { $size: 0 } } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, tag: '$_id', count: 1 } }
    ]);
    res.json(tags);
  } catch (error) {
    console.error('Get trending tags error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get shoppable ingredients for a recipe post
// @route   GET /api/posts/:id/shoppable-ingredients
// @access  Public
router.get('/:id/shoppable-ingredients', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isRecipe || !post.recipeDetails?.ingredients) {
      return res.json([]); // Return empty array if not a valid recipe
    }

    const ingredients = post.recipeDetails.ingredients;
    
    // Fetch all product names. This is not super efficient for large DBs,
    // but okay for now. A better approach would use text search indexes.
    const allProducts = await Product.find({ countInStock: { $gt: 0 } }).select('name');

    const shoppableProducts = [];
    const foundProductIds = new Set();

    ingredients.forEach(ingredientLine => {
      const lowerIngredientLine = ingredientLine.toLowerCase();
      for (const product of allProducts) {
        const lowerProductName = product.name.toLowerCase();
        // Simple matching: check if product name is in the ingredient line
        // and we haven't already added this product.
        if (lowerIngredientLine.includes(lowerProductName) && !foundProductIds.has(product._id.toString())) {
          shoppableProducts.push(product);
          foundProductIds.add(product._id.toString());
          break; // Move to next ingredient line once a match is found
        }
      }
    });

    res.json(shoppableProducts);
  } catch (error) {
    console.error('Get shoppable ingredients error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePic')
      .populate({
        path: 'comments',
        match: { parentComment: null }, // Fetch only top-level comments
        options: { sort: { createdAt: 'asc' } },
        // NOTE: This implementation populates one level of replies. For deeper nesting,
        // a recursive function or a different data loading strategy would be needed.
        populate: [
          { path: 'user', select: 'username profilePic' }, // Populate user of top-level comment
          {
            path: 'replies',
            options: { sort: { createdAt: 'asc' } },
            populate: { // Populate user of the reply
              path: 'user',
              select: 'username profilePic',
            },
          },
        ],
      })
      .populate({
        path: 'recipeReviews.user',
        select: 'username profilePic'
      }) // Populate the user for each recipe review
      .populate('taggedProducts', 'name price image countInStock'); // Populate tagged products

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get single post error:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Upvote/unvote a post
// @route   PUT /api/posts/:id/upvote
// @access  Private
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the post has already been upvoted by this user
    const upvotedIndex = post.upvotes.findIndex(
      (userId) => userId.toString() === req.user.id
    );

    if (upvotedIndex > -1) {
      // User has already upvoted, so remove the upvote
      post.upvotes.splice(upvotedIndex, 1);
    } else {
      // User has not upvoted, so add the upvote
      post.upvotes.push(req.user.id);
    }

    await post.save();

    // Create notification, but not if the user is upvoting their own post
    if (post.user.toString() !== req.user.id) {
      // Only create a notification if the user is adding an upvote, not removing it
      if (upvotedIndex === -1) {
        const message = `<strong>${req.user.username}</strong> upvoted your post: "<strong>${post.title}</strong>"`;
        const newNotification = await Notification.create({
          recipient: post.user,
          sender: req.user.id,
          type: 'upvote',
          message: message,
          post: post._id,
        });
        const recipientSocketId = req.onlineUsers[post.user.toString()];
        if (recipientSocketId) {
          const populatedNotification = await Notification.findById(newNotification._id).populate('sender', 'username profilePic').populate('post', 'title');
          req.io.to(recipientSocketId).emit('new_notification', populatedNotification);
        }
      }
    }

    res.json({ upvotes: post.upvotes });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      content: content,
      user: req.user.id,
      post: req.params.id,
      parentComment: parentCommentId || null,
    });

    const savedComment = await newComment.save();

    if (parentCommentId) {
      // It's a reply, add to parent comment's replies
      const parentComment = await Comment.findById(parentCommentId);
      parentComment.replies.push(savedComment._id);
      await parentComment.save();
    } else {
      // It's a top-level comment, add to post's comments
      post.comments.push(savedComment._id);
      await post.save();
    }

    // Create notification for the post author or parent comment author
    const recipientId = parentCommentId ? (await Comment.findById(parentCommentId)).user : post.user;

    // Don't notify if user is replying to their own post/comment
    if (recipientId.toString() !== req.user.id) {
      // Construct the notification message
      let notificationMessage;
      if (parentCommentId) {
        notificationMessage = `<strong>${req.user.username}</strong> replied to your comment.`;
      } else {
        notificationMessage = `<strong>${req.user.username}</strong> commented on your post: "<strong>${post.title}</strong>"`;
      }
      const newNotification = await Notification.create({
        recipient: recipientId,
        sender: req.user.id,
        type: 'comment',
        message: notificationMessage,
        post: post._id,
        comment: savedComment._id,
      });

      const recipientSocketId = req.onlineUsers[recipientId.toString()];
      if (recipientSocketId) {
        const populatedNotification = await Notification.findById(newNotification._id).populate('sender', 'username profilePic').populate('post', 'title');
        req.io.to(recipientSocketId).emit('new_notification', populatedNotification);
      }
    }


    const populatedComment = await Comment.findById(savedComment._id).populate('user', 'username profilePic');
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { title, content, tags, isRecipe, recipeDetails, taggedProducts } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.isRecipe = isRecipe === undefined ? post.isRecipe : isRecipe;
    post.taggedProducts = isRecipe ? taggedProducts : [];

    if (req.file) {
      post.image = `/uploads/recipes/${req.file.filename}`;
    }

    if (isRecipe && recipeDetails) { // recipeDetails is now a stringified JSON
      let parsedDetails;
      try {
        parsedDetails = JSON.parse(recipeDetails);
      } catch (e) { return res.status(400).json({ message: 'Invalid recipe details format.' }); }

      const parseNumericDetail = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };
      post.recipeDetails = {
        ...parsedDetails,
        prepTime: parseNumericDetail(parsedDetails.prepTime),
        cookTime: parseNumericDetail(parsedDetails.cookTime),
        servings: parseNumericDetail(parsedDetails.servings),
      };
    } else if (!isRecipe) {
      post.recipeDetails = undefined;
    }

    post = await post.save();
    
    // Repopulate to send back the full object with user details
    const populatedPost = await Post.findById(post._id)
        .populate('user', 'username profilePic')
        .populate({
            path: 'comments',
            match: { parentComment: null },
            options: { sort: { createdAt: 'asc' } },
            populate: [
                { path: 'user', select: 'username profilePic' },
                {
                    path: 'replies',
                    options: { sort: { createdAt: 'asc' } },
                    populate: { path: 'user', select: 'username profilePic' },
                },
            ],
        });

    res.json(populatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user or admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Also delete all comments associated with the post
    await Comment.deleteMany({ post: req.params.id });

    await post.deleteOne();

    res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Report a post
// @route   PUT /api/posts/:id/report
// @access  Private
router.put('/:id/report', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already reported this post
    const alreadyReported = post.reports.some(report => report.user.toString() === req.user.id);
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    post.reports.push({
      user: req.user.id,
      reason: req.body.reason,
    });

    await post.save();

    res.json({ success: true, message: 'Post reported successfully' });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Feature/unfeature a post
// @route   PUT /api/posts/:id/feature
// @access  Private/Admin
router.put('/:id/feature', protect, authorize('admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isFeatured = !post.isFeatured;
    await post.save();

    res.json({
      success: true,
      message: `Post ${post.isFeatured ? 'featured' : 'unfeatured'} successfully.`,
      isFeatured: post.isFeatured
    });
  } catch (error) {
    console.error('Feature post error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a new recipe review
// @route   POST /api/posts/:id/recipe-reviews
// @access  Private
router.post('/:id/recipe-reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.isRecipe) {
      return res.status(400).json({ message: 'This post is not a recipe and cannot be reviewed.' });
    }

    const alreadyReviewed = post.recipeReviews.find(
      (r) => r.user.toString() === req.user.id.toString()
    );

    // Sanitize existing bad data if present, to allow saving.
    if (post.isRecipe && post.recipeDetails) {
      const parseNumericDetail = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };
      post.recipeDetails.prepTime = parseNumericDetail(post.recipeDetails.prepTime);
      post.recipeDetails.cookTime = parseNumericDetail(post.recipeDetails.cookTime);
      post.recipeDetails.servings = parseNumericDetail(post.recipeDetails.servings);
    }

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this recipe' });
    }

    const review = { name: req.user.username, rating: Number(rating), comment, user: req.user._id };

    post.recipeReviews.push(review);
    post.numRecipeReviews = post.recipeReviews.length;
    post.recipeRating = post.recipeReviews.reduce((acc, item) => item.rating + acc, 0) / post.recipeReviews.length;

    await post.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Create recipe review error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
