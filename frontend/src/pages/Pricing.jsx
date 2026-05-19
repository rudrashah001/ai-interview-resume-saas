import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { FREE_FEATURES, PREMIUM_FEATURES } from '../utils/features.js';

export default function Pricing() {
  const { isAuthenticated, hasFullAccess } = useAuth();
  const [busy, setBusy] = useState(false);
  const [billing, setBilling] = useState('monthly');

  const checkout = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/payments/create-checkout-session', {
        plan: billing,
      });
      if (data.url) window.location.href = data.url;
      else toast.error('No checkout URL');
    } catch (err) {
      toast.error(err.userMessage || 'Stripe not configured or error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">Plans</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Core AI interview prep and chat are free. Premium adds ATS, mock interviews,
          and unlimited usage.
        </p>
        <div className="mt-6 inline-flex rounded-full border border-slate-200 p-1 dark:border-slate-700">
          {['monthly', 'yearly'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setBilling(p)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
                billing === p ? 'bg-brand-600 text-white' : ''
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold">Free</h2>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm text-slate-600 dark:text-slate-400">
            {FREE_FEATURES.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
        </Card>
        <Card className="border-brand-200 ring-2 ring-brand-100 dark:border-brand-900 dark:ring-brand-900/40">
          <h2 className="font-display text-xl font-semibold">Premium</h2>
          <p className="mt-2 text-3xl font-bold">
            {billing === 'yearly' ? '$249' : '$29'}
            <span className="text-base font-normal">/{billing === 'yearly' ? 'yr' : 'mo'}</span>
          </p>
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm text-slate-600 dark:text-slate-400">
            <li className="font-medium text-slate-800 dark:text-slate-200">Everything in Free, plus:</li>
            {PREMIUM_FEATURES.map((f) => (
              <li key={f}>★ {f}</li>
            ))}
          </ul>
          {hasFullAccess ? (
            <p className="mt-6 text-sm text-brand-600">You have Premium access.</p>
          ) : (
            <Button className="mt-6 w-full" disabled={busy} onClick={checkout}>
              {busy ? 'Redirecting…' : 'Subscribe with Stripe'}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
