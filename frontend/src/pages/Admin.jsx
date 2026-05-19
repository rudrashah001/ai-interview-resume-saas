import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const [a, u, p] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/users'),
          api.get('/admin/payments'),
        ]);
        setAnalytics(a.data);
        setUsers(u.data.items || []);
        setPayments(p.data.items || []);
      } catch (err) {
        toast.error(err.userMessage || 'Admin load failed');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const toggleRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      toast.success('Role updated');
      const { data } = await api.get('/admin/users');
      setUsers(data.items || []);
    } catch (err) {
      toast.error(err.userMessage || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const signupData =
    analytics?.signupsLast30Days?.map((d) => ({
      date: d._id,
      signups: d.count,
    })) || [];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Admin panel</h1>
      <div className="flex gap-2">
        {['overview', 'users', 'payments'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1 text-sm capitalize ${
              tab === t ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ['Users', analytics?.totals?.users],
              ['Premium', analytics?.totals?.premiumUsers],
              ['Resumes', analytics?.totals?.resumes],
              ['Interviews', analytics?.totals?.interviews],
              ['Revenue ($)', Number(analytics?.totals?.revenue || 0).toFixed(2)],
            ].map(([k, v]) => (
              <Card key={k}>
                <p className="text-xs uppercase text-slate-500">{k}</p>
                <p className="mt-2 text-2xl font-bold">{v ?? 0}</p>
              </Card>
            ))}
          </div>
          <Card>
            <h2 className="font-display text-lg font-semibold">Signups (30 days)</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke="#1a72f5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      {tab === 'users' && (
        <Card>
          <h2 className="font-display text-lg font-semibold">Users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Subscription</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-100 dark:border-slate-900">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2 capitalize">{u.role}</td>
                    <td className="py-2">{u.subscription?.status}</td>
                    <td className="py-2">
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() =>
                          toggleRole(u._id, u.role === 'admin' ? 'user' : 'admin')
                        }
                      >
                        Make {u.role === 'admin' ? 'user' : 'admin'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'payments' && (
        <Card>
          <h2 className="font-display text-lg font-semibold">Payment history (Stripe)</h2>
          <div className="mt-4 overflow-x-auto text-sm">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 text-left">User</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 dark:border-slate-900">
                    <td className="py-2">{p.user?.email || '—'}</td>
                    <td className="py-2">
                      {p.amount} {p.currency}
                    </td>
                    <td className="py-2">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
