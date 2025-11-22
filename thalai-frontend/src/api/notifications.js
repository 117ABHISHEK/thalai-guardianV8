import api from './auth';

// Get user notifications
export const getNotifications = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notifications' };
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark as read' };
  }
};

// Send notification (Admin only)
export const sendNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications/send', notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send notification' };
  }
};

