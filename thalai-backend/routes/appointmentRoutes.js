const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

router.use(protect);

// @route   POST /api/appointments
// @desc    Create a new appointment
router.post('/', createAppointment);

// @route   GET /api/appointments/my
// @desc    Get current user's appointments (as patient)
router.get('/my', getMyAppointments);

// @route   GET /api/appointments/doctor
// @desc    Get doctor's appointments
router.get('/doctor', getDoctorAppointments);

// @route   PATCH /api/appointments/:id
// @desc    Update appointment status
router.patch('/:id', updateAppointmentStatus);

module.exports = router;
