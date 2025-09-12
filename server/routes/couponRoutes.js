const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { code, discountType, discountValue, expiresAt, minPurchase, usageLimit } = req.body;
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiresAt,
      minPurchase: minPurchase || 0,
      usageLimit: usageLimit === null || usageLimit === '' ? null : Number(usageLimit),
    });
    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code must be unique.' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get all coupons (with pagination and search)
// @route   GET /api/coupons
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const search = req.query.search || '';

    const searchRegex = new RegExp(search, 'i');
    const query = search ? { code: searchRegex } : {};

    const count = await Coupon.countDocuments(query);
    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ coupons, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get orders that used a specific coupon
// @route   GET /api/coupons/:code/orders
// @access  Private/Admin
router.get('/:code/orders', protect, authorize('admin'), async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const couponCode = req.params.code.toUpperCase();

    const query = { 'discount.code': couponCode };

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('user', 'id username');

    res.json({ orders, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error(`Error fetching orders for coupon ${req.params.code}:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { code, discountType, discountValue, expiresAt, minPurchase, usageLimit, isActive } = req.body;
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.code = code.toUpperCase() || coupon.code;
    coupon.discountType = discountType || coupon.discountType;
    coupon.discountValue = discountValue || coupon.discountValue;
    coupon.expiresAt = expiresAt || coupon.expiresAt;
    coupon.minPurchase = minPurchase === '' ? 0 : minPurchase || coupon.minPurchase;
    coupon.usageLimit = usageLimit === '' || usageLimit === null ? null : Number(usageLimit) || coupon.usageLimit;
    if (typeof isActive === 'boolean') {
        coupon.isActive = isActive;
    }

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code must be unique.' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Validate a coupon for a user
// @route   POST /api/coupons/validate
// @access  Private
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isActive || coupon.expiresAt < new Date() || (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) || cartTotal < coupon.minPurchase) {
      return res.status(400).json({ message: 'The provided coupon is invalid, expired, or does not meet requirements.' });
    }

    let discountAmount = coupon.discountType === 'percentage' ? (cartTotal * coupon.discountValue) / 100 : coupon.discountValue;
    discountAmount = Math.min(discountAmount, cartTotal);

    res.json({ code: coupon.code, discountAmount, message: 'Coupon applied successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;