const mongoose = require('mongoose');
const slugify = require('slugify');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    unique: true,
    trim: true,
    maxlength: [30, 'Group name cannot be more than 30 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Group description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  coverImage: {
    type: String,
    default: '/images/default-group-cover.png',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  memberCount: {
    type: Number,
    default: 1,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  rules: [{
    title: { type: String, required: true },
    description: { type: String },
  }],
  flairs: [{
    text: { type: String, required: true },
    color: { type: String, default: '#808080' },
    backgroundColor: { type: String, default: '#e0e0e0' },
  }],
  bannedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  joinRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { timestamps: true });

// Create group slug from the name before saving
GroupSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('Group', GroupSchema);
