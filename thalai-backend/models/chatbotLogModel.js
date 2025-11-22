const mongoose = require('mongoose');

const chatbotLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
      required: true,
    },
    userMessage: {
      type: String,
      required: true,
      trim: true,
    },
    botResponse: {
      type: String,
      required: true,
      trim: true,
    },
    intent: {
      type: String,
      enum: [
        'transfusion_schedule',
        'donor_guidelines',
        'symptoms',
        'emergency',
        'system_help',
        'general',
      ],
      default: 'general',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    metadata: {
      userRole: String,
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatbotLogSchema.index({ userId: 1, createdAt: -1 });
chatbotLogSchema.index({ sessionId: 1 });

const ChatbotLog = mongoose.model('ChatbotLog', chatbotLogSchema);

module.exports = ChatbotLog;

