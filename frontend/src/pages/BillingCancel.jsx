import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export default function BillingCancel() {
  return (
    <div className="mx-auto max-w-lg">
      <Card className="text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">Checkout canceled</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No charges were made. You can try again anytime.
        </p>
        <Link to="/pricing">
          <Button className="w-full">Return to pricing</Button>
        </Link>
      </Card>
    </div>
  );
}
