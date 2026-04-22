const Draw = require('../models/Draw');
const User = require('../models/User');
const Score = require('../models/Score');

const SUBSCRIPTION_FEE_MONTHLY = 100; // ₹100/month
const POOL_SHARE = { fiveMatch: 0.40, fourMatch: 0.35, threeMatch: 0.25 };

// Helper: generate 5 unique numbers 1-45
const randomDraw = () => {
  const nums = new Set();
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return [...nums];
};

// Helper: algorithmic draw — use most frequent scores across all users
const algorithmicDraw = async () => {
  const scores = await Score.find({});
  const freq = {};
  scores.forEach(s => s.entries.forEach(e => {
    freq[e.score] = (freq[e.score] || 0) + 1;
  }));
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const nums = sorted.slice(0, 5).map(([n]) => parseInt(n));
  // Pad with random if fewer than 5 unique scores exist
  while (nums.length < 5) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (!nums.includes(r)) nums.push(r);
  }
  return nums.slice(0, 5);
};

// Helper: count how many of a user's scores match draw numbers
const countMatches = (userScores, drawNumbers) => {
  const scoreSet = new Set(userScores);
  return drawNumbers.filter(n => scoreSet.has(n)).length;
};

// Helper: calculate prize pool
const calcPrizePool = (subscriberCount, rolledOver = 0) => {
  const total = subscriberCount * SUBSCRIPTION_FEE_MONTHLY + rolledOver;
  return {
    total,
    fiveMatch: parseFloat((total * POOL_SHARE.fiveMatch).toFixed(2)),
    fourMatch: parseFloat((total * POOL_SHARE.fourMatch).toFixed(2)),
    threeMatch: parseFloat((total * POOL_SHARE.threeMatch).toFixed(2)),
    rolledOver,
  };
};

// GET /api/draws — list all draws
exports.getDraws = async (req, res, next) => {
  try {
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .populate('winners.user', 'name email');
    res.json({ success: true, draws });
  } catch (err) { next(err); }
};

// GET /api/draws/upcoming — current/upcoming draw info
exports.getUpcomingDraw = async (req, res, next) => {
  try {
    const now = new Date();
    let draw = await Draw.findOne({ month: now.getMonth() + 1, year: now.getFullYear() });
    res.json({ success: true, draw });
  } catch (err) { next(err); }
};

// GET /api/draws/my-results — user's own draw results
exports.getMyResults = async (req, res, next) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'winners.user': req.user._id,
    }).sort({ year: -1, month: -1 });
    res.json({ success: true, draws });
  } catch (err) { next(err); }
};

// POST /api/admin/draws/simulate
exports.simulateDraw = async (req, res, next) => {
  try {
    const { month, year, drawLogic = 'random' } = req.body;
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();

    // Get active subscribers
    const activeUsers = await User.find({ subscriptionStatus: 'active' });
    const subscriberCount = activeUsers.length;

    // Check for rollover from previous month
    let prevMonth = m === 1 ? 12 : m - 1;
    let prevYear = m === 1 ? y - 1 : y;
    const prevDraw = await Draw.findOne({ month: prevMonth, year: prevYear, status: 'published' });
    const rolledOver = prevDraw && prevDraw.winners.filter(w => w.matchType === '5-match').length === 0
      ? prevDraw.prizePool.fiveMatch : 0;

    const drawNumbers = drawLogic === 'algorithmic' ? await algorithmicDraw() : randomDraw();
    const prizePool = calcPrizePool(subscriberCount, rolledOver);

    // Find winners
    const winners = [];
    for (const user of activeUsers) {
      const scoreDoc = await Score.findOne({ user: user._id });
      if (!scoreDoc || scoreDoc.entries.length === 0) continue;
      const userScores = scoreDoc.entries.map(e => e.score);
      const matches = countMatches(userScores, drawNumbers);
      if (matches >= 3) {
        winners.push({
          user: user._id,
          matchType: matches === 5 ? '5-match' : matches === 4 ? '4-match' : '3-match',
          userScores,
          paymentStatus: 'pending',
          verificationStatus: 'pending',
        });
      }
    }

    // Calculate per-winner prizes
    const fiveWinners = winners.filter(w => w.matchType === '5-match');
    const fourWinners = winners.filter(w => w.matchType === '4-match');
    const threeWinners = winners.filter(w => w.matchType === '3-match');

    fiveWinners.forEach(w => { w.prizeAmount = fiveWinners.length ? prizePool.fiveMatch / fiveWinners.length : 0; });
    fourWinners.forEach(w => { w.prizeAmount = fourWinners.length ? prizePool.fourMatch / fourWinners.length : 0; });
    threeWinners.forEach(w => { w.prizeAmount = threeWinners.length ? prizePool.threeMatch / threeWinners.length : 0; });

    // Upsert draw
    const draw = await Draw.findOneAndUpdate(
      { month: m, year: y },
      { drawNumbers, drawLogic, prizePool, winners, activeSubscribers: subscriberCount, status: 'simulated' },
      { upsert: true, new: true }
    );

    res.json({ success: true, draw, message: 'Simulation complete — review before publishing' });
  } catch (err) { next(err); }
};

// POST /api/admin/draws/publish
exports.publishDraw = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();

    const draw = await Draw.findOne({ month: m, year: y });
    if (!draw) return res.status(404).json({ success: false, message: 'Run simulation first' });
    if (draw.status === 'published') return res.status(400).json({ success: false, message: 'Draw already published' });

    draw.status = 'published';
    draw.publishedAt = new Date();
    await draw.save();

    // Update winners' total won
    for (const w of draw.winners) {
      await User.findByIdAndUpdate(w.user, { $inc: { totalWon: w.prizeAmount || 0 } });
    }

    res.json({ success: true, draw, message: 'Draw published successfully' });
  } catch (err) { next(err); }
};

// POST /api/draws/:drawId/submit-proof
exports.submitProof = async (req, res, next) => {
  try {
    const { proofUrl } = req.body;
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });

    const winner = draw.winners.find(w => w.user.toString() === req.user._id.toString());
    if (!winner) return res.status(404).json({ success: false, message: 'You are not a winner in this draw' });

    winner.proofSubmitted = true;
    winner.proofUrl = proofUrl;
    await draw.save();

    res.json({ success: true, message: 'Proof submitted for review' });
  } catch (err) { next(err); }
};

// ADMIN: verify winner
exports.verifyWinner = async (req, res, next) => {
  try {
    const { drawId, winnerId, status } = req.body;
    const draw = await Draw.findById(drawId);
    const winner = draw.winners.id(winnerId);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    winner.verificationStatus = status; // 'approved' or 'rejected'
    if (status === 'approved') winner.paymentStatus = 'paid';
    await draw.save();

    res.json({ success: true, message: `Winner ${status}` });
  } catch (err) { next(err); }
};
