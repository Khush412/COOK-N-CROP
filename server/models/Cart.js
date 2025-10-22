const mongoose = require('mongoose');

const CartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const CartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    items: [CartItemSchema],
    savedForLater: [CartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
