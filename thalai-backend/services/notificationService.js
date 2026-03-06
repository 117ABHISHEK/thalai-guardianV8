const twilio = require('twilio');
const axios = require('axios');
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

// Brevo HTTP API configuration (uses HTTPS port 443 — works on all cloud platforms)
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_SMTP_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SMTP_USER;
const BREVO_SENDER_NAME = process.env.EMAIL_FROM_NAME || 'ThalAI Guardian';

console.log('[Email Service] Brevo HTTP API configured.',
  'SENDER:', BREVO_SENDER_EMAIL || 'NOT SET',
  'KEY:', BREVO_API_KEY ? '***SET***' : 'NOT SET'
);


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
 * Send email notification via Brevo HTTP API
 */
const sendEmail = async (to, subject, text) => {
  try {
    if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
      console.warn('[Email Service] Brevo not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    console.log(`[Email Service] Sending email to ${to} via Brevo API...`);

    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        textContent: text,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const messageId = response.data?.messageId || response.data?.id || 'sent';
    console.log(`[Email Service] ✅ Email sent to ${to}. MessageId: ${messageId}`);
    return { success: true, messageId };
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error(`[Email Service] ❌ Error sending to ${to}:`, errMsg);
    return { success: false, error: errMsg };
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

    const channel = options.channel || 'in_app';
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      channel,
      phoneNumber: user.phone,
      metadata: options.metadata || {},
      status: 'pending',
    });

    console.log(`[NotificationService] Processing notification type: ${type} for user: ${userId}, channel: ${channel}`);
    let sentSuccessfully = true;

    // Send SMS
    if (user.phone && (channel === 'sms' || channel === 'all')) {
      const smsResult = await sendSMS(user.phone, `${title}\n\n${message}`);
      if (!smsResult.success) {
        console.warn(`[NotificationService] SMS failed for user ${userId}`);
        sentSuccessfully = false;
      }
    }

    // Send Email
    if (user.email && (channel === 'email' || channel === 'all')) {
       console.log(`[NotificationService] Sending email to ${user.email} (channel: ${channel})`);
      const emailResult = await sendEmail(user.email, title, message);
      if (!emailResult.success) {
        console.warn(`[NotificationService] Email failed for user ${userId}: ${emailResult.error}`);
        sentSuccessfully = false;
      }
    }

    notification.status = sentSuccessfully ? 'sent' : 'failed';
    notification.sentAt = new Date();
    await notification.save();

    console.log(`[NotificationService] Notification status finalized: ${notification.status}`);

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
        channel: 'all',
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
        channel: 'all',
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
              channel: 'all',
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
            channel: 'all',
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

/**
 * Send appointment notification
 */
const sendAppointmentNotification = async (userId, appointment, action) => {
  const titles = {
    requested: '📅 Appointment Requested',
    scheduled: '✅ Appointment Scheduled',
    completed_pending: '🏥 Completion Verification Needed',
    completed: '🎉 Appointment Completed!',
    cancelled: '❌ Appointment Cancelled',
  };

  const messages = {
    requested: `A new appointment has been requested for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}.`,
    scheduled: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been scheduled.`,
    completed_pending: `Doctor has marked your visit on ${new Date(appointment.date).toLocaleDateString()} as complete. Please verify.`,
    completed: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} has been successfully completed.`,
    cancelled: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} has been cancelled.`,
  };

  return await sendNotification(
    userId,
    `appointment_${action}`,
    titles[action] || 'Appointment Update',
    messages[action] || 'Your appointment details have been updated.',
    { channel: 'all', metadata: { appointmentId: appointment._id } }
  );
};

/**
 * Send connection notification
 */
const sendConnectionNotification = async (userId, otherUserName, action) => {
  const titles = {
    request: '🤝 New Friend Request',
    accepted: '✨ Connection Accepted',
  };

  const messages = {
    request: `${otherUserName} wants to connect with you in the ThalAI Guardian circle.`,
    accepted: `You and ${otherUserName} are now connected. You can now coordinate checkups!`,
  };

  return await sendNotification(
    userId,
    `connection_${action}`,
    titles[action] || 'Connection Update',
    messages[action] || 'Your connection status has been updated.',
    { channel: 'all' }
  );
};

/**
 * Send checkup suggestion notification
 */
const sendCheckupSuggestionNotification = async (userId, suggesterName) => {
  return await sendNotification(
    userId,
    'checkup_suggestion',
    '🩺 Health Checkup Suggestion',
    `${suggesterName} suggested that you should schedule a regular health checkup.`,
    { channel: 'all' }
  );
};
const sendMatchAcceptedNotification = async (matchId) => {
  try {
    const MatchLog = require('../models/matchLogModel');
    const match = await MatchLog.findById(matchId)
      .populate({
        path: 'requestId',
        populate: { path: 'patientId' }
      })
      .populate({
        path: 'donorId',
        populate: { path: 'user' }
      });

    if (!match || !match.requestId || !match.donorId) {
      return { success: false, message: 'Match or related entities not found' };
    }

    const patient = match.requestId.patientId;
    const donor = match.donorId.user;

    const message = `🎉 Good news! A donor has accepted your blood request.

Donor: ${donor.name}
Blood Group: ${donor.bloodGroup}
Phone: ${donor.phone}

You can now contact the donor to coordinate. Thank you for using ThalAI Guardian! ❤️`;

    return await sendNotification(
      patient._id,
      'match_accepted',
      'Donor Accepted Your Request!',
      message,
      {
        channel: 'all',
        metadata: {
          matchId,
          requestId: match.requestId._id,
          donorId: match.donorId._id,
        },
      }
    );
  } catch (error) {
    console.error('Send match accepted notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send login alert notification
 */
const sendLoginAlert = async (userId, userAgent, ipAddress) => {
  try {
    const time = new Date().toLocaleString();
    const message = `Security Alert: A new login was detected for your account on ${time}.
    
Device/Browser: ${userAgent || 'Unknown'}
IP Address: ${ipAddress || 'Unknown'}

If this was not you, please change your password immediately.`;

    return await sendNotification(
      userId,
      'security_login',
      'Welcome Back! (Login Alert)',
      `Welcome back to ThalAI Guardian!\n\n${message}`,
      { channel: 'all' }
    );
  } catch (error) {
    console.error('Send login alert error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome notification for new users
 */
const sendWelcomeNotification = async (userId, name) => {
  try {
    const title = 'Welcome to ThalAI Guardian! 🩸';
    const message = `Hi ${name}, welcome to the ThalAI Guardian community! 
    
We're glad to have you with us. Your account has been successfully created.
- If you're a Donor: Thank you for your commitment to saving lives.
- If you're a Patient: We're here to support your health journey with AI-powered insights.

Explore your dashboard to get started!`;

    return await sendNotification(
      userId,
      'welcome',
      title,
      message,
      { channel: 'all' }
    );
  } catch (error) {
    console.error('Send welcome notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification for a new chat message
 */
const sendNewMessageNotification = async (recipientId, senderName, messageText) => {
  try {
    const title = `New Message from ${senderName} 📩`;
    const snippet = (messageText || '').length > 50 ? messageText.substring(0, 50) + '...' : messageText;
    const body = `Hi! You have a new message from ${senderName}:\n\n"${snippet}"\n\nLogin to ThalAI Guardian to reply.`;

    return await sendNotification(
      recipientId,
      'new_message',
      title,
      body,
      { channel: 'in_app' } // Default to in_app, or 'all' if user wants email/sms
    );
  } catch (error) {
    console.error('Send new message notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
  sendEmail,
  sendNotification,
  sendDonorMatchNotification,
  sendRequestStatusNotification,
  sendUrgentRequestBroadcast,
  sendAdminAlert,
  sendAppointmentNotification,
  sendConnectionNotification,
  sendCheckupSuggestionNotification,
  sendMatchAcceptedNotification,
  sendLoginAlert,
  sendNewMessageNotification,
  sendWelcomeNotification,
};

