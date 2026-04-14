import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurant, getMenu } from '../../services/restaurant.service';
import { useCart } from '../../context/CartContext';
import MenuItemCard from '../../components/restaurant/MenuItemCard';
import Spinner from '../../components/ui/Spinner';
import Navbar from '../../components/layout/Navbar';
import { formatCurrency } from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';

export default function RestaurantPage() {
  const { id } = useParams();
  const { itemCount, subtotal } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRestaurant(id), getMenu(id)])
      .then(([rRes, mRes]) => { setRestaurant(rRes.data); setMenu(mRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (!restaurant) return <div className="p-8 text-center text-gray-400">Restaurant not found</div>;

  // Group menu items by category
  const categories = menu.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 relative">
        {restaurant.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-4 left-6 text-white">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <div className="flex items-center gap-3 text-sm mt-1 opacity-90">
            <span>{restaurant.estimatedDeliveryMinutes} min</span>
            <span>•</span>
            <span>Delivery: {formatCurrency(restaurant.deliveryFee)}</span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {restaurant.description && (
          <p className="text-gray-500 mb-6">{restaurant.description}</p>
        )}

        {Object.entries(categories).map(([cat, items]) => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{cat}</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  restaurant={{ id: restaurant._id, name: restaurant.name }}
                />
              ))}
            </div>
          </div>
        ))}
      </main>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between max-w-3xl mx-auto">
          <span className="text-sm text-gray-600">{itemCount} item{itemCount > 1 ? 's' : ''} — {formatCurrency(subtotal)}</span>
          <Link to="/cart" className="btn-primary">View Cart</Link>
        </div>
      )}
    </div>
  );
}
