const Connection = require('../models/connectionModel');
const User = require('../models/userModel');
const Appointment = require('../models/appointmentModel');
const { sendConnectionNotification, sendCheckupSuggestionNotification } = require('../services/notificationService');

/**
 * @desc    Request a connection
 * @route   POST /api/connections/request
 */
exports.requestConnection = async (req, res) => {
  try {
    const { targetUserId, notes } = req.body;
    const requesterId = req.user._id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Determine roles
    let patientId, donorId;
    if (req.user.role === 'patient' && targetUser.role === 'donor') {
      patientId = requesterId;
      donorId = targetUserId;
    } else if (req.user.role === 'donor' && targetUser.role === 'patient') {
      patientId = targetUserId;
      donorId = requesterId;
    } else {
      return res.status(400).json({ success: false, message: 'Connections can only be made between a patient and a donor' });
    }

    const existingConnection = await Connection.findOne({ patient: patientId, donor: donorId });
    if (existingConnection) {
      return res.status(400).json({ success: false, message: 'Connection already exists or is pending' });
    }

    const connection = await Connection.create({
      patient: patientId,
      donor: donorId,
      requester: requesterId,
      notes,
    });

    // Notify target user
    await sendConnectionNotification(targetUserId, req.user.name, 'request');

    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get current user's connections
 * @route   GET /api/connections
 */
exports.getMyConnections = async (req, res) => {
  try {
    const query = req.user.role === 'patient' ? { patient: req.user._id } : { donor: req.user._id };
    const connections = await Connection.find(query)
      .populate('patient', 'name email bloodGroup phone')
      .populate('donor', 'name email bloodGroup phone')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: connections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Respond to a connection request
 * @route   PATCH /api/connections/:id
 */
exports.respondToConnection = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    // Only the target user can respond
    if (connection.requester.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot respond to your own request' });
    }

    const isAuthorized = 
      (req.user.role === 'patient' && connection.patient.toString() === req.user._id.toString()) ||
      (req.user.role === 'donor' && connection.donor.toString() === req.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    connection.status = status;
    await connection.save();

    // Notify requester if accepted
    if (status === 'active') {
      await sendConnectionNotification(connection.requester, req.user.name, 'accepted');
    }

    res.status(200).json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Initiate a quick checkup scheduling (Patient suggesting to Donor)
 * @route   POST /api/connections/:id/suggest-checkup
 */
exports.suggestCheckup = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection || connection.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active connection not found' });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can suggest checkups to their connected donors' });
    }

    // In a real app, this might send a notification. 
    // For now, we'll return a success message indicating the suggestion was sent.
    await sendCheckupSuggestionNotification(connection.donor, req.user.name);

    res.status(200).json({ 
      success: true, 
      message: 'Checkup suggestion sent to your donor friend. They can now book a consultation with a doctor.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Report a connection for audit
 * @route   POST /api/connections/:id/report
 */
exports.reportConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    // In a real app, this would create an audit record or notify an admin
    // For now, we simulate the logic
    console.log(`[AUDIT] Connection ${req.params.id} reported by user ${req.user._id}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Node flagged for administrative audit. Integrity check protocol initiated.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
