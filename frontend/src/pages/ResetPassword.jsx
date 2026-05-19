import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get('token') || '', [params]);
  const emailParam = useMemo(() => params.get('email') || '', [params]);
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Missing token');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, email, password });
      toast.success('Password updated');
      navigate('/login');
    } catch (err) {
      toast.error(err.userMessage || 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="font-display text-2xl font-bold">Set new password</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          <Link className="text-brand-600 hover:underline" to="/login">
            Sign in
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
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              New password
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
