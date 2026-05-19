import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';
import { FEATURED_COMPANIES } from '../utils/features.js';

export default function Interviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    jobTitle: '',
    company: '',
    difficulty: 'medium',
  });

  const load = async () => {
    try {
      const { data } = await api.get('/interviews');
      setItems(data);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/interviews', form);
      window.location.href = `/interviews/${data._id}`;
    } catch (err) {
      toast.error(err.userMessage || 'Could not create');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Interview prep</h1>
      <Card>
        <h2 className="font-semibold">New session</h2>
        <form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            required
            placeholder="Job title"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />
          <input
            list="companies"
            placeholder="Company"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <datalist id="companies">
            {FEATURED_COMPANIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <div className="md:col-span-3">
            <Button type="submit">Create session</Button>
          </div>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((s) => (
          <Link key={s._id} to={`/interviews/${s._id}`}>
            <Card className="h-full transition hover:border-brand-300">
              <h3 className="font-semibold">{s.jobTitle}</h3>
              <p className="text-xs text-slate-500">
                {s.company || 'Any company'} · {s.difficulty}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
