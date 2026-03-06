const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Applied to all public endpoints to prevent basic DDoS and brute force
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased for development/polling
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    status: 429
  },
  validate: { default: false },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Authentication Rate Limiter
 * Applied to login and registration routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    status: 429
  },
  validate: { default: false },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * User-based Rate Limiter (for authenticated routes)
 * Can be used after auth middleware to track limits by user ID
 */
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20000, // High limit for authenticated polling
  keyGenerator: (req) => {
    // If we have a user, use their ID as the key
    if (req.user && req.user.id) {
      return req.user.id;
    }
    // Fallback to IP for guests
    return req.ip;
  },
  validate: { 
    ipv6SubnetOrKeyGenerator: false,
    default: false 
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Request limit exceeded for your account. Please wait before trying again.',
    status: 429
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  userLimiter
};
