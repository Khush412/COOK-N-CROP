const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

// Admin routes
router.route('/')
  .post(protect, authorize('admin'), createCoupon)
  .get(protect, authorize('admin'), getAllCoupons);

router.route('/:id')
    .put(protect, authorize('admin'), updateCoupon)
    .delete(protect, authorize('admin'), deleteCoupon);

// User route
router.post('/validate', protect, validateCoupon);

module.exports = router;