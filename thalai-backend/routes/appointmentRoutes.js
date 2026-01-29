const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAllAppointments
} = require('../controllers/appointmentController');

router.use(protect);

// @route   POST /api/appointments
// @desc    Create a new appointment
router.post('/', createAppointment);

// @route   GET /api/appointments/my
// @desc    Get current user's appointments (as requester)
router.get('/my', getMyAppointments);

// @route   GET /api/appointments/doctor
// @desc    Get doctor's appointments
router.get('/doctor', getDoctorAppointments);

// @route   GET /api/appointments/all
// @desc    Get all appointments (Admin)
router.get('/all', getAllAppointments);

// @route   PATCH /api/appointments/:id
// @desc    Update appointment status and schedule
router.patch('/:id', updateAppointmentStatus);

module.exports = router;
