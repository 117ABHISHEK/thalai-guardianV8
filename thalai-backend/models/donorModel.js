const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    availabilityStatus: {
      type: Boolean,
      default: false,
    },
    lastDonationDate: {
      type: Date,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Index for faster queries
donorSchema.index({ user: 1 });
donorSchema.index({ availabilityStatus: 1 });
donorSchema.index({ isVerified: 1 });

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;

