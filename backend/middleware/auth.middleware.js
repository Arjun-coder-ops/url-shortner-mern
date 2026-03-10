const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Protect routes: verifies the JWT in the Authorization header.
 * Attaches the user document to req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Support both "Bearer <token>" header and cookie
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user (ensures deleted users can't authenticate)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = { protect };
