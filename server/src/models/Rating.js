const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    raterRole: { type: String, enum: ['student', 'driver'], required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true }
);

// Prevent double-rating: each user can only rate once per order
ratingSchema.index({ order: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
