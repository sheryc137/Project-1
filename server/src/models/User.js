const mongoose = require('mongoose');
const { PEPPERDINE_EMAIL_REGEX } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => PEPPERDINE_EMAIL_REGEX.test(v),
        message: 'Must be a valid @pepperdine.edu email address',
      },
    },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['student', 'driver', 'admin'],
      default: 'student',
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    stripeCustomerId: String,
    profilePicture: String,
    deliveryAddress: {
      buildingName: String,
      roomNumber: String,
      deliveryNotes: String,
    },
    driverProfile: {
      isAvailable: { type: Boolean, default: false },
      vehicleType: { type: String, enum: ['foot', 'bike', 'car'] },
      stripeAccountId: String,
      totalDeliveries: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
    },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
