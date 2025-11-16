const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');
const Group = require('../models/Group'); // Add this import
const AutoJoinGroups = require('../models/AutoJoinGroups'); // Add this import
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { registerValidation, validate } = require('../middleware/validation');

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
router.post('/register', registerValidation, validate, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      // Be more specific about which field is duplicate
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email. Please use a different email or sign in instead.'
        });
      } else if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken. Please choose a different username.'
        });
      }
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Auto-join groups configuration
    try {
      const autoJoinConfig = await AutoJoinGroups.findOne({ isActive: true });
      if (autoJoinConfig && autoJoinConfig.groups.length > 0) {
        // Add user to each auto-join group
        for (const groupId of autoJoinConfig.groups) {
          try {
            const group = await Group.findById(groupId);
            if (group && !group.isPrivate) {
              // Only add to public groups
              if (!group.members.includes(user._id)) {
                group.members.push(user._id);
                group.memberCount = group.members.length;
                await group.save();
                
                // Add group to user's subscriptions
                if (!user.subscriptions.includes(group._id)) {
                  user.subscriptions.push(group._id);
                  await user.save();
                }
              }
            }
          } catch (groupError) {
            console.error(`Error adding user to group ${groupId}:`, groupError);
            // Continue with other groups even if one fails
          }
        }
      }
    } catch (configError) {
      console.error('Error fetching auto-join configuration:', configError);
      // Don't fail registration if auto-join config is broken
    }

    // Send welcome email
    const welcomeMessage = `
      <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background-color: #800000; color: white; padding: 20px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-family: 'Cinzel', serif;">Welcome to Cook'N'Crop!</h1>
          </div>
          <div style="padding: 30px 40px; color: #333; line-height: 1.6;">
            <h2 style="color: #333333; font-weight: 600;">Hi ${user.username},</h2>
            <p>We're thrilled to have you join our community of food lovers. Get ready to explore fresh ingredients, discover amazing recipes, and connect with fellow foodies.</p>
            <p style="margin-top: 25px;">Here's what you can do to get started:</p>
            <ul style="list-style-type: '🍳'; padding-left: 20px;">
              <li style="margin-bottom: 10px; padding-left: 10px;"><a href="${process.env.CLIENT_URL}/CropCorner" style="color: #800000; text-decoration: none; font-weight: bold;">Shop for fresh ingredients</a></li>
              <li style="margin-bottom: 10px; padding-left: 10px;"><a href="${process.env.CLIENT_URL}/recipes" style="color: #800000; text-decoration: none; font-weight: bold;">Discover new recipes</a></li>
              <li style="margin-bottom: 10px; padding-left: 10px;"><a href="${process.env.CLIENT_URL}/community" style="color: #800000; text-decoration: none; font-weight: bold;">Join the community discussions</a></li>
            </ul>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.CLIENT_URL}/" style="background-color: #e8eb14; color: #333; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; border: 2px solid #d7d911;">Explore The Site</a>
            </div>
            <p style="margin-top: 20px;">Happy cooking!</p>
            <p><em>- The Cook'N'Crop Team</em></p>
          </div>
          <div style="background-color: #fafafa; color: #777; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; border-top: 1px solid #eaeaea;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cook'N'Crop. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
    try {
      console.log('Sending welcome email to:', user.email);
      await sendEmail({ email: user.email, subject: 'Welcome to Cook-N-Crop!', message: welcomeMessage });
      console.log('Welcome email sent successfully to:', user.email);
    } catch (err) {
      console.error('Failed to send welcome email to:', user.email, err);
    }

    // Emit real-time event to admins
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('new_activity', {
        type: 'user',
        id: user._id,
        title: `New user registered: ${user.username}`,
        timestamp: user.createdAt
      });
    }

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
router.post('/login', async (req, res) => {
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

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  const message = `
    <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #800000; color: white; padding: 20px 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-family: 'Cinzel', serif;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px 40px; color: #333; line-height: 1.6;">
          <h2 style="color: #333333; font-weight: 600;">Reset Your Password</h2>
          <p>We received a request to reset the password for your Cook'N'Crop account. Click the button below to set a new password. This link is only valid for 10 minutes.</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" clicktracking=off style="background-color: #e8eb14; color: #333; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; border: 2px solid #d7d911;">Reset Your Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email or contact our support if you have concerns.</p>
          <p><em>- The Cook'N'Crop Team</em></p>
        </div>
        <div style="background-color: #fafafa; color: #777; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; border-top: 1px solid #eaeaea;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cook'N'Crop. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  try {
      console.log('Sending password reset email to:', user.email);
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request for Cook-N-Crop',
        message,
      });

      // Only save the token if the email was sent successfully
      await user.save();
      console.log('Password reset email sent successfully to:', user.email);

      res.status(200).json({ success: true, message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (err) {
      console.error('Email sending error for:', user.email, err);
      // Do not save the user with the reset token if email fails.
      // This allows the user to try again without being locked out.
      res.status(500).json({ success: false, message: 'Could not send password reset email. Please try again later.' });
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

// @desc    LinkedIn OAuth
// @route   GET /api/auth/linkedin
// @access  Public
router.get('/linkedin', passport.authenticate('linkedin'));

// @desc    LinkedIn OAuth callback
// @route   GET /api/auth/linkedin/callback
// @access  Public
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
