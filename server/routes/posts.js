const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, tags, isRecipe, recipeDetails } = req.body;

    const newPost = new Post({
      user: req.user.id,
      title,
      content,
      tags,
      isRecipe,
      recipeDetails: isRecipe ? recipeDetails : undefined,
    });

    const post = await newPost.save();
    const populatedPost = await Post.findById(post._id).populate('user', 'username profilePic');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { sort = 'new', search = '', page = 1, limit = 9 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const aggregationProjection = {
      title: 1,
      content: 1,
      tags: 1,
      upvotes: 1,
      comments: 1,
      isRecipe: 1,
      recipeDetails: 1,
      createdAt: 1,
      updatedAt: 1,
      upvoteCount: 1,
      commentCount: 1,
      user: {
        _id: '$user._id',
        username: '$user.username',
        profilePic: '$user.profilePic',
      },
    };

    // Base match stage
    const matchStage = search ? { $match: { $text: { $search: search } } } : null;

    // Pipeline for fetching paginated data
    const dataPipeline = [];
    if (matchStage) dataPipeline.push(matchStage);

    // Add sorting stages
    if (sort === 'top') {
      dataPipeline.push({ $addFields: { upvoteCountSort: { $size: { $ifNull: ['$upvotes', []] } } } });
      dataPipeline.push({ $sort: { upvoteCountSort: -1, createdAt: -1 } });
    } else if (sort === 'discussed') {
      dataPipeline.push({ $addFields: { commentCountSort: { $size: { $ifNull: ['$comments', []] } } } });
      dataPipeline.push({ $sort: { commentCountSort: -1, createdAt: -1 } });
    } else if (sort === 'relevance' && search) {
      dataPipeline.push({ $sort: { score: { $meta: 'textScore' } } });
    } else { // Default to 'new'
      dataPipeline.push({ $sort: { createdAt: -1 } });
    }

    // Add pagination, lookup, and final projection
    dataPipeline.push(
      { $skip: skip },
      { $limit: limitNum },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $addFields: { 
          upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
          commentCount: { $size: { $ifNull: ['$comments', []] } } 
      } },
      { $project: aggregationProjection }
    );

    // Pipeline for getting total count
    const countPipeline = [];
    if (matchStage) countPipeline.push(matchStage);
    countPipeline.push({ $count: 'total' });

    // Execute both pipelines using $facet
    const results = await Post.aggregate([
      { $facet: {
          posts: dataPipeline,
          totalCount: countPipeline
      }}
    ]);

    const posts = results[0].posts;
    const totalPosts = results[0].totalCount[0] ? results[0].totalCount[0].total : 0;

    res.json({ posts, page: pageNum, pages: Math.ceil(totalPosts / limitNum) });
  } catch (error) {
    console.error('Get posts error:', error);
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
      });

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
router.put('/:id', protect, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { title, content, tags } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;

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

module.exports = router;
