const Request = require('../models/requestModel');
const MatchLog = require('../models/matchLogModel');
const { findMatchingDonors } = require('../utils/donorMatching');
const notificationService = require('../services/notificationService');

/**
 * @route   POST /api/match/find
 * @desc    Find matching donors for a request
 * @access  Private
 */
const findMatches = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
      });
    }

    // Get the request
    const request = await Request.findById(requestId).populate(
      'patientId',
      'name email bloodGroup'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check if user has permission
    if (
      request.patientId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Find matching donors
    const matches = await findMatchingDonors(request, { limit: 20 });

    // Save match logs
    const matchLogs = await Promise.all(
      matches.map((match) =>
        MatchLog.create({
          requestId: request._id,
          donorId: match.donorId,
          matchScore: match.matchScore,
          scoreBreakdown: match.scoreBreakdown,
          status: 'pending',
        })
      )
    );

    // Send notifications to top 3 donors
    if (matches.length > 0) {
      const topDonors = matches.slice(0, 3);
      for (const match of topDonors) {
        try {
          await notificationService.sendDonorMatchNotification(
            match.donorId,
            request._id,
            match.matchScore
          );
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Matches found successfully',
      data: {
        request: {
          id: request._id,
          bloodGroup: request.bloodGroup,
          urgency: request.urgency,
          unitsRequired: request.unitsRequired,
        },
        matches: matches.map((match) => ({
          donorId: match.donorId,
          name: match.donor?.name,
          email: match.donor?.email,
          phone: match.donor?.phone,
          bloodGroup: match.donor?.bloodGroup,
          matchScore: match.matchScore,
          scoreBreakdown: match.scoreBreakdown,
        })),
        totalMatches: matches.length,
      },
    });
  } catch (error) {
    console.error('Find matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/match/top
 * @desc    Get top matches for a request
 * @access  Private
 */
const getTopMatches = async (req, res) => {
  try {
    const { requestId } = req.query;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
      });
    }

    // Get match logs
    const matchLogs = await MatchLog.find({ requestId })
      .populate('donorId')
      .populate({
        path: 'donorId',
        populate: {
          path: 'user',
          select: 'name email phone bloodGroup address',
        },
      })
      .sort({ matchScore: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        matches: matchLogs.map((log) => ({
          matchId: log._id,
          donorId: log.donorId?._id,
          donor: log.donorId?.user,
          matchScore: log.matchScore,
          scoreBreakdown: log.scoreBreakdown,
          status: log.status,
          createdAt: log.createdAt,
        })),
        totalMatches: matchLogs.length,
      },
    });
  } catch (error) {
    console.error('Get top matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  findMatches,
  getTopMatches,
};

