const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  getUserLinks,
  getUrlAnalytics,
  getDashboard,
  deleteUrl,
  getQrCode,
} = require('../controllers/url.controller');
const { protect } = require('../middleware/auth.middleware');
const { shortenValidator } = require('../middleware/validate.middleware');
const rateLimit = require('express-rate-limit');

// Limit URL creation: 20 per 10 min per user IP
const shortenLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Too many URL creation requests. Please slow down.' },
});

// All URL routes require authentication
router.use(protect);

router.post('/shorten', shortenLimiter, shortenValidator, shortenUrl);
router.get('/user-links', getUserLinks);
router.get('/dashboard', getDashboard);
router.get('/analytics/:id', getUrlAnalytics);
router.get('/qr/:id', getQrCode);
router.delete('/:id', deleteUrl);

module.exports = router;
