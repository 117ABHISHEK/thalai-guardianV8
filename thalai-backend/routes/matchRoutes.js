const express = require('express');
const router = express.Router();
const { findMatches, getTopMatches } = require('../controllers/matchController');
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

module.exports = router;

