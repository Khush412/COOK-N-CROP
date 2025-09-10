const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { orderItems, shippingAddress } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // 1. Get product details from the database to ensure data integrity
        const itemsFromDB = await Product.find({
            _id: { $in: orderItems.map((x) => x.product) },
        });

        // 2. Map client items to DB items and check for invalid products
        const dbOrderItems = orderItems.map((itemFromClient) => {
            const matchingItemFromDB = itemsFromDB.find(
                (item) => item._id.toString() === itemFromClient.product
            );

            if (!matchingItemFromDB) {
                // Throw an error if a product is not found
                throw new Error(`Product not found: ${itemFromClient.product}`);
            }

            return {
                name: matchingItemFromDB.name,
                qty: itemFromClient.qty,
                image: matchingItemFromDB.image,
                price: matchingItemFromDB.price, // Use price from DB
                product: itemFromClient.product,
            };
        });

        // 3. Calculate total price on the server
        const calculatedTotalPrice = dbOrderItems.reduce(
            (acc, item) => acc + item.price * item.qty,
            0
        );

        const order = new Order({
            user: req.user._id,
            orderItems: dbOrderItems,
            shippingAddress,
            totalPrice: calculatedTotalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Server Error creating order', error: error.message });
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Security Check: Ensure the logged-in user is the owner of the order or an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
});

module.exports = router;
