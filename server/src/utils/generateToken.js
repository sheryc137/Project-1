const crypto = require('crypto');

/** Generate a 6-digit numeric OTP */
const generateOTP = () => {
  const digits = crypto.randomInt(100000, 999999);
  return String(digits);
};

/** Expiry: 15 minutes from now */
const otpExpiry = () => new Date(Date.now() + 15 * 60 * 1000);

module.exports = { generateOTP, otpExpiry };
