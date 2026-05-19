import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Button from './Button.jsx';

const linkClass = ({ isActive }) =>
  `text-sm font-medium whitespace-nowrap ${
    isActive
      ? 'text-brand-600 dark:text-brand-400'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
  }`;

export default function Navbar() {
  const { isAuthenticated, user, logout, hasFullAccess } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const navLinks = isAuthenticated ? (
    <>
      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/resumes" className={linkClass}>
        Resumes
      </NavLink>
      <NavLink to="/analyzer" className={linkClass}>
        Analyzer
      </NavLink>
      <NavLink to="/interviews" className={linkClass}>
        Interviews
      </NavLink>
      <NavLink to="/chat" className={linkClass}>
        AI Chat
      </NavLink>
      <NavLink to="/premium-tools" className={linkClass}>
        Premium
      </NavLink>
      <NavLink to="/pricing" className={linkClass}>
        Pricing
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
      {user?.role === 'admin' && (
        <NavLink to="/admin" className={linkClass}>
          Admin
        </NavLink>
      )}
    </>
  ) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight shrink-0">
            Prep<span className="text-brand-600">AI</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex">
            {navLinks}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            {isAuthenticated ? (
              <>
                {!hasFullAccess && (
                  <Button
                    variant="secondary"
                    className="hidden sm:inline-flex"
                    onClick={() => navigate('/pricing')}
                  >
                    Upgrade
                  </Button>
                )}
                <span className="hidden text-xs text-slate-500 md:inline">
                  {user?.name}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Log in
                </NavLink>
                <Button onClick={() => navigate('/register')}>Get started</Button>
              </>
            )}
          </div>
        </div>
        {isAuthenticated && (
          <nav className="mt-2 flex gap-3 overflow-x-auto pb-1 lg:hidden">
            {navLinks}
          </nav>
        )}
      </div>
    </header>
  );
}
