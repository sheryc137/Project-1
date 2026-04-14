const { body } = require('express-validator');

const placeOrderValidator = [
  body('restaurantId').isMongoId().withMessage('Valid restaurant ID required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menuItemId').isMongoId().withMessage('Valid menu item ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress.buildingName').trim().notEmpty().withMessage('Building name is required'),
  body('deliveryAddress.roomNumber').trim().notEmpty().withMessage('Room number is required'),
];

module.exports = { placeOrderValidator };
