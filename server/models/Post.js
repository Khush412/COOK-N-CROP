const mongoose = require('mongoose');

const recipeReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, {
  timestamps: true,
});

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
  },
  media: [
    {
      url: { type: String, required: true },
      mediaType: { type: String, enum: ['image', 'video'], required: true },
      _id: false,
    },
  ],
  tags: [
    {
      type: String,
      trim: true,
    }, // Removed trailing comma here to fix syntax error
  ],
  hashtags: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],
  mentions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  flair: {
    type: String,
    trim: true,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  downvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  voteScore: {
    type: Number, default: 0, index: true
  },
  hotScore: {
    type: Number,
    default: 0
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  // For recipe-specific posts
  isRecipe: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  recipeRating: {
    type: Number,
    required: true,
    default: 0,
  },
  numRecipeReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  recipeDetails: {
    prepTime: Number, // Changed to Number for filtering
    cookTime: Number, // Changed to Number for filtering
    servings: Number, // Changed to Number for filtering
    ingredients: [String],
    instructions: [String],
  },
  taggedProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  recipeReviews: [recipeReviewSchema],
  reports: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a text index for searching
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Index for hashtag searches
PostSchema.index({ hashtags: 1 });

// Index for vote score and hot score sorting
PostSchema.index({ voteScore: -1, createdAt: -1 });
PostSchema.index({ hotScore: -1 });

// Virtual for upvote count
PostSchema.virtual('upvoteCount').get(function() {
  return this.upvotes ? this.upvotes.length : 0;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

module.exports = mongoose.model('Post', PostSchema);
