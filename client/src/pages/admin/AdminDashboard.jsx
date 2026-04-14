import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/admin/restaurants" className="card p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">🍽️</div>
            <h2 className="font-semibold text-gray-900">Manage Restaurants</h2>
            <p className="text-sm text-gray-500 mt-1">Add, edit, or remove restaurants and menus</p>
          </Link>
          <Link to="/admin/users" className="card p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">👥</div>
            <h2 className="font-semibold text-gray-900">Manage Users</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage student and driver accounts</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
