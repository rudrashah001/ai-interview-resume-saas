import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} PrepAI — Interview prep & resumes.
      </footer>
    </div>
  );
}
