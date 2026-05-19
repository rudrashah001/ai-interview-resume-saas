import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('If an account exists, check your email (or server logs in dev).');
    } catch (err) {
      toast.error(err.userMessage || 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="font-display text-2xl font-bold">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          <Link className="text-brand-600 hover:underline" to="/login">
            Back to sign in
          </Link>
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
