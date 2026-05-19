import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { FREE_FEATURES, PREMIUM_FEATURES } from '../utils/features.js';

export default function Home() {
  return (
    <div className="space-y-20 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 px-8 py-16 text-white shadow-xl md:px-14 md:py-20">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-400/20 blur-2xl" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">
            AI Interview Prep & Resume SaaS
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            Resumes, interviews, and career coaching — free to start.
          </h1>
          <p className="text-lg text-brand-100">
            Build resumes, practice with AI-generated questions from top companies,
            chat with a career coach, and upgrade for ATS scoring, mock interviews,
            and unlimited access.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register">
              <Button className="bg-white text-brand-700 hover:bg-brand-50">
                Start free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                View plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <Card className="border-brand-100 dark:border-brand-900/50">
          <h2 className="font-display text-xl font-semibold text-brand-600 dark:text-brand-400">
            Free forever
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-brand-500">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="ring-2 ring-brand-200 dark:ring-brand-800">
          <h2 className="font-display text-xl font-semibold">Premium</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {PREMIUM_FEATURES.slice(0, 8).map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-amber-500">★</span>
                {f}
              </li>
            ))}
            <li className="text-slate-500">+ more in pricing</li>
          </ul>
          <Link to="/pricing" className="mt-6 inline-block">
            <Button>See Premium</Button>
          </Link>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Resume builder', desc: 'Create, upload, analyze, and export PDF resumes.', to: '/resumes' },
          { title: 'Interview prep', desc: 'Google, Microsoft, Amazon, TCS, Infosys, Meta — and more.', to: '/interviews' },
          { title: 'AI chat', desc: 'Career coach available on the free plan — no card required.', to: '/chat' },
        ].map((item) => (
          <Card key={item.title} className="transition hover:shadow-md">
            <h3 className="font-display font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
            <Link to={item.to} className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
              Explore →
            </Link>
          </Card>
        ))}
      </section>
    </div>
  );
}
