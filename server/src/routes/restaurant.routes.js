const router = require('express').Router();
const ctrl = require('../controllers/restaurant.controller');
const menuRouter = require('./menu.routes');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(authenticate);
router.use('/:restaurantId/menu', menuRouter);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', requireRole('admin'), ctrl.create);
router.put('/:id', requireRole('admin'), ctrl.update);
router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
