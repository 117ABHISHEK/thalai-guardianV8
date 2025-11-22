import api from './auth';

// Find matching donors for a request
export const findMatches = async (requestId) => {
  try {
    const response = await api.post('/match/find', { requestId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to find matches' };
  }
};

// Get top matches for a request
export const getTopMatches = async (requestId) => {
  try {
    const response = await api.get(`/match/top?requestId=${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get matches' };
  }
};

