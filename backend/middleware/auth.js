const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies JWT and attaches req.user.
 * Also runs subscription expiry check on every authenticated request.
 */
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorised — no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('selectedCharity', 'name image');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });

    // ── Auto-expiry check ────────────────────────────────────────────
    // If the subscription end date has passed and status is still 'active' or 'cancelled',
    // flip it to 'expired' silently so the next call sees the updated state.
    if (
      (req.user.subscriptionStatus === 'active' || req.user.subscriptionStatus === 'cancelled') &&
      req.user.subscriptionEndDate &&
      req.user.subscriptionEndDate < new Date()
    ) {
      await User.findByIdAndUpdate(req.user._id, { subscriptionStatus: 'expired' });
      req.user.subscriptionStatus = 'expired'; // update in-memory too
    }
    // ────────────────────────────────────────────────────────────────

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

/**
 * adminOnly — allow only users with role === 'admin'.
 */
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Admin access required' });
};

/**
 * requireActiveSubscription — blocks access for non-subscribers.
 * Must come AFTER protect so req.user exists.
 *
 * Allows admins through without a subscription check.
 */
exports.requireActiveSubscription = (req, res, next) => {
  // Admins bypass subscription check
  if (req.user && req.user.role === 'admin') return next();

  if (req.user && req.user.hasActiveSubscription()) return next();

  const status = req.user?.subscriptionStatus || 'inactive';
  const message =
    status === 'expired'
      ? 'Your subscription has expired. Please renew to continue.'
      : 'An active subscription is required to access this feature.';

  res.status(403).json({ success: false, message, subscriptionStatus: status });
};

// Legacy alias — keeps existing route files working if referenced as 'subscribed'
exports.subscribed = exports.requireActiveSubscription;
