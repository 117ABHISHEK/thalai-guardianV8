const axios = require('axios');

const ERAKTKOSH_API_URL = process.env.ERAKTKOSH_API_URL || 'https://api.eraktkosh.in/api';
const ERAKTKOSH_API_KEY = process.env.ERAKTKOSH_API_KEY || '';

/**
 * Search for blood availability on e-RaktKosh
 */
const searchBloodAvailability = async (bloodGroup, location = {}) => {
  try {
    // Note: This is a placeholder implementation
    // Replace with actual e-RaktKosh API endpoint and authentication
    
    const response = await axios.get(`${ERAKTKOSH_API_URL}/blood/search`, {
      params: {
        bloodGroup,
        state: location.state,
        city: location.city,
        district: location.district,
      },
      headers: {
        'Authorization': `Bearer ${ERAKTKOSH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Transform e-RaktKosh response to unified format
    const donors = response.data.data?.donors || response.data || [];
    
    return donors.map((donor) => ({
      source: 'eraktkosh',
      name: donor.name || donor.donorName || 'Anonymous',
      bloodGroup: donor.bloodGroup || bloodGroup,
      location: {
        hospital: donor.hospital || donor.centerName,
        city: donor.city || location.city,
        state: donor.state || location.state,
        district: donor.district || location.district,
      },
      contact: {
        phone: donor.phone || donor.contactNumber,
        email: donor.email,
      },
      availability: donor.availability || true,
      lastUpdated: donor.lastUpdated || new Date(),
      unitsAvailable: donor.unitsAvailable || 1,
    }));
  } catch (error) {
    console.error('e-RaktKosh API error:', error.message);
    
    // Return mock data for development/testing
    if (process.env.NODE_ENV === 'development') {
      return getMockERaktKoshData(bloodGroup, location);
    }
    
    return [];
  }
};

/**
 * Mock data for development (remove in production)
 */
const getMockERaktKoshData = (bloodGroup, location) => {
  return [
    {
      source: 'eraktkosh',
      name: 'City Blood Bank',
      bloodGroup,
      location: {
        hospital: 'City General Hospital',
        city: location.city || 'Mumbai',
        state: location.state || 'Maharashtra',
      },
      contact: {
        phone: '+91-XXXXX-XXXXX',
      },
      availability: true,
      lastUpdated: new Date(),
      unitsAvailable: 5,
    },
    {
      source: 'eraktkosh',
      name: 'Regional Blood Center',
      bloodGroup,
      location: {
        hospital: 'Regional Medical Center',
        city: location.city || 'Mumbai',
        state: location.state || 'Maharashtra',
      },
      contact: {
        phone: '+91-XXXXX-XXXXX',
      },
      availability: true,
      lastUpdated: new Date(),
      unitsAvailable: 3,
    },
  ];
};

/**
 * Merge e-RaktKosh donors with internal matches
 */
const mergeDonorResults = (internalMatches, eraktkoshDonors) => {
  const merged = [...internalMatches];
  
  // Add e-RaktKosh donors with lower priority scores
  eraktkoshDonors.forEach((donor, index) => {
    merged.push({
      source: 'external',
      donor: {
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        phone: donor.contact?.phone,
      },
      location: donor.location,
      matchScore: 60 - (index * 5), // Lower scores for external
      scoreBreakdown: {
        bloodGroupMatch: 100,
        locationScore: 30,
        availabilityScore: 50,
        donationFrequencyScore: 0,
        aiPredictionScore: 0,
        externalSource: true,
      },
      externalData: donor,
    });
  });
  
  // Sort by match score
  merged.sort((a, b) => b.matchScore - a.matchScore);
  
  return merged;
};

module.exports = {
  searchBloodAvailability,
  mergeDonorResults,
};

