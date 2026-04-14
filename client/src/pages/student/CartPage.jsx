import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Navbar from '../../components/layout/Navbar';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, subtotal } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-lg">Your cart is empty</p>
          <Link to="/" className="btn-primary mt-4">Browse Restaurants</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart</h1>
        <p className="text-gray-500 text-sm mb-6">From {cart.restaurantName}</p>

        <div className="card divide-y divide-gray-100">
          {cart.items.map((item, idx) => (
            <div key={idx} className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.selectedOptions?.filter(o => o.choice).map((opt) => (
                  <p key={opt.label} className="text-xs text-gray-500">{opt.label}: {opt.choice}</p>
                ))}
                <p className="text-sm text-gray-600 mt-1">{formatCurrency(item.subtotal || item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-wave hover:text-wave flex items-center justify-center">−</button>
                <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-wave hover:text-wave flex items-center justify-center">+</button>
                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 ml-1 text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-4 mt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t border-gray-100">
            <span>Estimated Total</span><span>{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-xs text-gray-400">Delivery fee and tip added at checkout</p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Link to="/checkout" className="btn-primary w-full text-center">Proceed to Checkout</Link>
          <Link to="/" className="btn-secondary w-full text-center">Add More Items</Link>
        </div>
      </main>
    </div>
  );
}
