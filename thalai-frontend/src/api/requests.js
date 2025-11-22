import api from './auth';

// Create a new blood request
export const createRequest = async (requestData) => {
  try {
    const response = await api.post('/requests', requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create request' };
  }
};

// Get all requests for a user
export const getUserRequests = async (userId) => {
  try {
    const response = await api.get(`/requests/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch requests' };
  }
};

// Get all requests (Admin)
export const getAllRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
    if (filters.urgency) params.append('urgency', filters.urgency);

    const queryString = params.toString();
    const url = `/requests${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch requests' };
  }
};

// Get a single request by ID
export const getRequestById = async (requestId) => {
  try {
    const response = await api.get(`/requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch request' };
  }
};

// Cancel a request
export const cancelRequest = async (requestId) => {
  try {
    const response = await api.put(`/requests/${requestId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel request' };
  }
};

