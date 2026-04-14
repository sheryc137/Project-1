const stripe = require('../config/stripe');
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const stripeService = require('../services/stripe.service');

const createIntent = async (req, res) => {
  const { orderId, tip = 0 } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (String(order.customer) !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

  const user = await User.findById(req.user.userId);
  const customer = await stripeService.getOrCreateCustomer(user);

  const amount = order.subtotal + order.deliveryFee + tip;
  order.tip = tip;
  order.totalAmount = amount;
  await order.save();

  const intent = await stripeService.createPaymentIntent({
    amount,
    customerId: customer.id,
    metadata: { orderId: String(order._id), userId: req.user.userId },
  });

  // Pre-create a Payment record
  const driverEarnings = tip + Math.floor(order.deliveryFee * 0.7);
  await Payment.create({
    order: order._id,
    customer: req.user.userId,
    stripePaymentIntentId: intent.id,
    amount,
    deliveryFee: order.deliveryFee,
    tip,
    driverEarnings,
    status: 'pending',
  });

  res.json({ clientSecret: intent.client_secret });
};

// Stripe webhook — must be called with raw body
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { status: 'captured', stripeChargeId: intent.latest_charge },
    );
    // Update order PI reference
    if (intent.metadata?.orderId) {
      await Order.findByIdAndUpdate(intent.metadata.orderId, { stripePaymentIntentId: intent.id });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    await Payment.findOneAndUpdate({ stripePaymentIntentId: intent.id }, { status: 'failed' });
  }

  res.json({ received: true });
};

const getPayment = async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
};

const refundPayment = async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  const refund = await stripeService.refundPayment(payment.stripePaymentIntentId);
  payment.status = 'refunded';
  payment.refundAmount = refund.amount;
  payment.refundReason = req.body.reason || 'Order cancelled';
  await payment.save();

  res.json(payment);
};

const driverOnboard = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user || user.role !== 'driver') return res.status(403).json({ error: 'Not a driver' });

  if (!user.driverProfile.stripeAccountId) {
    const account = await stripeService.createConnectAccount(user.email);
    user.driverProfile.stripeAccountId = account.id;
    await user.save();
  }

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = await stripeService.createAccountLink(
    user.driverProfile.stripeAccountId,
    `${baseUrl}/driver/onboard/refresh`,
    `${baseUrl}/driver/onboard/success`
  );

  res.json({ url: link.url });
};

module.exports = { createIntent, handleWebhook, getPayment, refundPayment, driverOnboard };
