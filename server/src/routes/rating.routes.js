const router = require('express').Router();
const ctrl = require('../controllers/rating.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { ratingValidator } = require('../validators/payment.validator');

router.use(authenticate);

router.post('/', ratingValidator, validate, ctrl.submitRating);
router.get('/user/:userId', ctrl.getRatingsForUser);
router.get('/order/:orderId', ctrl.getRatingsForOrder);

module.exports = router;
