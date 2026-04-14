const transporter = require('../config/mailer');

const FROM = process.env.FROM_EMAIL || '"Waves Delivery" <noreply@waves.delivery>';

const sendVerificationEmail = async (to, otp) => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Verify your Waves Delivery account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a56db">Waves Delivery 🌊</h2>
        <p>Thanks for signing up! Enter the code below to verify your @pepperdine.edu email:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a56db;margin:24px 0">${otp}</div>
        <p style="color:#6b7280">This code expires in 15 minutes. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (to, otp) => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reset your Waves Delivery password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a56db">Waves Delivery 🌊</h2>
        <p>Use the code below to reset your password:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a56db;margin:24px 0">${otp}</div>
        <p style="color:#6b7280">This code expires in 15 minutes.</p>
      </div>
    `,
  });
};

const sendOrderConfirmationEmail = async (to, order) => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Order #${order._id} confirmed — Waves Delivery`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a56db">Order confirmed! 🎉</h2>
        <p>Your order from <strong>${order.restaurant?.name || 'the restaurant'}</strong> has been placed.</p>
        <p>We'll notify you when a driver picks it up.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendOrderConfirmationEmail };
