const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { orderItems, shippingAddress, couponCode } = req.body;

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

            // Check stock availability
            if (matchingItemFromDB.countInStock < itemFromClient.qty) {
                const err = new Error(`Not enough stock for ${matchingItemFromDB.name}. Only ${matchingItemFromDB.countInStock} left.`);
                err.statusCode = 400; // Set status code for specific error
                throw err;
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
        const subtotal = dbOrderItems.reduce(
            (acc, item) => acc + item.price * item.qty,
            0
        );

        let discountAmount = 0;
        let finalPrice = subtotal;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            // Re-validate coupon on the server
            if (!coupon || !coupon.isActive || coupon.expiresAt < new Date() || (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) || subtotal < coupon.minPurchase) {
                return res.status(400).json({ message: 'The provided coupon is invalid or expired.' });
            }

            if (coupon.discountType === 'percentage') {
                discountAmount = (subtotal * coupon.discountValue) / 100;
            } else {
                discountAmount = coupon.discountValue;
            }
            discountAmount = Math.min(discountAmount, subtotal);
            finalPrice = subtotal - discountAmount;
            appliedCoupon = coupon;
        }

        const order = new Order({
            user: req.user._id,
            orderItems: dbOrderItems,
            shippingAddress,
            subtotal: subtotal,
            discount: {
                code: appliedCoupon ? appliedCoupon.code : undefined,
                amount: discountAmount,
            },
            totalPrice: finalPrice,
        });

        const createdOrder = await order.save();

        // If a coupon was successfully applied, increment its usage count
        if (appliedCoupon) {
            appliedCoupon.timesUsed += 1;
            await appliedCoupon.save();
        }

        // 4. Update stock count for each item in the order
        const updateStockPromises = createdOrder.orderItems.map(async (item) => {
            return Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: -item.qty }
            });
        });
        await Promise.all(updateStockPromises);

        // 5. Send order confirmation email
        try {
            const itemRows = createdOrder.orderItems.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center;">${item.qty}</td>
                    <td style="text-align: right;">$${item.price.toFixed(2)}</td>
                    <td style="text-align: right;">$${(item.qty * item.price).toFixed(2)}</td>
                </tr>
            `).join('');

            const discountRow = createdOrder.discount.amount > 0 ? `
                <h3>Subtotal: $${createdOrder.subtotal.toFixed(2)}</h3>
                <h3>Discount (${createdOrder.discount.code}): -$${createdOrder.discount.amount.toFixed(2)}</h3>
            ` : '';

            const message = `
                <h1>Thank you for your order!</h1>
                <p>Hi ${req.user.username},</p>
                <p>We've received your order #${createdOrder._id} and are getting it ready.</p>
                <h2>Order Summary</h2>
                <table width="100%" cellpadding="5" cellspacing="0" border="1">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                ${discountRow}
                <h3>Total: $${createdOrder.totalPrice.toFixed(2)}</h3>
                <p>You can view your order details here: <a href="${process.env.CLIENT_URL}/order/${createdOrder._id}">${process.env.CLIENT_URL}/order/${createdOrder._id}</a></p>
            `;
            await sendEmail({ email: req.user.email, subject: `Your Cook-N-Crop Order #${createdOrder._id}`, message });
        } catch (emailError) {
            console.error('Could not send order confirmation email:', emailError);
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        // If we threw a custom status code, use it. Otherwise, default to 500.
        res.status(error.statusCode || 500).json({ message: error.message || 'Server Error creating order' });
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id username');
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server Error' });
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

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
router.put('/:id/pay', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      // In a real app, you'd add paymentResult details from a payment gateway here
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order to paid error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order to delivered error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
