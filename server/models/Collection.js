const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: [50, 'Collection name cannot be more than 50 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [250, 'Description cannot be more than 250 characters'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

CollectionSchema.virtual('postCount').get(function() {
  return this.posts ? this.posts.length : 0;
});

module.exports = mongoose.model('Collection', CollectionSchema);
