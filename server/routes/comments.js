const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { commentValidation, validate, reportValidation } = require('../middleware/validation');
const Comment = require('../models/Comment');
const Group = require('../models/Group'); // Import Group model
const Post = require('../models/Post'); // Import Post model to get group info
const Notification = require('../models/Notification');
const { extractMentions, extractHashtags, validateMentions } = require('../utils/textParser');

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
router.put('/:id', protect, commentValidation, validate, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check user
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const newContent = req.body.content || comment.content;
    
    // Extract mentions and hashtags from updated content
    const mentionedUsernames = extractMentions(newContent);
    const hashtags = extractHashtags(newContent);
    
    // Validate mentions (get user IDs)
    const mentionedUserIds = await validateMentions(mentionedUsernames);

    // Get the post for notification context
    const post = await Post.findById(comment.post);
    
    // Find newly mentioned users (not in old mentions)
    const oldMentionIds = comment.mentions.map(id => id.toString());
    const newMentionIds = mentionedUserIds.filter(id => !oldMentionIds.includes(id.toString()));

    // Update comment
    comment.content = newContent;
    comment.mentions = mentionedUserIds;
    comment.hashtags = hashtags;
    await comment.save();

    // Send notifications to newly mentioned users
    if (newMentionIds.length > 0 && post) {
      const notificationsToCreate = newMentionIds
        .filter(userId => userId.toString() !== req.user.id) // Don't notify yourself
        .map(userId => ({
          recipient: userId,
          sender: req.user.id,
          type: 'comment',
          message: `<strong>${req.user.username}</strong> mentioned you in a comment on "<strong>${post.title}</strong>"`,
          post: post._id,
          comment: comment._id,
          link: `/post/${post._id}`,
        }));

      if (notificationsToCreate.length > 0) {
        await Notification.insertMany(notificationsToCreate);
        
        // Send real-time notifications
        notificationsToCreate.forEach(async (notif) => {
          const mentionedSocketId = req.onlineUsers[notif.recipient.toString()];
          if (mentionedSocketId) {
            const populatedNotif = await Notification.findOne({ recipient: notif.recipient, comment: comment._id })
              .sort({ createdAt: -1 })
              .populate('sender', 'username profilePic')
              .populate('post', 'title');
            req.io.to(mentionedSocketId).emit('new_notification', populatedNotif);
          }
        });
      }
    }

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

    // Check user, group moderator, or admin
    const post = await Post.findById(comment.post);
    const group = post ? await Group.findById(post.group) : null;
    const isGroupModerator = group && group.moderators.some(modId => modId.equals(req.user.id));

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin' && !isGroupModerator) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // If it's a reply, remove it from the parent's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, { $pull: { replies: comment._id } });
    } else {
      // If it's a top-level comment, remove it from the post's comments array
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
router.put('/:id/report', protect, reportValidation, validate, async (req, res) => {
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

// @desc    Clear reports for a comment (Admin only)
// @route   PUT /api/comments/:id/clear-reports
// @access  Private/Admin
router.put('/:id/clear-reports', protect, authorize('admin'), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Clear all reports
    comment.reports = [];
    await comment.save();
    
    res.json({ success: true, message: 'Comment reports cleared successfully' });
  } catch (error) {
    console.error('Clear comment reports error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
