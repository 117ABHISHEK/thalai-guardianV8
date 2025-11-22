const express = require('express');
const router = express.Router();
const {
  updateAvailability,
  getAvailability,
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

module.exports = router;

