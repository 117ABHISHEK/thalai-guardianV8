const express = require('express');
const router = express.Router();
const {
  createRequest,
  getUserRequests,
  getAllRequests,
  cancelRequest,
  getRequestById,
  updateUrgency,
  markDonorUnavailable,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { requestValidationRules, updateUrgencyRules, handleValidationErrors } = require('../utils/validation');

// All routes require authentication
router.use(protect);

// @route   POST /api/requests
// @desc    Create a new blood request
// @access  Private (Patient)
router.post('/', allowRoles('patient'), requestValidationRules(), handleValidationErrors, createRequest);

// @route   GET /api/requests/user/:id
// @desc    Get all requests for a specific patient
// @access  Private
router.get('/user/:id', getUserRequests);

// @route   GET /api/requests
// @desc    Get all requests (Admin only)
// @access  Private/Admin
router.get('/', allowRoles('admin'), getAllRequests);

// @route   GET /api/requests/:id
// @desc    Get a single request by ID
// @access  Private
router.get('/:id', getRequestById);

// @route   PUT /api/requests/:id/cancel
// @desc    Cancel a blood request
// @access  Private
router.put('/:id/cancel', cancelRequest);

// @route   PATCH /api/requests/:id/urgency
// @desc    Update request urgency (Admin only)
// @access  Private/Admin
router.patch('/:id/urgency', allowRoles('admin'), updateUrgencyRules(), handleValidationErrors, updateUrgency);

// @route   PUT /api/requests/:id/donor-unavailable/:donorId
// @desc    Mark a donor as unavailable and promote next backup to primary
// @access  Private (Patient/Admin)
router.put('/:id/donor-unavailable/:donorId', markDonorUnavailable);

module.exports = router;
