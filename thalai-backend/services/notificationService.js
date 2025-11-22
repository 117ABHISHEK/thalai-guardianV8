const twilio = require('twilio');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Request = require('../models/requestModel');

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken 
  ? twilio(accountSid, authToken)
  : null;

/**
 * Send SMS notification
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!client) {
      console.warn('Twilio not configured. SMS not sent.');
      return { success: false, message: 'Twilio not configured' };
    }

    if (!phoneNumber || !message) {
      return { success: false, message: 'Phone number and message required' };
    }

    // Format phone number (add country code if needed)
    const formattedNumber = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+91${phoneNumber}`;

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedNumber,
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send notification and log it
 */
const sendNotification = async (userId, type, title, message, options = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      channel: options.channel || 'sms',
      phoneNumber: user.phone || options.phoneNumber,
      metadata: options.metadata || {},
      status: 'pending',
    });

    // Send SMS if phone number available
    if (user.phone && (options.channel === 'sms' || !options.channel)) {
      const smsResult = await sendSMS(user.phone, `${title}\n\n${message}`);
      
      notification.status = smsResult.success ? 'sent' : 'failed';
      notification.sentAt = new Date();
      notification.messageId = smsResult.messageId;
      
      if (!smsResult.success) {
        notification.errorMessage = smsResult.error;
      }
    } else {
      notification.status = 'sent';
      notification.sentAt = new Date();
    }

    await notification.save();

    return {
      success: true,
      notificationId: notification._id,
      status: notification.status,
    };
  } catch (error) {
    console.error('Send notification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send donor match notification
 */
const sendDonorMatchNotification = async (donorId, requestId, matchScore) => {
  try {
    const donor = await Donor.findById(donorId).populate('user');
    const request = await Request.findById(requestId).populate('patientId');

    if (!donor || !donor.user || !request) {
      return { success: false, message: 'Donor or request not found' };
    }

    const message = `🩸 ThalAI Guardian: New Blood Request Match!

Blood Group: ${request.bloodGroup}
Units Needed: ${request.unitsRequired}
Urgency: ${request.urgency.toUpperCase()}
Match Score: ${matchScore}%

Patient: ${request.patientId.name}
Location: ${request.location?.hospital || request.location?.city || 'N/A'}

Please check your dashboard to respond.
Thank you for being a lifesaver! ❤️`;

    return await sendNotification(
      donor.user._id,
      'donor_match',
      'New Blood Request Match',
      message,
      {
        channel: 'sms',
        metadata: {
          requestId,
          donorId,
          matchScore,
        },
      }
    );
  } catch (error) {
    console.error('Send donor match notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send request status update notification
 */
const sendRequestStatusNotification = async (requestId, status) => {
  try {
    const request = await Request.findById(requestId).populate('patientId');

    if (!request) {
      return { success: false, message: 'Request not found' };
    }

    const statusMessages = {
      searching: 'Your blood request is now being processed. We are searching for matching donors.',
      completed: 'Great news! Your blood request has been fulfilled. Thank you for using ThalAI Guardian.',
      cancelled: 'Your blood request has been cancelled.',
    };

    const message = statusMessages[status] || 'Your blood request status has been updated.';

    return await sendNotification(
      request.patientId._id,
      'request_status_update',
      'Request Status Update',
      `🩸 ThalAI Guardian\n\n${message}\n\nRequest ID: ${request._id}\nBlood Group: ${request.bloodGroup}`,
      {
        channel: 'sms',
        metadata: {
          requestId,
          status,
        },
      }
    );
  } catch (error) {
    console.error('Send request status notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send urgent request broadcast
 */
const sendUrgentRequestBroadcast = async (requestId, donorIds) => {
  try {
    const request = await Request.findById(requestId).populate('patientId');

    if (!request) {
      return { success: false, message: 'Request not found' };
    }

    const message = `🚨 URGENT: Blood Request

Blood Group: ${request.bloodGroup}
Units: ${request.unitsRequired}
Location: ${request.location?.hospital || request.location?.city || 'N/A'}

This is an urgent request. Please check your dashboard if you can help.

ThalAI Guardian`;

    const results = await Promise.all(
      donorIds.map(async (donorId) => {
        const donor = await Donor.findById(donorId).populate('user');
        if (donor && donor.user && donor.user.phone) {
          return await sendNotification(
            donor.user._id,
            'urgent_request',
            '🚨 Urgent Blood Request',
            message,
            {
              channel: 'sms',
              metadata: {
                requestId,
                donorId,
              },
            }
          );
        }
        return { success: false, message: 'Donor not found' };
      })
    );

    return {
      success: true,
      sent: results.filter((r) => r.success).length,
      total: results.length,
    };
  } catch (error) {
    console.error('Send urgent request broadcast error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send admin alert
 */
const sendAdminAlert = async (message, metadata = {}) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true });

    const results = await Promise.all(
      admins.map(async (admin) => {
        return await sendNotification(
          admin._id,
          'admin_alert',
          'Admin Alert',
          `🔔 ${message}`,
          {
            channel: 'sms',
            metadata,
          }
        );
      })
    );

    return {
      success: true,
      sent: results.filter((r) => r.success).length,
      total: results.length,
    };
  } catch (error) {
    console.error('Send admin alert error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
  sendNotification,
  sendDonorMatchNotification,
  sendRequestStatusNotification,
  sendUrgentRequestBroadcast,
  sendAdminAlert,
};

