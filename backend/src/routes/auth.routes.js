const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register with email and password
router.post('/register', registerValidation, authController.register);

// Login with email and password
router.post('/login', loginValidation, authController.login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  authController.githubCallback
);

// Get current user (protected route)
router.get('/me', authenticateJWT, authController.getCurrentUser);

module.exports = router;
