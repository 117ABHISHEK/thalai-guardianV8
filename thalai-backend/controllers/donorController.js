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

    // Find donor profile to get current state for eligibility calculation
    const donor = await Donor.findOne({ user: req.user._id }).populate('user');

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    if (donationFrequencyMonths && donationFrequencyMonths < 3) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation frequency is 3 months',
      });
    }
    
    // Create a temporary plain object for eligibility computation with pending changes
    const tempDonorState = donor.toObject();
    if (availabilityStatus !== undefined) {
      tempDonorState.availabilityStatus = availabilityStatus;
    }
    if (lastDonationDate) {
      tempDonorState.lastDonationDate = new Date(lastDonationDate);
    }
    if (donationFrequencyMonths) {
      tempDonorState.donationFrequencyMonths = donationFrequencyMonths;
    }

    const eligibility = computeEligibility(tempDonorState);

    const updatePayload = {
      eligibilityStatus: eligibility.eligible ? 'eligible' : 'deferred',
      eligibilityReason: eligibility.reason,
      nextPossibleDonationDate: eligibility.nextPossibleDate,
      eligibilityLastChecked: new Date(),
    };

    if (availabilityStatus !== undefined) {
      updatePayload.availabilityStatus = availabilityStatus;
    }
    if (lastDonationDate) {
      updatePayload.lastDonationDate = new Date(lastDonationDate);
    }
    if (donationFrequencyMonths) {
      updatePayload.donationFrequencyMonths = donationFrequencyMonths;
    }

    const updatedDonor = await Donor.findByIdAndUpdate(
      donor._id,
      { $set: updatePayload },
      { new: true } // `new: true` to return the modified document
    ).populate('user', 'name email bloodGroup phone dateOfBirth');

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        donor: updatedDonor,
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

    // Compute eligibility with error handling
    let eligibility;
    try {
      eligibility = computeEligibility(donor);
    } catch (eligibilityError) {
      logger.error('Eligibility computation error', { 
        error: eligibilityError.message, 
        donorId: donor._id,
        userId: req.user._id 
      });
      // Return donor data without eligibility if computation fails
      eligibility = {
        eligible: false,
        reason: 'Unable to compute eligibility - please contact admin',
        checks: {},
        nextPossibleDate: null
      };
    }

    res.status(200).json({
      success: true,
      data: {
        donor,
        eligibility,
      },
    });
  } catch (error) {
    logger.error('Get availability error', { error: error.message, stack: error.stack, userId: req.user._id });
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

    // Compute eligibility with error handling
    let eligibility;
    try {
      eligibility = computeEligibility(donor);
    } catch (eligibilityError) {
      logger.error('Eligibility computation error in profile', { 
        error: eligibilityError.message, 
        donorId: donor._id,
        userId: req.user._id 
      });
      // Return donor data without eligibility if computation fails
      eligibility = {
        eligible: false,
        reason: 'Unable to compute eligibility - please contact admin',
        checks: {},
        nextPossibleDate: null
      };
    }

    res.status(200).json({
      success: true,
      data: {
        donor,
        eligibility,
      },
    });
  } catch (error) {
    logger.error('Get donor profile error', { error: error.message, stack: error.stack, userId: req.user._id });
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
