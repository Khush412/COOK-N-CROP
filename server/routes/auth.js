const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
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
      user: user.getClientUserObject()
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

    // Send welcome email
    const welcomeMessage = `
      <h1>Welcome to Cook-N-Crop, ${user.username}!</h1>
      <p>We're thrilled to have you join our community of food lovers.</p>
      <p>Here's what you can do to get started:</p>
      <ul>
        <li><a href="${process.env.CLIENT_URL}/CropCorner">Shop for fresh ingredients</a></li>
        <li><a href="${process.env.CLIENT_URL}/recipes">Discover new recipes</a></li>
        <li><a href="${process.env.CLIENT_URL}/community">Join the community discussions</a></li>
      </ul>
      <p>Happy cooking!</p>
    `;
    sendEmail({ email: user.email, subject: 'Welcome to Cook-N-Crop!', message: welcomeMessage }).catch(err => {
      console.error('Failed to send welcome email:', err);
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

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // We send a success response even if user not found to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to passwordResetToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire time (10 minutes)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request for Cook-N-Crop',
        message,
      });
    } catch (err) {
      console.error('Email sending error:', err);
      // Clear fields on error to be safe
    }

    res.status(200).json({ success: true, message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Clear fields on error to be safe
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put('/reset-password/:resettoken', async (req, res) => {
  // Get hashed token
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  // Set new password
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: user.getClientUserObject()
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
      user: user.getClientUserObject()
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
