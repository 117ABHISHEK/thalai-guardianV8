const express = require('express');
const router = express.Router();
const {
  sendNotification,
  getUserNotifications,
  markAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// @route   POST /api/notifications/send
// @desc    Send a notification (Admin only)
// @access  Private/Admin
router.post('/send', allowRoles('admin'), sendNotification);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', getUserNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', markAsRead);

module.exports = router;

