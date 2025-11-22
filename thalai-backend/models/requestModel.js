const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is needed'],
      min: [1, 'At least 1 unit is required'],
      max: [10, 'Maximum 10 units per request'],
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'searching', 'completed', 'cancelled'],
      default: 'pending',
    },
    location: {
      hospital: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
    },
    contactPerson: {
      name: String,
      phone: String,
      relationship: String,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
requestSchema.index({ patientId: 1, status: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ bloodGroup: 1 });
requestSchema.index({ createdAt: -1 });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;

