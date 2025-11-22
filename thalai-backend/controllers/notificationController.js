const notificationService = require('../services/notificationService');
const Notification = require('../models/notificationModel');
const { allowRoles } = require('../middleware/roleMiddleware');

/**
 * @route   POST /api/notifications/send
 * @desc    Send a notification
 * @access  Private (Admin)
 */
const sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, channel, metadata } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, type, title, and message are required',
      });
    }

    const result = await notificationService.sendNotification(
      userId,
      type,
      title,
      message,
      { channel, metadata }
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to send notification',
      });
    }
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
const getUserNotifications = async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;

    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        notifications,
        total: notifications.length,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    notification.deliveredAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead,
};

