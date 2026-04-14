const { body } = require('express-validator');

const createIntentValidator = [
  body('orderId').isMongoId().withMessage('Valid order ID required'),
  body('tip').optional().isInt({ min: 0 }).withMessage('Tip must be a non-negative integer (cents)'),
];

const ratingValidator = [
  body('orderId').isMongoId().withMessage('Valid order ID required'),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 500 }),
];

module.exports = { createIntentValidator, ratingValidator };
