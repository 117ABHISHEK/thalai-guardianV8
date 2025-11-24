const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Patient = require('../models/patientModel');
const { computeEligibility } = require('../services/eligibilityService');
const logger = require('../utils/logger');

/**
 * @route   GET /api/admin/donors
 * @desc    Get list of all donors with eligibility information
 * @access  Private/Admin
 */
const getDonors = async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate('user', 'name email bloodGroup phone address dateOfBirth')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    // Compute eligibility for each donor
    const donorsWithEligibility = donors.map((donor) => {
      const eligibility = computeEligibility(donor);
      return {
        ...donor.toObject(),
        eligibility,
      };
    });

    res.status(200).json({
      success: true,
      count: donorsWithEligibility.length,
      data: {
        donors: donorsWithEligibility,
      },
    });
  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/donors/verify
 * @desc    Verify a donor and set health clearance/eligibility
 * @access  Private/Admin
 */
const verifyDonor = async (req, res) => {
  try {
    const { donorId, healthClearance, eligibilityStatus, eligibilityReason, notes } = req.body;

    if (!donorId) {
      return res.status(400).json({
        success: false,
        message: 'Donor ID is required',
      });
    }

    const donor = await Donor.findById(donorId).populate('user');

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    // Check if user is actually a donor
    const user = await User.findById(donor.user._id || donor.user);
    if (!user || user.role !== 'donor') {
      return res.status(400).json({
        success: false,
        message: 'User is not a donor',
      });
    }

    // Store old eligibility status for logging
    const oldEligibilityStatus = donor.eligibilityStatus;

    // Update verification status
    donor.isVerified = true;
    donor.verifiedAt = new Date();
    donor.verifiedBy = req.user._id;

    // Update health clearance (if provided)
    if (healthClearance !== undefined) {
      donor.healthClearance = healthClearance === true;
    }

    // Update eligibility status (if provided)
    if (eligibilityStatus) {
      const validStatuses = ['eligible', 'ineligible', 'deferred'];
      if (validStatuses.includes(eligibilityStatus)) {
        donor.eligibilityStatus = eligibilityStatus;
        donor.eligibilityReason = eligibilityReason || donor.eligibilityReason || 'Updated by admin';
        donor.eligibilityLastChecked = new Date();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid eligibility status. Must be: eligible, ineligible, or deferred',
        });
      }
    }

    // Update notes (if provided)
    if (notes) {
      donor.notes = notes;
    }

    // Recompute eligibility if eligibility status not explicitly set
    if (!eligibilityStatus) {
      const eligibility = computeEligibility(donor);
      // Only auto-update if admin hasn't explicitly set eligibility
      if (donor.eligibilityStatus === 'deferred' || !donor.eligibilityStatus) {
        donor.eligibilityStatus = eligibility.eligible ? 'eligible' : 'deferred';
        donor.eligibilityReason = eligibility.reason;
        donor.nextPossibleDonationDate = eligibility.nextPossibleDate;
      }
    } else {
      // If admin explicitly set eligibility, recompute nextPossibleDate
      const eligibility = computeEligibility(donor);
      donor.nextPossibleDonationDate = eligibility.nextPossibleDate;
    }

    await donor.save();

    // Log donor verification
    logger.logDonorVerification(
      donor._id,
      req.user._id,
      donor.healthClearance,
      donor.eligibilityStatus
    );

    // Log eligibility change if status changed
    if (oldEligibilityStatus !== donor.eligibilityStatus) {
      logger.logEligibilityChange(
        donor._id,
        req.user._id,
        oldEligibilityStatus,
        donor.eligibilityStatus,
        donor.eligibilityReason
      );
    }

    // Log admin action
    logger.logAdminAction('verify_donor', req.user._id, donor._id, {
      healthClearance: donor.healthClearance,
      eligibilityStatus: donor.eligibilityStatus,
    });

    // Populate the updated donor
    await donor.populate('user', 'name email bloodGroup phone');
    await donor.populate('verifiedBy', 'name email');

    // Get final eligibility status
    const finalEligibility = computeEligibility(donor);

    res.status(200).json({
      success: true,
      message: 'Donor verified successfully',
      data: {
        donor: {
          ...donor.toObject(),
          eligibility: finalEligibility,
        },
      },
    });
  } catch (error) {
    console.error('Verify donor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/donors/eligibility-report
 * @desc    Get eligibility report for all donors
 * @access  Private/Admin
 */
const getEligibilityReport = async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate('user', 'name email bloodGroup phone dateOfBirth')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    const eligibilityReport = donors.map((donor) => {
      const eligibility = computeEligibility(donor);
      return {
        donorId: donor._id,
        name: donor.user?.name || 'N/A',
        email: donor.user?.email || 'N/A',
        bloodGroup: donor.user?.bloodGroup || 'N/A',
        isVerified: donor.isVerified,
        healthClearance: donor.healthClearance,
        eligibilityStatus: donor.eligibilityStatus,
        eligibilityReason: donor.eligibilityReason || eligibility.reason,
        nextPossibleDonationDate: eligibility.nextPossibleDate || donor.nextPossibleDonationDate,
        lastDonationDate: donor.lastDonationDate,
        daysSinceLastDonation: donor.daysSinceLastDonation || null,
        eligibilityChecks: eligibility.checks,
        eligible: eligibility.eligible,
      };
    });

    res.status(200).json({
      success: true,
      count: eligibilityReport.length,
      data: {
        report: eligibilityReport,
        summary: {
          total: eligibilityReport.length,
          eligible: eligibilityReport.filter((d) => d.eligible).length,
          ineligible: eligibilityReport.filter((d) => !d.eligible && d.eligibilityStatus === 'ineligible').length,
          deferred: eligibilityReport.filter((d) => d.eligibilityStatus === 'deferred').length,
          verified: eligibilityReport.filter((d) => d.isVerified).length,
        },
      },
    });
  } catch (error) {
    console.error('Get eligibility report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Private/Admin
 */
const getStats = async (req, res) => {
  try {
    // Total patients
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });

    // Total donors
    const totalDonors = await User.countDocuments({ role: 'donor', isActive: true });

    // Verified donors
    const verifiedDonors = await Donor.countDocuments({ isVerified: true });

    // Eligible donors
    const eligibleDonors = await Donor.countDocuments({ eligibilityStatus: 'eligible', healthClearance: true });

    // Pending requests
    const Request = require('../models/requestModel');
    const pendingRequests = await Request.countDocuments({ status: { $in: ['pending', 'searching'] } });

    // Completed requests
    const completedRequests = await Request.countDocuments({ status: 'completed' });

    // Additional stats using aggregation
    const donorStats = await Donor.aggregate([
      {
        $group: {
          _id: null,
          totalDonorProfiles: { $sum: 1 },
          availableDonors: {
            $sum: { $cond: ['$availabilityStatus', 1, 0] },
          },
          totalDonationsCount: { $sum: '$totalDonations' },
          verifiedCount: { $sum: { $cond: ['$isVerified', 1, 0] } },
          eligibleCount: {
            $sum: {
              $cond: [
                { $eq: ['$eligibilityStatus', 'eligible'] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const bloodGroupStats = await User.aggregate([
      {
        $match: {
          role: { $in: ['patient', 'donor'] },
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const eligibilityStats = await Donor.aggregate([
      {
        $group: {
          _id: '$eligibilityStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDonors,
        verifiedDonors,
        eligibleDonors,
        pendingRequests,
        completedRequests,
        donorStats: donorStats[0] || {
          totalDonorProfiles: 0,
          availableDonors: 0,
          totalDonationsCount: 0,
          verifiedCount: 0,
          eligibleCount: 0,
        },
        bloodGroupDistribution: bloodGroupStats,
        eligibilityDistribution: eligibilityStats,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getDonors,
  verifyDonor,
  getEligibilityReport,
  getStats,
};
