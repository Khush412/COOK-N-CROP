const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 'google.id': profile.id });
      
      if (user) {
        // Update last login and Google info
        user.google.name = profile.displayName;
        user.google.picture = profile.photos[0]?.value;
        if (!user.profilePic) { // If user has no custom pic, update from social
          user.profilePic = profile.photos[0]?.value;
        }
        await user.save();
        await user.updateLastActivity();
        return done(null, user);
      }

      // Check if user exists with this email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.google = {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0]?.value
        };
        await user.save();
        await user.updateLastActivity();
        return done(null, user);
      }

      // Create new user
      const newUser = new User({
        // Sanitize display name to create a valid username
        username: (profile.displayName || 'user').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() + '_' + profile.id.slice(-4),
        email: profile.emails[0].value,
        google: {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0]?.value
        },
        isEmailVerified: true,
        lastLogin: new Date(),
        loginCount: 1
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`,
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this GitHub ID
      let user = await User.findOne({ 'github.id': profile.id });
      
      if (user) {
        // Update GitHub info and last login
        user.github = {
          id: profile.id,
          username: profile.username,
          email: profile.emails?.[0]?.value || user.email,
          name: profile.displayName || profile.username,
          avatar_url: profile.photos?.[0]?.value,
          bio: profile._json?.bio,
          public_repos: profile._json?.public_repos,
          followers: profile._json?.followers,
          following: profile._json?.following
        };
        await user.save();
        await user.updateLastActivity();
        return done(null, user);
      }

      // Check if user exists with this email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email });
        
        if (user) {
          // Link GitHub account to existing user
          user.github = {
            id: profile.id,
            username: profile.username,
            email: email,
            name: profile.displayName || profile.username,
            avatar_url: profile.photos?.[0]?.value,
            bio: profile._json?.bio,
            public_repos: profile._json?.public_repos,
            followers: profile._json?.followers,
            following: profile._json?.following
          };
          await user.save();
          await user.updateLastActivity();
          return done(null, user);
        }
      }

      // If we are here, it's a new user. We MUST have an email to proceed.
      if (!email) {
        return done(new Error('Your GitHub account does not have a public email address. Please add one to sign up.'), false);
      }

      // Create new user
      const newUser = new User({
        username: (profile.username || 'user').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() + '_' + profile.id.slice(-4),
        email: email,
        github: {
          id: profile.id,
          username: profile.username,
          email: email,
          name: profile.displayName || profile.username,
          avatar_url: profile.photos?.[0]?.value,
          bio: profile._json?.bio,
          public_repos: profile._json?.public_repos,
          followers: profile._json?.followers,
          following: profile._json?.following
        },
        isEmailVerified: true,
        lastLogin: new Date(),
        loginCount: 1
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/auth/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true // Recommended for security
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this LinkedIn ID
      let user = await User.findOne({ 'linkedin.id': profile.id });
      
      if (user) {
        // Update last login and potentially other info
        user.linkedin = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || user.email,
          profile_image_url: profile.photos?.[0]?.value,
        };
        await user.save();
        await user.updateLastActivity();
        return done(null, user);
      }

      // Check if user exists with this email from LinkedIn
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email });
        
        if (user) {
          // Link LinkedIn account to existing user
          user.linkedin = {
            id: profile.id,
            name: profile.displayName,
            email: email,
            profile_image_url: profile.photos?.[0]?.value,
          };
          await user.save();
          await user.updateLastActivity();
          return done(null, user);
        }
      }

      // If we are here, it's a new user. We MUST have an email to proceed
      if (!email) {
        return done(new Error('Your LinkedIn account did not provide an email address. Please ensure your LinkedIn email is public or try another login method.'), false);
      }

      // Create new user
      const newUser = new User({
        username: (profile.displayName || 'user').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() + '_' + profile.id.slice(-4),
        email: email,
        linkedin: {
          id: profile.id,
          name: profile.displayName,
          email: email,
          profile_image_url: profile.photos?.[0]?.value,
        },
        isEmailVerified: true,
        lastLogin: new Date(),
        loginCount: 1
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));
}

module.exports = passport;
