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

// @desc    Get all users (Admin only)
// @route   GET /api/users/all
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Toggle save/unsave a post
// @route   PUT /api/users/me/posts/save/:postId
// @access  Private
router.put('/me/posts/save/:postId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.postId;

    // Defensive check: Ensure savedPosts is an array. This handles older user documents
    // that might not have this field initialized.
    if (!Array.isArray(user.savedPosts)) {
      user.savedPosts = [];
    }

    const postIndex = user.savedPosts.indexOf(postId);

    if (postIndex > -1) {
      // Post is already saved, so unsave it
      user.savedPosts.splice(postIndex, 1);
    } else {
      // Post is not saved, so save it
      user.savedPosts.push(postId);
    }

    await user.save();
    res.status(200).json({ success: true, savedPosts: user.savedPosts });
  } catch (error) {
    console.error('Toggle save post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get user's saved posts
// @route   GET /api/users/me/posts/saved
// @access  Private
router.get('/me/posts/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedPosts',
      populate: {
        path: 'user',
        select: 'username profilePic'
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user.savedPosts });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get public user profile by username, including their posts and comments
// @route   GET /api/users/profile/:username
// @access  Public
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('username bio profilePic createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Dynamically import Post and Comment models to avoid circular dependencies if any
    const Post = require('../models/Post');
    const Comment = require('../models/Comment');

    // Fetch user's recent posts
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(15) // Limit for performance
      .select('title createdAt');

    // Fetch user's recent comments
    const comments = await Comment.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(15) // Limit for performance
      .populate('post', 'title _id') // Populate post title to give context
      .select('content createdAt post');

    res.status(200).json({ success: true, data: { user, posts, comments } });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'premium', 'admin'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, data: { _id: user._id, role: user.role } });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ success: false, message: 'Admin cannot deactivate their own account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ success: true, data: { _id: user._id, isActive: user.isActive } });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
