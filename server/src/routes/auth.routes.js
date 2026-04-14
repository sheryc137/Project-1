const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { registerValidator, loginValidator, verifyEmailValidator } = require('../validators/auth.validator');

router.post('/register', registerValidator, validate, ctrl.register);
router.post('/verify-email', authenticate, verifyEmailValidator, validate, ctrl.verifyEmail);
router.post('/resend-verification', authenticate, ctrl.resendVerification);
router.post('/login', loginValidator, validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

module.exports = router;
