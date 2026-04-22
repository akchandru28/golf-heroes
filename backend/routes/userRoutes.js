const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('selectedCharity', 'name image description');
  res.json({ success: true, user });
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true }).populate('selectedCharity', 'name image');
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// PUT /api/users/charity
router.put('/charity', protect, async (req, res, next) => {
  try {
    const { charityId, charityPercentage } = req.body;
    if (charityPercentage && (charityPercentage < 10 || charityPercentage > 100))
      return res.status(400).json({ success: false, message: 'Percentage must be between 10 and 100' });
    const update = {};
    if (charityId) update.selectedCharity = charityId;
    if (charityPercentage) update.charityPercentage = charityPercentage;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).populate('selectedCharity', 'name image');
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

module.exports = router;
