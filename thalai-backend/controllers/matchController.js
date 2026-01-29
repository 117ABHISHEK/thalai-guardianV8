const Request = require('../models/requestModel');
const MatchLog = require('../models/matchLogModel');
const { processRequestMatching } = require('../services/matchService');

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

    // Get the request to check permissions
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check if user has permission
    if (
      request.patientId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Use service to find and process matches
    const matches = await processRequestMatching(requestId);

    if (matches === null) {
      return res.status(500).json({
        success: false,
        message: 'Error processing matches',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Matches found and donors notified',
      data: {
        matches: matches.map((match) => ({
          donorId: match.donorId,
          userId: match.donor?._id,
          name: match.donor?.name,
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

