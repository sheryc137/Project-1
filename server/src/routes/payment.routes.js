const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createIntentValidator } = require('../validators/payment.validator');

// Webhook must use raw body — registered separately in app.js
router.post('/create-intent', authenticate, createIntentValidator, validate, ctrl.createIntent);
router.get('/:orderId', authenticate, ctrl.getPayment);
router.post('/:orderId/refund', authenticate, requireRole('admin'), ctrl.refundPayment);
router.post('/driver/onboard', authenticate, requireRole('driver'), ctrl.driverOnboard);

module.exports = router;
