import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';
import TypingIndicator from '../components/TypingIndicator.jsx';

export default function Chat() {
  const { hasFullAccess } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadList = async () => {
    try {
      const { data } = await api.get('/chat');
      setConversations(data);
      if (!activeId && data[0]?._id) setActiveId(data[0]._id);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!activeId) return;
      try {
        const { data } = await api.get(`/chat/${activeId}`);
        setConversation(data);
      } catch (err) {
        toast.error(err.userMessage || 'Could not open chat');
      }
    };
    run();
  }, [activeId]);

  const newChat = async () => {
    try {
      const { data } = await api.post('/chat', { title: 'New chat' });
      setConversations((c) => [data, ...c]);
      setActiveId(data._id);
      setConversation(data);
    } catch (err) {
      toast.error(err.userMessage || 'Could not create');
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeId) return;
    const previous = conversation;
    const optimistic = {
      ...conversation,
      messages: [
        ...(conversation?.messages || []),
        { role: 'user', content: input, _id: `tmp-${Date.now()}` },
      ],
    };
    setConversation(optimistic);
    const outgoing = input;
    setInput('');
    setSending(true);
    try {
      const { data } = await api.post(`/chat/${activeId}/messages`, {
        content: outgoing,
      });
      setConversation(data);
      loadList();
    } catch (err) {
      toast.error(err.userMessage || 'Send failed');
      setConversation(previous);
    } finally {
      setSending(false);
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
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <Card className="h-fit space-y-3 p-4">
        <Button className="w-full" onClick={newChat}>
          New chat
        </Button>
        <ul className="space-y-2 text-sm">
          {conversations.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                onClick={() => setActiveId(c._id)}
                className={`w-full rounded-lg px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  c._id === activeId ? 'bg-brand-50 dark:bg-brand-900/30' : ''
                }`}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="flex min-h-[480px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {(conversation?.messages || []).map((m) => (
            <div
              key={m._id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={send} className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <input
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="Ask about interviews, offers, STAR stories… (free)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" disabled={sending}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
