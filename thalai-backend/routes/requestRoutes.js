const express = require('express');
const router = express.Router();
const {
  createRequest,
  getUserRequests,
  getAllRequests,
  cancelRequest,
  getRequestById,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// @route   POST /api/requests
// @desc    Create a new blood request
// @access  Private (Patient)
router.post('/', allowRoles('patient'), createRequest);

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

module.exports = router;

