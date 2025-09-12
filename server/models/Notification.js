const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['upvote', 'comment', 'follow', 'broadcast'], // Added 'broadcast'
    required: true,
  },
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
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    // Make 'post' required only for relevant notification types
    required: function() {
      return ['upvote', 'comment'].includes(this.type);
    },
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
