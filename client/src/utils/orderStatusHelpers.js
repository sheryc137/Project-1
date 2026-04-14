export const STATUS_LABELS = {
  pending: 'Waiting for Driver',
  accepted: 'Driver Accepted',
  picked_up: 'Order Picked Up',
  in_transit: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const STATUS_ORDER = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered'];
