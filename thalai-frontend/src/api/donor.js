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

