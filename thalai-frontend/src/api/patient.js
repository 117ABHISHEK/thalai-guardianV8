import api from './auth';

/**
 * Get current prediction status for logged-in patient
 */
export const getPredictionStatus = async () => {
  return await api.get('/auth/prediction-status');
};

/**
 * Manually trigger prediction update
 */
export const triggerPrediction = async () => {
  return await api.post('/auth/trigger-prediction');
};

/**
 * Update patient medical data via profile update
 */
export const updatePatientMedicalData = async (data) => {
  return await api.put('/auth/profile', data);
};
