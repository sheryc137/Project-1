import { useEffect, useState } from 'react';
import { getDriverOrders, getEarnings } from '../../services/driver.service';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import Spinner from '../../components/ui/Spinner';
import Navbar from '../../components/layout/Navbar';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function DriverHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDriverOrders(), getEarnings()])
      .then(([oRes, eRes]) => { setOrders(oRes.data); setEarnings(eRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Delivery History</h1>

        {earnings && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-wave">{formatCurrency(earnings.totalEarnings)}</p>
              <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{earnings.deliveryCount}</p>
              <p className="text-sm text-gray-500 mt-1">Deliveries</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">No deliveries yet.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="card p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{order.restaurant?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      For {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-sm font-semibold text-green-600 mt-2">
                      {formatCurrency((order.tip || 0) + Math.round((order.deliveryFee || 0) * 0.7))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
