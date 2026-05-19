import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.userMessage || 'Could not register');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="font-display text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link className="text-brand-600 hover:underline" to="/login">
            Sign in
          </Link>
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {['name', 'email', 'password'].map((field) => (
            <div key={field}>
              <label className="text-xs font-medium capitalize text-slate-600 dark:text-slate-400">
                {field}
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
                minLength={field === 'password' ? 8 : undefined}
              />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
