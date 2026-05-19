import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export default function BillingSuccess() {
  const { refreshMe } = useAuth();

  useEffect(() => {
    refreshMe?.();
  }, [refreshMe]);

  return (
    <div className="mx-auto max-w-lg">
      <Card className="text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">You are all set</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Stripe will confirm your subscription shortly. Refresh your profile from
          the dashboard if premium does not appear immediately.
        </p>
        <Link to="/dashboard">
          <Button className="w-full">Back to dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
