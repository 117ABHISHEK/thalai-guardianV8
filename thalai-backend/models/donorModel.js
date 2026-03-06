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
    },
    // Physical metrics
    heightCm: {
      type: Number,
      min: [45, 'Height must be at least 45 cm'],
      max: [230, 'Height cannot exceed 230 cm'],
    },
    weightKg: {
      type: Number,
      min: [2, 'Weight must be at least 2 kg'],
      max: [250, 'Weight cannot exceed 250 kg'],
    },
    // Medical history
    medicalHistory: [
      {
        condition: {
          type: String,
          required: true,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.\-/#:]+$/, 'Condition must contain only alphanumeric characters, spaces, hyphens, commas, dots, slashes and hashes']
        },
        details: {
          type: String,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.\-/#:]+$/, 'Details must contain only alphanumeric characters, spaces, hyphens, commas, dots, slashes and hashes']
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
    // Medical reports (user submitted)
    medicalReports: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.\-/#:]+$/, 'Title must contain only alphanumeric characters, spaces, hyphens, commas, dots, slashes and hashes']
        },
        reportDate: {
          type: Date,
          default: Date.now,
        },
        // Donor specific vitals
        hemoglobin: {
          type: Number, // g/dL
          min: [2, 'Min Hb is 2 g/dL'],
          max: [20, 'Max Hb is 20 g/dL'],
        },
        bpSystolic: {
          type: Number, // mmHg
          min: [70, 'Systolic BP must be at least 70 mmHg'],
          max: [240, 'Systolic BP cannot exceed 240 mmHg'],
        },
        bpDiastolic: {
          type: Number, // mmHg
          min: [40, 'Diastolic BP must be at least 40 mmHg'],
          max: [150, 'Diastolic BP cannot exceed 150 mmHg'],
        },
        pulseRate: {
          type: Number, // bpm
          min: [30, 'Pulse rate must be at least 30 bpm'],
          max: [250, 'Pulse rate cannot exceed 250 bpm'],
        },
        temperature: {
          type: Number, // Celsius
          min: [35, 'Temperature must be at least 35°C'],
          max: [42.5, 'Temperature cannot exceed 42.5°C'],
        },
        notes: {
          type: String,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.\-/#:]+$/, 'Notes must contain only alphanumeric characters, spaces, hyphens, commas, dots, slashes and hashes']
        },
        value: {
          type: String,
          trim: true,
        },
        heightCm: {
          type: Number,
          min: [45, 'Min height is 45 cm'],
          max: [230, 'Max height is 230 cm'],
        },
        weightKg: {
          type: Number,
          min: [2, 'Min weight is 2 kg'],
          max: [250, 'Max weight is 250 kg'],
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
      match: [/^[a-zA-Z0-9\s,.-:]+$/, 'Eligibility reason must contain only alphanumeric characters, spaces, hyphens, colons, commas, and dots'],
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
      match: [/^[a-zA-Z0-9\s,.-]+$/, 'Notes must contain only alphanumeric characters, spaces, hyphens, commas, and dots']
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries (user already indexed via unique: true)
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
  if (!this.lastDonationDate && this.age < 18) return false; // Too young to start
  if (this.age < 18) return false; // Minors can't donate

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
