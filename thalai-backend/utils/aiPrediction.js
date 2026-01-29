const axios = require('axios');
const Patient = require('../models/patientModel');
const User = require('../models/userModel');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Trigger next transfusion prediction for a patient
 */
const updateTransfusionPrediction = async (patientId) => {
  try {
    const patient = await Patient.findById(patientId).populate('user');
    if (!patient) return null;

    const user = patient.user;
    if (!user) return null;

    // Prepare history data
    const history = patient.transfusionHistory.map(h => ({
      date: h.date.toISOString().split('T')[0],
      units: h.units,
      hb_value: h.hb_value
    }));

    // If no history, we can't predict much
    if (history.length === 0) return null;

    // Get latest medical report values if available
    const latestReport = patient.medicalReports && patient.medicalReports.length > 0
      ? patient.medicalReports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))[0]
      : {};

    const payload = {
      patientId: patient._id.toString(),
      history: history,
      lastHb: patient.currentHb || (history.length > 0 ? history[history.length - 1].hb_value : 9.0),
      age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 25,
      weightKg: patient.weightKg || latestReport.weightKg || 50,
      comorbidities: patient.comorbidities.map(c => c.condition),
      currentDate: new Date().toISOString().split('T')[0],
      ferritin: latestReport.ferritin,
      sgpt: latestReport.sgpt,
      sgot: latestReport.sgot,
      creatinine: latestReport.creatinine
    };

    const response = await axios.post(`${AI_SERVICE_URL}/predict-next-transfusion`, payload, {
      timeout: 5000
    });

    if (response.data && response.data.predictedNextDate) {
      patient.predictedNextTransfusionDate = new Date(response.data.predictedNextDate);
      patient.predictionConfidence = response.data.confidence;
      patient.predictionExplanation = response.data.explanation;
      patient.predictionLastUpdated = new Date();
      
      await patient.save();
      return patient;
    }

    return null;
  } catch (error) {
    console.error('Error updating transfusion prediction:', error.message);
    return null;
  }
};

module.exports = {
  updateTransfusionPrediction
};
