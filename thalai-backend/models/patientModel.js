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
          min: [1, 'At least 1 unit required'],
        },
        hb_value: {
          type: Number,
          required: true,
          min: [0, 'Hemoglobin value must be positive'],
          max: [20, 'Hemoglobin value seems unrealistic'],
        },
        notes: {
          type: String,
          trim: true,
        },
        hospital: {
          type: String,
          trim: true,
        },
        doctor: {
          type: String,
          trim: true,
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
    // Medical information
    comorbidities: [
      {
        condition: {
          type: String,
          required: true,
          trim: true,
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
      min: [0, 'Hemoglobin must be positive'],
      max: [20, 'Hemoglobin value seems unrealistic'],
    },
    currentHbDate: {
      type: Date,
    },
    // Health metrics
    heightCm: {
      type: Number,
      min: [0, 'Height must be positive'],
      max: [300, 'Height seems unrealistic'],
    },
    weightKg: {
      type: Number,
      min: [0, 'Weight must be positive'],
      max: [500, 'Weight seems unrealistic'],
    },
    // Medical reports (user submitted)
    medicalReports: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        reportDate: {
          type: Date,
          default: Date.now,
        },
        // Thalassemia specific parameters
        hemoglobin: {
          type: Number, // g/dL
          min: 0,
          max: 25,
        },
        ferritin: {
          type: Number, // ng/mL
          min: 0,
        },
        sgpt: {
          type: Number, // U/L (ALT)
          min: 0,
        },
        sgot: {
          type: Number, // U/L (AST)
          min: 0,
        },
        creatinine: {
          type: Number, // mg/dL
          min: 0,
        },
        notes: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
        },
        heightCm: {
          type: Number,
          min: 0,
          max: 300,
        },
        weightKg: {
          type: Number,
          min: 0,
          max: 500,
        },
      },
    ],
    // Notes
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (user already indexed via unique: true)
patientSchema.index({ lastTransfusionDate: -1 });
patientSchema.index({ predictedNextTransfusionDate: 1 });

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

