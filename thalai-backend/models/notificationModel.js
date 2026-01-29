const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'donor_match',
        'request_approved',
        'request_status_update',
        'urgent_request',
        'admin_alert',
        'system',
        'appointment_requested',
        'appointment_scheduled',
        'appointment_completed_pending',
        'appointment_completed',
        'connection_request',
        'connection_accepted',
        'checkup_suggested'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ['sms', 'email', 'push', 'in_app', 'all'],
      default: 'in_app',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'delivered'],
      default: 'pending',
    },
    sentAt: Date,
    deliveredAt: Date,
    errorMessage: String,
    metadata: {
      requestId: mongoose.Schema.Types.ObjectId,
      donorId: mongoose.Schema.Types.ObjectId,
      matchId: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

