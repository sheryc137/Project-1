import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../../services/order.service';
import { cancelOrder } from '../../services/order.service';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { useAuth } from '../../context/AuthContext';
import OrderTimeline from '../../components/order/OrderTimeline';
import RatingModal from '../../components/rating/RatingModal';
import Navbar from '../../components/layout/Navbar';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const { status, showRating, driverInfo, dismissRating } = useOrderTracking(
    id,
    order?.status
  );

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await cancelOrder(id);
      setOrder(res.data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel order');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (!order) return <div className="p-8 text-center text-gray-400">Order not found</div>;

  const currentStatus = status || order.status;
  const canCancel = ['pending', 'accepted'].includes(currentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <Link to="/orders" className="text-sm text-wave hover:underline">All Orders</Link>
        </div>

        {/* Status card */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Delivery Status</h2>
          <OrderTimeline currentStatus={currentStatus} />

          {driverInfo && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Your driver</p>
              <p className="font-medium text-gray-900">{driverInfo.name}</p>
              {driverInfo.rating > 0 && (
                <p className="text-xs text-gray-500">⭐ {driverInfo.rating.toFixed(1)}</p>
              )}
            </div>
          )}
        </div>

        {/* Order details */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Order from {order.restaurant?.name}</h2>
          <div className="space-y-1">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-500"><span>Delivery fee</span><span>{formatCurrency(order.deliveryFee)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Tip</span><span>{formatCurrency(order.tip || 0)}</span></div>
            <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-2">Delivery to</h2>
          <p className="text-sm text-gray-600">{order.deliveryAddress?.buildingName}</p>
          <p className="text-sm text-gray-600">{order.deliveryAddress?.roomNumber}</p>
          {order.deliveryAddress?.deliveryNotes && (
            <p className="text-xs text-gray-400 mt-1">{order.deliveryAddress.deliveryNotes}</p>
          )}
        </div>

        {canCancel && (
          <button onClick={handleCancel} className="btn-danger w-full">Cancel Order</button>
        )}
      </main>

      {showRating && (
        <RatingModal
          open={showRating}
          onClose={dismissRating}
          orderId={id}
          rateeName={driverInfo?.name}
        />
      )}
    </div>
  );
}
