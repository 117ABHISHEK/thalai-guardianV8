import api from './auth';

// Get list of all donors
export const getDonors = async () => {
  try {
    const response = await api.get('/admin/donors');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch donors' };
  }
};

// Verify a donor
export const verifyDonor = async (donorId) => {
  try {
    const response = await api.post('/admin/donors/verify', { donorId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to verify donor' };
  }
};

// Get system statistics
export const getStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch statistics' };
  }
};

