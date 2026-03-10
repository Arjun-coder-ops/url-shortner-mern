const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Stricter rate limit for auth endpoints (5 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many auth attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.get('/me', protect, getMe);

module.exports = router;
