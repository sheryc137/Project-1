import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { startOnboarding } from '../../services/driver.service';
import Navbar from '../../components/layout/Navbar';
import Spinner from '../../components/ui/Spinner';
import StarRating from '../../components/rating/StarRating';
import toast from 'react-hot-toast';

const BUILDINGS = [
  'Tyler Campus Center', 'Payson Library', 'Towers Residence Hall',
  'Lovernich Residential Complex', 'Seaside Residence Hall', 'George Page Hall',
  'Appleby Center', 'Brock House', 'Firestone Fieldhouse',
  'Pendleton Learning Center', 'Keck Science Center', 'Rockwell Academic Center',
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [address, setAddress] = useState({ buildingName: '', roomNumber: '', deliveryNotes: '' });

  useEffect(() => {
    api.get('/users/me')
      .then((res) => {
        setProfile(res.data);
        setForm({ firstName: res.data.firstName, lastName: res.data.lastName, phone: res.data.phone || '' });
        setAddress(res.data.deliveryAddress || { buildingName: '', roomNumber: '', deliveryNotes: '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/me', form);
      await api.put('/users/me/delivery-address', address);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeDriver = async () => {
    try {
      await api.post('/users/become-driver', { vehicleType: 'foot' });
      toast.success('You are now a driver!');
      window.location.href = '/driver';
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleStripeOnboard = async () => {
    try {
      const res = await startOnboarding();
      window.location.href = res.data.url;
    } catch {
      toast.error('Stripe onboarding failed');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* Rating */}
        {profile?.averageRating > 0 && (
          <div className="card p-4 mb-4 flex items-center gap-3">
            <StarRating value={Math.round(profile.averageRating)} readonly />
            <span className="text-sm text-gray-500">{profile.averageRating.toFixed(1)} ({profile.ratingCount} ratings)</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Personal Info</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input bg-gray-50" value={profile?.email || ''} readOnly />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input className="input" placeholder="+1 (555) 000-0000" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Default Delivery Address</h2>
            <div>
              <label className="label">Building</label>
              <select className="input" value={address.buildingName}
                onChange={(e) => setAddress({ ...address, buildingName: e.target.value })}>
                <option value="">Select building…</option>
                {BUILDINGS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Room / Location</label>
              <input className="input" placeholder="Room 204" value={address.roomNumber}
                onChange={(e) => setAddress({ ...address, roomNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Doorbell code, leave at door…" value={address.deliveryNotes}
                onChange={(e) => setAddress({ ...address, deliveryNotes: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {profile?.role === 'student' && (
          <div className="card p-5 mt-5">
            <h2 className="font-semibold text-gray-900 mb-2">Become a Driver</h2>
            <p className="text-sm text-gray-500 mb-3">Earn money by delivering orders to fellow Waves!</p>
            <button onClick={handleBecomeDriver} className="btn-secondary w-full">Sign Up as Driver</button>
          </div>
        )}

        {profile?.role === 'driver' && !profile?.driverProfile?.stripeAccountId && (
          <div className="card p-5 mt-5">
            <h2 className="font-semibold text-gray-900 mb-2">Set Up Payouts</h2>
            <p className="text-sm text-gray-500 mb-3">Connect Stripe to receive your earnings.</p>
            <button onClick={handleStripeOnboard} className="btn-secondary w-full">Connect Stripe</button>
          </div>
        )}
      </main>
    </div>
  );
}
