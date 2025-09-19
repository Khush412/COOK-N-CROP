const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { orderItems, shippingAddress, couponCode, paymentMethod } = req.body;

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

        const isPaid = paymentMethod !== 'COD';

        const order = new Order({
            user: req.user._id,
            orderItems: dbOrderItems,
            shippingAddress,
            paymentMethod,
            subtotal: subtotal,
            discount: {
                code: appliedCoupon ? appliedCoupon.code : undefined,
                amount: discountAmount,
            },
            totalPrice: finalPrice,
            status: 'Processing',
            isPaid: isPaid,
            paidAt: isPaid ? Date.now() : null,
            statusHistory: [{ status: 'Processing' }],
        });

        const createdOrder = await order.save();

        // Update user's activity stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                'activity.totalOrders': 1,
                'activity.totalSpent': finalPrice
            }
        });

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
                <tr style="border-bottom: 1px solid #eaeaea;">
                    <td style="padding: 15px; vertical-align: middle;">${item.name}</td>
                    <td style="padding: 15px; vertical-align: middle; text-align: center;">${item.qty}</td>
                    <td style="padding: 15px; vertical-align: middle; text-align: right;">$${item.price.toFixed(2)}</td>
                    <td style="padding: 15px; vertical-align: middle; text-align: right;">$${(item.qty * item.price).toFixed(2)}</td>
                </tr>
            `).join('');

            const summaryRows = createdOrder.discount.amount > 0 ? `
                <tr>
                    <td colspan="3" style="text-align: right; padding: 5px 0;">Subtotal:</td>
                    <td style="text-align: right; padding: 5px 0;">$${createdOrder.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right; padding: 5px 0; color: #28a745;">Discount (${createdOrder.discount.code}):</td>
                    <td style="text-align: right; padding: 5px 0; color: #28a745;">-$${createdOrder.discount.amount.toFixed(2)}</td>
                </tr>
            ` : '';

            const message = `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
                <div style="background-color: #800000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 28px;">Thank You For Your Order!</h1>
                </div>
                <div style="padding: 25px;">
                  <p>Hi ${req.user.username},</p>
                  <p>We've received your order #${createdOrder._id.toString().slice(-6)} and are getting it ready. Here's a summary of your purchase:</p>
                  <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                    <thead>
                      <tr style="background-color: #f9f9f9;">
                        <th style="padding: 12px; border-bottom: 2px solid #eaeaea; text-align: left;">Item</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eaeaea; text-align: center;">Quantity</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eaeaea; text-align: right;">Price</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eaeaea; text-align: right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                  </table>
                  <table style="width: 100%; margin-top: 20px;">
                    <tbody>
                      ${summaryRows}
                      <tr>
                        <td colspan="3" style="text-align: right; padding: 10px 0; font-weight: bold; border-top: 2px solid #333;">Grand Total:</td>
                        <td style="text-align: right; padding: 10px 0; font-weight: bold; border-top: 2px solid #333;">$${createdOrder.totalPrice.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.CLIENT_URL}/order/${createdOrder._id}" style="background-color: #e8eb14d1; color: #333; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">View Your Order</a>
                  </div>
                </div>
                <div style="background-color: #f1f1f1; color: #777; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cook'N'Crop. All rights reserved.</p>
                </div>
              </div>
            `;
            await sendEmail({ email: req.user.email, subject: `Your Cook-N-Crop Order #${createdOrder._id}`, message });
        } catch (emailError) {
            console.error('Could not send order confirmation email:', emailError);
        }

        // Emit real-time event to admins
        const io = req.app.get('io');
        if (io) {
            io.to('admin_room').emit('new_activity', {
                type: 'order',
                id: createdOrder._id,
                title: `New order #${createdOrder._id.toString().slice(-6)} by ${req.user.username} for $${createdOrder.totalPrice.toFixed(2)}`,
                timestamp: createdOrder.createdAt
            });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        // If we threw a custom status code, use it. Otherwise, default to 500.
        res.status(error.statusCode || 500).json({ message: error.message || 'Server Error creating order' });
    }
});

