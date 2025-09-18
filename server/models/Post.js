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
  image: {
    type: String,
    default: null,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
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

// Virtual for upvote count
PostSchema.virtual('upvoteCount').get(function() {
  return this.upvotes ? this.upvotes.length : 0;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

module.exports = mongoose.model('Post', PostSchema);
