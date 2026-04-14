const jwt = require('jsonwebtoken');

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { signAccessToken, signRefreshToken, verifyToken };
