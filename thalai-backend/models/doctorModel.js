const mongoose = require('mongoose');

/**
 * Doctor Model
 * Stores doctor information and their assigned patients
 */
const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    // Professional Information
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      default: 'Hematology',
    },
    licenseNumber: {
      type: String,
      required: [true, 'Medical license number is required'],
      unique: true,
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    experience: {
      type: Number, // Years of experience
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    // Hospital/Clinic Information
    hospital: {
      name: {
        type: String,
        trim: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    // Assigned Patients
    assignedPatients: [
      {
        patient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Patient',
          required: true,
        },
        assignedDate: {
          type: Date,
          default: Date.now,
        },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Admin who assigned
        },
        status: {
          type: String,
          enum: ['active', 'inactive', 'transferred'],
          default: 'active',
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin who verified
    },
    verificationDate: {
      type: Date,
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    // Availability
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
    },
    consultationHours: {
      start: {
        type: String, // Format: "HH:MM"
        default: '09:00',
      },
      end: {
        type: String, // Format: "HH:MM"
        default: '17:00',
      },
    },
    // Statistics
    totalPatientsAssigned: {
      type: Number,
      default: 0,
    },
    activePatientsCount: {
      type: Number,
      default: 0,
    },
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

// Indexes (user and licenseNumber already indexed via unique: true)
doctorSchema.index({ isVerified: 1 });
doctorSchema.index({ 'assignedPatients.patient': 1 });

// Virtual: active patients
doctorSchema.virtual('activePatients').get(function () {
  return this.assignedPatients.filter((ap) => ap.status === 'active');
});

// Method: Add patient assignment
doctorSchema.methods.assignPatient = function (patientId, adminId, notes = '') {
  // Check if patient already assigned
  const existingAssignment = this.assignedPatients.find(
    (ap) => ap.patient.toString() === patientId.toString() && ap.status === 'active'
  );

  if (existingAssignment) {
    throw new Error('Patient is already assigned to this doctor');
  }

  this.assignedPatients.push({
    patient: patientId,
    assignedBy: adminId,
    assignedDate: new Date(),
    status: 'active',
    notes,
  });

  this.totalPatientsAssigned += 1;
  this.activePatientsCount += 1;
};

// Method: Remove patient assignment
doctorSchema.methods.removePatient = function (patientId) {
  const assignment = this.assignedPatients.find(
    (ap) => ap.patient.toString() === patientId.toString() && ap.status === 'active'
  );

  if (!assignment) {
    throw new Error('Patient is not assigned to this doctor');
  }

  assignment.status = 'inactive';
  this.activePatientsCount = Math.max(0, this.activePatientsCount - 1);
};

// Method: Transfer patient
doctorSchema.methods.transferPatient = function (patientId) {
  const assignment = this.assignedPatients.find(
    (ap) => ap.patient.toString() === patientId.toString() && ap.status === 'active'
  );

  if (!assignment) {
    throw new Error('Patient is not assigned to this doctor');
  }

  assignment.status = 'transferred';
  this.activePatientsCount = Math.max(0, this.activePatientsCount - 1);
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
