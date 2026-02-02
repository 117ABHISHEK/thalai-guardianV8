import api from './auth';

// Get donor availability
export const getDonorAvailability = async () => {
  try {
    const response = await api.get('/donors/availability');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch availability' };
  }
};

// Update donor availability
export const updateDonorAvailability = async (availabilityData) => {
  try {
    const response = await api.post('/donors/availability', availabilityData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update availability' };
  }
};

// Get donor profile with eligibility information
export const getDonorProfile = async () => {
  try {
    const response = await api.get('/donors/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch donor profile' };
  }
};
// Get donor matches (requests that donor has been matched with)
export const getMyMatches = async () => {
  try {
    const response = await api.get('/match/my-matches');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch matches' };
  }
};

// Update match status (accept/reject)
export const updateMatchStatus = async (matchId, statusData) => {
  try {
    const response = await api.put(`/match/status/${matchId}`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update match status' };
  }
};

// Update donor health data via profile update
export const updateDonorHealthData = async (data) => {
  try {
    const response = await api.put('/auth/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update health data' };
  }
};
