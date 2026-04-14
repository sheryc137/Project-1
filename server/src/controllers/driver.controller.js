const Order = require('../models/Order');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { ORDER_STATUS } = require('../utils/constants');
const socketService = require('../services/socket.service');
const stripeService = require('../services/stripe.service');

const getAvailableOrders = async (req, res) => {
  const orders = await Order.find({ status: ORDER_STATUS.PENDING, driver: null })
    .populate('restaurant', 'name address')
    .sort({ createdAt: 1 });
  res.json(orders);
};

const acceptOrder = async (req, res) => {
  // Atomic update: only grab if still pending and unassigned
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: ORDER_STATUS.PENDING, driver: null },
    {
      $set: {
        status: ORDER_STATUS.ACCEPTED,
        driver: req.user.userId,
      },
      $push: { statusHistory: { status: ORDER_STATUS.ACCEPTED, timestamp: new Date() } },
    },
    { new: true }
  ).populate('restaurant', 'name address estimatedDeliveryMinutes');

  if (!order) return res.status(409).json({ error: 'Order already taken or not available' });

  const driver = await User.findById(req.user.userId).select('firstName lastName driverProfile');

  socketService.emitStatusUpdate(order._id, {
    status: ORDER_STATUS.ACCEPTED,
    orderId: order._id,
    driver: { name: driver.fullName, rating: driver.driverProfile?.averageRating },
    estimatedDeliveryTime: order.estimatedDeliveryTime,
  });
  socketService.emitOrderTaken(order._id);

  res.json(order);
};

const updateStatus = async (newStatus) => async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (String(order.driver) !== req.user.userId) return res.status(403).json({ error: 'Not your order' });

  order.status = newStatus;
  order.statusHistory.push({ status: newStatus, timestamp: new Date() });

  if (newStatus === ORDER_STATUS.DELIVERED) {
    order.actualDeliveryTime = new Date();

    // Increment driver delivery count
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 'driverProfile.totalDeliveries': 1 },
    });

    // Transfer driver earnings via Stripe Connect
    const payment = await Payment.findOne({ order: order._id, status: 'captured' });
    if (payment?.driverEarnings && payment.stripePaymentIntentId) {
      const driver = await User.findById(req.user.userId);
      if (driver?.driverProfile?.stripeAccountId) {
        try {
          const transfer = await stripeService.transferToDriver({
            amount: payment.driverEarnings,
            stripeAccountId: driver.driverProfile.stripeAccountId,
            orderId: order._id,
          });
          payment.stripeTransferId = transfer.id;
          await payment.save();
        } catch (e) {
          console.error('Stripe transfer failed:', e.message);
        }
      }
    }

    socketService.emitPromptRating(order._id);
  } else {
    socketService.emitStatusUpdate(order._id, { status: newStatus, orderId: order._id });
  }

  await order.save();
  res.json(order);
};

const getDriverOrders = async (req, res) => {
  const orders = await Order.find({ driver: req.user.userId })
    .populate('restaurant', 'name')
    .populate('customer', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json(orders);
};

const getEarnings = async (req, res) => {
  const payments = await Payment.find({ driver: req.user.userId, status: 'captured' });
  const total = payments.reduce((sum, p) => sum + (p.driverEarnings || 0), 0);
  const count = payments.length;
  res.json({ totalEarnings: total, deliveryCount: count, payments });
};

module.exports = {
  getAvailableOrders,
  acceptOrder,
  markPickedUp: updateStatus(ORDER_STATUS.PICKED_UP),
  markInTransit: updateStatus(ORDER_STATUS.IN_TRANSIT),
  markDelivered: updateStatus(ORDER_STATUS.DELIVERED),
  getDriverOrders,
  getEarnings,
};
