import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createPaymentIntent } from '../../services/payment.service';
import { placeOrder } from '../../services/order.service';
import TipSelector from '../../components/payment/TipSelector';
import Navbar from '../../components/layout/Navbar';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import api from '../../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const BUILDINGS = [
  'Tyler Campus Center', 'Payson Library', 'Towers Residence Hall',
  'Lovernich Residential Complex', 'Seaside Residence Hall', 'George Page Hall',
  'Appleby Center', 'Brock House', 'Firestone Fieldhouse',
  'Pendleton Learning Center', 'Keck Science Center', 'Rockwell Academic Center',
];

function CheckoutForm({ deliveryFee }) {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tip, setTip] = useState(0);
  const [address, setAddress] = useState({ buildingName: '', roomNumber: '', deliveryNotes: '' });
  const [loading, setLoading] = useState(false);

  const total = subtotal + deliveryFee + tip;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!address.buildingName || !address.roomNumber) {
      toast.error('Please enter your delivery address');
      return;
    }

    setLoading(true);
    try {
      // 1. Create a temporary order to get an order ID for the payment intent
      const orderRes = await placeOrder({
        restaurantId: cart.restaurantId,
        items: cart.items.map((i) => ({
          menuItemId: i._id,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions,
        })),
        deliveryAddress: address,
        stripePaymentIntentId: 'pending',
        tip,
      });
      const orderId = orderRes.data._id;

      // 2. Create payment intent
      const intentRes = await createPaymentIntent({ orderId, tip });
      const { clientSecret } = intentRes.data;

      // 3. Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        clearCart();
        toast.success('Order placed! Looking for a driver…');
        navigate(`/orders/${orderId}/tracking`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery Address */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Delivery Address</h2>
        <div>
          <label className="label">Building</label>
          <select
            className="input"
            value={address.buildingName}
            onChange={(e) => setAddress({ ...address, buildingName: e.target.value })}
            required
          >
            <option value="">Select building…</option>
            {BUILDINGS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Room / Location</label>
          <input className="input" placeholder="e.g. Room 204 or Lobby" value={address.roomNumber}
            onChange={(e) => setAddress({ ...address, roomNumber: e.target.value })} required />
        </div>
        <div>
          <label className="label">Delivery notes (optional)</label>
          <input className="input" placeholder="Ring doorbell, leave at door…" value={address.deliveryNotes}
            onChange={(e) => setAddress({ ...address, deliveryNotes: e.target.value })} />
        </div>
      </div>

      {/* Tip */}
      <div className="card p-5">
        <TipSelector subtotal={subtotal} tip={tip} onChange={setTip} />
      </div>

      {/* Order Summary */}
      <div className="card p-5 space-y-2">
        <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
        {cart.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.name} × {item.quantity}</span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-2 space-y-1">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-sm text-gray-500"><span>Delivery fee</span><span>{formatCurrency(deliveryFee)}</span></div>
          <div className="flex justify-between text-sm text-gray-500"><span>Tip</span><span>{formatCurrency(tip)}</span></div>
          <div className="flex justify-between font-semibold text-gray-900 pt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
      </div>

      {/* Card */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#374151' } } }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Test card: 4242 4242 4242 4242 · Any expiry · Any CVV</p>
      </div>

      <button type="submit" disabled={loading || !stripe} className="btn-primary w-full py-3 text-base">
        {loading ? 'Processing…' : `Pay ${formatCurrency(total)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const [deliveryFee, setDeliveryFee] = useState(199);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cart.restaurantId) { navigate('/'); return; }
    // Fetch the delivery fee from the restaurant
    api.get(`/restaurants/${cart.restaurantId}`)
      .then((res) => setDeliveryFee(res.data.deliveryFee))
      .catch(() => {});
  }, [cart.restaurantId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm deliveryFee={deliveryFee} />
        </Elements>
      </main>
    </div>
  );
}
