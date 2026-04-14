const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/jwtHelpers');
const { generateOTP, otpExpiry } = require('../utils/generateToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOTP();

  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    emailVerificationToken: otp,
    emailVerificationExpires: otpExpiry(),
  });

  try {
    await sendVerificationEmail(email, otp);
  } catch (e) {
    console.error('Email send failed:', e.message);
  }

  const tokenPayload = { userId: user._id, role: user.role, isEmailVerified: false };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ userId: user._id });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.status(201).json({
    accessToken,
    user: { id: user._id, email: user.email, firstName, lastName, role: user.role, isEmailVerified: false },
  });
};

const verifyEmail = async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.isEmailVerified) return res.status(400).json({ error: 'Email already verified' });

  if (
    user.emailVerificationToken !== token ||
    !user.emailVerificationExpires ||
    Date.now() > user.emailVerificationExpires.getTime()
  ) {
    return res.status(400).json({ error: 'Invalid or expired verification code' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  const accessToken = signAccessToken({ userId: user._id, role: user.role, isEmailVerified: true });
  res.json({ accessToken, message: 'Email verified successfully' });
};

const resendVerification = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.isEmailVerified) return res.status(400).json({ error: 'Email already verified' });

  const otp = generateOTP();
  user.emailVerificationToken = otp;
  user.emailVerificationExpires = otpExpiry();
  await user.save();

  await sendVerificationEmail(user.email, otp);
  res.json({ message: 'Verification email resent' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.isEmailVerified) {
    return res.status(403).json({ error: 'Please verify your email before logging in' });
  }

  const tokenPayload = { userId: user._id, role: user.role, isEmailVerified: true };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ userId: user._id });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({
    accessToken,
    user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  });
};

const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const accessToken = signAccessToken({ userId: user._id, role: user.role, isEmailVerified: user.isEmailVerified });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken', COOKIE_OPTS);
  res.json({ message: 'Logged out' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always return 200 to avoid email enumeration
  if (!user) return res.json({ message: 'If that email exists, a reset code was sent' });

  const otp = generateOTP();
  user.passwordResetToken = otp;
  user.passwordResetExpires = otpExpiry();
  await user.save();

  try {
    await sendPasswordResetEmail(email, otp);
  } catch (e) {
    console.error('Reset email failed:', e.message);
  }

  res.json({ message: 'If that email exists, a reset code was sent' });
};

const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (
    !user ||
    user.passwordResetToken !== token ||
    !user.passwordResetExpires ||
    Date.now() > user.passwordResetExpires.getTime()
  ) {
    return res.status(400).json({ error: 'Invalid or expired reset code' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully' });
};

module.exports = { register, verifyEmail, resendVerification, login, refresh, logout, forgotPassword, resetPassword };
