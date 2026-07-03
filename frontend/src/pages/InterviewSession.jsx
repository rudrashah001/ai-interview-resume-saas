import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasFullAccess } = useAuth();
  const [questionCount, setQuestionCount] = useState(10);
  const [mix, setMix] = useState('both');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [answers, setAnswers] = useState({});

  const load = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      setSession(data);
      const map = {};
      (data.items || []).forEach((it) => {
        map[it._id] = it.answer || '';
      });
      setAnswers(map);
    } catch (err) {
      toast.error(err.userMessage || 'Not found');
      navigate('/interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, navigate]);

  const genQuestions = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/interviews/${id}/questions`, {
        mix,
        count: Math.min(100, Math.max(1, questionCount)),
      });
      setSession(data);
      toast.success('Questions generated');
    } catch (err) {
      toast.error(err.userMessage || 'AI error');
    } finally {
      setBusy(false);
    }
  };

  const saveAnswer = async (itemId) => {
    setBusy(true);
    try {
      const { data } = await api.patch(`/interviews/${id}/answer`, {
        itemId,
        answer: answers[itemId] || '',
      });
      setSession(data);
      toast.success('Answer saved');
    } catch (err) {
      toast.error(err.userMessage || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const feedback = async (itemId) => {
    if (!hasFullAccess) {
      toast.error('Premium required for AI feedback');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(`/interviews/${id}/feedback`, { itemId });
      setSession(data);
      toast.success('Feedback ready');
    } catch (err) {
      toast.error(err.userMessage || 'AI error');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">{session.jobTitle}</h1>
          <p className="text-sm text-slate-500">
            {session.company} · {session.difficulty}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={mix}
            onChange={(e) => setMix(e.target.value)}
          >
            <option value="both">Technical + HR</option>
            <option value="technical">Technical only</option>
            <option value="hr">HR only</option>
          </select>
          <input
            type="number"
            min={1}
            max={100}
            className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
          />
          <Button onClick={genQuestions} disabled={busy}>
            Generate questions
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {(session.items || []).map((it) => (
          <Card key={it._id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {it.category}
              </span>
            </div>
            <p className="font-medium">{it.question}</p>
            <textarea
              className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              value={answers[it._id] || ''}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [it._id]: e.target.value }))
              }
              placeholder="Your answer…"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => saveAnswer(it._id)}
              >
                Save answer
              </Button>
              <Button
                type="button"
                disabled={busy}
                onClick={() => feedback(it._id)}
              >
                AI feedback {hasFullAccess ? '' : '(Premium)'}
              </Button>
            </div>
            {it.feedback && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900">
                {it.feedback}
              </div>
            )}
          </Card>
        ))}
        {!session.items?.length && (
          <p className="text-slate-500">
            Select mix and count above, then click Generate questions. For Google,
            Microsoft, etc., saved company questions load even if AI is busy.
          </p>
        )}
      </div>
    </div>
  );
}
