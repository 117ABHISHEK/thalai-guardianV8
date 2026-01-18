const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

// @route   GET /api/doctor/patients
// @desc    Get all patients assigned to the logged-in doctor
// @access  Private (Doctor only)
const getAssignedPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate({
        path: 'assignedPatients.patient',
        populate: {
          path: 'user',
          select: 'name email bloodGroup phone dateOfBirth',
        },
      })
      .populate('assignedPatients.assignedBy', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Filter only active patients
    const activePatients = doctor.assignedPatients.filter((ap) => ap.status === 'active');

    res.status(200).json({
      success: true,
      data: {
        patients: activePatients,
        totalActive: activePatients.length,
        totalAssigned: doctor.totalPatientsAssigned,
      },
    });
  } catch (error) {
    console.error('Get assigned patients error:', error);
    logger.error('Get assigned patients error', { error: error.message, doctorId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/doctor/patients/:patientId
// @desc    Get detailed information about a specific patient
// @access  Private (Doctor only)
const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Check if patient is assigned to this doctor
    const assignment = doctor.assignedPatients.find(
      (ap) => ap.patient.toString() === patientId && ap.status === 'active'
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this patient',
      });
    }

    // Get patient details
    const patient = await Patient.findById(patientId).populate('user', '-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        patient,
        assignment: {
          assignedDate: assignment.assignedDate,
          notes: assignment.notes,
        },
      },
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    logger.error('Get patient details error', { error: error.message, doctorId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   PUT /api/doctor/patients/:patientId/notes
// @desc    Add or update notes for a patient
// @access  Private (Doctor only)
const updatePatientNotes = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { notes } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Find the patient assignment
    const assignment = doctor.assignedPatients.find(
      (ap) => ap.patient.toString() === patientId && ap.status === 'active'
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this patient',
      });
    }

    // Update notes
    assignment.notes = notes;
    await doctor.save();

    logger.info('Patient notes updated', { doctorId: req.user._id, patientId, notes });

    res.status(200).json({
      success: true,
      message: 'Patient notes updated successfully',
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error('Update patient notes error:', error);
    logger.error('Update patient notes error', { error: error.message, doctorId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/doctor/profile
// @desc    Get doctor's own profile
// @access  Private (Doctor only)
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', '-password')
      .populate('verifiedBy', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        doctor,
      },
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    logger.error('Get doctor profile error', { error: error.message, doctorId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/doctor/dashboard/stats
// @desc    Get dashboard statistics for doctor
// @access  Private (Doctor only)
const getDashboardStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Get active patients
    const activePatients = doctor.assignedPatients.filter((ap) => ap.status === 'active');

    // Get patients needing transfusion soon (predicted within next 7 days)
    const patientsNeedingTransfusion = [];
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const assignment of activePatients) {
      const patient = await Patient.findById(assignment.patient);
      if (
        patient &&
        patient.predictedNextTransfusionDate &&
        patient.predictedNextTransfusionDate <= sevenDaysFromNow &&
        patient.predictedNextTransfusionDate >= today
      ) {
        patientsNeedingTransfusion.push({
          patientId: patient._id,
          predictedDate: patient.predictedNextTransfusionDate,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalPatientsAssigned: doctor.totalPatientsAssigned,
        activePatientsCount: doctor.activePatientsCount,
        patientsNeedingTransfusionSoon: patientsNeedingTransfusion.length,
        isVerified: doctor.isVerified,
        verificationDate: doctor.verificationDate,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    logger.error('Get dashboard stats error', { error: error.message, doctorId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getAssignedPatients,
  getPatientDetails,
  updatePatientNotes,
  getDoctorProfile,
  getDashboardStats,
};
