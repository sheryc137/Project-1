import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant._id}`} className="card hover:shadow-md transition-shadow block overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-200 relative">
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">🍽️</div>
        )}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Closed</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
            {restaurant.category && (
              <p className="text-xs text-gray-500 mt-0.5">{restaurant.category}</p>
            )}
          </div>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{restaurant.estimatedDeliveryMinutes} min</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>Delivery: {formatCurrency(restaurant.deliveryFee)}</span>
          {restaurant.minimumOrder > 0 && <span>Min: {formatCurrency(restaurant.minimumOrder)}</span>}
        </div>
      </div>
    </Link>
  );
}
