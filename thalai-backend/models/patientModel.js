const mongoose = require('mongoose');

/**
 * Patient Model with transfusion history for ML prediction
 * Stores historical transfusion data to predict next transfusion date
 */
const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required for patients'],
    },
    parentDetails: {
      parentName: { 
        type: String, 
        trim: true,
        match: [/^[a-zA-Z\s-]+$/, 'Parent name must contain only alphabets and hyphens']
      },
      parentPhone: { 
        type: String, 
        trim: true,
        match: [/^\+?[0-9\s-]{10,15}$/, 'Parent phone number is invalid']
      },
      parentRelation: { 
        type: String, 
        trim: true,
        match: [/^[a-zA-Z\s]+$/, 'Parent relation must contain only alphabets']
      }
    },
    // Transfusion history - key data for ML prediction
    transfusionHistory: [
      {
        date: {
          type: Date,
          required: true,
          validate: {
            validator: function (date) {
              return date <= new Date(); // Cannot be future date
            },
            message: 'Transfusion date cannot be in the future',
          },
        },
        units: {
          type: Number,
          required: true,
          min: [0.5, 'Minimum 0.5 units required'],
          max: [6, 'Maximum 6 units allowed per entry'],
        },
        hb_value: {
          type: Number,
          required: true,
          min: [2, 'Hemoglobin must be at least 2 g/dL'],
          max: [20, 'Hemoglobin cannot exceed 20 g/dL'],
        },
        notes: {
          type: String,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.\-/#]+$/, 'Notes must contain only alphanumeric characters, spaces, hyphens, commas, dots, slashes and hashes']
        },
        hospital: {
          type: String,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.-]+$/, 'Hospital must contain only alphanumeric characters, spaces, hyphens, commas, and dots']
        },
        doctor: {
          type: String,
          trim: true,
          match: [/^[a-zA-Z\s.-]+$/, 'Doctor name can only contain alphabets, spaces, dots, and hyphens']
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    // Last transfusion date (for quick access)
    lastTransfusionDate: {
      type: Date,
      validate: {
        validator: function (date) {
          if (!date) return true; // Optional
          return date <= new Date();
        },
        message: 'Last transfusion date cannot be in the future',
      },
    },
    // Computed typical interval between transfusions (in days)
    typicalIntervalDays: {
      type: Number,
      min: [0, 'Interval must be positive'],
      default: null, // Computed from history
    },
    // ML prediction results (cached)
    predictedNextTransfusionDate: {
      type: Date,
    },
    predictionConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    predictionLastUpdated: {
      type: Date,
    },
    predictionExplanation: {
      type: String,
      trim: true,
    },
    predictionUrgency: {
      type: String,
      enum: ['normal', 'soon', 'urgent', 'overdue'],
      default: 'normal',
    },
    // Medical information
    comorbidities: [
      {
        condition: {
          type: String,
          required: true,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.-]+$/, 'Condition must contain only alphanumeric characters, spaces, hyphens, commas, and dots']
        },
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe'],
          default: 'moderate',
        },
        diagnosisDate: {
          type: Date,
        },
      },
    ],
    // Current health metrics
    currentHb: {
      type: Number,
      min: [2, 'Hemoglobin must be at least 2 g/dL'],
      max: [20, 'Hemoglobin cannot exceed 20 g/dL'],
    },
    currentHbDate: {
      type: Date,
    },
    // Health metrics
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
    // Advanced Clinical Parameters for AI
    thalassemiaType: {
      type: String,
      enum: [
        'Beta Thalassemia Major',
        'Beta Thalassemia Intermedia',
        'E-Beta Thalassemia',
        'Alpha Thalassemia (HbH)',
        'Other'
      ],
      default: 'Beta Thalassemia Major'
    },
    splenectomy: {
      type: Boolean,
      default: false
    },
    // Medical reports (user submitted)
    medicalReports: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.\-/#]+$/, 'Title must contain only alphanumeric characters, spaces, hyphens, commas, dots, slashes and hashes']
        },
        reportDate: {
          type: Date,
          default: Date.now,
        },
        // Thalassemia specific parameters
        hemoglobin: {
          type: Number, // g/dL
          min: [2, 'Min Hb is 2 g/dL'],
          max: [20, 'Max Hb is 20 g/dL'],
        },
        ferritin: {
          type: Number, // ng/mL
          min: [10, 'Min Ferritin is 10 ng/mL'],
          max: [15000, 'Max Ferritin is 15000 ng/mL'],
        },
        sgpt: {
          type: Number, // U/L (ALT)
          min: [0, 'Min SGPT is 0 U/L'],
          max: [2000, 'SGPT seems unrealistic (> 2000 U/L)'],
        },
        sgot: {
          type: Number, // U/L (AST)
          min: [0, 'Min SGOT is 0 U/L'],
          max: [2000, 'SGOT seems unrealistic (> 2000 U/L)'],
        },
        creatinine: {
          type: Number, // mg/dL
          min: [0, 'Min Creatinine is 0 mg/dL'],
          max: [15, 'Creatinine seems unrealistic (> 15 mg/dL)'],
        },
        notes: {
          type: String,
          trim: true,
          match: [/^[a-zA-Z0-9\s,.\-/#]+$/, 'Notes must contain only alphanumeric characters, spaces, hyphens, commas, dots, slashes and hashes']
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
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    // Notes
    notes: {
      type: String,
      trim: true,
      match: [/^[a-zA-Z0-9\s,.\-/#]+$/, 'Notes must contain only alphanumeric characters, spaces, hyphens, commas, dots, slashes and hashes']
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (user already indexed via unique: true)
patientSchema.index({ lastTransfusionDate: -1 });
patientSchema.index({ predictedNextTransfusionDate: 1 });

// Virtual: age calculation
patientSchema.virtual('age').get(function () {
  if (!this.dob) return null;
  const today = new Date();
  const age = today.getFullYear() - this.dob.getFullYear();
  const monthDiff = today.getMonth() - this.dob.getMonth();
  const dayDiff = today.getDate() - this.dob.getDate();
  return age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
});

// Virtual: days since last transfusion
patientSchema.virtual('daysSinceLastTransfusion').get(function () {
  if (!this.lastTransfusionDate) return null;
  const today = new Date();
  const diffTime = today - this.lastTransfusionDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Method: compute typical interval from history
patientSchema.methods.computeTypicalInterval = function () {
  if (!this.transfusionHistory || this.transfusionHistory.length < 2) {
    return null; // Need at least 2 transfusions to compute interval
  }

  const sortedHistory = [...this.transfusionHistory].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const intervals = [];
  for (let i = 1; i < sortedHistory.length; i++) {
    const prevDate = new Date(sortedHistory[i - 1].date);
    const currDate = new Date(sortedHistory[i].date);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    intervals.push(diffDays);
  }

  // Return average interval
  const sum = intervals.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / intervals.length);
};

// Pre-save hook: update lastTransfusionDate and typicalIntervalDays
patientSchema.pre('save', function (next) {
  // Update lastTransfusionDate from history
  if (this.transfusionHistory && this.transfusionHistory.length > 0) {
    const sortedHistory = [...this.transfusionHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    this.lastTransfusionDate = sortedHistory[0].date;

    // Compute typical interval
    this.typicalIntervalDays = this.computeTypicalInterval();
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;

