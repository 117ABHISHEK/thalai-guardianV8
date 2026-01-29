const Request = require('../models/requestModel');
const MatchLog = require('../models/matchLogModel');
const { findMatchingDonors } = require('../utils/donorMatching');
const notificationService = require('../services/notificationService');

/**
 * Find matching donors for a request and notify them
 */
const processRequestMatching = async (requestId) => {
  try {
    const request = await Request.findById(requestId).populate(
      'patientId',
      'name email bloodGroup'
    );

    if (!request) return null;

    // Find matching donors
    const matches = await findMatchingDonors(request, { limit: 20 });

    if (matches.length === 0) return [];

    // Save match logs
    const matchLogs = await Promise.all(
      matches.map((match) =>
        MatchLog.findOneAndUpdate(
          { requestId: request._id, donorId: match.donorId },
          {
            matchScore: match.matchScore,
            scoreBreakdown: match.scoreBreakdown,
            status: 'pending',
          },
          { upsert: true, new: true }
        )
      )
    );

    // Update request status to 'searching' if it was 'pending'
    if (request.status === 'pending') {
      request.status = 'searching';
      await request.save();
    }

    // Send notifications to top 3 donors if not already notified
    const topDonors = matches.slice(0, 3);
    for (const match of topDonors) {
      try {
        await notificationService.sendDonorMatchNotification(
          match.donorId,
          request._id,
          match.matchScore
        );
      } catch (error) {
        console.error('Error sending matching notification:', error);
      }
    }

    return matches;
  } catch (error) {
    console.error('Process request matching error:', error);
    return null;
  }
};

module.exports = {
  processRequestMatching,
};
