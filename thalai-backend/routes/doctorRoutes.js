const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const {
  getAssignedPatients,
  getPatientDetails,
  updatePatientNotes,
  getDoctorProfile,
  getDashboardStats,
} = require('../controllers/doctorController');

// All routes require authentication and doctor role
router.use(protect);
router.use(allowRoles('doctor'));

// @route   GET /api/doctor/patients
// @desc    Get all patients assigned to the doctor
router.get('/patients', getAssignedPatients);

// @route   GET /api/doctor/patients/:patientId
// @desc    Get detailed information about a specific patient
router.get('/patients/:patientId', getPatientDetails);

// @route   PUT /api/doctor/patients/:patientId/notes
// @desc    Add or update notes for a patient
router.put('/patients/:patientId/notes', updatePatientNotes);

// @route   GET /api/doctor/profile
// @desc    Get doctor's own profile
router.get('/profile', getDoctorProfile);

// @route   GET /api/doctor/dashboard/stats
// @desc    Get dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
