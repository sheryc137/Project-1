import { useEffect, useState } from 'react';
import { listRestaurants } from '../../services/restaurant.service';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import Spinner from '../../components/ui/Spinner';
import Navbar from '../../components/layout/Navbar';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    listRestaurants()
      .then((res) => setRestaurants(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campus Eats 🌊</h1>
          <p className="text-gray-500 mt-1">Order food & drinks delivered to anywhere on campus</p>
        </div>

        <div className="mb-6">
          <input
            className="input max-w-sm"
            placeholder="Search restaurants or cuisine…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {search ? 'No restaurants match your search.' : 'No restaurants available right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </main>
    </div>
  );
}
