import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import FeatureGate from '../components/FeatureGate.jsx';
import Spinner from '../components/Spinner.jsx';

export default function ResumeAnalyzer() {
  const { hasFullAccess } = useAuth();
  const [text, setText] = useState('');
  const [jobTarget, setJobTarget] = useState('');
  const [industry, setIndustry] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);

  const runBasic = async () => {
    if (text.length < 40) {
      toast.error('Paste at least 40 characters of resume text');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/resumes/ai/analyze', { text, jobTarget });
      setAnalysis(data);
      toast.success('Analysis complete');
    } catch (err) {
      toast.error(err.userMessage || 'Analysis failed');
    } finally {
      setBusy(false);
    }
  };

  const runAdvanced = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/resumes/ai/analyze/advanced', {
        text,
        jobTarget,
        industry,
      });
      setAnalysis(data);
      toast.success('Advanced analysis ready');
    } catch (err) {
      toast.error(err.userMessage || 'Advanced analysis failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Resume analyzer</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Free: AI score and improvement tips. Premium: ATS check and deep optimization.
        </p>
      </div>

      <Card className="space-y-4">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          placeholder="Target role (e.g. Frontend Engineer)"
          value={jobTarget}
          onChange={(e) => setJobTarget(e.target.value)}
        />
        {hasFullAccess && (
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="Industry (optional)"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        )}
        <textarea
          className="min-h-[200px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          placeholder="Paste your resume text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={runBasic} disabled={busy}>
            {busy ? 'Analyzing…' : 'Run free analysis'}
          </Button>
          {hasFullAccess && (
            <Button variant="secondary" onClick={runAdvanced} disabled={busy}>
              Advanced + ATS
            </Button>
          )}
        </div>
        {!hasFullAccess && (
          <FeatureGate premium message="ATS score and industry optimization require Premium." />
        )}
      </Card>

      {busy && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {analysis && !busy && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <p className="text-xs uppercase text-slate-500">Score</p>
            <p className="text-4xl font-bold text-brand-600">{analysis.score ?? '—'}</p>
            {analysis.atsScore != null && (
              <p className="mt-2 text-sm">ATS: {analysis.atsScore}</p>
            )}
          </Card>
          <Card>
            <h3 className="font-semibold">Summary</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{analysis.summary}</p>
          </Card>
          {['strengths', 'improvements', 'suggestions', 'optimizationTips'].map(
            (key) =>
              analysis[key]?.length ? (
                <Card key={key}>
                  <h3 className="font-semibold capitalize">{key}</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
                    {analysis[key].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Card>
              ) : null
          )}
        </div>
      )}
    </div>
  );
}
