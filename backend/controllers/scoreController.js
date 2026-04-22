const Score = require('../models/Score');

// GET /api/scores/me
exports.getMyScores = async (req, res, next) => {
  try {
    let scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) scoreDoc = await Score.create({ user: req.user._id, entries: [] });
    // Return sorted newest first
    const sorted = [...scoreDoc.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, entries: sorted });
  } catch (err) { next(err); }
};

// POST /api/scores
exports.addScore = async (req, res, next) => {
  try {
    const { score, date } = req.body;
    if (!score || !date) return res.status(400).json({ success: false, message: 'Score and date required' });
    if (score < 1 || score > 45) return res.status(400).json({ success: false, message: 'Score must be 1-45' });

    let scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) scoreDoc = await Score.create({ user: req.user._id, entries: [] });

    scoreDoc.addScore(score, date);
    await scoreDoc.save();

    const sorted = [...scoreDoc.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(201).json({ success: true, entries: sorted });
  } catch (err) {
    if (err.message.includes('already exists')) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

// PUT /api/scores/:entryId
exports.updateScore = async (req, res, next) => {
  try {
    const { score, date } = req.body;
    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) return res.status(404).json({ success: false, message: 'Score record not found' });

    const entry = scoreDoc.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Score entry not found' });

    // Check date conflict if date changed
    if (date && new Date(date).toDateString() !== new Date(entry.date).toDateString()) {
      const conflict = scoreDoc.entries.find(
        e => e._id.toString() !== req.params.entryId &&
          new Date(e.date).toDateString() === new Date(date).toDateString()
      );
      if (conflict) return res.status(400).json({ success: false, message: 'Another score already exists for that date' });
    }

    if (score !== undefined) entry.score = score;
    if (date) entry.date = new Date(date);
    scoreDoc.updatedAt = new Date();
    await scoreDoc.save();

    const sorted = [...scoreDoc.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, entries: sorted });
  } catch (err) { next(err); }
};

// DELETE /api/scores/:entryId
exports.deleteScore = async (req, res, next) => {
  try {
    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) return res.status(404).json({ success: false, message: 'Score record not found' });
    scoreDoc.entries = scoreDoc.entries.filter(e => e._id.toString() !== req.params.entryId);
    await scoreDoc.save();
    const sorted = [...scoreDoc.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, entries: sorted });
  } catch (err) { next(err); }
};
