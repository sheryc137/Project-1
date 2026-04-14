import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../../services/order.service';
import { markPickedUp, markInTransit, markDelivered } from '../../services/driver.service';
import RatingModal from '../../components/rating/RatingModal';
import OrderTimeline from '../../components/order/OrderTimeline';
import Navbar from '../../components/layout/Navbar';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const NEXT_ACTIONS = {
  accepted: { label: 'Mark as Picked Up', fn: markPickedUp },
  picked_up: { label: 'Mark as In Transit', fn: markInTransit },
  in_transit: { label: 'Mark as Delivered', fn: markDelivered },
};

export default function ActiveDeliveryPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    getOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleAction = async () => {
    const action = NEXT_ACTIONS[order.status];
    if (!action) return;
    setUpdating(true);
    try {
      const res = await action.fn(orderId);
      setOrder(res.data);
      if (res.data.status === 'delivered') {
        toast.success('Delivery marked as complete!');
        setShowRating(true);
      } else {
        toast.success('Status updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (!order) return <div className="p-8 text-center text-gray-400">Order not found</div>;

  const action = NEXT_ACTIONS[order.status];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Active Delivery</h1>

        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Delivery Status</h2>
          <OrderTimeline currentStatus={order.status} />
        </div>

        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-2">Pick up from</h2>
          <p className="text-gray-700 font-medium">{order.restaurant?.name}</p>
          <p className="text-sm text-gray-500">{order.restaurant?.address}</p>

          <h2 className="font-semibold text-gray-900 mt-4 mb-2">Deliver to</h2>
          <p className="text-gray-700">{order.deliveryAddress?.buildingName}</p>
          <p className="text-sm text-gray-500">{order.deliveryAddress?.roomNumber}</p>
          {order.deliveryAddress?.deliveryNotes && (
            <p className="text-xs text-gray-400 mt-1 italic">{order.deliveryAddress.deliveryNotes}</p>
          )}
        </div>

        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Order Items</h2>
          <div className="space-y-1">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          {order.specialInstructions && (
            <p className="text-xs text-gray-400 mt-2 italic">Note: {order.specialInstructions}</p>
          )}
        </div>

        <div className="card p-5 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Your earnings (tip + 70% delivery fee)</span>
            <span className="font-semibold text-green-600">
              {formatCurrency((order.tip || 0) + Math.round((order.deliveryFee || 0) * 0.7))}
            </span>
          </div>
        </div>

        {action && (
          <button onClick={handleAction} disabled={updating} className="btn-primary w-full py-3 text-base">
            {updating ? 'Updating…' : action.label}
          </button>
        )}

        {order.status === 'delivered' && !showRating && (
          <div className="text-center mt-4">
            <p className="text-green-600 font-medium">✓ Delivery complete!</p>
            <button onClick={() => navigate('/driver')} className="btn-secondary mt-3">Back to Dashboard</button>
          </div>
        )}
      </main>

      {showRating && (
        <RatingModal
          open={showRating}
          onClose={() => { setShowRating(false); navigate('/driver'); }}
          orderId={orderId}
          rateeName={`${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim()}
        />
      )}
    </div>
  );
}
