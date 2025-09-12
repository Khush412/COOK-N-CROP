const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @desc    Upvote/unvote a comment
// @route   PUT /api/comments/:id/upvote
// @access  Private
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the comment has already been upvoted by this user
    const upvotedIndex = comment.upvotes.findIndex(
      (userId) => userId.toString() === req.user.id
    );

    if (upvotedIndex > -1) {
      // User has already upvoted, so remove the upvote
      comment.upvotes.splice(upvotedIndex, 1);
    } else {
      // User has not upvoted, so add the upvote
      comment.upvotes.push(req.user.id);
    }

    await comment.save();

    // Create notification, but not if the user is upvoting their own comment
    if (comment.user.toString() !== req.user.id) {
      // Only create a notification if the user is adding an upvote, not removing it
      if (upvotedIndex === -1) {
        const message = `<strong>${req.user.username}</strong> upvoted your comment.`;
        const newNotification = await Notification.create({
          recipient: comment.user,
          sender: req.user.id,
          type: 'upvote', // Corrected type to match enum
          message: message,
          post: comment.post,
          comment: comment._id,
        });
        const recipientSocketId = req.onlineUsers[comment.user.toString()];
        if (recipientSocketId) {
          const populatedNotification = await Notification.findById(newNotification._id).populate('sender', 'username profilePic').populate('post', 'title');
          req.io.to(recipientSocketId).emit('new_notification', populatedNotification);
        }
      }
    }

    res.json({ upvotes: comment.upvotes });
  } catch (error) {
    console.error('Comment upvote error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check user
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    comment.content = req.body.content || comment.content;
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'username profilePic');
    res.json(populatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check user or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // If it's a reply, remove it from the parent's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    } else {
      // If it's a top-level comment, remove it from the post's comments array
      const Post = require('../models/Post');
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: comment._id },
      });
    }

    // Recursively delete all replies of this comment
    const deleteReplies = async (commentId) => {
        const commentToDelete = await Comment.findById(commentId);
        if (commentToDelete && commentToDelete.replies.length > 0) {
            for (const replyId of commentToDelete.replies) {
                await deleteReplies(replyId);
            }
        }
        await Comment.findByIdAndDelete(commentId);
    };

    await deleteReplies(req.params.id);

    res.json({ success: true, message: 'Comment removed' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Report a comment
// @route   PUT /api/comments/:id/report
// @access  Private
router.put('/:id/report', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user has already reported this comment
    const alreadyReported = comment.reports.some(report => report.user.toString() === req.user.id);
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this comment' });
    }

    comment.reports.push({
      user: req.user.id,
      reason: req.body.reason,
    });

    await comment.save();

    res.json({ success: true, message: 'Comment reported successfully' });
  } catch (error) {
    console.error('Report comment error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all reported comments (Admin only)
// @route   GET /api/comments/reported
// @access  Private/Admin
router.get('/reported', protect, authorize('admin'), async (req, res) => {
  try {
    const comments = await Comment.find({ 'reports.0': { $exists: true } })
      .populate('user', 'username')
      .populate('post', 'title')
      .populate('reports.user', 'username');
    res.json(comments);
  } catch (error) {
    console.error('Get reported comments error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
