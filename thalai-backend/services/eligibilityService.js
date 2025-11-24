/**
 * Eligibility Service
 * Computes donor eligibility based on age, donation interval, medical history, and health clearance
 * Implements 90-day minimum donation interval rule
 */

const Donor = require('../models/donorModel');

// Constants
const MIN_DONATION_INTERVAL_DAYS = 90; // 3 months
const MIN_DONOR_AGE = 18;

// Medical conditions that make a donor ineligible
const CONTRAINDICATION_CONDITIONS = [
  'active infection',
  'recent surgery',
  'heart disease',
  'cancer',
  'hiv',
  'hepatitis',
  'blood disorder',
  'pregnancy',
  'recent vaccination',
];

/**
 * Check if a medical condition is a contraindication
 */
const isContraindication = (condition) => {
  if (!condition) return false;
  const lowerCondition = condition.toLowerCase();
  return CONTRAINDICATION_CONDITIONS.some((contraindication) =>
    lowerCondition.includes(contraindication)
  );
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  return age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
};

/**
 * Calculate days since last donation
 */
const daysSinceLastDonation = (lastDonationDate) => {
  if (!lastDonationDate) return null;
  const today = new Date();
  const diffTime = today - lastDonationDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate next possible donation date (90 days from last donation)
 */
const calculateNextPossibleDate = (lastDonationDate, donationFrequencyMonths = 3) => {
  if (!lastDonationDate) return null;
  const minIntervalDays = donationFrequencyMonths * 30; // Approximate months to days
  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + minIntervalDays);
  return nextDate;
};

/**
 * Main eligibility computation function
 * @param {Object} donorDoc - Mongoose donor document
 * @returns {Object} { eligible: boolean, reason: string, nextPossibleDate: Date|null, checks: Object }
 */
const computeEligibility = (donorDoc) => {
  const checks = {
    ageCheck: { passed: false, reason: '' },
    donationIntervalCheck: { passed: false, reason: '' },
    medicalHistoryCheck: { passed: false, reason: '' },
    healthClearanceCheck: { passed: false, reason: '' },
    verificationCheck: { passed: false, reason: '' },
  };

  const reasons = [];
  let eligible = false;

  // 1. Age check
  const age = calculateAge(donorDoc.dob || donorDoc.user?.dateOfBirth);
  if (age === null) {
    checks.ageCheck.reason = 'Date of birth not provided';
    reasons.push('Date of birth is required');
  } else if (age < MIN_DONOR_AGE) {
    checks.ageCheck.reason = `Donor must be at least ${MIN_DONOR_AGE} years old. Current age: ${age}`;
    reasons.push(`Age requirement not met (must be ${MIN_DONOR_AGE}+ years)`);
  } else {
    checks.ageCheck.passed = true;
  }

  // 2. Donation interval check (90-day rule)
  if (donorDoc.lastDonationDate) {
    const daysSince = daysSinceLastDonation(donorDoc.lastDonationDate);
    const minIntervalDays = donorDoc.donationFrequencyMonths * 30 || MIN_DONATION_INTERVAL_DAYS;

    if (daysSince < minIntervalDays) {
      const nextPossibleDate = calculateNextPossibleDate(
        donorDoc.lastDonationDate,
        donorDoc.donationFrequencyMonths || 3
      );
      checks.donationIntervalCheck.reason = `Minimum ${minIntervalDays} days must pass since last donation. ${daysSince} days have passed. Next possible donation: ${nextPossibleDate.toISOString().split('T')[0]}`;
      reasons.push(
        `Donation interval requirement not met (must wait ${minIntervalDays} days between donations)`
      );
    } else {
      checks.donationIntervalCheck.passed = true;
    }
  } else {
    // No previous donation - interval check passes
    checks.donationIntervalCheck.passed = true;
  }

  // 3. Medical history check
  if (donorDoc.medicalHistory && donorDoc.medicalHistory.length > 0) {
    const hasContraindication = donorDoc.medicalHistory.some(
      (condition) =>
        condition.isContraindication ||
        isContraindication(condition.condition || condition)
    );

    if (hasContraindication) {
      checks.medicalHistoryCheck.reason =
        'Medical history contains conditions that prevent donation';
      reasons.push('Medical contraindication present');
    } else {
      checks.medicalHistoryCheck.passed = true;
    }
  } else {
    // No medical history provided - requires admin review
    if (!donorDoc.healthClearance) {
      checks.medicalHistoryCheck.reason = 'Medical history not provided; requires admin review';
      reasons.push('Medical history pending review');
    } else {
      checks.medicalHistoryCheck.passed = true;
    }
  }

  // 4. Health clearance check (admin must set this)
  if (!donorDoc.healthClearance) {
    checks.healthClearanceCheck.reason = 'Health clearance not granted by admin';
    reasons.push('Pending health clearance');
  } else {
    checks.healthClearanceCheck.passed = true;
  }

  // 5. Verification check
  if (!donorDoc.isVerified) {
    checks.verificationCheck.reason = 'Donor not verified by admin';
    reasons.push('Pending admin verification');
  } else {
    checks.verificationCheck.passed = true;
  }

  // Determine overall eligibility
  // All checks must pass OR admin has explicitly set eligibilityStatus to 'eligible'
  if (donorDoc.eligibilityStatus === 'eligible' && donorDoc.healthClearance) {
    // Admin has manually set as eligible
    eligible = true;
  } else if (donorDoc.eligibilityStatus === 'ineligible') {
    // Admin has explicitly marked as ineligible
    eligible = false;
    reasons.push(donorDoc.eligibilityReason || 'Marked ineligible by admin');
  } else {
    // Auto-compute eligibility based on checks
    eligible =
      checks.ageCheck.passed &&
      checks.donationIntervalCheck.passed &&
      checks.medicalHistoryCheck.passed &&
      checks.healthClearanceCheck.passed &&
      checks.verificationCheck.passed;
  }

  // Calculate next possible donation date
  let nextPossibleDate = null;
  if (donorDoc.lastDonationDate) {
    nextPossibleDate = calculateNextPossibleDate(
      donorDoc.lastDonationDate,
      donorDoc.donationFrequencyMonths || 3
    );
  } else {
    // No previous donation - can donate today if other checks pass
    nextPossibleDate = eligible ? new Date() : null;
  }

  // If not eligible due to interval, nextPossibleDate is already set above
  if (!checks.donationIntervalCheck.passed && donorDoc.lastDonationDate) {
    nextPossibleDate = calculateNextPossibleDate(
      donorDoc.lastDonationDate,
      donorDoc.donationFrequencyMonths || 3
    );
  }

  return {
    eligible,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Eligible to donate',
    nextPossibleDate,
    checks,
  };
};