// @desc    Update an order as Admin
// @route   PUT /api/orders/admin/edit/:id
// @access  Private/Admin
router.put('/admin/edit/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { orderItems, shippingAddress } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // --- Stock Management ---
        const oldItemsMap = new Map(order.orderItems.map(item => [item.product.toString(), item.qty]));
        const newItemsMap = new Map(orderItems.map(item => [item.product.toString(), item.qty]));
        const allProductIds = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);
        const products = await Product.find({ _id: { $in: [...allProductIds] } });
        const productsMap = new Map(products.map(p => [p._id.toString(), p]));

        const stockUpdates = [];
        for (const productId of allProductIds) {
            const oldQty = oldItemsMap.get(productId) || 0;
            const newQty = newItemsMap.get(productId) || 0;
            const diff = newQty - oldQty;

            if (diff !== 0) {
                const product = productsMap.get(productId);
                if (!product) return res.status(404).json({ message: `Product with ID ${productId} not found.` });
                if (diff > 0 && product.countInStock < diff) {
                    return res.status(400).json({ message: `Not enough stock for ${product.name}. Only ${product.countInStock} available.` });
                }
                stockUpdates.push({ productId, change: -diff });
            }
        }

        // --- Update Order Details ---
        const itemsFromDB = await Product.find({ _id: { $in: orderItems.map(x => x.product) } });
        const dbOrderItems = orderItems.map(item => {
            const matchingItem = itemsFromDB.find(p => p._id.toString() === item.product.toString());
            return { name: matchingItem.name, qty: item.qty, image: matchingItem.image, price: matchingItem.price, product: item.product };
        });

        order.orderItems = dbOrderItems;
        order.shippingAddress = shippingAddress || order.shippingAddress;
        order.subtotal = dbOrderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
        order.totalPrice = order.subtotal - (order.discount?.amount || 0);
        if (order.totalPrice < 0) order.totalPrice = 0;

        // --- Apply Changes ---
        for (const update of stockUpdates) {
            await Product.findByIdAndUpdate(update.productId, { $inc: { countInStock: update.change } });
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Admin order update error:', error);
        res.status(500).json({ message: error.message || 'Server Error updating order' });
    }
});

