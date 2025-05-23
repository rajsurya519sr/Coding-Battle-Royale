const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Fallback JWT secret if environment variable is not available
const JWT_SECRET = process.env.JWT_SECRET || '5f2b5cdbe5194f10b3241568fe4e2b22';
console.log('Using JWT_SECRET:', JWT_SECRET ? 'Secret is set' : 'Secret is NOT set');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object from database
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { generateToken };
