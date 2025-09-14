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
      const populatedCart = await cart.populate('items.product');
      res.json(populatedCart);
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
      const populatedCart = await newCart.populate('items.product');
      res.json(populatedCart);
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
      const populatedCart = await cart.populate('items.product');
      res.json(populatedCart);
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
      const populatedCart = await cart.populate('items.product');
      res.json(populatedCart);
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

// @desc    Add multiple items to the cart
// @route   POST /api/cart/add-multiple
// @access  Private
router.post('/add-multiple', protect, async (req, res) => {
    const { items } = req.body; // Expects an array of { productId, quantity }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'No items to add.' });
    }

    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            // If no cart, create one.
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        const productIds = items.map(item => item.productId);
        const products = await Product.find({ '_id': { $in: productIds } });

        const unavailableItems = [];

        // First, validate all items before making any changes
        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.productId);

            if (!product) {
                unavailableItems.push({ productId: item.productId, name: 'Unknown Product', reason: 'Product no longer exists.' });
                continue;
            }
            
            const existingItem = cart.items.find(cartItem => cartItem.product.toString() === item.productId);
            const quantityInCart = existingItem ? existingItem.quantity : 0;

            if (product.countInStock < (item.quantity + quantityInCart)) {
                unavailableItems.push({ name: product.name, reason: `Not enough stock. Only ${product.countInStock} available.` });
            }
        }

        // If any item is unavailable, abort and send a detailed error response
        if (unavailableItems.length > 0) {
            return res.status(400).json({
                message: 'Some items could not be added to your cart.',
                unavailableItems,
            });
        }

        // If all items are available, add them to the cart
        for (const item of items) {
            const existingItem = cart.items.find(cartItem => cartItem.product.toString() === item.productId);

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                cart.items.push({ product: item.productId, quantity: item.quantity });
            }
        }
        
        const updatedCart = await cart.save();
        const populatedCart = await updatedCart.populate('items.product');
        res.json(populatedCart);
    } catch (error) {
        console.error('Error adding multiple items to cart:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
