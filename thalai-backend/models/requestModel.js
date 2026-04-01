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
      hospital: {
        type: String,
        trim: true,
        match: [/^[a-zA-Z0-9\s,.-]+$/, 'Hospital name must contain only alphanumeric characters, spaces, hyphens, commas, and dots']
      },
      address: {
        type: String,
        trim: true,
        match: [/^[a-zA-Z0-9\s,.-]+$/, 'Address must contain only alphanumeric characters, spaces, hyphens, commas, and dots']
      },
      city: {
        type: String,
        trim: true,
        match: [/^[a-zA-Z\s]+$/, 'City must contain only alphabets']
      },
      state: {
        type: String,
        trim: true,
        match: [/^[a-zA-Z\s]+$/, 'State must contain only alphabets']
      },
      zipCode: {
        type: String,
        trim: true,
        match: [/^\d{6}$/, 'Zip code must be exactly 6 digits']
      },
    },
    contactPerson: {
      name: {
        type: String,
        trim: true,
        match: [/^[a-zA-Z\s-]+$/, 'Name must contain only alphabets and hyphens']
      },
      phone: {
        type: String,
        trim: true,
        match: [/^\+?[0-9\s-]{10,15}$/, 'Phone number is invalid']
      },
      relationship: {
        type: String,
        trim: true,
        match: [/^[a-zA-Z\s]+$/, 'Relationship must contain only letters']
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    acceptedDonors: [
      {
        donorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Donor',
          required: true,
        },
        matchId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MatchLog',
          required: true,
        },
        role: {
          type: String,
          enum: ['primary', 'backup'],
          required: true,
        },
        status: {
          type: String,
          enum: ['active', 'unavailable', 'completed'],
          default: 'active',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
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

