const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true }, // cents
    category: { type: String, trim: true },
    imageUrl: String,
    isAvailable: { type: Boolean, default: true },
    customizationOptions: [
      {
        label: String,
        choices: [
          {
            name: String,
            additionalCost: { type: Number, default: 0 },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
