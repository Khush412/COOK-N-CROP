const Coupon = require('../models/Coupon');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiresAt, minPurchase, usageLimit, tierRestrictions } = req.body;

    // Check if coupon with this code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon with this code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiresAt,
      minPurchase: minPurchase || 0,
      usageLimit: usageLimit || null,
      tierRestrictions: tierRestrictions || ['bronze', 'silver', 'gold'], // Default to all tiers
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all coupons with pagination and search
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';

    const query = search 
      ? { code: { $regex: search, $options: 'i' } }
      : {};

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Coupon.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        coupons,
        page,
        pages,
        total,
      },
    });
  } catch (error) {
    console.error('Get all coupons error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, expiresAt, minPurchase, usageLimit, tierRestrictions } = req.body;

    // Check if another coupon with this code already exists
    if (code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(), 
        _id: { $ne: id } 
      });
      if (existingCoupon) {
        return res.status(400).json({ success: false, message: 'Coupon with this code already exists' });
      }
    }

    const updateData = {
      ...(code && { code: code.toUpperCase() }),
      ...(discountType && { discountType }),
      ...(discountValue && { discountValue }),
      ...(expiresAt && { expiresAt }),
      ...(minPurchase !== undefined && { minPurchase }),
      ...(usageLimit !== undefined && { usageLimit }),
      ...(tierRestrictions && { tierRestrictions }), // Add tier restrictions
    };

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, cartTotal); // Can't discount more than cart total
    }

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};