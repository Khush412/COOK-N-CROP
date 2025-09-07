const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
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
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 'google.id': profile.id });
      
      if (user) {
        // Update last login
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
        username: profile.displayName.toLowerCase().replace(/\s+/g, '_') + '_' + profile.id.slice(-4),
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
    callbackURL: "/api/auth/github/callback"
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
          avatar_url: profile.photos[0]?.value,
          bio: profile._json.bio,
          public_repos: profile._json.public_repos,
          followers: profile._json.followers,
          following: profile._json.following
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
            avatar_url: profile.photos[0]?.value,
            bio: profile._json.bio,
            public_repos: profile._json.public_repos,
            followers: profile._json.followers,
            following: profile._json.following
          };
          await user.save();
          await user.updateLastActivity();
          return done(null, user);
        }
      }

      // Create new user
      const newUser = new User({
        username: profile.username + '_' + profile.id.slice(-4),
        email: email || `${profile.username}@github.local`,
        github: {
          id: profile.id,
          username: profile.username,
          email: email,
          name: profile.displayName || profile.username,
          avatar_url: profile.photos[0]?.value,
          bio: profile._json.bio,
          public_repos: profile._json.public_repos,
          followers: profile._json.followers,
          following: profile._json.following
        },
        isEmailVerified: !!email,
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

// Twitter OAuth Strategy
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "/api/auth/twitter/callback"
  },
  async (token, tokenSecret, profile, done) => {
    try {
      // Check if user already exists with this Twitter ID
      let user = await User.findOne({ 'twitter.id': profile.id });
      
      if (user) {
        // Update Twitter info and last login
        user.twitter = {
          id: profile.id,
          username: profile.username,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || user.email,
          profile_image_url: profile.photos[0]?.value,
          followers_count: profile._json.followers_count,
          following_count: profile._json.friends_count,
          tweet_count: profile._json.statuses_count
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
          // Link Twitter account to existing user
          user.twitter = {
            id: profile.id,
            username: profile.username,
            name: profile.displayName,
            email: email,
            profile_image_url: profile.photos[0]?.value,
            followers_count: profile._json.followers_count,
            following_count: profile._json.friends_count,
            tweet_count: profile._json.statuses_count
          };
          await user.save();
          await user.updateLastActivity();
          return done(null, user);
        }
      }

      // Create new user
      const newUser = new User({
        username: profile.username + '_' + profile.id.slice(-4),
        email: email || `${profile.username}@twitter.local`,
        twitter: {
          id: profile.id,
          username: profile.username,
          name: profile.displayName,
          email: email,
          profile_image_url: profile.photos[0]?.value,
          followers_count: profile._json.followers_count,
          following_count: profile._json.friends_count,
          tweet_count: profile._json.statuses_count
        },
        isEmailVerified: !!email,
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
