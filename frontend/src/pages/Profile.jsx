import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export default function Profile() {
  const { user, refreshMe, hasFullAccess, isPremium } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/profile', { name });
      await refreshMe();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.userMessage || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <Card>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Email</label>
            <p className="mt-1 text-sm">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Plan</label>
            <p className="mt-1 text-sm capitalize">
              {hasFullAccess
                ? user?.role === 'admin'
                  ? 'Admin (full access)'
                  : isPremium
                    ? user?.subscription?.plan || 'Premium'
                    : 'Premium'
                : 'Free'}
            </p>
            <p className="text-xs text-slate-500">
              Status: {user?.subscription?.status || 'none'}
            </p>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
