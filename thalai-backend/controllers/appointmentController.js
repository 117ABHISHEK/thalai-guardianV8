const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const { sendAppointmentNotification } = require('../services/notificationService');

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

    // Check for overlap if creating directly as scheduled (unlikely for patients/donors)
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: 'scheduled'
    });

    if (existing) {
       return res.status(400).json({
         success: false,
         message: 'This slot is already booked for this doctor.',
       });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      doctor: doctorId,
      userRole: req.user.role,
      date,
      time,
      reason,
      status: 'pending' 
    });

    // Notify doctor
    await sendAppointmentNotification(doctorId, appointment, 'requested');

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
 * @desc    Get user's appointments (as requester)
 * @route   GET /api/appointments/my
 * @access  Private
 */
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
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
      .populate('user', 'name email bloodGroup role phone')
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
 * @desc    Update appointment status and schedule
 * @route   PATCH /api/appointments/:id
 * @access  Private
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, date, time, notes } = req.body;
    
    const allowedStatuses = ['pending', 'scheduled', 'completed_pending', 'completed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
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

    // Authorization check
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isRequester = appointment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isDoctor && !isRequester && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    // Two-step completion logic:
    // 1. Doctor requests completion -> status becomes 'completed_pending'
    // 2. Requester confirms completion -> status becomes 'completed'
    if (status === 'completed_pending') {
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only the doctor can request for appointment completion.',
        });
      }
      if (appointment.status !== 'scheduled') {
         return res.status(400).json({
           success: false,
           message: 'Appointment must be in scheduled state to request completion.',
         });
      }
    }

    if (status === 'completed') {
      if (!isRequester && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only the patient/donor can confirm completion of the visit.',
        });
      }
      if (appointment.status !== 'completed_pending' && !isAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Appointment must be marked as pending completion by the doctor first.',
        });
      }
    }

    // Overlap check if status transitioning to 'scheduled' or if date/time changed while scheduled
    const finalStatus = status || appointment.status;
    const finalDate = date || appointment.date;
    const finalTime = time || appointment.time;

    if (finalStatus === 'scheduled') {
      const overlap = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctor: appointment.doctor,
        date: finalDate,
        time: finalTime,
        status: 'scheduled'
      });

      if (overlap) {
        return res.status(400).json({
          success: false,
          message: 'Conflict: Doctor already has a scheduled appointment at this time.',
        });
      }
    }

    // Update fields
    if (status) appointment.status = status;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (notes) appointment.notes = notes;

    await appointment.save();

    // Trigger Notifications based on status change
    if (status === 'scheduled') {
      await sendAppointmentNotification(appointment.user, appointment, 'scheduled');
    } else if (status === 'completed_pending') {
      await sendAppointmentNotification(appointment.user, appointment, 'completed_pending');
    } else if (status === 'completed') {
      await sendAppointmentNotification(appointment.doctor, appointment, 'completed');
    } else if (status === 'cancelled') {
      const targetId = isDoctor ? appointment.user : appointment.doctor;
      await sendAppointmentNotification(targetId, appointment, 'cancelled');
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Get all appointments (Admin)
 * @route   GET /api/appointments/all
 * @access  Private/Admin
 */
const getAllAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const appointments = await Appointment.find({})
      .populate('user', 'name email role')
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
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
  getAllAppointments,
};
