/**
 * API service for handling backend requests
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Register a new user
 * @param {Object} userData - User data including email, password, and name
 * @returns {Promise} Promise that resolves to user data and token
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.errors?.[0]?.msg || 'Registration failed');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login a user
 * @param {Object} credentials - User credentials including email and password
 * @returns {Promise} Promise that resolves to user data and token
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.errors?.[0]?.msg || 'Login failed');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise} Promise that resolves to user data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user data');
    }

    // Update stored user data
    localStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Logout the current user
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
