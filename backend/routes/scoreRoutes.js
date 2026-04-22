const express = require('express');
const router = express.Router();
const { getMyScores, addScore, updateScore, deleteScore } = require('../controllers/scoreController');
const { protect, subscribed } = require('../middleware/auth');

router.use(protect);
router.get('/me', getMyScores);
router.post('/', subscribed, addScore);
router.put('/:entryId', subscribed, updateScore);
router.delete('/:entryId', subscribed, deleteScore);

module.exports = router;
