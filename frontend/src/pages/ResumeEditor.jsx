import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';
import { exportResumePdf } from '../utils/pdfExport.js';

const emptyExp = { company: '', role: '', start: '', end: '', bullets: [''] };

export default function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasFullAccess } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzeText, setAnalyzeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [busyAi, setBusyAi] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get(`/resumes/${id}`);
        setResume(data);
      } catch (err) {
        toast.error(err.userMessage || 'Not found');
        navigate('/resumes');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, navigate]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/resumes/${id}`, resume);
      setResume(data);
      toast.success('Saved');
    } catch (err) {
      toast.error(err.userMessage || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const aiSummary = async () => {
    if (!hasFullAccess) {
      toast.error('Premium required');
      return;
    }
    setBusyAi(true);
    try {
      const bullets = (resume.experience || [])
        .flatMap((e) => e.bullets || [])
        .join('; ');
      const { data } = await api.post('/resumes/ai/summary', {
        role: resume.headline,
        bullets,
      });
      setResume((r) => ({ ...r, summary: data.summary }));
      toast.success('Summary generated');
    } catch (err) {
      toast.error(err.userMessage || 'AI error');
    } finally {
      setBusyAi(false);
    }
  };

  const aiSkills = async () => {
    if (!hasFullAccess) {
      toast.error('Premium required');
      return;
    }
    setBusyAi(true);
    try {
      const snippet = JSON.stringify(resume.experience || []).slice(0, 800);
      const { data } = await api.post('/resumes/ai/skills', {
        role: resume.headline,
        experienceSnippet: snippet,
      });
      setResume((r) => ({ ...r, skills: data.skills }));
      toast.success('Skills suggested');
    } catch (err) {
      toast.error(err.userMessage || 'AI error');
    } finally {
      setBusyAi(false);
    }
  };

  const runAnalyze = async () => {
    setBusyAi(true);
    try {
      const { data } = await api.post('/resumes/ai/analyze', {
        text: analyzeText,
        jobTarget: resume.headline,
      });
      setAnalysis(data);
      toast.success('Analysis ready');
    } catch (err) {
      toast.error(err.userMessage || 'AI error');
    } finally {
      setBusyAi(false);
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post(`/resumes/${id}/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(data);
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err.userMessage || 'Upload failed');
    }
  };

  if (loading || !resume) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const setField = (key, val) => setResume((r) => ({ ...r, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold">Resume editor</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await api.post(`/resumes/${id}/track-download`);
                exportResumePdf(resume);
              } catch (err) {
                toast.error(err.userMessage || 'Download limit reached');
              }
            }}
            type="button"
          >
            Download PDF
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium">Title</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              value={resume.title}
              onChange={(e) => setField('title', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Full name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              value={resume.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium">Headline</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={resume.headline}
            onChange={(e) => setField('headline', e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium">Summary</label>
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              disabled={busyAi}
              onClick={aiSummary}
            >
              AI summary {isPremium ? '' : '(Premium)'}
            </Button>
          </div>
          <textarea
            className="mt-1 min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={resume.summary}
            onChange={(e) => setField('summary', e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium">Skills (comma separated)</label>
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              disabled={busyAi}
              onClick={aiSkills}
            >
              AI suggest {isPremium ? '' : '(Premium)'}
            </Button>
          </div>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={(resume.skills || []).join(', ')}
            onChange={(e) =>
              setField(
                'skills',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">Experience</h2>
        {(resume.experience?.length ? resume.experience : [emptyExp]).map(
          (ex, idx) => (
            <div key={idx} className="mt-4 space-y-2 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  placeholder="Role"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={ex.role}
                  onChange={(e) => {
                    const next = [...(resume.experience || [])];
                    next[idx] = { ...ex, role: e.target.value };
                    setField('experience', next);
                  }}
                />
                <input
                  placeholder="Company"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={ex.company}
                  onChange={(e) => {
                    const next = [...(resume.experience || [])];
                    next[idx] = { ...ex, company: e.target.value };
                    setField('experience', next);
                  }}
                />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  placeholder="Start"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={ex.start}
                  onChange={(e) => {
                    const next = [...(resume.experience || [])];
                    next[idx] = { ...ex, start: e.target.value };
                    setField('experience', next);
                  }}
                />
                <input
                  placeholder="End"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={ex.end}
                  onChange={(e) => {
                    const next = [...(resume.experience || [])];
                    next[idx] = { ...ex, end: e.target.value };
                    setField('experience', next);
                  }}
                />
              </div>
              <textarea
                placeholder="Bullets (one per line)"
                className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                value={(ex.bullets || []).join('\n')}
                onChange={(e) => {
                  const next = [...(resume.experience || [])];
                  next[idx] = {
                    ...ex,
                    bullets: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                  };
                  setField('experience', next);
                }}
              />
            </div>
          )
        )}
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() =>
            setField('experience', [...(resume.experience || []), { ...emptyExp }])
          }
        >
          Add role
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Resume file (Cloudinary)</h2>
        <input type="file" accept=".pdf,image/*" onChange={uploadFile} />
        {resume.resumeFile?.url && (
          <a
            href={resume.resumeFile.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-600 hover:underline"
          >
            View uploaded file
          </a>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold">AI resume analysis</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Paste resume text for a structured critique {isPremium ? '' : '(Premium).'}
        </p>
        <textarea
          className="min-h-[120px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          value={analyzeText}
          onChange={(e) => setAnalyzeText(e.target.value)}
          placeholder="Paste plain text from your resume…"
        />
        <Button type="button" disabled={busyAi} onClick={runAnalyze}>
          Analyze
        </Button>
        {analysis && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
            <p className="font-semibold">Score: {analysis.score}</p>
            <p className="mt-2">{analysis.summary}</p>
            <ul className="mt-2 list-disc pl-5">
              {(analysis.strengths || []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
