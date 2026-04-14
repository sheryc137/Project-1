const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stripePaymentIntentId: { type: String, required: true },
    stripeChargeId: String,
    stripeTransferId: String,
    amount: Number, // cents
    deliveryFee: Number,
    tip: Number,
    driverEarnings: Number,
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'refunded', 'failed'],
      default: 'pending',
    },
    refundAmount: Number,
    refundReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
