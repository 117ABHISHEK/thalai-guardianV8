const eraktService = require('../services/eraktService');
const { findMatchingDonors } = require('../utils/donorMatching');
const Request = require('../models/requestModel');

/**
 * @route   GET /api/external/eraktkosh/search
 * @desc    Search e-RaktKosh for blood availability
 * @access  Private
 */
const searchERaktKosh = async (req, res) => {
  try {
    const { bloodGroup, city, state, district } = req.query;

    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Blood group is required',
      });
    }

    const location = { city, state, district };
    const donors = await eraktService.searchBloodAvailability(bloodGroup, location);

    res.status(200).json({
      success: true,
      data: {
        donors,
        total: donors.length,
        source: 'eraktkosh',
      },
    });
  } catch (error) {
    console.error('Search e-RaktKosh error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching e-RaktKosh',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/external/merge
 * @desc    Merge internal matches with external sources
 * @access  Private
 */
const mergeDonorSources = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
      });
    }

    // Get request
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Find internal matches
    const internalMatches = await findMatchingDonors(request, { limit: 10 });

    // Get external donors
    const eraktkoshDonors = await eraktService.searchBloodAvailability(
      request.bloodGroup,
      request.location
    );

    // Merge results
    const merged = eraktService.mergeDonorResults(internalMatches, eraktkoshDonors);

    res.status(200).json({
      success: true,
      data: {
        request: {
          id: request._id,
          bloodGroup: request.bloodGroup,
          urgency: request.urgency,
        },
        matches: merged,
        internalCount: internalMatches.length,
        externalCount: eraktkoshDonors.length,
        totalMatches: merged.length,
      },
    });
  } catch (error) {
    console.error('Merge donor sources error:', error);
    res.status(500).json({
      success: false,
      message: 'Error merging donor sources',
      error: error.message,
    });
  }
};

module.exports = {
  searchERaktKosh,
  mergeDonorSources,
};

