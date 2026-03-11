const { body, validationResult } = require('express-validator');

/**
 * Middleware to collect validation errors and return 422 if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// -- Auth validators -----------------------------------------------------------
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// -- URL validators ------------------------------------------------------------
const shortenValidator = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Must be a valid URL starting with http:// or https://'),
  body('customCode')
    .optional()
    .trim()
    .isAlphanumeric().withMessage('Custom code must be alphanumeric')
    .isLength({ min: 3, max: 20 }).withMessage('Custom code must be 3-20 characters'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title max 100 characters'),
  body('expiresAt')
    .optional()
    .isISO8601().withMessage('Expiry must be a valid date')
    .custom((val) => {
      if (new Date(val) <= new Date()) throw new Error('Expiry must be in the future');
      return true;
    }),
  validate,
];

module.exports = { registerValidator, loginValidator, shortenValidator };
