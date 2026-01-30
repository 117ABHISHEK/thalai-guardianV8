const express = require('express');
const router = express.Router();
const { findMatches, getTopMatches, getMyMatches, updateMatchStatus } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// @route   POST /api/match/find
// @desc    Find matching donors for a request
// @access  Private
router.post('/find', findMatches);

// @route   GET /api/match/top
// @desc    Get top matches for a request
// @access  Private
router.get('/top', getTopMatches);

// @route   GET /api/match/my-matches
// @desc    Get all match requests for the logged-in donor
// @access  Private (Donor only)
router.get('/my-matches', getMyMatches);

// @route   PUT /api/match/status/:matchId
// @desc    Update match status (accept/reject)
// @access  Private (Donor only)
router.put('/status/:matchId', updateMatchStatus);

module.exports = router;

