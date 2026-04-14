const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/menu.controller');
const { requireRole } = require('../middleware/roles.middleware');

router.get('/', ctrl.list);
router.get('/:itemId', ctrl.getOne);
router.post('/', requireRole('admin'), ctrl.create);
router.put('/:itemId', requireRole('admin'), ctrl.update);
router.delete('/:itemId', requireRole('admin'), ctrl.remove);

module.exports = router;
