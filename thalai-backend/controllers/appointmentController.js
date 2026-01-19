const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if doctor exists and is actually a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
      reason,
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's appointments (as patient)
 * @route   GET /api/appointments/my
 * @access  Private
 */
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email specialization')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

/**
 * @desc    Get doctor's appointments
 * @route   GET /api/appointments/doctor
 * @access  Private
 */
const getDoctorAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access doctor appointments',
      });
    }

    const query = req.user.role === 'doctor' ? { doctor: req.user._id } : {};
    
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email bloodGroup')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PATCH /api/appointments/:id
 * @access  Private
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization check: Only doctor or patient involved can update
    // But usually for status like 'completed', only doctor. For 'cancelled', both.
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isPatient = appointment.patient.toString() === req.user._id.toString();

    if (!isDoctor && !isPatient) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};
