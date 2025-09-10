const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validateProfileUpdate, validatePasswordChange, handleValidationErrors } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

// ======= Exact Current User Routes - MUST come before /:id dynamic routes =======

// @desc    Get current logged-in user's profile
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  console.log('Profile fetch requested by user:', req.user?.id);
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.getPublicProfile() });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// @desc    Update current user profile (with optional profile picture upload)
// @route   PUT /api/users/me
// @access  Private
router.put(
  '/me',
  protect,
  upload.single('profilePic'),
  validateProfileUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (typeof req.body.username === 'string' && req.body.username.trim() !== '') {
        user.username = req.body.username.trim();
      }
      if (typeof req.body.bio === 'string') {
        user.bio = req.body.bio.trim();
      }
      if (req.file) {
        user.profilePic = `/uploads/profilePics/${req.file.filename}`;
      }

      await user.save();
      res.json({ success: true, data: user.getPublicProfile(), message: 'Profile updated' });
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ success: false, message: 'Error updating profile' });
    }
  }
);

// @desc    Unlink a social OAuth provider from current user
// @route   DELETE /api/users/me/social/unlink/:provider
// @access  Private
router.delete('/me/social/unlink/:provider', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const provider = req.params.provider.toLowerCase();
    if (!['google', 'github', 'twitter'].includes(provider)) {
      return res.status(400).json({ success: false, message: 'Invalid provider' });
    }

    // Reset OAuth provider info safely
    user[provider] = {};

    await user.save();

    res.json({ success: true, message: `${provider} account unlinked` });
  } catch (err) {
    console.error('Error unlinking social account:', err);
    res.status(500).json({ success: false, message: 'Error unlinking social account' });
  }
});

// ======= Dynamic :id Routes =======

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this user' });
    }

    res.status(200).json({ success: true, data: user.getPublicProfile() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update user by ID
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, validateProfileUpdate, handleValidationErrors, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
    }

    const fieldsToUpdate = {
      username: req.body.username,
      bio: req.body.bio,
      profilePic: req.body.profilePic,
    };

    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
    });

    const updatedUser = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedUser.getPublicProfile() });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error during user update' });
  }
});

// @desc    Delete user by ID
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this user' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error during user deletion' });
  }
});

// @desc    Change password by ID
// @route   PUT /api/users/:id/password
// @access  Private
router.put('/:id/password', protect, validatePasswordChange, handleValidationErrors, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to change this password' });
    }

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password change' });
  }
});

// @desc    Update user subscription plan
// @route   PUT /api/users/:id/subscription
// @access  Private
router.put('/:id/subscription', protect, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this subscription' });
    }

    const { plan, startDate, endDate, isActive } = req.body;
    const validPlans = ['free', 'premium', 'pro'];
    if (plan && !validPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
    }

    const updateData = {};
    if (plan) updateData['subscription.plan'] = plan;
    if (startDate) updateData['subscription.startDate'] = startDate;
    if (endDate) updateData['subscription.endDate'] = endDate;
    if (typeof isActive === 'boolean') updateData['subscription.isActive'] = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, subscription: user.subscription });
  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({ success: false, message: 'Server error during subscription update' });
  }
});

module.exports = router;
