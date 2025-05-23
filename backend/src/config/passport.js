const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const prisma = require('./database');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// JWT Strategy
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || '5f2b5cdbe5194f10b3241568fe4e2b22' // Fallback to hardcoded secret if env var is not available
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id }
      });

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy - Only initialize if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Initializing Google OAuth strategy');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id }
          });

          // If user doesn't exist, create a new one
          if (!user) {
            // Check if email already exists
            const existingUserWithEmail = await prisma.user.findUnique({
              where: { email: profile.emails[0].value }
            });

            if (existingUserWithEmail) {
              // Update existing user with Google ID
              user = await prisma.user.update({
                where: { id: existingUserWithEmail.id },
                data: { googleId: profile.id }
              });
            } else {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email: profile.emails[0].value,
                  name: profile.displayName,
                  googleId: profile.id,
                  avatar: profile.photos[0]?.value
                }
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
} else {
  console.log('Google OAuth credentials not found, strategy not initialized');
}

// GitHub OAuth Strategy - Only initialize if credentials are available
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('Initializing GitHub OAuth strategy');
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await prisma.user.findUnique({
            where: { githubId: profile.id.toString() }
          });

          // If user doesn't exist, create a new one
          if (!user) {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
            
            // Check if email already exists
            const existingUserWithEmail = await prisma.user.findUnique({
              where: { email }
            });

            if (existingUserWithEmail) {
              // Update existing user with GitHub ID
              user = await prisma.user.update({
                where: { id: existingUserWithEmail.id },
                data: { githubId: profile.id.toString() }
              });
            } else {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  name: profile.displayName || profile.username,
                  githubId: profile.id.toString(),
                  avatar: profile.photos[0]?.value
                }
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
} else {
  console.log('GitHub OAuth credentials not found, strategy not initialized');
}

module.exports = passport;
