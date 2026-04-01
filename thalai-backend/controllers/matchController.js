const Request = require('../models/requestModel');
const MatchLog = require('../models/matchLogModel');
const Donor = require('../models/donorModel');
const { processRequestMatching } = require('../services/matchService');
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

/**
 * @route   GET /api/match/my-matches
 * @desc    Get all match requests for the logged-in donor
 * @access  Private (Donor only)
 */
const getMyMatches = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    const matches = await MatchLog.find({ donorId: donor._id })
      .populate({
        path: 'requestId',
        populate: {
          path: 'patientId',
          select: 'name email phone address',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        matches: matches.map(match => ({
          matchId: match._id,
          request: match.requestId,
          matchScore: match.matchScore,
          status: match.status,
          createdAt: match.createdAt,
        })),
        total: matches.length,
      },
    });
  } catch (error) {
    console.error('Get my matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/match/update-status/:matchId
 * @desc    Update match status (accept/reject)
 * @access  Private (Donor only)
 */
const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status, notes } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted or rejected',
      });
    }

    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    const match = await MatchLog.findOne({ _id: matchId, donorId: donor._id });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match log not found or access denied',
      });
    }

    // Check if already accepted to avoid duplicate push
    const wasAlreadyAccepted = match.status === 'accepted';

    match.status = status;
    match.notes = notes || match.notes;
    match.respondedAt = new Date();
    await match.save();

    // If accepted, notify the patient and update request
    if (status === 'accepted' && !wasAlreadyAccepted) {
      const request = await Request.findById(match.requestId);
      if (request) {
        const activeDonors = request.acceptedDonors ? request.acceptedDonors.filter(d => d.status === 'active') : [];
        const role = activeDonors.length === 0 ? 'primary' : 'backup';
        
        request.acceptedDonors = request.acceptedDonors || [];
        request.acceptedDonors.push({
          donorId: donor._id,
          matchId: match._id,
          role: role,
          status: 'active'
        });
        await request.save();
      }

      notificationService.sendMatchAcceptedNotification(match._id).catch(err => 
        console.error('Failed to send match accepted notification:', err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: `Match successfully ${status}`,
      data: match,
    });
  } catch (error) {
    console.error('Update match status error:', error);
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
  getMyMatches,
  updateMatchStatus,
};

