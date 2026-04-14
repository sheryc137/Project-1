const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { placeOrderValidator } = require('../validators/order.validator');

router.use(authenticate);

router.post('/', placeOrderValidator, validate, ctrl.placeOrder);
router.get('/', ctrl.getMyOrders);
router.get('/:id', ctrl.getOrder);
router.put('/:id/cancel', ctrl.cancelOrder);

module.exports = router;
