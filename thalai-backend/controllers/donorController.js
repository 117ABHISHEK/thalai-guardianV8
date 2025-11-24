const Donor = require('../models/donorModel');
const User = require('../models/userModel');
const { computeEligibility } = require('../services/eligibilityService');
const logger = require('../utils/logger');

// @route   POST /api/donors/availability
// @desc    Update donor availability status
// @access  Private (Donor)
const updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus, lastDonationDate, donationFrequencyMonths } = req.body;

    // Find donor profile
    const donor = await Donor.findOne({ user: req.user._id });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    // Update availability
    if (availabilityStatus !== undefined) {
      donor.availabilityStatus = availabilityStatus;
    }

    // Update last donation date if provided
    if (lastDonationDate) {
      donor.lastDonationDate = new Date(lastDonationDate);
    }

    // Update donation frequency if provided
    if (donationFrequencyMonths) {
      if (donationFrequencyMonths < 3) {
        return res.status(400).json({
          success: false,
          message: 'Minimum donation frequency is 3 months',
        });
      }
      donor.donationFrequencyMonths = donationFrequencyMonths;
    }

    // Recompute eligibility after updates
    await donor.populate('user');
    const eligibility = computeEligibility(donor);
    
    // Update eligibility fields
    donor.eligibilityStatus = eligibility.eligible ? 'eligible' : 'deferred';
    donor.eligibilityReason = eligibility.reason;
    donor.nextPossibleDonationDate = eligibility.nextPossibleDate;
    donor.eligibilityLastChecked = new Date();

    await donor.save();

    // Populate user details
    await donor.populate('user', 'name email bloodGroup phone dateOfBirth');

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        donor,
        eligibility,
      },
    });
  } catch (error) {
    logger.error('Update availability error', { error: error.message, userId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/donors/availability
// @desc    Get donor availability status
// @access  Private (Donor)
const getAvailability = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id }).populate(
      'user',
      'name email bloodGroup phone dateOfBirth'
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    // Compute eligibility
    const eligibility = computeEligibility(donor);

    res.status(200).json({
      success: true,
      data: {
        donor,
        eligibility,
      },
    });
  } catch (error) {
    logger.error('Get availability error', { error: error.message, userId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/donors/profile
// @desc    Get donor profile with eligibility information
// @access  Private (Donor)
const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id })
      .populate('user', 'name email bloodGroup phone dateOfBirth address')
      .populate('verifiedBy', 'name email');

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    // Compute eligibility
    const eligibility = computeEligibility(donor);

    res.status(200).json({
      success: true,
      data: {
        donor,
        eligibility,
      },
    });
  } catch (error) {
    logger.error('Get donor profile error', { error: error.message, userId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  updateAvailability,
  getAvailability,
  getDonorProfile,
};
