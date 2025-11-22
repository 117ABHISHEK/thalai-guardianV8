import api from './auth';

// Get public statistics
export const getPublicStats = async () => {
  try {
    const response = await api.get('/public/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch stats' };
  }
};

// Get public donors preview
export const getPublicDonors = async (limit = 5) => {
  try {
    const response = await api.get(`/public/donors?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch donors' };
  }
};

// Get public requests preview
export const getPublicRequests = async () => {
  try {
    const response = await api.get('/public/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch requests' };
  }
};

