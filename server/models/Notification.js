const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['reply', 'post_upvote', 'comment_upvote'],
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  comment: { // Only for 'reply' and 'comment_upvote' types
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', NotificationSchema);