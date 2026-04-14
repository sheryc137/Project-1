const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../utils/constants');

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },

    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: String,
        price: Number,
        quantity: { type: Number, min: 1 },
        selectedOptions: [
          {
            label: String,
            choice: String,
            additionalCost: Number,
          },
        ],
        subtotal: Number,
      },
    ],

    deliveryAddress: {
      buildingName: String,
      roomNumber: String,
      deliveryNotes: String,
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },

    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],

    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    stripePaymentIntentId: String,

    subtotal: Number,
    deliveryFee: Number,
    tip: { type: Number, default: 0 },
    totalAmount: Number,

    specialInstructions: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,

    customerRatingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    driverRatingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
