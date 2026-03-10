const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Generate a signed JWT for the given user id.
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /api/auth/register
 * Creates a new user account and returns a JWT.
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email is already in use
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

/**
 * POST /api/auth/login
 * Authenticates an existing user and returns a JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default via `select: false`)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { register, login, getMe };
