const Request = require('../models/requestModel');
const User = require('../models/userModel');

// @route   POST /api/requests
// @desc    Create a new blood request
// @access  Private (Patient)
const createRequest = async (req, res) => {
  try {
    const {
      bloodGroup,
      unitsRequired,
      urgency,
      location,
      contactPerson,
      notes,
    } = req.body;

    // Validation
    if (!bloodGroup || !unitsRequired) {
      return res.status(400).json({
        message: 'Blood group and units required are mandatory',
      });
    }

    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        message: 'Invalid blood group',
      });
    }

    // Validate units
    if (unitsRequired < 1 || unitsRequired > 10) {
      return res.status(400).json({
        message: 'Units required must be between 1 and 10',
      });
    }

    // Check if user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        message: 'Only patients can create blood requests',
      });
    }

    // Check for duplicate active requests
    const existingRequest = await Request.findOne({
      patientId: req.user._id,
      status: { $in: ['pending', 'searching'] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have an active blood request. Please cancel it before creating a new one.',
        existingRequest: {
          id: existingRequest._id,
          status: existingRequest.status,
          createdAt: existingRequest.createdAt,
        },
      });
    }

    // Create request
    const request = await Request.create({
      patientId: req.user._id,
      bloodGroup,
      unitsRequired,
      urgency: urgency || 'medium',
      location,
      contactPerson,
      notes,
      status: 'pending',
    });

    // Populate patient details
    await request.populate('patientId', 'name email bloodGroup phone');

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: {
        request,
      },
    });
  } catch (error) {
    console.error('Create request error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You already have an active blood request',
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/requests/user/:id
// @desc    Get all requests for a specific patient
// @access  Private
const getUserRequests = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is accessing their own requests or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    const requests = await Request.find({ patientId: id })
      .populate('patientId', 'name email bloodGroup phone')
      .populate('cancelledBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: {
        requests,
      },
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/requests
// @desc    Get all requests (Admin only)
// @access  Private/Admin
const getAllRequests = async (req, res) => {
  try {
    const { status, bloodGroup, urgency } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (urgency) filter.urgency = urgency;

    const requests = await Request.find(filter)
      .populate('patientId', 'name email bloodGroup phone address')
      .populate('cancelledBy', 'name email')
      .sort({ createdAt: -1 });

    // Get statistics
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: {
        requests,
        stats,
      },
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   PUT /api/requests/:id/cancel
// @desc    Cancel a blood request
// @access  Private
const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        message: 'Request not found',
      });
    }

    // Check if user is the patient who created the request or is admin
    if (
      request.patientId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'You can only cancel your own requests',
      });
    }

    // Check if request can be cancelled
    if (request.status === 'cancelled') {
      return res.status(400).json({
        message: 'Request is already cancelled',
      });
    }

    if (request.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot cancel a completed request',
      });
    }

    // Update request
    request.status = 'cancelled';
    request.cancelledAt = new Date();
    request.cancelledBy = req.user._id;

    await request.save();

    // Populate details
    await request.populate('patientId', 'name email');
    await request.populate('cancelledBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      data: {
        request,
      },
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/requests/:id
// @desc    Get a single request by ID
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id)
      .populate('patientId', 'name email bloodGroup phone address')
      .populate('cancelledBy', 'name email');

    if (!request) {
      return res.status(404).json({
        message: 'Request not found',
      });
    }

    // Check access
    if (
      request.patientId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        request,
      },
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  getAllRequests,
  cancelRequest,
  getRequestById,
};

