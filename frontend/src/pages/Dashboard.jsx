import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';
import Button from '../components/Button.jsx';

export default function Dashboard() {
  const { user, hasFullAccess } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data: d } = await api.get('/users/dashboard');
        setData(d);
      } catch (err) {
        toast.error(err.userMessage || 'Could not load dashboard');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Hello, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {hasFullAccess
              ? 'Premium active — all features unlocked.'
              : 'Free plan: AI chat, interview questions, and resume analysis included.'}
          </p>
        </div>
        {!hasFullAccess && (
          <Link to="/pricing">
            <Button>Upgrade to Premium</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Resumes
          </p>
          <p className="mt-2 text-3xl font-bold">{data?.stats?.resumeCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Interview sessions
          </p>
          <p className="mt-2 text-3xl font-bold">
            {data?.stats?.interviewCount ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Subscription
          </p>
          <p className="mt-2 text-lg font-semibold capitalize">
            {data?.profile?.subscription?.status || 'none'}
          </p>
          <p className="text-xs text-slate-500">
            Plan: {data?.profile?.subscription?.plan || 'free'}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent resumes</h2>
            <Link to="/resumes" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-3 text-sm">
            {data?.recentResumes?.length ? (
              data.recentResumes.map((r) => (
                <li key={r._id} className="flex justify-between gap-2">
                  <Link
                    to={`/resumes/${r._id}`}
                    className="font-medium hover:text-brand-600"
                  >
                    {r.title}
                  </Link>
                  <span className="text-slate-500">
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No resumes yet.</li>
            )}
          </ul>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Recent interviews
            </h2>
            <Link
              to="/interviews"
              className="text-sm text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="space-y-3 text-sm">
            {data?.recentInterviews?.length ? (
              data.recentInterviews.map((s) => (
                <li key={s._id} className="flex justify-between gap-2">
                  <Link
                    to={`/interviews/${s._id}`}
                    className="font-medium hover:text-brand-600"
                  >
                    {s.jobTitle}
                  </Link>
                  <span className="text-slate-500 capitalize">
                    {s.difficulty}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No sessions yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
