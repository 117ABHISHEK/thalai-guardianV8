/**
 * Validation Utilities
 * Centralized validation functions for donor registration, donation eligibility, and data validation
 */

const { body, validationResult } = require('express-validator');
const {
  validateDonorRegistration,
  calculateAge,
  daysSinceLastDonation,
  calculateNextPossibleDate,
  MIN_DONATION_INTERVAL_DAYS,
  MIN_DONOR_AGE,
} = require('../services/eligibilityService');

/**
 * Validation result handler middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

/**
 * Email validation
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Phone validation (supports international formats)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Blood group validation
 */
const isValidBloodGroup = (bloodGroup) => {
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validBloodGroups.includes(bloodGroup);
};

/**
 * Date validation (not in future)
 */
const isNotFutureDate = (date) => {
  if (!date) return true; // Optional field
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return inputDate <= today;
};

/**
 * Age validation for donors (must be >= 18)
 */
const validateDonorAge = (dob) => {
  if (!dob) {
    return { valid: false, message: 'Date of birth is required for donors' };
  }

  const age = calculateAge(dob);
  if (age === null) {
    return { valid: false, message: 'Invalid date of birth' };
  }

  if (age < MIN_DONOR_AGE) {
    return {
      valid: false,
      message: `Must be at least ${MIN_DONOR_AGE} years old to register as donor. Current age: ${age}`,
      age,
    };
  }

  return { valid: true, age };
};

/**
 * Donation interval validation (90-day rule)
 */
const validateDonationInterval = (lastDonationDate, donationFrequencyMonths = 3) => {
  if (!lastDonationDate) {
    return { valid: true }; // No previous donation
  }

  const daysSince = daysSinceLastDonation(lastDonationDate);
  const minIntervalDays = donationFrequencyMonths * 30;

  if (daysSince < minIntervalDays) {
    const nextPossibleDate = calculateNextPossibleDate(
      lastDonationDate,
      donationFrequencyMonths
    );
    return {
      valid: false,
      message: `Minimum ${minIntervalDays} days must pass since last donation. ${daysSince} days have passed.`,
      daysSince,
      minIntervalDays,
      nextPossibleDate,
    };
  }

  return { valid: true, daysSince };
};

/**
 * Height validation (50-250 cm)
 */
const validateHeight = (heightCm) => {
  if (heightCm === undefined || heightCm === null) {
    return { valid: false, message: 'Height is required' };
  }

  if (heightCm < 50 || heightCm > 250) {
    return {
      valid: false,
      message: 'Height must be between 50 and 250 cm',
    };
  }

  return { valid: true };
};

/**
 * Weight validation (20-250 kg)
 */
const validateWeight = (weightKg) => {
  if (weightKg === undefined || weightKg === null) {
    return { valid: false, message: 'Weight is required' };
  }

  if (weightKg < 20 || weightKg > 250) {
    return {
      valid: false,
      message: 'Weight must be between 20 and 250 kg',
    };
  }

  return { valid: true };
};

/**
 * Express-validator rules for donor registration
 */
const donorRegistrationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

    body('role')
      .isIn(['patient', 'donor', 'admin'])
      .withMessage('Invalid role. Must be one of: patient, donor, admin'),

    body('bloodGroup')
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Invalid blood group'),

    body('phone')
      .optional()
      .trim()
      .custom((value) => {
        if (value && !isValidPhone(value)) {
          throw new Error('Invalid phone number format');
        }
        return true;
      }),

    body('dob')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)')
      .custom((value) => {
        if (!isNotFutureDate(value)) {
          throw new Error('Date of birth cannot be in the future');
        }
        return true;
      }),

    body('heightCm')
      .optional()
      .isFloat({ min: 50, max: 250 })
      .withMessage('Height must be between 50 and 250 cm'),

    body('weightKg')
      .optional()
      .isFloat({ min: 20, max: 250 })
      .withMessage('Weight must be between 20 and 250 kg'),

    body('donationFrequencyMonths')
      .optional()
      .isInt({ min: 3 })
      .withMessage('Minimum donation frequency is 3 months'),

    body('lastDonationDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        if (!isNotFutureDate(value)) {
          throw new Error('Last donation date cannot be in the future');
        }
        return true;
      }),
  ];
};

/**
 * Express-validator rules for donor profile update
 */
const donorProfileUpdateRules = () => {
  return [
    body('heightCm')
      .optional()
      .isFloat({ min: 50, max: 250 })
      .withMessage('Height must be between 50 and 250 cm'),

    body('weightKg')
      .optional()
      .isFloat({ min: 20, max: 250 })
      .withMessage('Weight must be between 20 and 250 kg'),

    body('donationFrequencyMonths')
      .optional()
      .isInt({ min: 3 })
      .withMessage('Minimum donation frequency is 3 months'),

    body('lastDonationDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        if (!isNotFutureDate(value)) {
          throw new Error('Last donation date cannot be in the future');
        }
        return true;
      }),

    body('medicalHistory')
      .optional()
      .isArray()
      .withMessage('Medical history must be an array'),

    body('medicalHistory.*.condition')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Medical condition name is required'),

    body('availabilityStatus')
      .optional()
      .isBoolean()
      .withMessage('Availability status must be a boolean'),
  ];
};

module.exports = {
  handleValidationErrors,
  isValidEmail,
  isValidPhone,
  isValidBloodGroup,
  isNotFutureDate,
  validateDonorAge,
  validateDonationInterval,
  validateHeight,
  validateWeight,
  donorRegistrationRules,
  donorProfileUpdateRules,
  MIN_DONATION_INTERVAL_DAYS,
  MIN_DONOR_AGE,
};

