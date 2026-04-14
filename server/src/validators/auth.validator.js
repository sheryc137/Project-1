const { body } = require('express-validator');

const registerValidator = [
  body('email')
    .trim()
    .toLowerCase()
    .matches(/^[\w.+-]+@pepperdine\.edu$/)
    .withMessage('Must be a valid @pepperdine.edu email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

const loginValidator = [
  body('email').trim().toLowerCase().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const verifyEmailValidator = [
  body('token')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Token must be a 6-digit code'),
];

module.exports = { registerValidator, loginValidator, verifyEmailValidator };
