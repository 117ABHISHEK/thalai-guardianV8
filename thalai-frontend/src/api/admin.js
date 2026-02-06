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

// Get AI service status
export const getAIStatus = async () => {
  try {
    const response = await api.get('/admin/ai-status');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch AI status' };
  }
};
// Get list of all users
export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

// Toggle user activity status (block/unblock)
export const toggleUserStatus = async (userId) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user status' };
  }
};

// Permanently delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};
