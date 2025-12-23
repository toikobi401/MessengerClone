import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const displayName = profile.displayName;
        const avatarUrl = profile.photos[0]?.value || '';

        // Step 1: Check if user with googleId exists
        let user = await User.findOne({ where: { googleId } });

        if (user) {
          // User found with Google ID, return user
          return done(null, user);
        }

        // Step 2: Check if user with email exists (link account)
        user = await User.findOne({ where: { email } });

        if (user) {
          // User exists with email, link Google account
          user.googleId = googleId;
          
          // Update avatar if not set
          if (!user.isAvatarImageSet && avatarUrl) {
            user.avatarImage = avatarUrl;
            user.isAvatarImageSet = true;
          }
          
          await user.save();
          return done(null, user);
        }

        // Step 3: Create new user
        const newUser = await User.create({
          username: displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now().toString().slice(-4),
          email,
          googleId,
          avatarImage: avatarUrl,
          isAvatarImageSet: !!avatarUrl,
          password: null // Google users don't have password initially
        });

        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
