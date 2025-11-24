const mongoose = require('mongoose');

/**
 * Extended Donor Model with eligibility tracking, medical history, and health metrics
 * Supports 90-day donation interval rule and comprehensive eligibility assessment
 */
const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    // Basic donor information
    dob: {
      type: Date,
      required: [true, 'Date of birth is required for donors'],
      validate: {
        validator: function (dob) {
          // Age validation: must be at least 18 years old
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const dayDiff = today.getDate() - dob.getDate();
          const actualAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
          return actualAge >= 18;
        },
        message: 'Donor must be at least 18 years old',
      },
    },
    // Physical metrics
    heightCm: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [250, 'Height must not exceed 250 cm'],
      required: [true, 'Height is required'],
    },
    weightKg: {
      type: Number,
      min: [20, 'Weight must be at least 20 kg'],
      max: [250, 'Weight must not exceed 250 kg'],
      required: [true, 'Weight is required'],
    },
    // Medical history
    medicalHistory: [
      {
        condition: {
          type: String,
          required: true,
          trim: true,
        },
        details: {
          type: String,
          trim: true,
        },
        diagnosisDate: {
          type: Date,
        },
        isContraindication: {
          type: Boolean,
          default: false, // Flag for conditions that prevent donation
        },
      },
    ],
    // Donation history
    lastDonationDate: {
      type: Date,
      validate: {
        validator: function (date) {
          if (!date) return true; // Optional field
          return date <= new Date(); // Cannot be in the future
        },
        message: 'Last donation date cannot be in the future',
      },
    },
    donationFrequencyMonths: {
      type: Number,
      default: 3,
      min: [3, 'Minimum donation frequency is 3 months (90 days)'],
      validate: {
        validator: function (freq) {
          return freq >= 3; // Enforce 3-month minimum (90 days)
        },
        message: 'Donation frequency must be at least 3 months',
      },
    },
    totalDonations: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Availability and verification
    availabilityStatus: {
      type: Boolean,
      default: false,
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
    // Health clearance and eligibility (admin-managed)
    healthClearance: {
      type: Boolean,
      default: false, // Set by admin after reviewing medical documents
    },
    eligibilityStatus: {
      type: String,
      enum: ['eligible', 'ineligible', 'deferred'],
      default: 'deferred', // Starts as deferred until admin review
    },
    eligibilityReason: {
      type: String,
      trim: true,
      default: 'Pending admin review',
    },
    nextPossibleDonationDate: {
      type: Date, // Computed based on lastDonationDate + 90 days
    },
    eligibilityLastChecked: {
      type: Date,
      default: Date.now,
    },
    // Additional notes
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
donorSchema.index({ user: 1 });
donorSchema.index({ availabilityStatus: 1 });
donorSchema.index({ isVerified: 1 });
donorSchema.index({ eligibilityStatus: 1 });
donorSchema.index({ healthClearance: 1 });
donorSchema.index({ nextPossibleDonationDate: 1 });

// Virtual for age calculation
donorSchema.virtual('age').get(function () {
  if (!this.dob) return null;
  const today = new Date();
  const age = today.getFullYear() - this.dob.getFullYear();
  const monthDiff = today.getMonth() - this.dob.getMonth();
  const dayDiff = today.getDate() - this.dob.getDate();
  return age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
});

// Virtual for days since last donation
donorSchema.virtual('daysSinceLastDonation').get(function () {
  if (!this.lastDonationDate) return null;
  const today = new Date();
  const diffTime = today - this.lastDonationDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save hook to compute nextPossibleDonationDate
donorSchema.pre('save', function (next) {
  if (this.lastDonationDate) {
    const minIntervalDays = this.donationFrequencyMonths * 30; // Approximate
    const nextDate = new Date(this.lastDonationDate);
    nextDate.setDate(nextDate.getDate() + minIntervalDays);
    this.nextPossibleDonationDate = nextDate;
  }
  next();
});

// Method to check if donation is allowed today
donorSchema.methods.canDonateToday = function () {
  if (!this.lastDonationDate) return true; // Never donated before
  
  const daysSince = this.daysSinceLastDonation;
  const minIntervalDays = this.donationFrequencyMonths * 30;
  
  return daysSince >= minIntervalDays && 
         this.eligibilityStatus === 'eligible' && 
         this.healthClearance === true &&
         this.isVerified === true;
};

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;