// @desc    Create new order as Admin
// @route   POST /api/orders/admin/create
// @access  Private/Admin
router.post('/admin/create', protect, authorize('admin'), async (req, res) => {
    try {
        const { userId, orderItems, shippingAddress } = req.body;

        if (!userId || !orderItems || orderItems.length === 0 || !shippingAddress) {
            return res.status(400).json({ message: 'Missing required fields: userId, orderItems, shippingAddress' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const itemsFromDB = await Product.find({ _id: { $in: orderItems.map((x) => x.product) } });

        const dbOrderItems = orderItems.map((itemFromClient) => {
            const matchingItemFromDB = itemsFromDB.find((item) => item._id.toString() === itemFromClient.product);
            if (!matchingItemFromDB) throw new Error(`Product not found: ${itemFromClient.product}`);
            if (matchingItemFromDB.countInStock < itemFromClient.qty) {
                const err = new Error(`Not enough stock for ${matchingItemFromDB.name}. Only ${matchingItemFromDB.countInStock} left.`);
                err.statusCode = 400;
                throw err;
            }
            return {
                name: matchingItemFromDB.name, qty: itemFromClient.qty, image: matchingItemFromDB.image,
                price: matchingItemFromDB.price, product: itemFromClient.product,
            };
        });

        const subtotal = dbOrderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
        const finalPrice = subtotal; // Admin-created orders don't use coupons for now

        const order = new Order({
            user: userId, orderItems: dbOrderItems, shippingAddress, subtotal, totalPrice: finalPrice,
            status: 'Processing', isPaid: true, paidAt: Date.now(), statusHistory: [{ status: 'Processing' }],
        });

        const createdOrder = await order.save();
        await Promise.all(createdOrder.orderItems.map(item => Product.findByIdAndUpdate(item.product, { $inc: { countInStock: -item.qty } })));
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Admin order creation error:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server Error creating order' });
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const { search, status } = req.query;

    const matchQuery = {};

    if (status && status !== 'All') {
      matchQuery.status = status;
    }

    // Build search query
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      // Find users that match the search term
      const users = await User.find({
        $or: [{ username: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const userIds = users.map(u => u._id);

      const orConditions = [{ user: { $in: userIds } }];
      // Also check if the search term is a valid MongoDB ObjectId for the order ID
      if (mongoose.Types.ObjectId.isValid(search)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(search) });
      }
      matchQuery.$or = orConditions;
    }

    const count = await Order.countDocuments(matchQuery);
    const orders = await Order.find(matchQuery)
      .sort({ createdAt: -1 }) // Show newest orders first
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('user', 'id username');

    res.json({ orders, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate({
            path: 'orderItems.product',
            select: 'name image reviews' // Select fields needed for review check
        });
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'username email')
        .populate({
            path: 'orderItems.product',
            select: 'name image reviews'
        });

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
router.put('/:id/pay', protect, authorize('admin'), async (req, res) => { // This route is now legacy, but we'll keep it robust
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      // Update status if it's currently pending
      if (order.status === 'Pending') {
        order.status = 'Processing';
        // Defensive check for older orders
        if (!Array.isArray(order.statusHistory)) {
            order.statusHistory = [];
        }
        order.statusHistory.push({ status: 'Processing' });
      }
      // In a real app, you'd add paymentResult details from a payment gateway here

      // Defensive check for subtotal on older orders
      if (typeof order.subtotal === 'undefined' || order.subtotal === null) {
          order.subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
      }

      const updatedOrder = await order.save();

      // Send email notification
      try {
        const message = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
            <div style="background-color: #800000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Cook'N'Crop</h1>
            </div>
            <div style="padding: 25px;">
              <h2 style="color: #333333;">Your Order is Being Processed</h2>
              <p>Hi ${order.user.username},</p>
              <p>We have confirmed payment for your order #${order._id}. It is now being processed.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.CLIENT_URL}/order/${order._id}" style="background-color: #e8eb14d1; color: #333; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">View Your Order</a>
              </div>
            </div>
            <div style="background-color: #f1f1f1; color: #777; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cook'N'Crop. All rights reserved.</p>
            </div>
          </div>
        `;
        await sendEmail({ email: order.user.email, subject: `Your Cook-N-Crop Order #${order._id} is Processing`, message });
      } catch (emailError) {
        console.error(`Could not send order payment email for order ${order._id}:`, emailError);
      }

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
router.put('/:id/deliver', protect, authorize('admin'), async (req, res) => { // This route is now legacy, but we'll keep it robust
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';
      // Defensive check for older orders
      if (!Array.isArray(order.statusHistory)) {
        order.statusHistory = [];
      }
      order.statusHistory.push({ status: 'Delivered' });

      // Defensive check for subtotal on older orders
      if (typeof order.subtotal === 'undefined' || order.subtotal === null) {
          order.subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
      }

      const updatedOrder = await order.save();

      // Send email notification
      try {
        const message = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
            <div style="background-color: #800000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Cook'N'Crop</h1>
            </div>
            <div style="padding: 25px;">
              <h2 style="color: #333333;">Your Order Has Been Delivered!</h2>
              <p>Hi ${order.user.username},</p>
              <p>Your order #${order._id} has been marked as delivered. We hope you enjoy your fresh products!</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.CLIENT_URL}/order/${order._id}" style="background-color: #e8eb14d1; color: #333; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">View Your Order</a>
              </div>
            </div>
            <div style="background-color: #f1f1f1; color: #777; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cook'N'Crop. All rights reserved.</p>
            </div>
          </div>
        `;
        await sendEmail({ email: order.user.email, subject: `Your Cook-N-Crop Order #${order._id} Has Been Delivered`, message });
      } catch (emailError) {
        console.error(`Could not send order delivery email for order ${order._id}:`, emailError);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order to delivered error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'username email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { status } = req.body;
        const oldStatus = order.status;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Handle stock changes when moving to or from 'Canceled' status
        if (status === 'Canceled' && oldStatus !== 'Canceled') {
            // Replenish stock
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { countInStock: item.qty }
                });
            }
        } else if (oldStatus === 'Canceled' && status !== 'Canceled') {
            // De-cancel: Decrement stock again, checking availability first
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (!product || product.countInStock < item.qty) {
                    return res.status(400).json({
                        message: `Cannot un-cancel order. Not enough stock for ${product ? product.name : 'a product'}.`
                    });
                }
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { countInStock: -item.qty }
                });
            }
        }

        // Update status and history if it's a new status
        if (oldStatus !== status) {
            order.status = status;
            // Defensive check: Initialize statusHistory if it doesn't exist on older orders
            if (!Array.isArray(order.statusHistory)) {
                order.statusHistory = [];
            }
            order.statusHistory.push({ status });
        }

        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        } else if (oldStatus === 'Delivered' && status !== 'Delivered') {
            // Handle case where an order is moved from 'Delivered' to another status
            order.isDelivered = false;
            order.deliveredAt = null;
        }

        // Defensive check for subtotal on older orders
        if (typeof order.subtotal === 'undefined' || order.subtotal === null) {
            order.subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
        }

        const updatedOrder = await order.save();

        // Send email notification if status changed and user has an email
        if (oldStatus !== status && order.user && order.user.email) {
            try {
                const message = `
                  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="background-color: #800000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; font-size: 28px;">Cook'N'Crop</h1>
                    </div>
                    <div style="padding: 25px;">
                      <h2 style="color: #333333;">Your Order Status has been Updated</h2>
                      <p>Hi ${order.user.username},</p>
                      <p>The status of your order #${order._id} has been updated to: <strong>${status}</strong>.</p>
                      <p>Thank you for shopping with Cook-N-Crop!</p>
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.CLIENT_URL}/order/${order._id}" style="background-color: #e8eb14d1; color: #333; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">View Your Order</a>
                      </div>
                    </div>
                    <div style="background-color: #f1f1f1; color: #777; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cook'N'Crop. All rights reserved.</p>
                    </div>
                  </div>
                `;
                await sendEmail({
                    email: order.user.email,
                    subject: `Update on your Cook-N-Crop Order #${order._id}`,
                    message
                });
            } catch (emailError) {
                console.error(`Could not send status update email for order ${order._id}:`, emailError);
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
