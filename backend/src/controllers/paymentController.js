import User from '../models/User.js';
import PaymentEvent from '../models/PaymentEvent.js';
import { getStripe } from '../config/stripe.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503);
    throw new Error('Stripe is not configured');
  }
  const plan = req.body.plan === 'yearly' ? 'yearly' : 'monthly';
  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY;
  if (!priceId) {
    res.status(503);
    throw new Error(`Stripe price ID missing for ${plan} plan`);
  }

  const user = await User.findById(req.user._id);
  let customerId = user.subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: String(user._id) },
    });
    customerId = customer.id;
    user.subscription.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/billing/cancel`,
    metadata: { userId: String(user._id), plan },
  });

  res.json({ url: session.url, plan });
});

export const webhookStripe = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !whSecret) {
    return res.status(503).send('Stripe webhook not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.subscription.status = 'active';
            const plan = session.metadata?.plan || 'monthly';
            user.subscription.plan =
              plan === 'yearly' ? 'premium_yearly' : 'premium_monthly';
            user.subscription.stripeSubscriptionId = session.subscription;
            const days = plan === 'yearly' ? 365 : 30;
            user.subscription.currentPeriodEnd = new Date(
              Date.now() + days * 24 * 60 * 60 * 1000
            );
            await user.save();
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const user = await User.findOne({
          'subscription.stripeCustomerId': customerId,
        });
        if (user) {
          if (sub.status === 'active' || sub.status === 'trialing') {
            user.subscription.status = 'active';
            user.subscription.stripeSubscriptionId = sub.id;
            user.subscription.currentPeriodEnd = sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : user.subscription.currentPeriodEnd;
          } else {
            user.subscription.status =
              sub.status === 'canceled' ? 'canceled' : 'past_due';
          }
          await user.save();
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const user = await User.findOne({
          'subscription.stripeCustomerId': invoice.customer,
        });
        if (user && invoice.amount_paid) {
          await PaymentEvent.findOneAndUpdate(
            { stripeEventId: event.id },
            {
              user: user._id,
              stripeEventId: event.id,
              type: 'payment_succeeded',
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              metadata: { invoiceId: invoice.id },
            },
            { upsert: true, new: true }
          );
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Webhook handler error', e);
    return res.status(500).send('Webhook handler failed');
  }

  res.json({ received: true });
};
