import api from './auth';

export const getDoctorStats = async () => {
  return await api.get('/doctor/dashboard/stats');
};

export const getAssignedPatients = async () => {
  return await api.get('/doctor/patients');
};

export const getPatientDetails = async (patientId) => {
  return await api.get(`/doctor/patients/${patientId}`);
};

export const updatePatientNotes = async (patientId, notes) => {
  return await api.put(`/doctor/patients/${patientId}/notes`, { notes });
};

export const updatePatientMedicalData = async (patientId, data) => {
  return await api.put(`/doctor/patients/${patientId}/medical-data`, data);
};

export const getDoctorProfile = async () => {
  return await api.get('/doctor/profile');
};
