const express = require('express');
const router = express.Router();
const {
  updateAvailability,
  getAvailability,
  getDonorProfile,
} = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// @route   POST /api/donors/availability
// @desc    Update donor availability status
// @access  Private (Donor only)
router.post(
  '/availability',
  protect,
  allowRoles('donor'),
  updateAvailability
);

// @route   GET /api/donors/availability
// @desc    Get donor availability status
// @access  Private (Donor only)
router.get(
  '/availability',
  protect,
  allowRoles('donor'),
  getAvailability
);

// @route   GET /api/donors/profile
// @desc    Get donor profile with eligibility information
// @access  Private (Donor only)
router.get(
  '/profile',
  protect,
  allowRoles('donor'),
  getDonorProfile
);

module.exports = router;

