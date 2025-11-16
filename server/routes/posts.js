const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { reportValidation, validate } = require('../middleware/validation');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Import User model
const Group = require('../models/Group'); // Import Group model
const { extractMentions, extractHashtags, validateMentions } = require('../utils/textParser');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Rate limiter for file uploads - stricter than general API
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 100, // 20 uploads per 15 min in production
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.'
  }
});

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
  const filetypes = /jpg|jpeg|png|gif|mp4|mov|avi|mkv|webm|ogg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function(req, file, cb) { checkFileType(file, cb); },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit per file
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
router.post('/', protect, uploadLimiter, upload.array('media', 10), async (req, res) => {
  try {
    const { title, content, tags, isRecipe, recipeDetails, taggedProducts, group, flair } = req.body;

    const mediaFiles = req.files ? req.files.map(file => ({
      url: `/uploads/recipes/${file.filename}`,
      mediaType: file.mimetype.startsWith('image') ? 'image' : 'video',
    })) : [];
    if (!group) return res.status(400).json({ message: 'A group must be selected to create a post.' });

    // Extract mentions and hashtags from title and content
    const combinedText = `${title} ${content}`;
    const mentionedUsernames = extractMentions(combinedText);
    const hashtags = extractHashtags(combinedText);
    
    // Validate mentions (get user IDs)
    const mentionedUserIds = await validateMentions(mentionedUsernames);

    const postData = {
      user: req.user.id,
      title,
      content,
      media: mediaFiles,
      tags,
      hashtags,
      mentions: mentionedUserIds,
      isRecipe,
      taggedProducts: isRecipe ? taggedProducts : [],
      flair,
      group,
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

    // Create notifications for mentioned users
    if (mentionedUserIds.length > 0) {
      const notificationsToCreate = mentionedUserIds
        .filter(userId => userId.toString() !== req.user.id) // Don't notify yourself
        .map(userId => ({
          recipient: userId,
          sender: req.user.id,
          type: 'comment', // Reusing comment type for mentions
          message: `<strong>${req.user.username}</strong> mentioned you in a post: "<strong>${title}</strong>"`,
          post: post._id,
          link: `/post/${post._id}`,
        }));

      if (notificationsToCreate.length > 0) {
        // Check for duplicate notifications in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        for (const notif of notificationsToCreate) {
          const existingNotif = await Notification.findOne({
            recipient: notif.recipient,
            sender: notif.sender,
            post: notif.post,
            type: 'comment',
            createdAt: { $gte: fiveMinutesAgo }
          });
          
          // Only create if no duplicate found
          if (!existingNotif) {
            const newNotif = await Notification.create(notif);
            
            // Send real-time notification
            const recipientSocketId = req.onlineUsers[notif.recipient.toString()];
            if (recipientSocketId) {
              const populatedNotif = await Notification.findById(newNotif._id)
                .populate('sender', 'username profilePic')
                .populate('post', 'title');
              req.io.to(recipientSocketId).emit('new_notification', populatedNotif);
            }
          }
        }
      }
    }

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

    // Handle search parameter
    if (search) {
      // Check if this is a hashtag search (starts with # and has content after #)
      if (search.startsWith('#') && search.length > 1) {
        const cleanSearch = search.substring(1);
        if (matchConditions.$or) {
          // If we already have an $or condition, add to it
          matchConditions.$or.push({ tags: cleanSearch });
          matchConditions.$or.push({ hashtags: cleanSearch });
        } else {
          // Otherwise, create a new $or condition
          matchConditions.$or = [
            { tags: cleanSearch },
            { hashtags: cleanSearch }
          ];
        }
      } else if (search.startsWith('#') && search.length === 1) {
        // If search is just "#", don't add any search conditions
        // This prevents errors when user just types "#" without any hashtag
      } else {
        // Regular text search - only add if search term is not empty
        if (search.trim() !== '') {
          matchConditions.$text = { $search: search };
        }
      }
    }

    // Handle tags parameter
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagsArray.length > 0) {
        if (matchConditions.$or) {
          // If we already have an $or condition from search, add to it
          matchConditions.$or.push({ tags: { $in: tagsArray } });
          matchConditions.$or.push({ hashtags: { $in: tagsArray } });
        } else {
          // Otherwise, create a new $or condition
          matchConditions.$or = [
            { tags: { $in: tagsArray } },
            { hashtags: { $in: tagsArray } }
          ];
        }
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
    if (sort === 'relevance' && search && search.trim() !== '' && !search.startsWith('#')) {
      pipeline.push({ $sort: { score: { $meta: 'textScore' } } });
    } else if (sort === 'top') {
      pipeline.push({ $addFields: { sortScore: '$voteScore' } });
      pipeline.push({ $sort: { isPinned: -1, isFeatured: -1, sortScore: -1, createdAt: -1 } });
    } else if (sort === 'discussed') {
      pipeline.push({ $addFields: { sortScore: { $size: { $ifNull: ['$comments', []] } } } });
      pipeline.push({ $sort: { isPinned: -1, isFeatured: -1, sortScore: -1, createdAt: -1 } });
    } else { // Default to 'new'
      pipeline.push({ $sort: { isPinned: -1, isFeatured: -1, createdAt: -1 } });
    }

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // Add lookups and final shaping
    pipeline.push({ $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } });
    pipeline.push({ $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'group' } }); // Populate group info
    pipeline.push({ $unwind: '$user' }, { $unwind: '$group' });

    // Final projection stage
    const projectStage = {
      title: 1,
      content: 1,
      media: 1,
      tags: 1,
      isRecipe: 1,
      isFeatured: 1,
      isPinned: 1,
      recipeDetails: 1,
      flair: 1,
      createdAt: 1,
      taggedProducts: 1,
      updatedAt: 1,
      upvotes: 1,
      group: { _id: '$group._id', name: '$group.name', slug: '$group.slug', moderators: '$group.moderators', creator: '$group.creator' }, // Include group moderator and creator info
      user: { _id: '$user._id', username: '$user.username', profilePic: '$user.profilePic' },
      upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
      commentCount: { $size: { $ifNull: ['$comments', []] } },
    };

    if (search && search.trim() !== '' && !search.startsWith('#')) {
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

// @desc    Get featured recipes
// @route   GET /api/posts/featured-recipes
// @access  Public
router.get('/featured-recipes', async (req, res) => {
  try {
    const recipes = await Post.aggregate([
      { $match: { isRecipe: true } },
      {
        $addFields: {
          upvoteCount: { $size: { $ifNull: ['$upvotes', []] } }
        }
      },
      { $sort: { upvoteCount: -1, createdAt: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          title: 1, content: 1, media: 1, tags: 1, isRecipe: 1, isFeatured: 1, createdAt: 1,
          upvotes: 1,
          'user._id': '$user._id', 'user.username': '$user.username', 'user.profilePic': '$user.profilePic',
          upvoteCount: 1,
          commentCount: { $size: { $ifNull: ['$comments', []] } }
        }
      }
    ]);
    res.json(recipes);
  } catch (error) {
    console.error('Get featured recipes error:', error);
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
    // Remove the date filter to show all trending tags
    const tags = await Post.aggregate([
      { $match: { tags: { $ne: null, $not: { $size: 0 } } } }, // Remove date filter
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

// @desc    Pin/unpin a post
// @route   PUT /api/posts/:id/pin
// @access  Private (Group Moderator or Admin)
router.put('/:id/pin', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const group = await Group.findById(post.group);
    if (!group) {
      return res.status(404).json({ message: 'Associated group not found' });
    }

    const isModerator = group.moderators.some(modId => modId.equals(req.user.id));
    if (!isModerator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to pin posts in this group.' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({ success: true, message: `Post ${post.isPinned ? 'pinned' : 'unpinned'}.`, isPinned: post.isPinned });

  } catch (error) {
    console.error('Pin post error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePic')
      .populate('group', 'name slug rules moderators creator') // Populate group with rules
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
      .populate('taggedProducts', 'name price images countInStock'); // Populate tagged products with images array

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

    // Extract mentions and hashtags from comment content
    const mentionedUsernames = extractMentions(content);
    const hashtags = extractHashtags(content);
    
    // Validate mentions (get user IDs)
    const mentionedUserIds = await validateMentions(mentionedUsernames);

    const newComment = new Comment({
      content: content,
      user: req.user.id,
      post: req.params.id,
      parentComment: parentCommentId || null,
      hashtags,
      mentions: mentionedUserIds,
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

    // Create notifications for mentioned users in the comment
    if (mentionedUserIds.length > 0) {
      const notificationsToCreate = mentionedUserIds
        .filter(userId => userId.toString() !== req.user.id && userId.toString() !== recipientId.toString()) // Don't duplicate notifications
        .map(userId => ({
          recipient: userId,
          sender: req.user.id,
          type: 'comment',
          message: `<strong>${req.user.username}</strong> mentioned you in a comment on "<strong>${post.title}</strong>"`,
          post: post._id,
          comment: savedComment._id,
          link: `/post/${post._id}`,
        }));

      if (notificationsToCreate.length > 0) {
        await Notification.insertMany(notificationsToCreate);
        
        // Send real-time notifications to mentioned users
        notificationsToCreate.forEach(async (notif) => {
          const mentionedSocketId = req.onlineUsers[notif.recipient.toString()];
          if (mentionedSocketId) {
            const populatedNotif = await Notification.findOne({ recipient: notif.recipient, comment: savedComment._id })
              .sort({ createdAt: -1 })
              .populate('sender', 'username profilePic')
              .populate('post', 'title');
            req.io.to(mentionedSocketId).emit('new_notification', populatedNotif);
          }
        });
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
router.put('/:id', protect, uploadLimiter, upload.array('media', 10), async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user, group moderator, or admin
    const group = await Group.findById(post.group);
    const isGroupModerator = group && group.moderators.some(modId => modId.equals(req.user.id));

    if (post.user.toString() !== req.user.id && req.user.role !== 'admin' && !isGroupModerator) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { title, content, tags, isRecipe, recipeDetails, taggedProducts, existingMedia, group: newGroup, flair } = req.body;

    // If a group is provided in the update, ensure the user is authorized to change it
    if (newGroup && newGroup !== post.group.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change a post\'s group.' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags !== undefined ? tags : post.tags;
    post.isRecipe = isRecipe === 'true';
    post.taggedProducts = isRecipe ? taggedProducts : [];
    
    const newMediaFiles = req.files ? req.files.map(file => ({
      url: `/uploads/recipes/${file.filename}`,
      mediaType: file.mimetype.startsWith('image') ? 'image' : 'video',
    })) : [];

    // existingMedia should be an array of media objects from the frontend
    const parsedExistingMedia = existingMedia ? JSON.parse(existingMedia) : [];

    // Sanitize URLs of existing media to remove the base URL prefix (with safe error handling)
    const sanitizedExistingMedia = parsedExistingMedia.map(media => {
      try {
        const url = new URL(media.url, 'http://localhost:5000');
        return { ...media, url: url.pathname };
      } catch (error) {
        // If URL parsing fails, return as-is (likely already a pathname)
        return media;
      }
    });

    const finalMedia = sanitizedExistingMedia.concat(newMediaFiles);
    post.media = finalMedia;

    if (newGroup) {
      post.group = newGroup;
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

    // Check user, group moderator, or admin
    const group = await Group.findById(post.group);
    const isGroupModerator = group && group.moderators.some(modId => modId.equals(req.user.id));

    if (post.user.toString() !== req.user.id && req.user.role !== 'admin' && !isGroupModerator) {
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
router.put('/:id/report', protect, reportValidation, validate, async (req, res) => {
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

// @desc    Get posts by tagged product
// @route   GET /api/posts/tagged-product/:productId
// @access  Public
router.get('/tagged-product/:productId', optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 6 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Validate productId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Find posts tagged with this product
    const matchConditions = {
      taggedProducts: productId
      // Removed isRecipe: true filter to show all posts tagged with this product
    };

    // Exclude posts from users that the current user has blocked
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('blockedUsers');
      matchConditions.user = { $nin: currentUser.blockedUsers };
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      { $sort: { createdAt: -1 } }, // Sort by newest first
      { $skip: skip },
      { $limit: limitNum },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          title: 1,
          content: 1,
          media: 1,
          tags: 1,
          createdAt: 1,
          taggedProducts: 1,
          upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
          commentCount: { $size: { $ifNull: ['$comments', []] } },
          'user._id': 1,
          'user.username': 1,
          'user.profilePic': 1
        }
      }
    ];

    const posts = await Post.aggregate(pipeline);
    const totalPosts = await Post.countDocuments(matchConditions);

    res.json({ posts, page: pageNum, pages: Math.ceil(totalPosts / limitNum) });
  } catch (error) {
    console.error('Get posts by tagged product error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Clear reports for a post (Admin only)
// @route   PUT /api/posts/:id/clear-reports
// @access  Private/Admin
router.put('/:id/clear-reports', protect, authorize('admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Clear all reports
    post.reports = [];
    await post.save();
    
    res.json({ success: true, message: 'Post reports cleared successfully' });
  } catch (error) {
    console.error('Clear post reports error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
