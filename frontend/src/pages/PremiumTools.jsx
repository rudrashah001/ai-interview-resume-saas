import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import FeatureGate from '../components/FeatureGate.jsx';

const TABS = [
  { id: 'cover', label: 'Cover letter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'roadmap', label: 'Interview roadmap' },
  { id: 'career', label: 'Career guidance' },
  { id: 'skills', label: 'Skill gap' },
  { id: 'jobs', label: 'Job matches' },
  { id: 'mock', label: 'Mock interview' },
];

export default function PremiumTools() {
  const { hasFullAccess } = useAuth();
  const [tab, setTab] = useState('cover');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    resumeText: '',
    jobTitle: '',
    company: '',
    name: '',
    headline: '',
    goals: '',
    background: '',
    currentSkills: '',
    targetRole: '',
    jobDescription: '',
    skills: '',
    experience: '',
    transcript: '',
  });

  const run = async () => {
    if (!hasFullAccess) return;
    setBusy(true);
    setResult(null);
    try {
      let data;
      if (tab === 'cover') {
        ({ data } = await api.post('/resumes/ai/cover-letter', {
          resumeText: form.resumeText,
          jobTitle: form.jobTitle,
          company: form.company,
        }));
      } else if (tab === 'linkedin') {
        ({ data } = await api.post('/resumes/ai/linkedin', {
          resumeText: form.resumeText,
          name: form.name,
          headline: form.headline,
        }));
      } else if (tab === 'portfolio') {
        ({ data } = await api.post('/resumes/ai/portfolio', {
          role: form.jobTitle,
          skills: form.skills.split(',').map((s) => s.trim()),
        }));
      } else if (tab === 'roadmap') {
        ({ data } = await api.post('/premium/roadmap', {
          company: form.company,
          jobTitle: form.jobTitle,
        }));
      } else if (tab === 'career') {
        ({ data } = await api.post('/premium/career-guidance', {
          goals: form.goals,
          background: form.background,
        }));
      } else if (tab === 'skills') {
        ({ data } = await api.post('/premium/skill-gap', {
          currentSkills: form.currentSkills.split(',').map((s) => s.trim()),
          targetRole: form.targetRole,
          jobDescription: form.jobDescription,
        }));
      } else if (tab === 'jobs') {
        ({ data } = await api.post('/premium/job-recommendations', {
          skills: form.skills.split(',').map((s) => s.trim()),
          experience: form.experience,
        }));
      } else if (tab === 'mock') {
        ({ data } = await api.post('/premium/mock-interview', {
          jobTitle: form.jobTitle,
          company: form.company,
          transcript: form.transcript,
        }));
      }
      setResult(data);
      toast.success('Done');
    } catch (err) {
      toast.error(err.userMessage || 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  if (!hasFullAccess) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">Premium tools</h1>
        <FeatureGate premium message="Unlock cover letters, LinkedIn bios, mock interviews, career guidance, and more." />
        <Link to="/pricing">
          <Button>Upgrade now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Premium tools</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              tab === t.id
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Card className="space-y-3">
        <textarea
          className="min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          placeholder="Resume text or context…"
          value={form.resumeText}
          onChange={(e) => setForm({ ...form, resumeText: e.target.value })}
        />
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="Job title"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <Button onClick={run} disabled={busy}>
          {busy ? 'Working…' : 'Generate'}
        </Button>
      </Card>
      {result && (
        <Card>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}
