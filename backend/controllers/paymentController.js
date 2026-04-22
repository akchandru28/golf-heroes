const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// POST /api/payments/create-checkout-session
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    let customerId = req.user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { 'subscription.stripeCustomerId': customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.FRONTEND_URL}/subscribe?cancelled=true`,
      metadata: { userId: req.user._id.toString(), plan },
    });

    res.json({ success: true, sessionUrl: session.url });
  } catch (err) { next(err); }
};

// POST /api/payments/cancel
exports.cancelSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.subscription.stripeSubscriptionId)
      return res.status(400).json({ success: false, message: 'No active subscription found' });

    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await User.findByIdAndUpdate(user._id, { 'subscription.cancelAtPeriodEnd': true });
    res.json({ success: true, message: 'Subscription will cancel at end of billing period' });
  } catch (err) { next(err); }
};

// GET /api/payments/status
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, subscription: user.subscription });
  } catch (err) { next(err); }
};

// POST /api/payments/webhook — Stripe webhook handler
exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = data;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      await User.findByIdAndUpdate(userId, {
        'subscription.status': 'active',
        'subscription.plan': plan,
        'subscription.stripeSubscriptionId': sub.id,
        'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': false,
      });
      break;
    }
    case 'invoice.payment_succeeded': {
      const sub = await stripe.subscriptions.retrieve(data.subscription);
      const customer = await stripe.customers.retrieve(data.customer);
      const user = await User.findOne({ 'subscription.stripeCustomerId': data.customer });
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const user = await User.findOne({ 'subscription.stripeSubscriptionId': data.id });
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          'subscription.status': 'cancelled',
          'subscription.stripeSubscriptionId': null,
        });
      }
      break;
    }
    case 'invoice.payment_failed': {
      const user = await User.findOne({ 'subscription.stripeCustomerId': data.customer });
      if (user) await User.findByIdAndUpdate(user._id, { 'subscription.status': 'lapsed' });
      break;
    }
  }

  res.json({ received: true });
};
