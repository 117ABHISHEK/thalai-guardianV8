const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  getPredictionStatus,
  triggerPrediction,
  changePassword,
  exportData,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   GET /api/auth/prediction-status
// @desc    Get prediction status for patient
// @access  Private (Patient only)
router.get('/prediction-status', protect, getPredictionStatus);

// @route   POST /api/auth/trigger-prediction
// @desc    Manually trigger prediction update
// @access  Private (Patient only)
router.post('/trigger-prediction', protect, triggerPrediction);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, changePassword);

// @route   GET /api/auth/export-data
// @desc    Export user medical data
// @access  Private
router.get('/export-data', protect, exportData);

module.exports = router;

