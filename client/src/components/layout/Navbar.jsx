import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-wave text-lg">
          🌊 Waves Delivery
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            {user.role === 'student' && (
              <>
                <Link to="/" className="text-sm text-gray-600 hover:text-wave">Restaurants</Link>
                <Link to="/orders" className="text-sm text-gray-600 hover:text-wave">Orders</Link>
                <Link to="/cart" className="relative text-sm text-gray-600 hover:text-wave">
                  Cart
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-wave text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user.role === 'driver' && (
              <>
                <Link to="/driver" className="text-sm text-gray-600 hover:text-wave">Dashboard</Link>
                <Link to="/driver/history" className="text-sm text-gray-600 hover:text-wave">History</Link>
              </>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="text-sm text-gray-600 hover:text-wave">Admin</Link>
            )}
            <Link to="/profile" className="text-sm text-gray-600 hover:text-wave">Profile</Link>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
