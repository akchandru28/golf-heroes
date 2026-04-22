const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, getUserDetail, updateUser, editUserScores,
  getAllDraws, getPendingVerifications,
} = require('../controllers/adminController');
const { simulateDraw, publishDraw, verifyWinner } = require('../controllers/drawController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.put('/users/:id/scores', editUserScores);
router.get('/draws', getAllDraws);
router.post('/draws/simulate', simulateDraw);
router.post('/draws/publish', publishDraw);
router.post('/draws/verify-winner', verifyWinner);
router.get('/winners/pending', getPendingVerifications);

module.exports = router;
