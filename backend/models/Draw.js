const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchType: { type: String, enum: ['5-match', '4-match', '3-match'] },
  prizeAmount: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  proofSubmitted: { type: Boolean, default: false },
  proofUrl: { type: String },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  userScores: [Number],
});

const drawSchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  drawNumbers: { type: [Number], default: [] }, // 5 numbers drawn
  drawLogic: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
  status: { type: String, enum: ['upcoming', 'simulated', 'published'], default: 'upcoming' },
  prizePool: {
    total: { type: Number, default: 0 },
    fiveMatch: { type: Number, default: 0 },   // 40%
    fourMatch: { type: Number, default: 0 },   // 35%
    threeMatch: { type: Number, default: 0 },  // 25%
    rolledOver: { type: Number, default: 0 },  // from previous jackpot
  },
  winners: [winnerSchema],
  activeSubscribers: { type: Number, default: 0 },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);
