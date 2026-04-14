import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAvailableOrders, acceptOrder } from '../../services/driver.service';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Navbar from '../../components/layout/Navbar';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [accepting, setAccepting] = useState(null);

  const fetchOrders = useCallback(() => {
    getAvailableOrders()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Get current availability
    api.get('/users/me').then((res) => setIsAvailable(res.data.driverProfile?.isAvailable || false));
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;
    const onNewOrder = (data) => {
      setOrders((prev) => {
        if (prev.find((o) => String(o._id) === String(data.orderId))) return prev;
        fetchOrders(); // re-fetch full order details
        return prev;
      });
      toast('New delivery request!', { icon: '🚀' });
    };
    const onOrderTaken = ({ orderId }) => {
      setOrders((prev) => prev.filter((o) => String(o._id) !== String(orderId)));
    };
    socket.on('new_order', onNewOrder);
    socket.on('order_taken', onOrderTaken);
    return () => { socket.off('new_order', onNewOrder); socket.off('order_taken', onOrderTaken); };
  }, [socket, fetchOrders]);

  const toggleAvailability = async () => {
    const res = await api.put('/users/driver/availability');
    setIsAvailable(res.data.isAvailable);
    if (res.data.isAvailable) {
      socket?.emit('driver_available');
      toast.success('You are now available for deliveries!');
      fetchOrders();
    } else {
      socket?.emit('driver_unavailable');
      toast('You are now offline.');
    }
  };

  const handleAccept = async (orderId) => {
    setAccepting(orderId);
    try {
      await acceptOrder(orderId);
      toast.success('Order accepted!');
      setOrders((prev) => prev.filter((o) => String(o._id) !== String(orderId)));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not accept order');
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome, {user?.firstName || 'Driver'}!</p>
          </div>
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isAvailable ? '🟢 Online' : '⚪ Offline'}
          </button>
        </div>

        {!isAvailable ? (
          <div className="card p-8 text-center text-gray-400">
            <div className="text-5xl mb-3">😴</div>
            <p>You are offline. Toggle online to see delivery requests.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <div className="text-5xl mb-3">⏳</div>
            <p>No orders available right now. Hang tight!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">{orders.length} available order{orders.length > 1 ? 's' : ''}</p>
            {orders.map((order) => (
              <div key={order._id} className="card p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{order.restaurant?.name}</p>
                    <p className="text-xs text-gray-500">{order.restaurant?.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-wave">{formatCurrency(order.tip || 0)} tip</p>
                    <p className="text-xs text-gray-400">{formatCurrency(order.deliveryFee)} fee</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p>📍 {order.deliveryAddress?.buildingName}, {order.deliveryAddress?.roomNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.items?.length} item{order.items?.length > 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => handleAccept(order._id)}
                  disabled={accepting === order._id}
                  className="btn-primary w-full"
                >
                  {accepting === order._id ? 'Accepting…' : 'Accept Delivery'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
