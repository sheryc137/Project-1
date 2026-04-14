import { useEffect, useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', category: '', address: '', estimatedDeliveryMinutes: 30, deliveryFee: 199, minimumOrder: 0 };

export default function ManageRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get('/restaurants').then((res) => setRestaurants(res.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/restaurants/${editing}`, form);
        toast.success('Restaurant updated');
      } else {
        await api.post('/restaurants', form);
        toast.success('Restaurant created');
      }
      setForm(EMPTY_FORM);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return;
    await api.delete(`/restaurants/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Restaurants</h1>

        {/* Form */}
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">{editing ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" placeholder="Mexican, Burgers…" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="label">Est. Delivery (min)</label>
              <input className="input" type="number" min="5" value={form.estimatedDeliveryMinutes} onChange={(e) => setForm({ ...form, estimatedDeliveryMinutes: +e.target.value })} />
            </div>
            <div>
              <label className="label">Delivery Fee (cents)</label>
              <input className="input" type="number" min="0" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: +e.target.value })} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }} className="btn-secondary">Cancel</button>
              )}
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-2">
            {restaurants.map((r) => (
              <div key={r._id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.category} · {r.estimatedDeliveryMinutes} min · {formatCurrency(r.deliveryFee)} delivery</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(r._id); setForm({ name: r.name, description: r.description || '', category: r.category || '', address: r.address || '', estimatedDeliveryMinutes: r.estimatedDeliveryMinutes, deliveryFee: r.deliveryFee, minimumOrder: r.minimumOrder }); }} className="btn-secondary py-1 px-3 text-xs">Edit</button>
                  <button onClick={() => handleDelete(r._id)} className="btn-danger py-1 px-3 text-xs">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
