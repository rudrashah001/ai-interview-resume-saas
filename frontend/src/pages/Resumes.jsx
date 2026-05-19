import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Resumes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/resumes');
      setItems(data);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      const { data } = await api.post('/resumes', {
        title: 'Untitled resume',
        fullName: '',
        headline: '',
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        contact: {},
      });
      window.location.href = `/resumes/${data._id}`;
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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-3xl font-bold">Resumes</h1>
        <Button onClick={create}>New resume</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((r) => (
          <Link key={r._id} to={`/resumes/${r._id}`}>
            <Card className="h-full transition hover:border-brand-300">
              <h2 className="font-semibold">{r.title}</h2>
              <p className="mt-1 text-xs text-slate-500">
                Updated {new Date(r.updatedAt).toLocaleString()}
              </p>
            </Card>
          </Link>
        ))}
        {!items.length && (
          <p className="text-slate-500">Create your first resume to get started.</p>
        )}
      </div>
    </div>
  );
}
