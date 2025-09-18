const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: { // The admin who replied
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const SupportMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    enum: ['General Inquiry', 'Account Support', 'Order Issue', 'Partnership', 'Feedback'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null, // For non-logged-in users
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SupportMessage', SupportMessageSchema);
