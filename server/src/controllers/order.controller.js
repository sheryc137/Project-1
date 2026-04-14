const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { ORDER_STATUS } = require('../utils/constants');
const socketService = require('../services/socket.service');

const placeOrder = async (req, res) => {
  const { restaurantId, items, deliveryAddress, specialInstructions, stripePaymentIntentId, tip = 0 } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  if (!restaurant.isOpen) return res.status(400).json({ error: 'Restaurant is currently closed' });

  // Snapshot item details & calculate subtotal
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findOne({ _id: item.menuItemId, restaurant: restaurantId, isAvailable: true });
    if (!menuItem) return res.status(400).json({ error: `Menu item ${item.menuItemId} not found or unavailable` });

    let itemTotal = menuItem.price * item.quantity;
    const selectedOptions = [];
    if (item.selectedOptions?.length) {
      for (const opt of item.selectedOptions) {
        itemTotal += (opt.additionalCost || 0) * item.quantity;
        selectedOptions.push(opt);
      }
    }
    subtotal += itemTotal;
    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      selectedOptions,
      subtotal: itemTotal,
    });
  }

  const deliveryFee = restaurant.deliveryFee;
  const totalAmount = subtotal + deliveryFee + tip;

  const order = await Order.create({
    customer: req.user.userId,
    restaurant: restaurantId,
    items: orderItems,
    deliveryAddress,
    specialInstructions,
    stripePaymentIntentId,
    subtotal,
    deliveryFee,
    tip,
    totalAmount,
    statusHistory: [{ status: ORDER_STATUS.PENDING, timestamp: new Date() }],
    estimatedDeliveryTime: new Date(Date.now() + restaurant.estimatedDeliveryMinutes * 60 * 1000),
  });

  await order.populate('restaurant', 'name');
  socketService.emitNewOrder(order);

  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user.userId })
    .populate('restaurant', 'name imageUrl')
    .populate('driver', 'firstName lastName driverProfile.averageRating')
    .sort({ createdAt: -1 });
  res.json(orders);
};

const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('restaurant', 'name imageUrl address')
    .populate('driver', 'firstName lastName phone driverProfile')
    .populate('customer', 'firstName lastName');

  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Only customer, assigned driver, or admin can view
  const isCustomer = String(order.customer._id) === req.user.userId;
  const isDriver = order.driver && String(order.driver._id) === req.user.userId;
  if (!isCustomer && !isDriver && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(order);
};

const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (String(order.customer) !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

  const cancellableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED];
  if (!cancellableStatuses.includes(order.status)) {
    return res.status(400).json({ error: 'Cannot cancel order after pickup' });
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, timestamp: new Date() });
  await order.save();

  socketService.emitStatusUpdate(order._id, { status: ORDER_STATUS.CANCELLED, orderId: order._id });

  res.json(order);
};

module.exports = { placeOrder, getMyOrders, getOrder, cancelOrder };
