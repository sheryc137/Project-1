import { useEffect, useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-700',
  driver: 'bg-green-100 text-green-700',
  admin: 'bg-purple-100 text-purple-700',
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/admin/all').then((res) => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="card divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={ROLE_COLORS[u.role]}>{u.role}</Badge>
                  {!u.isEmailVerified && <Badge className="bg-yellow-100 text-yellow-700">Unverified</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
