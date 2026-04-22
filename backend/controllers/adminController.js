const User = require('../models/User');
const Score = require('../models/Score');
const Draw = require('../models/Draw');
const Charity = require('../models/Charity');

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeSubscribers = await User.countDocuments({ subscriptionStatus: 'active' });
    const totalCharities = await Charity.countDocuments({ active: true });
    const publishedDraws = await Draw.countDocuments({ status: 'published' });

    // Total prize pool estimate: active subscribers × ₹100
    const totalPrizePool = activeSubscribers * 100;

    // Charity contributions: sum of (₹100 × charityPercentage%) per active subscriber
    const charityAgg = await User.aggregate([
      { $match: { subscriptionStatus: 'active' } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: [100, { $divide: ['$charityPercentage', 100] }] } },
        },
      },
    ]);
    const totalCharityContributions = charityAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: { totalUsers, activeSubscribers, totalCharities, publishedDraws, totalPrizePool, totalCharityContributions },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.subscriptionStatus = status; // flat field

    const users = await User.find(query)
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/admin/users/:id
exports.getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('selectedCharity', 'name image');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const scores = await Score.findOne({ user: user._id });
    res.json({ success: true, user, scores: scores?.entries || [] });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, subscriptionStatus } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (subscriptionStatus) update.subscriptionStatus = subscriptionStatus; // flat field
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/scores
exports.editUserScores = async (req, res, next) => {
  try {
    const { entries } = req.body;
    const scoreDoc = await Score.findOneAndUpdate(
      { user: req.params.id },
      { entries, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ success: true, entries: scoreDoc.entries });
  } catch (err) { next(err); }
};

// GET /api/admin/draws
exports.getAllDraws = async (req, res, next) => {
  try {
    const draws = await Draw.find().sort({ year: -1, month: -1 }).populate('winners.user', 'name email');
    res.json({ success: true, draws });
  } catch (err) { next(err); }
};

// GET /api/admin/winners/pending
exports.getPendingVerifications = async (req, res, next) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'winners.proofSubmitted': true,
      'winners.verificationStatus': 'pending',
    }).populate('winners.user', 'name email');
    res.json({ success: true, draws });
  } catch (err) { next(err); }
};
