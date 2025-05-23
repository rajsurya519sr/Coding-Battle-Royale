const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

/**
 * Register a new user with email and password
 */
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token (excluding password)
    const { password: _, ...userData } = user;
    
    res.status(201).json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login with email and password
 */
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has a password (might be OAuth user)
    if (!user.password) {
      return res.status(401).json({ 
        message: 'This account was created with a social login. Please use that method to login.' 
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token (excluding password)
    const { password: _, ...userData } = user;
    
    res.json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Handle Google OAuth callback
 */
const googleCallback = (req, res) => {
  try {
    // Generate JWT token
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

/**
 * Handle GitHub OAuth callback
 */
const githubCallback = (req, res) => {
  try {
    // Generate JWT token
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

/**
 * Get current authenticated user
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by JWT middleware
    const { password, ...userData } = req.user;
    
    res.json({ user: userData });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  googleCallback,
  githubCallback,
  getCurrentUser
};
