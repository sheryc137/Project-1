const router = require('express').Router();
const ctrl = require('../controllers/driver.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(authenticate, requireRole('driver'));

router.get('/available-orders', ctrl.getAvailableOrders);
router.get('/orders', ctrl.getDriverOrders);
router.get('/earnings', ctrl.getEarnings);
router.put('/orders/:id/accept', ctrl.acceptOrder);
router.put('/orders/:id/picked-up', ctrl.markPickedUp);
router.put('/orders/:id/in-transit', ctrl.markInTransit);
router.put('/orders/:id/delivered', ctrl.markDelivered);

module.exports = router;
