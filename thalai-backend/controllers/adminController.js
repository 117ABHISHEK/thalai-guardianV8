const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
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

    // Total doctors
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });

    // Verified donors
    const verifiedDonors = await Donor.countDocuments({ isVerified: true });

    // Verified doctors
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });

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
        totalDoctors,
        verifiedDonors,
        verifiedDoctors,
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



/**
 * @route   GET /api/admin/doctors
 * @desc    Get list of all doctors
 * @access  Private/Admin
 */
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email bloodGroup phone address dateOfBirth')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: {
        doctors,
      },
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/doctors/verify
 * @desc    Verify a doctor
 * @access  Private/Admin
 */
const verifyDoctor = async (req, res) => {
  try {
    const { doctorId, notes } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
    }

    const doctor = await Doctor.findById(doctorId).populate('user');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Update verification status
    doctor.isVerified = true;
    doctor.verificationDate = new Date();
    doctor.verifiedBy = req.user._id;
    if (notes) {
      doctor.verificationNotes = notes;
    }

    await doctor.save();

    logger.info('Doctor verified', { doctorId: doctor._id, verifiedBy: req.user._id });

    // Populate the updated doctor
    await doctor.populate('user', 'name email phone');
    await doctor.populate('verifiedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Doctor verified successfully',
      data: {
        doctor,
      },
    });
  } catch (error) {
    console.error('Verify doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/doctors/assign-patient
 * @desc    Assign a patient to a doctor
 * @access  Private/Admin
 */
const assignPatientToDoctor = async (req, res) => {
  try {
    const { doctorId, patientId, notes } = req.body;

    if (!doctorId || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and Patient ID are required',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Check if doctor is verified
    if (!doctor.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Doctor must be verified before assigning patients',
      });
    }

    // Assign patient to doctor
    try {
      doctor.assignPatient(patientId, req.user._id, notes || '');
      await doctor.save();

      logger.info('Patient assigned to doctor', {
        doctorId: doctor._id,
        patientId: patient._id,
        assignedBy: req.user._id,
      });

      res.status(200).json({
        success: true,
        message: 'Patient assigned to doctor successfully',
        data: {
          doctor,
        },
      });
    } catch (assignError) {
      return res.status(400).json({
        success: false,
        message: assignError.message,
      });
    }
  } catch (error) {
    console.error('Assign patient to doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/doctors/unassign-patient
 * @desc    Unassign a patient from a doctor
 * @access  Private/Admin
 */
const unassignPatientFromDoctor = async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    if (!doctorId || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and Patient ID are required',
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Remove patient from doctor
    try {
      doctor.removePatient(patientId);
      await doctor.save();

      logger.info('Patient unassigned from doctor', {
        doctorId: doctor._id,
        patientId,
        unassignedBy: req.user._id,
      });

      res.status(200).json({
        success: true,
        message: 'Patient unassigned from doctor successfully',
        data: {
          doctor,
        },
      });
    } catch (removeError) {
      return res.status(400).json({
        success: false,
        message: removeError.message,
      });
    }
  } catch (error) {
    console.error('Unassign patient from doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/patients
 * @desc    Get list of all patients
 * @access  Private/Admin
 */
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('user', 'name email bloodGroup phone address dateOfBirth')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: {
        patients,
      },
    });
  } catch (error) {
    console.error('Get patients error:', error);
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
  getDoctors,
  verifyDoctor,
  assignPatientToDoctor,
  unassignPatientFromDoctor,
  getPatients,
};
