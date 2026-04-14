const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(authenticate);

router.get('/me', ctrl.getMe);
router.put('/me', ctrl.updateMe);
router.put('/me/delivery-address', ctrl.updateDeliveryAddress);
router.post('/become-driver', ctrl.becomeDriver);
router.put('/driver/availability', requireRole('driver'), ctrl.toggleAvailability);
router.get('/admin/all', requireRole('admin'), ctrl.listAllUsers);

module.exports = router;
