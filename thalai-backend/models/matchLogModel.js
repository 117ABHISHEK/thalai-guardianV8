const mongoose = require('mongoose');

const matchLogSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scoreBreakdown: {
      bloodGroupMatch: Number,
      locationScore: Number,
      availabilityScore: Number,
      donationFrequencyScore: Number,
      aiPredictionScore: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    contactedAt: Date,
    respondedAt: Date,
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
matchLogSchema.index({ requestId: 1, matchScore: -1 });
matchLogSchema.index({ donorId: 1 });
matchLogSchema.index({ status: 1 });

const MatchLog = mongoose.model('MatchLog', matchLogSchema);

module.exports = MatchLog;

