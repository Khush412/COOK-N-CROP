const mongoose = require('mongoose');

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
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Fruits', 'Vegetables', 'Exotic Produce', 'Seasonal Picks', 'Organic / Specials'],
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  origin: {
    type: String,
  },
  freshness: {
    type: String,
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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
