const mongoose = require('mongoose');

const donorHistorySchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    donationDate: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    unitsDonated: {
      type: Number,
      default: 1,
    },
    location: {
      hospital: String,
      city: String,
      state: String,
    },
    healthStatus: {
      type: String,
      enum: ['excellent', 'good', 'fair'],
      default: 'good',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
donorHistorySchema.index({ donorId: 1, donationDate: -1 });
donorHistorySchema.index({ donationDate: -1 });

const DonorHistory = mongoose.model('DonorHistory', donorHistorySchema);

module.exports = DonorHistory;

