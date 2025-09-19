const express = require('express');
const User = require('../models/User');
const Address = require('../models/Address');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateProfileUpdate, validatePasswordChange, handleValidationErrors } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

// ======= Exact Current User Routes - MUST come before /:id dynamic routes =======

// @desc    Get current logged-in user's profile
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req, res) => {
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

// @desc    Change current user's password
// @route   PUT /api/users/me/password
// @access  Private
router.put(
  '/me/password',
  protect,
  validatePasswordChange,
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      user.password = req.body.newPassword;
      await user.save();

      // Optionally, you can send a new token here or just a success message.
      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: 'Server error during password change' });
    }
  }
);

// @desc    Delete current user's account
// @route   POST /api/users/me/delete-account
// @access  Private
router.post('/me/delete-account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to delete your account.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // Anonymize user data instead of hard deleting to preserve community content integrity
    user.username = `user_${user._id.toString().slice(-8)}`;
    user.email = `${user._id}@deleted.co`;
    user.password = undefined; // This will be removed by the pre-save hook if not modified
    user.bio = 'This account has been deleted.';
    user.profilePic = null;
    user.isActive = false;
    user.google = undefined;
    user.github = undefined;
    user.twitter = undefined;
    user.savedPosts = [];
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false }); // Skip validation as we are intentionally setting invalid email etc.

    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Server error during account deletion.' });
  }
});

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
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const search = req.query.search || '';

    const searchRegex = new RegExp(search, 'i');
    const query = search
      ? {
          $or: [
            { username: searchRegex },
            { email: searchRegex },
          ],
        }
      : {};

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({ success: true, users, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Bulk update user status (Admin only)
// @route   PUT /api/users/bulk-status
// @access  Private/Admin
router.put('/bulk-status', protect, authorize('admin'), async (req, res) => {
  try {
    const { userIds, isActive } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'User IDs and a valid status are required.' });
    }

    // Prevent admin from deactivating themselves in a bulk operation
    if (!isActive && userIds.includes(req.user.id.toString())) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account in a bulk operation.' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isActive: isActive } }
    );

    res.status(200).json({ success: true, message: `${result.modifiedCount} users updated.` });
  } catch (error) {
    console.error('Bulk update user status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Search for users by username or email (Admin only)
// @route   GET /api/users/search
// @access  Private/Admin
router.get('/search', protect, authorize('admin'), async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.json([]);
    }
    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [{ username: searchRegex }, { email: searchRegex }],
    })
    .select('_id username email')
    .limit(10); // Limit results for performance

    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server Error' });
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

// @desc    Toggle a product in user's wishlist
// @route   PUT /api/users/me/wishlist/:productId
// @access  Private
router.put('/me/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;

    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    const productIndex = user.wishlist.indexOf(productId);

    if (productIndex > -1) {
      user.wishlist.splice(productIndex, 1); // Remove from wishlist
    } else {
      user.wishlist.push(productId); // Add to wishlist
    }

    await user.save();
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get user's wishlist
// @route   GET /api/users/me/wishlist
// @access  Private
router.get('/me/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user.wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
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

// @desc    Get current user's activity (posts and comments)
// @route   GET /api/users/me/activity
// @access  Private
router.get('/me/activity', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Dynamically import Post and Comment models to avoid circular dependencies if any
    const Post = require('../models/Post');
    const Comment = require('../models/Comment');

    // Fetch user's recent posts
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to a reasonable number
      .select('title createdAt');

    // Fetch user's recent comments
    const comments = await Comment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to a reasonable number
      .populate('post', 'title _id') // Populate post title to give context
      .select('content createdAt post');

    res.status(200).json({ success: true, data: { posts, comments } });
  } catch (error) {
    console.error('Get my activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get public user profile by username, including their posts and comments
// @route   GET /api/users/profile/:username
// @access  Public
router.get('/profile/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('username bio profilePic createdAt followers following');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the logged-in user (if any) is following this profile
    let isFollowing = false;
    if (req.user) {
      isFollowing = req.user.following.some(id => id.equals(user._id));
    }

    const publicProfile = user.getPublicProfile();
    publicProfile.followersCount = user.followers.length;
    publicProfile.followingCount = user.following.length;

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

    res.status(200).json({ success: true, data: { user: publicProfile, posts, comments, isFollowing } });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get current user's blocked users
// @route   GET /api/users/me/blocked
// @access  Private
router.get('/me/blocked', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('blockedUsers', 'username profilePic');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.blockedUsers });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get current user's dashboard data
// @route   GET /api/users/me/dashboard
// @access  Private
router.get('/me/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const Post = require('../models/Post');
    const Comment = require('../models/Comment');
    const Order = require('../models/Order');

    const recentOrdersPromise = Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('totalPrice status createdAt');

    const recentPostsPromise = Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title createdAt');

    const recentCommentsPromise = Comment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('post', 'title _id')
      .select('content createdAt post');

    const [recentOrders, recentPosts, recentComments] = await Promise.all([
      recentOrdersPromise,
      recentPostsPromise,
      recentCommentsPromise,
    ]);

    res.status(200).json({ success: true, data: { recentOrders, recentPosts, recentComments } });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all addresses for a specific user (Admin only)
// @route   GET /api/users/:userId/addresses
// @access  Private/Admin
router.get('/:userId/addresses', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('username');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const addresses = await Address.find({ user: req.params.userId });
    res.status(200).json({ success: true, data: { username: user.username, addresses: addresses } });
  } catch (error) {
    console.error('Get user addresses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete an address for a specific user (Admin only)
// @route   DELETE /api/users/:userId/addresses/:addressId
// @access  Private/Admin
router.delete('/:userId/addresses/:addressId', protect, authorize('admin'), async (req, res) => {
  try {
    const address = await Address.findById(req.params.addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    if (address.user.toString() !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Address does not belong to this user.' });
    }
    await address.deleteOne();
    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete user address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======= Dynamic :id Routes =======

// @desc    Block/unblock a user
// @route   PUT /api/users/:id/block
// @access  Private
router.put('/:id/block', protect, async (req, res) => {
  try {
    const userToBlock = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToBlock || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot block yourself." });
    }

    const isBlocked = currentUser.blockedUsers.some(id => id.equals(userToBlock._id));

    if (isBlocked) {
      // Unblock
      currentUser.blockedUsers.pull(userToBlock._id);
    } else {
      // Block
      currentUser.blockedUsers.push(userToBlock._id);
    }

    await currentUser.save();
    res.status(200).json({ success: true, message: isBlocked ? 'User unblocked' : 'User blocked' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Follow/unfollow a user
// @route   PUT /api/users/:id/follow
// @access  Private
router.put('/:id/follow', protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself." });
    }

    const isFollowing = currentUser.following.some(id => id.equals(userToFollow._id));

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(currentUser._id);
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.status(200).json({ success: true, message: isFollowing ? 'User unfollowed' : 'User followed' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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

// @desc    Delete user by ID (Admin only - Anonymizes user)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ success: false, message: 'Admin cannot delete their own account via this route.' });
    }

    // Anonymize user data instead of hard deleting
    user.username = `user_${user._id.toString().slice(-8)}`;
    user.email = `${user._id}@deleted.co`;
    user.password = undefined;
    user.bio = 'This account has been deleted.';
    user.profilePic = null;
    user.isActive = false;
    user.google = undefined;
    user.github = undefined;
    user.twitter = undefined;
    user.savedPosts = [];
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'User account has been anonymized and deactivated.' });
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
