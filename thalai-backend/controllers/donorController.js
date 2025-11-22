const Donor = require('../models/donorModel');
const User = require('../models/userModel');

// @route   POST /api/donors/availability
// @desc    Update donor availability status
// @access  Private (Donor only)
const updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus, lastDonationDate } = req.body;

    // Validation
    if (typeof availabilityStatus !== 'boolean') {
      return res.status(400).json({
        message: 'availabilityStatus must be a boolean (true/false)',
      });
    }

    // Check if user is a donor
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        message: 'Only donors can update availability',
      });
    }

    // Find or create donor profile
    let donor = await Donor.findOne({ user: req.user._id });

    if (!donor) {
      // Create donor profile if it doesn't exist
      donor = await Donor.create({
        user: req.user._id,
        availabilityStatus,
        lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      });
    } else {
      // Update existing donor profile
      const updateFields = { availabilityStatus };
      if (lastDonationDate) {
        updateFields.lastDonationDate = new Date(lastDonationDate);
        // Increment total donations if lastDonationDate is being set
        if (!donor.lastDonationDate || donor.lastDonationDate.toISOString() !== new Date(lastDonationDate).toISOString()) {
          updateFields.totalDonations = (donor.totalDonations || 0) + 1;
        }
      }

      donor = await Donor.findByIdAndUpdate(
        donor._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
    }

    // Populate user details
    await donor.populate('user', 'name email bloodGroup phone');

    res.status(200).json({
      success: true,
      message: 'Donor availability updated successfully',
      data: {
        donor,
      },
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/donors/availability
// @desc    Get donor availability status
// @access  Private (Donor only)
const getAvailability = async (req, res) => {
  try {
    // Check if user is a donor
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        message: 'Only donors can view availability',
      });
    }

    // Find donor profile
    let donor = await Donor.findOne({ user: req.user._id });

    if (!donor) {
      // Create default donor profile if it doesn't exist
      donor = await Donor.create({
        user: req.user._id,
        availabilityStatus: false,
      });
    }

    // Populate user details
    await donor.populate('user', 'name email bloodGroup phone');

    res.status(200).json({
      success: true,
      data: {
        donor,
      },
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  updateAvailability,
  getAvailability,
};

