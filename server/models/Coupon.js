const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'], // e.g., 10% off or $5 off
  },
  discountValue: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  timesUsed: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Tier restrictions - which tiers can use this coupon
  tierRestrictions: {
    type: [String],
    enum: ['bronze', 'silver', 'gold'],
    default: ['bronze', 'silver', 'gold'], // Available to all tiers by default
  },
}, {
  timestamps: true,
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;