const User = require('../models/userModel');
const Donor = require('../models/donorModel');

// @route   GET /api/admin/donors
// @desc    Get list of all donors
// @access  Private/Admin
const getDonors = async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate('user', 'name email bloodGroup phone address dateOfBirth')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donors.length,
      data: {
        donors,
      },
    });
  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   POST /api/admin/donors/verify
// @desc    Verify a donor
// @access  Private/Admin
const verifyDonor = async (req, res) => {
  try {
    const { donorId } = req.body;

    if (!donorId) {
      return res.status(400).json({
        message: 'Donor ID is required',
      });
    }

    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({
        message: 'Donor not found',
      });
    }

    // Check if user is actually a donor
    const user = await User.findById(donor.user);
    if (!user || user.role !== 'donor') {
      return res.status(400).json({
        message: 'User is not a donor',
      });
    }

    // Update donor verification status
    donor.isVerified = true;
    donor.verifiedAt = new Date();
    donor.verifiedBy = req.user._id;

    await donor.save();

    // Populate the updated donor
    await donor.populate('user', 'name email bloodGroup phone');
    await donor.populate('verifiedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Donor verified successfully',
      data: {
        donor,
      },
    });
  } catch (error) {
    console.error('Verify donor error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    // Total patients
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });

    // Total donors
    const totalDonors = await User.countDocuments({ role: 'donor', isActive: true });

    // Verified donors
    const verifiedDonors = await Donor.countDocuments({ isVerified: true });

    // Pending requests (placeholder - will be implemented in next module)
    // For now, we'll set it to 0
    const pendingRequests = 0;

    // Completed requests (placeholder - will be implemented in next module)
    // For now, we'll set it to 0
    const completedRequests = 0;

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

    const donorRoleStats = await User.aggregate([
      {
        $match: {
          role: 'donor',
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const verifiedDonorCount = await Donor.aggregate([
      {
        $match: {
          isVerified: true,
        },
      },
      {
        $count: 'verified',
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDonors,
        verifiedDonors: verifiedDonorCount[0]?.verified || 0,
        pendingRequests,
        completedRequests,
        donorStats: donorStats[0] || {
          totalDonorProfiles: 0,
          availableDonors: 0,
          totalDonationsCount: 0,
        },
        bloodGroupDistribution: bloodGroupStats,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getDonors,
  verifyDonor,
  getStats,
};

