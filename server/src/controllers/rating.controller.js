const Rating = require('../models/Rating');
const Order = require('../models/Order');
const User = require('../models/User');
const { ORDER_STATUS } = require('../utils/constants');

const submitRating = async (req, res) => {
  const { orderId, stars, comment } = req.body;

  const order = await Order.findById(orderId).populate('customer driver');
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== ORDER_STATUS.DELIVERED) {
    return res.status(400).json({ error: 'Can only rate delivered orders' });
  }

  // Enforce 7-day rating window
  if (order.actualDeliveryTime && Date.now() > order.actualDeliveryTime.getTime() + 7 * 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Rating window has expired (7 days)' });
  }

  const userId = req.user.userId;
  const isCustomer = String(order.customer._id) === userId;
  const isDriver = order.driver && String(order.driver._id) === userId;

  if (!isCustomer && !isDriver) {
    return res.status(403).json({ error: 'You are not part of this order' });
  }

  const rateeId = isCustomer ? order.driver._id : order.customer._id;
  const raterRole = isCustomer ? 'student' : 'driver';

  const rating = await Rating.create({
    order: orderId,
    rater: userId,
    ratee: rateeId,
    raterRole,
    stars,
    comment,
  });

  // Update order to record rating
  if (isCustomer) {
    order.customerRatingId = rating._id;
  } else {
    order.driverRatingId = rating._id;
  }
  await order.save();

  // Recalculate ratee's average
  const ratee = await User.findById(rateeId);
  if (ratee) {
    const field = isCustomer ? 'driverProfile' : null;
    if (field) {
      const oldAvg = ratee.driverProfile.averageRating || 0;
      const count = ratee.driverProfile.ratingCount || 0;
      ratee.driverProfile.averageRating = (oldAvg * count + stars) / (count + 1);
      ratee.driverProfile.ratingCount = count + 1;
    } else {
      const oldAvg = ratee.averageRating || 0;
      const count = ratee.ratingCount || 0;
      ratee.averageRating = (oldAvg * count + stars) / (count + 1);
      ratee.ratingCount = count + 1;
    }
    await ratee.save();
  }

  res.status(201).json(rating);
};

const getRatingsForUser = async (req, res) => {
  const ratings = await Rating.find({ ratee: req.params.userId })
    .populate('rater', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json(ratings);
};

const getRatingsForOrder = async (req, res) => {
  const ratings = await Rating.find({ order: req.params.orderId })
    .populate('rater', 'firstName lastName');
  res.json(ratings);
};

module.exports = { submitRating, getRatingsForUser, getRatingsForOrder };
