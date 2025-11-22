import api from './auth';

// Ask chatbot
export const askChatbot = async (message, sessionId) => {
  try {
    const response = await api.post('/chatbot/ask', { message, sessionId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get chatbot response' };
  }
};

// Get chat history
export const getChatHistory = async (sessionId, limit = 50) => {
  try {
    const response = await api.get(
      `/chatbot/history?sessionId=${sessionId}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get chat history' };
  }
};

