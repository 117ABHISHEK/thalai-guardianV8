const Donor = require('../models/donorModel');
const User = require('../models/userModel');
const DonorHistory = require('../models/donorHistoryModel');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Calculate location score based on distance
 */
const calculateLocationScore = (donorLocation, requestLocation) => {
  if (!donorLocation || !requestLocation) {
    return 50; // Default score if location not available
  }

  // Simple city/state matching
  let score = 0;
  
  if (donorLocation.city && requestLocation.city) {
    if (donorLocation.city.toLowerCase() === requestLocation.city.toLowerCase()) {
      score += 40;
    } else if (donorLocation.state && requestLocation.state) {
      if (donorLocation.state.toLowerCase() === requestLocation.state.toLowerCase()) {
        score += 20;
      }
    }
  }

  // If same state, add base score
  if (donorLocation.state && requestLocation.state) {
    if (donorLocation.state.toLowerCase() === requestLocation.state.toLowerCase()) {
      score += 10;
    }
  }

  return Math.min(score, 50);
};

/**
 * Calculate availability score
 */
const calculateAvailabilityScore = (donor) => {
  let score = 0;

  if (donor.availabilityStatus) {
    score += 30;
  }

  if (donor.isVerified) {
    score += 20;
  }

  return score;
};

/**
 * Calculate donation frequency score
 */
const calculateDonationFrequencyScore = async (donorId) => {
  try {
    const histories = await DonorHistory.find({ donorId })
      .sort({ donationDate: -1 })
      .limit(10);

    if (histories.length === 0) {
      return 20; // New donor bonus
    }

    const totalDonations = histories.length;
    const now = new Date();
    const lastDonation = histories[0]?.donationDate;
    
    if (!lastDonation) {
      return 20;
    }

    const daysSinceLastDonation = Math.floor(
      (now - lastDonation) / (1000 * 60 * 60 * 24)
    );

    let score = 0;

    // Frequency score (more donations = higher score)
    score += Math.min(totalDonations * 2, 20);

    // Recency score (optimal gap is 56-90 days)
    if (daysSinceLastDonation >= 56 && daysSinceLastDonation <= 90) {
      score += 30; // Optimal window
    } else if (daysSinceLastDonation >= 30 && daysSinceLastDonation < 56) {
      score += 15; // Too soon but acceptable
    } else if (daysSinceLastDonation > 90 && daysSinceLastDonation <= 180) {
      score += 20; // Acceptable gap
    } else if (daysSinceLastDonation > 180) {
      score += 10; // Long gap
    }

    return Math.min(score, 50);
  } catch (error) {
    console.error('Error calculating donation frequency score:', error);
    return 15;
  }
};

/**
 * Get AI predicted availability score
 */
const getPredictedAvailability = async (donorId, donorData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/predict-availability`, {
      donorId: donorId.toString(),
      age: donorData.age || 30,
      donationFrequency: donorData.totalDonations || 0,
      lastDonationDate: donorData.lastDonationDate,
      region: donorData.region || 'unknown',
      healthFlags: donorData.healthFlags || [],
    }, {
      timeout: 5000,
    });

    return response.data.availabilityScore || 50;
  } catch (error) {
    console.error('AI service error:', error.message);
    // Fallback to default score
    return 50;
  }
};

/**
 * Check blood group compatibility
 */
const isBloodGroupCompatible = (donorGroup, patientGroup) => {
  const compatibility = {
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
  };

  return compatibility[donorGroup]?.includes(patientGroup) || false;
};

/**
 * Calculate urgency multiplier
 */
const getUrgencyMultiplier = (urgency) => {
  const multipliers = {
    critical: 1.5,
    high: 1.3,
    medium: 1.0,
    low: 0.8,
  };
  return multipliers[urgency] || 1.0;
};

/**
 * Main matching function
 */
const findMatchingDonors = async (request, options = {}) => {
  try {
    const {
      bloodGroup: patientBloodGroup,
      urgency,
      location: requestLocation,
      unitsRequired,
    } = request;

    // Find all verified donors
    const donors = await Donor.find({
      isVerified: true,
      availabilityStatus: true,
    }).populate('user', 'name email bloodGroup phone address dateOfBirth');

    // Filter compatible donors
    const compatibleDonors = donors.filter((donor) => {
      const donorBloodGroup = donor.user?.bloodGroup;
      return isBloodGroupCompatible(donorBloodGroup, patientBloodGroup);
    });

    if (compatibleDonors.length === 0) {
      return [];
    }

    // Calculate scores for each donor
    const scoredDonors = await Promise.all(
      compatibleDonors.map(async (donor) => {
        const donorUser = donor.user;
        const donorLocation = donorUser?.address || {};

        // Calculate individual scores
        const locationScore = calculateLocationScore(
          donorLocation,
          requestLocation
        );
        const availabilityScore = calculateAvailabilityScore(donor);
        const frequencyScore = await calculateDonationFrequencyScore(donor._id);

        // Get AI prediction
        const donorData = {
          age: donorUser?.dateOfBirth
            ? new Date().getFullYear() - new Date(donorUser.dateOfBirth).getFullYear()
            : 30,
          totalDonations: donor.totalDonations || 0,
          lastDonationDate: donor.lastDonationDate,
          region: donorLocation.state || 'unknown',
          healthFlags: [],
        };

        const aiScore = await getPredictedAvailability(donor._id, donorData);

        // Calculate total score
        const baseScore =
          locationScore * 0.3 +
          availabilityScore * 0.25 +
          frequencyScore * 0.25 +
          aiScore * 0.2;

        const urgencyMultiplier = getUrgencyMultiplier(urgency);
        const finalScore = Math.min(baseScore * urgencyMultiplier, 100);

        return {
          donorId: donor._id,
          donor: donorUser,
          donorProfile: donor,
          matchScore: Math.round(finalScore * 100) / 100,
          scoreBreakdown: {
            bloodGroupMatch: 100,
            locationScore: Math.round(locationScore * 100) / 100,
            availabilityScore: Math.round(availabilityScore * 100) / 100,
            donationFrequencyScore: Math.round(frequencyScore * 100) / 100,
            aiPredictionScore: Math.round(aiScore * 100) / 100,
          },
        };
      })
    );

    // Sort by score (highest first)
    scoredDonors.sort((a, b) => b.matchScore - a.matchScore);

    // Return top N donors (default 10)
    const limit = options.limit || 10;
    return scoredDonors.slice(0, limit);
  } catch (error) {
    console.error('Error in findMatchingDonors:', error);
    throw error;
  }
};

module.exports = {
  findMatchingDonors,
  getPredictedAvailability,
  calculateLocationScore,
  calculateAvailabilityScore,
  calculateDonationFrequencyScore,
  isBloodGroupCompatible,
};

