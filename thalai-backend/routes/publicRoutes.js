const express = require('express');
const router = express.Router();
const {
  getPublicStats,
  getPublicDonors,
  getPublicRequests,
} = require('../controllers/publicController');

// Public routes - no authentication required

// @route   GET /api/public/stats
// @desc    Get public statistics
// @access  Public
router.get('/stats', getPublicStats);

// @route   GET /api/public/donors
// @desc    Get public donor preview
// @access  Public
router.get('/donors', getPublicDonors);

// @route   GET /api/public/requests
// @desc    Get public request preview
// @access  Public
router.get('/requests', getPublicRequests);

module.exports = router;

