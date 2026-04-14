let _io = null;

const init = (io) => {
  _io = io;
};

const io = () => {
  if (!_io) throw new Error('Socket.io not initialized');
  return _io;
};

/** Broadcast a new pending order to all available drivers */
const emitNewOrder = (order) => {
  io().to('drivers').emit('new_order', {
    orderId: order._id,
    restaurantName: order.restaurant?.name,
    deliveryAddress: order.deliveryAddress,
    totalAmount: order.totalAmount,
    tip: order.tip,
    createdAt: order.createdAt,
  });
};

/** Tell all drivers this order has been taken */
const emitOrderTaken = (orderId) => {
  io().to('drivers').emit('order_taken', { orderId });
};

/** Notify the per-order room of a status change */
const emitStatusUpdate = (orderId, payload) => {
  io().to(`order_${orderId}`).emit('order_status_update', payload);
};

/** Prompt both parties to rate after delivery */
const emitPromptRating = (orderId) => {
  io().to(`order_${orderId}`).emit('prompt_rating', { orderId });
};

module.exports = { init, emitNewOrder, emitOrderTaken, emitStatusUpdate, emitPromptRating };
