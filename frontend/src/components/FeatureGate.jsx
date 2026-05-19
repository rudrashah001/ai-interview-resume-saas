import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';
import Card from './Card.jsx';

export default function FeatureGate({ children, premium = false, message }) {
  const { hasFullAccess } = useAuth();
  if (!premium || hasFullAccess) return children;

  return (
    <Card className="border-dashed border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/30">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {message || 'This feature is included with Premium.'}
      </p>
      <Link to="/pricing" className="mt-4 inline-block">
        <Button size="sm">View Premium plans</Button>
      </Link>
    </Card>
  );
}
