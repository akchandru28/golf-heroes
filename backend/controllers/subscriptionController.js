const User = require('../models/User');

// ── Plan duration constants ──────────────────────────────────────────
const PLAN_DAYS = {
  monthly: 30,
  yearly: 365,
};

/**
 * Helper: calculate the end date from a start date and plan key.
 * Returns a new Date.
 */
const calcEndDate = (startDate, plan) => {
  const end = new Date(startDate);
  end.setDate(end.getDate() + PLAN_DAYS[plan]);
  return end;
};

// ────────────────────────────────────────────────────────────────────
// POST /api/subscription/activate
// Body: { plan: "monthly" | "yearly" }
// Behaviour:
//   - New subscriber    → start fresh
//   - Already active    → extend from current end date (don't reset)
//   - Expired/inactive  → restart from today
// ────────────────────────────────────────────────────────────────────
exports.activateSubscription = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLAN_DAYS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Choose "monthly" or "yearly".',
      });
    }

    const user = await User.findById(req.user._id);

    let startDate;
    let endDate;

    if (user.hasActiveSubscription()) {
      // ── Extend existing active subscription (don't punish loyal users) ──
      // New end = current end + plan duration
      startDate = user.subscriptionStartDate || new Date();
      endDate = calcEndDate(user.subscriptionEndDate, plan);
    } else {
      // ── Fresh start (new, expired, or inactive) ──
      startDate = new Date();
      endDate = calcEndDate(startDate, plan);
    }

    user.subscriptionStatus = 'active';
    user.plan = plan;
    user.subscriptionStartDate = startDate;
    user.subscriptionEndDate = endDate;
    await user.save();

    // Return full user minus password
    const updatedUser = await User.findById(user._id).populate('selectedCharity', 'name image');

    res.status(200).json({
      success: true,
      message: `Subscription activated — ${plan} plan`,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────
// GET /api/subscription/status
// Returns: status, plan, subscriptionStartDate, subscriptionEndDate,
//          remainingDays
// ────────────────────────────────────────────────────────────────────
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const now = new Date();
    let remainingDays = 0;

    if (user.subscriptionEndDate && user.subscriptionEndDate > now) {
      const msLeft = user.subscriptionEndDate.getTime() - now.getTime();
      remainingDays = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    }

    res.json({
      success: true,
      status: user.subscriptionStatus,
      plan: user.plan,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      remainingDays,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────
// POST /api/subscription/cancel
// Immediately sets status to 'inactive'.
// User retains access until the current end date (grace period).
// ────────────────────────────────────────────────────────────────────
exports.cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.subscriptionStatus !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to cancel.',
      });
    }

    // Mark as cancelled but keep end date — user keeps access until period ends
    user.subscriptionStatus = 'cancelled';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled.',
      subscriptionEndDate: user.subscriptionEndDate,
    });
  } catch (err) {
    next(err);
  }
};
