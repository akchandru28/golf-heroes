const express = require('express');
const router = express.Router();
const {
  activateSubscription,
  getSubscriptionStatus,
  cancelSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// All subscription routes require a valid JWT
router.use(protect);

/**
 * POST /api/subscription/activate
 * Body: { plan: "monthly" | "yearly" }
 * Activates or extends the user's subscription — no payment needed.
 */
router.post('/activate', activateSubscription);

/**
 * GET /api/subscription/status
 * Returns: { status, plan, subscriptionStartDate, subscriptionEndDate, remainingDays }
 */
router.get('/status', getSubscriptionStatus);

/**
 * POST /api/subscription/cancel
 * Cancels the active subscription immediately.
 */
router.post('/cancel', cancelSubscription);

module.exports = router;
