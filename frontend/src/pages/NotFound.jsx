import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Page not found.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
