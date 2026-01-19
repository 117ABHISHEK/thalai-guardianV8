const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Request = require('../models/requestModel');

/**
 * @route   GET /api/public/stats
 * @desc    Get public statistics
 * @access  Public
 */
const getPublicStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDonors,
      verifiedDonors,
      totalRequests,
      pendingRequests,
      urgentRequests,
      completedRequests,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient', isActive: true }),
      User.countDocuments({ role: 'donor', isActive: true }),
      Donor.countDocuments({ isVerified: true }),
      Request.countDocuments(),
      Request.countDocuments({ status: { $in: ['pending', 'searching'] } }),
      Request.countDocuments({ urgency: 'critical' }),
      Request.countDocuments({ status: 'completed' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDonors,
        verifiedDonors,
        totalRequests,
        pendingRequests,
        urgentRequests,
        completedRequests,
        activeDonors: await Donor.countDocuments({ availabilityStatus: true }),
      },
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/public/donors
 * @desc    Get public donor preview (top verified donors)
 * @access  Public
 */
const getPublicDonors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const donors = await Donor.find({
      isVerified: true,
      availabilityStatus: true,
    })
      .populate('user', 'name bloodGroup')
      .sort({ totalDonations: -1, createdAt: -1 })
      .limit(limit)
      .select('totalDonations lastDonationDate availabilityStatus');

    const formattedDonors = donors
      .filter((donor) => donor.user)
      .map((donor) => ({
        name: donor.user.name,
        bloodGroup: donor.user.bloodGroup,
        totalDonations: donor.totalDonations || 0,
        lastDonationDate: donor.lastDonationDate,
        isAvailable: donor.availabilityStatus,
      }));

    res.status(200).json({
      success: true,
      data: {
        donors: formattedDonors,
        total: formattedDonors.length,
      },
    });
  } catch (error) {
    console.error('Get public donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/public/requests
 * @desc    Get public request preview
 * @access  Public
 */
const getPublicRequests = async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const urgencyStats = await Request.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 },
        },
      },
    ]);

    const bloodGroupStats = await Request.aggregate([
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

    const recentRequests = await Request.find({
      status: { $in: ['pending', 'searching'] },
    })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('bloodGroup unitsRequired urgency createdAt status');

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats,
        urgencyBreakdown: urgencyStats,
        bloodGroupBreakdown: bloodGroupStats,
        recentRequests: recentRequests.map((req) => ({
          bloodGroup: req.bloodGroup,
          unitsRequired: req.unitsRequired,
          urgency: req.urgency,
          status: req.status,
          createdAt: req.createdAt,
        })),
        totalPending: await Request.countDocuments({
          status: { $in: ['pending', 'searching'] },
        }),
        totalUrgent: await Request.countDocuments({ urgency: 'critical' }),
      },
    });
  } catch (error) {
    console.error('Get public requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const Doctor = require('../models/doctorModel');

/**
 * @route   GET /api/public/doctors
 * @desc    Get list of verified doctors
 * @access  Public
 */
const getPublicDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true })
      .populate('user', 'name email phone')
      .select('specialization qualification hospital experience');

    const formattedDoctors = doctors
      .filter((doc) => doc.user)
      .map((doc) => ({
        id: doc.user._id,
        name: doc.user.name,
        specialization: doc.specialization,
        qualification: doc.qualification,
        hospital: doc.hospital?.name || 'N/A',
        experience: doc.experience,
      }));

    res.status(200).json({
      success: true,
      data: formattedDoctors,
    });
  } catch (error) {
    console.error('Get public doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getPublicStats,
  getPublicDonors,
  getPublicRequests,
  getPublicDoctors,
};

