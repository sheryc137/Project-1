import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { setAccessToken } from '../../services/api';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.verifyEmail(code);
      setAccessToken(res.data.accessToken);
      updateUser({ isEmailVerified: true });
      toast.success('Email verified! Welcome to Waves Delivery.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      toast.success('Verification code resent!');
    } catch {
      toast.error('Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-100 p-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="text-4xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-500 text-sm mb-6">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-gray-700">{user?.email || 'your email'}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            className="input text-center text-2xl tracking-widest font-mono"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />
          <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full">
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-4 text-sm text-wave hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending…' : "Didn't receive it? Resend code"}
        </button>
      </div>
    </div>
  );
}
