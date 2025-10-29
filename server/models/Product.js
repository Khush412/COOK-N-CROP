const mongoose = require('mongoose');

// Product variant schema for different sizes/weights
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  }, // e.g., "500g", "1kg", "2kg"
  price: {
    type: Number,
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
  },
  sku: {
    type: String,
    trim: true,
  }, // Stock Keeping Unit
}, { _id: true });

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, {
  timestamps: true,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    trim: true,
  },
  // Updated to support multiple images
  images: [{
    type: String,
    required: true,
  }],
  reviews: [reviewSchema],
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Baked Goods', 'Beverages', 'Snacks', 'Other'],
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
  },
  // Brand information
  brand: {
    type: String,
    trim: true,
  },
  // Tags for filtering and search
  tags: [{
    type: String,
    trim: true,
    index: true, // Add index for better search performance
  }],
  // Product variants (different sizes/weights)
  variants: [variantSchema],
  // Badges
  badges: {
    isNew: { type: Boolean, default: false },
    isOrganic: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
  },
  // Sale price (if on sale)
  salePrice: {
    type: Number,
  },
  // Track sales for bestseller badge
  totalSales: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  nutritionFacts: {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
  },
  recipeSuggestions: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a text index for searching
productSchema.index({ name: 'text', description: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;