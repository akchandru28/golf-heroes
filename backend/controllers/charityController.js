const Charity = require('../models/Charity');
const User = require('../models/User');

// GET /api/charities
exports.getCharities = async (req, res, next) => {
  try {
    const { search, featured } = req.query;
    const query = { active: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (featured === 'true') query.featured = true;
    const charities = await Charity.find(query).sort({ featured: -1, name: 1 });
    res.json({ success: true, charities });
  } catch (err) { next(err); }
};

// GET /api/charities/:id
exports.getCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (err) { next(err); }
};

// PUT /api/users/charity — user selects/updates charity
exports.selectCharity = async (req, res, next) => {
  try {
    const { charityId, percentage } = req.body;
    if (percentage && (percentage < 10 || percentage > 100))
      return res.status(400).json({ success: false, message: 'Percentage must be 10-100' });
    const update = { selectedCharity: charityId };
    if (percentage) update.charityPercentage = percentage;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).populate('selectedCharity', 'name image');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// ADMIN CRUD
exports.createCharity = async (req, res, next) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ success: true, charity });
  } catch (err) { next(err); }
};

exports.updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (err) { next(err); }
};

exports.deleteCharity = async (req, res, next) => {
  try {
    await Charity.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: 'Charity deactivated' });
  } catch (err) { next(err); }
};
