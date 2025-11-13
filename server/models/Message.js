const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: false, // Make content optional to support media-only messages
    trim: true,
  },
  // Add media attachments support
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'audio'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    mimetype: String,
    size: Number
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Add reference to another message (for replies)
  referencedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', MessageSchema);