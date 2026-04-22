const express = require('express');
const router = express.Router();
const { getDraws, getUpcomingDraw, getMyResults, submitProof } = require('../controllers/drawController');
const { protect } = require('../middleware/auth');

router.get('/', getDraws);
router.get('/upcoming', protect, getUpcomingDraw);
router.get('/my-results', protect, getMyResults);
router.post('/:drawId/submit-proof', protect, submitProof);

module.exports = router;
