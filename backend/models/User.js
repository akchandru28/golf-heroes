const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // ── Subscription (no payment gateway) ──────────────────────────────
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'inactive',
  },
  plan: { type: String, enum: ['monthly', 'yearly', null], default: null },
  subscriptionStartDate: { type: Date, default: null },
  subscriptionEndDate: { type: Date, default: null },
  // ────────────────────────────────────────────────────────────────────

  selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  charityPercentage: { type: Number, default: 10, min: 10, max: 100 },
  totalWon: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// ── Hash password before save ────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * True only when status is 'active' AND end date is in the future.
 * Used by requireActiveSubscription middleware.
 */
userSchema.methods.hasActiveSubscription = function () {
  return (
    (this.subscriptionStatus === 'active' || this.subscriptionStatus === 'cancelled') &&
    this.subscriptionEndDate &&
    this.subscriptionEndDate > new Date()
  );
};

module.exports = mongoose.model('User', userSchema);
