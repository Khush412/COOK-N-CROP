const express = require('express');
const { protect } = require('../middleware/auth');
const { getHarvestCoinsBalance, redeemHarvestCoins } = require('../controllers/loyaltyController');

const router = express.Router();

// @desc    Get user's Harvest Coins balance
// @route   GET /api/loyalty/balance
// @access  Private
router.route('/balance').get(protect, async (req, res) => {
  try {
    const result = await getHarvestCoinsBalance(req.user._id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Redeem Harvest Coins for discount
// @route   POST /api/loyalty/redeem
// @access  Private
router.route('/redeem').post(protect, async (req, res) => {
  try {
    const { coins, orderValue } = req.body;
    const result = await redeemHarvestCoins(req.user._id, coins, orderValue);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;