/**
 * Validate donor registration data
 * @param {Object} donorData - Donor registration data
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateDonorRegistration = (donorData) => {
  const errors = [];

  // Age validation
  if (donorData.dob) {
    const age = calculateAge(donorData.dob);
    if (age !== null && age < MIN_DONOR_AGE) {
      errors.push({
        field: 'dob',
        message: `Must be at least ${MIN_DONOR_AGE} years old to register as donor`,
      });
    }
  }

  // Height validation
  if (donorData.heightCm !== undefined) {
    if (donorData.heightCm < 50 || donorData.heightCm > 250) {
      errors.push({
        field: 'heightCm',
        message: 'Height must be between 50 and 250 cm',
      });
    }
  }

  // Weight validation
  if (donorData.weightKg !== undefined) {
    if (donorData.weightKg < 20 || donorData.weightKg > 250) {
      errors.push({
        field: 'weightKg',
        message: 'Weight must be between 20 and 250 kg',
      });
    }
  }

  // Donation frequency validation
  if (donorData.donationFrequencyMonths !== undefined) {
    if (donorData.donationFrequencyMonths < 3) {
      errors.push({
        field: 'donationFrequencyMonths',
        message: 'Minimum donation frequency is 3 months',
      });
    }
  }

  // Last donation date validation
  if (donorData.lastDonationDate) {
    const daysSince = daysSinceLastDonation(donorData.lastDonationDate);
    const minIntervalDays = (donorData.donationFrequencyMonths || 3) * 30;

    if (daysSince < minIntervalDays) {
      const nextPossibleDate = calculateNextPossibleDate(
        donorData.lastDonationDate,
        donorData.donationFrequencyMonths || 3
      );
      errors.push({
        field: 'lastDonationDate',
        message: `Minimum ${minIntervalDays} days must pass since last donation. Next possible donation: ${nextPossibleDate.toISOString().split('T')[0]}`,
        nextPossibleDate,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  computeEligibility,
  validateDonorRegistration,
  calculateNextPossibleDate,
  daysSinceLastDonation,
  calculateAge,
  MIN_DONATION_INTERVAL_DAYS,
  MIN_DONOR_AGE,
};

