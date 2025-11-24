const express = require('express');
const router = express.Router();
const {
  getDonors,
  verifyDonor,
  getEligibilityReport,
  getStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(allowRoles('admin'));

// @route   GET /api/admin/donors
// @desc    Get list of all donors
// @access  Private/Admin
router.get('/donors', getDonors);

// @route   POST /api/admin/donors/verify
// @desc    Verify a donor
// @access  Private/Admin
router.post('/donors/verify', verifyDonor);

// @route   GET /api/admin/donors/eligibility-report
// @desc    Get eligibility report for all donors
// @access  Private/Admin
router.get('/donors/eligibility-report', getEligibilityReport);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private/Admin
router.get('/stats', getStats);

module.exports = router;

