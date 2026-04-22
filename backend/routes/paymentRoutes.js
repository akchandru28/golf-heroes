const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  cancelSubscription,
  getSubscriptionStatus,
  stripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook must use raw body — handled in server.js before express.json()
router.post('/webhook', stripeWebhook);

router.use(protect);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/cancel', cancelSubscription);
router.get('/status', getSubscriptionStatus);

module.exports = router;
