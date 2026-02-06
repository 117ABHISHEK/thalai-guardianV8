const express = require('express');
const router = express.Router();
const {
  getDonors,
  verifyDonor,
  getEligibilityReport,
  getStats,
  getDoctors,
  verifyDoctor,
  assignPatientToDoctor,
  unassignPatientFromDoctor,
  getPatients,
  getAIStatus,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(allowRoles('admin'));

// @route   GET /api/admin/donors
// @desc    Get list of all donors
// @access  Private/Admin
router.get('/donors', getDonors);

// @route   POST /api/admin/donors/verify
// @desc    Verify a donor
// @access  Private/Admin
router.post('/donors/verify', verifyDonor);

// @route   GET /api/admin/donors/eligibility-report
// @desc    Get eligibility report for all donors
// @access  Private/Admin
router.get('/donors/eligibility-report', getEligibilityReport);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private/Admin
router.get('/stats', getStats);

// @route   GET /api/admin/doctors
// @desc    Get list of all doctors
// @access  Private/Admin
router.get('/doctors', getDoctors);

// @route   POST /api/admin/doctors/verify
// @desc    Verify a doctor
// @access  Private/Admin
router.post('/doctors/verify', verifyDoctor);

// @route   POST /api/admin/doctors/assign-patient
// @desc    Assign a patient to a doctor
// @access  Private/Admin
router.post('/doctors/assign-patient', assignPatientToDoctor);

// @route   POST /api/admin/doctors/unassign-patient
// @desc    Unassign a patient from a doctor
// @access  Private/Admin
router.post('/doctors/unassign-patient', unassignPatientFromDoctor);

// @route   GET /api/admin/patients
// @desc    Get list of all patients
// @access  Private/Admin
router.get('/patients', getPatients);

// @route   GET /api/admin/ai-status
// @desc    Get AI service health and status
// @access  Private/Admin
router.get('/ai-status', getAIStatus);

// Account Settings / User Management routes
// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   PATCH /api/admin/users/:userId/toggle-status
router.patch('/users/:userId/toggle-status', toggleUserStatus);

// @route   DELETE /api/admin/users/:userId
router.delete('/users/:userId', deleteUser);

module.exports = router;

