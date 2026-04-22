const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  score: { type: Number, required: true, min: 1, max: 45 },
  date: { type: Date, required: true },
}, { _id: true });

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entries: {
    type: [scoreEntrySchema],
    validate: {
      validator: function (v) { return v.length <= 5; },
      message: 'Maximum 5 scores allowed',
    },
  },
  updatedAt: { type: Date, default: Date.now },
});

// Keep only latest 5 — sorted by date desc
scoreSchema.methods.addScore = function (score, date) {
  // Check for duplicate date
  const dateStr = new Date(date).toDateString();
  const dup = this.entries.find(e => new Date(e.date).toDateString() === dateStr);
  if (dup) throw new Error('A score already exists for this date. Edit or delete it first.');

  this.entries.push({ score, date: new Date(date) });
  // Sort newest first, keep only 5
  this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (this.entries.length > 5) this.entries = this.entries.slice(0, 5);
  this.updatedAt = new Date();
};

module.exports = mongoose.model('Score', scoreSchema);
