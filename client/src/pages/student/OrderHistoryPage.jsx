import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../services/order.service';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import RatingModal from '../../components/rating/RatingModal';
import Spinner from '../../components/ui/Spinner';
import Navbar from '../../components/layout/Navbar';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingOrder, setRatingOrder] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <p>No orders yet</p>
            <Link to="/" className="btn-primary mt-4 inline-block">Order Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{order.restaurant?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  <div className="flex gap-2">
                    {order.status === 'delivered' && !order.customerRatingId && (
                      <button
                        onClick={() => setRatingOrder(order)}
                        className="btn-secondary py-1 px-3 text-xs"
                      >
                        Rate Order
                      </button>
                    )}
                    <Link to={`/orders/${order._id}/tracking`} className="text-xs text-wave hover:underline">
                      {order.status === 'delivered' ? 'View Details' : 'Track Order'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {ratingOrder && (
        <RatingModal
          open={!!ratingOrder}
          onClose={() => setRatingOrder(null)}
          orderId={ratingOrder._id}
          rateeName={ratingOrder.driver ? `${ratingOrder.driver.firstName} ${ratingOrder.driver.lastName}` : undefined}
        />
      )}
    </div>
  );
}
