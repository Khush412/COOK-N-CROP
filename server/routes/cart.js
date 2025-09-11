const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, async (req, res) => {
  const { productId, quantity } = req.body;

  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive number.' });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      // Cart exists for user
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Product exists in the cart, update quantity
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (product.countInStock < newQuantity) {
          return res.status(400).json({ message: `Not enough stock for ${product.name}. Only ${product.countInStock} available.` });
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        // Product does not exist in cart, add new item
        if (product.countInStock < quantity) {
          return res.status(400).json({
            message: `Not enough stock for ${product.name}. Only ${product.countInStock} available.`,
          });
        }
        cart.items.push({ product: productId, quantity });
      }
      cart = await cart.save();
      res.json(cart);
    } else {
      // No cart for user, create new cart
      if (product.countInStock < quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Only ${product.countInStock} available.`,
        });
      }
      const newCart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
      res.json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } 
});

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      // Instead of a 404, return a 200 with a default empty cart structure.
      // This is a valid state for a user who has not added items yet.
      return res.json({
        _id: null,
        user: req.user.id,
        items: [],
        __v: 0,
      });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/item/:productId
// @access  Private
router.put('/item/:productId', protect, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (itemIndex > -1) {
      if (quantity > product.countInStock) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Only ${product.countInStock} available.`,
        });
      }

      let item = cart.items[itemIndex];
      item.quantity = quantity;
      if (item.quantity <= 0) {
        cart.items.splice(itemIndex, 1); // Remove item if quantity is 0 or less
      }
      cart = await cart.save();
      res.json(cart);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:productId
// @access  Private
router.delete('/item/:productId', protect, async (req, res) => {
  const { productId } = req.params;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      cart = await cart.save();
      res.json(cart);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = []; // Clear all items
    cart = await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
