/**
 * Winston Logger Configuration
 * Provides structured logging for ThalAI Guardian backend
 */

const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'thalai-guardian-backend' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write eligibility changes to eligibility.log
    new winston.transports.File({
      filename: path.join(logsDir, 'eligibility.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
} else {
  // In production, only log info and above to console
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'info',
    })
  );
}

// Helper methods for specific log types
logger.logEligibilityChange = function (donorId, userId, oldStatus, newStatus, reason) {
  this.info('Eligibility status changed', {
    type: 'eligibility_change',
    donorId,
    changedBy: userId,
    oldStatus,
    newStatus,
    reason,
    timestamp: new Date().toISOString(),
  });
};

logger.logDonorVerification = function (donorId, adminId, healthClearance, eligibilityStatus) {
  this.info('Donor verified', {
    type: 'donor_verification',
    donorId,
    verifiedBy: adminId,
    healthClearance,
    eligibilityStatus,
    timestamp: new Date().toISOString(),
  });
};

logger.logAdminAction = function (action, adminId, targetId, details) {
  this.info('Admin action performed', {
    type: 'admin_action',
    action,
    adminId,
    targetId,
    details,
    timestamp: new Date().toISOString(),
  });
};

logger.logMLPrediction = function (patientId, predictionDate, confidence, method) {
  this.info('ML prediction made', {
    type: 'ml_prediction',
    patientId,
    predictionDate,
    confidence,
    method,
    timestamp: new Date().toISOString(),
  });
};

logger.logRegistration = function (userId, role, email, metadata) {
  this.info('User registered', {
    type: 'user_registration',
    userId,
    role,
    email,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

module.exports = logger;

