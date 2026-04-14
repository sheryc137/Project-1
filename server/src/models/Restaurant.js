const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    imageUrl: String,
    address: { type: String, trim: true },
    estimatedDeliveryMinutes: { type: Number, default: 30 },
    minimumOrder: { type: Number, default: 0 }, // cents
    deliveryFee: { type: Number, default: 199 }, // cents
    isOpen: { type: Boolean, default: true },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
