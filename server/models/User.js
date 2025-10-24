const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.google && !this.github && !this.linkedin;
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  flavorPoints: {
    type: Number,
    default: 0
  },
  profilePic: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // OAuth providers
  google: {
    id: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    picture: {
      type: String,
      default: null
    }
  },
  github: {
    id: {
      type: String,
      default: null
    },
    username: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    avatar_url: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      default: null
    },
    public_repos: {
      type: Number,
      default: 0
    },
    followers: {
      type: Number,
      default: 0
    },
    following: {
      type: Number,
      default: 0
    }
  },
  linkedin: {
    id: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null
    },
    profile_image_url: {
      type: String,
      default: null
    }
  },
  // User preferences
  preferences: {
    theme: {
      type: String,
      default: 'forestMist'
    },
    fontFamily: {
      type: String,
      default: 'Roboto, Arial, sans-serif'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'private'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showSocialLinks: {
        type: Boolean,
        default: true
      }
    }
  },
  // Saved content
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  // Following/Followers
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Activity tracking
  activity: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    harvestCoins: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance (excluding email and username because unique is inline)
userSchema.index({ 'google.id': 1 });
userSchema.index({ 'github.id': 1 });
userSchema.index({ 'linkedin.id': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.google && this.google.name) return this.google.name;
  if (this.github && this.github.name) return this.github.name;
  if (this.linkedin && this.linkedin.name) return this.linkedin.name;
  return this.username;
});

// Virtual for profile picture URL
userSchema.virtual('profilePicture').get(function() {
  if (this.profilePic) return this.profilePic;
  if (this.google && this.google.picture) return this.google.picture;
  if (this.github && this.github.avatar_url) return this.github.avatar_url;
  if (this.linkedin && this.linkedin.profile_image_url) return this.linkedin.profile_image_url;
  return null;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // If profilePic is not set, try to set it from a social provider.
  // This ensures OAuth users get an avatar automatically.
  if (!this.profilePic) {
    if (this.google?.picture) {
      this.profilePic = this.google.picture;
    } else if (this.github?.avatar_url) {
      this.profilePic = this.github.avatar_url;
    } else if (this.linkedin && this.linkedin.profile_image_url) {
      this.profilePic = this.linkedin.profile_image_url;
    }
  }

  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get the user object for the client
userSchema.methods.getClientUserObject = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    bio: this.bio,
    profilePic: this.profilePic,
    role: this.role,
    google: this.google,
    github: this.github,
    linkedin: this.linkedin,
    preferences: this.preferences,
    savedPosts: this.savedPosts,
    wishlist: this.wishlist,
    activity: this.activity,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
    loginCount: this.loginCount
  };
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

// Update last activity
userSchema.methods.updateLastActivity = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  this.activity.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
