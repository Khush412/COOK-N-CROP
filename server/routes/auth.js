const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        role: user.role,
        google: user.google,
        github: user.github,
        twitter: user.twitter,
        preferences: user.preferences,
        subscription: user.subscription,
        savedPosts: user.savedPosts,
        activity: user.activity,
        createdAt: user.createdAt
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email === email ? 'email' : 'username');
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'User already exists with this email' 
          : 'Username is already taken'
      });
    }

    console.log('Creating new user...');
    console.log('User data:', { username, email, password: '***' });
    
    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    console.log('User created successfully:', {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${messages.join(', ')}`
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findByEmailOrUsername(email).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: 'INCORRECT_PASSWORD',
        message: 'Incorrect password'
      });
    }

    // Update last activity
    await user.updateLastActivity();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        role: user.role,
        google: user.google,
        github: user.github,
        twitter: user.twitter,
        preferences: user.preferences,
        subscription: user.subscription,
        savedPosts: user.savedPosts,
        activity: user.activity,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
router.get('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// @desc    GitHub OAuth
// @route   GET /api/auth/github
// @access  Public
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// @desc    Twitter OAuth
// @route   GET /api/auth/twitter
// @access  Public
router.get('/twitter', passport.authenticate('twitter'));

// @desc    Twitter OAuth callback
// @route   GET /api/auth/twitter/callback
// @access  Public
router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const fieldsToUpdate = {
      username: req.body.username,
      bio: req.body.bio,
      profilePic: req.body.profilePic
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        role: user.role,
        google: user.google,
        github: user.github,
        twitter: user.twitter,
        preferences: user.preferences,
        subscription: user.subscription,
        activity: user.activity,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: req.body.preferences },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during preferences update'
    });
  }
});

module.exports = router;
