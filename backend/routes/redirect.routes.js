const express = require('express');
const router = express.Router();
const { redirect } = require('../controllers/redirect.controller');

// Matches any /:shortCode that hasn't been caught by /api/* routes
// We explicitly exclude paths starting with "api" in server.js ordering
router.get('/:shortCode', redirect);

module.exports = router;
