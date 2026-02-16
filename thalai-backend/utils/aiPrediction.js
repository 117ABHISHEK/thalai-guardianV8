const axios = require('axios');
const Patient = require('../models/patientModel');
const User = require('../models/userModel');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const PREDICTION_TIMEOUT = 15000; // 15 seconds

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Trigger next transfusion prediction for a patient
 * @param {String} patientId - Patient MongoDB ID
 * @returns {Object} Prediction result with status
 */
const updateTransfusionPrediction = async (patientId) => {
  try {
    const patient = await Patient.findById(patientId).populate('user');
    
    if (!patient || !patient.user) {
      console.error('Patient or user not found for prediction');
      return { success: false, error: 'Patient not found' };
    }

    // Prepare data for AI service
    const transfusionHistory = patient.transfusionHistory || [];
    
    if (transfusionHistory.length === 0) {
      console.log('No transfusion history available for prediction');
      // Set a default prediction message
      patient.predictionExplanation = 'Add transfusion records to get AI-powered predictions';
      patient.predictionLastUpdated = new Date();
      await patient.save();
      return { success: false, error: 'No transfusion history' };
    }

    const requestData = {
      patientId: patientId.toString(),
      history: transfusionHistory.map(t => ({
        date: t.date instanceof Date ? t.date.toISOString().split('T')[0] : t.date,
        units: t.units || 1,
        hb_value: t.hb_value || patient.currentHb || 9.0
      })),
      lastHb: patient.currentHb || 9.0,
      ferritin: patient.medicalReports?.[0]?.ferritin || 1000,
      sgpt: patient.medicalReports?.[0]?.sgpt || 0,
      sgot: patient.medicalReports?.[0]?.sgot || 0,
      creatinine: patient.medicalReports?.[0]?.creatinine || 0,
      age: calculateAge(patient.user.dateOfBirth) || 25,
      weightKg: patient.weightKg || 50,
      thalassemiaType: patient.thalassemiaType || 'Beta Thalassemia Major',
      splenectomy: patient.splenectomy || false,
      comorbidities: patient.comorbidities?.map(c => c.condition) || [],
      currentDate: new Date().toISOString().split('T')[0]
    };

    console.log(`Requesting prediction for patient ${patientId}...`);

    // Call AI service with timeout and retry
    const response = await axios.post(
      `${AI_SERVICE_URL}/predict-next-transfusion`,
      requestData,
      { 
        timeout: PREDICTION_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data && response.data.predictedNextDate) {
      // Update patient record
      patient.predictedNextTransfusionDate = new Date(response.data.predictedNextDate);
      patient.predictionConfidence = response.data.confidence || 0.5;
      patient.predictionExplanation = response.data.explanation || 'Prediction based on transfusion history';
      patient.predictionUrgency = response.data.urgency || 'normal';
      patient.predictionLastUpdated = new Date();
      
      await patient.save();
      
      console.log(`✓ Prediction updated for patient ${patientId}: ${response.data.predictedNextDate}`);
      
      return {
        success: true,
        prediction: {
          predictedDate: response.data.predictedNextDate,
          confidence: response.data.confidence,
          explanation: response.data.explanation,
          method: response.data.method,
          urgency: response.data.urgency || 'normal'
        }
      };
    }

    return { success: false, error: 'Invalid response from AI service' };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('AI service is not running');
      return { success: false, error: 'AI service unavailable' };
    } else if (error.code === 'ETIMEDOUT') {
      console.error('AI service request timed out');
      return { success: false, error: 'Prediction timeout' };
    }
    const errorMessage = error.response?.data?.error || error.message;
    console.error('AI Prediction error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Get current prediction status for a patient
 */
const getPredictionStatus = async (patientId) => {
  try {
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return { success: false, error: 'Patient not found' };
    }

    return {
      success: true,
      prediction: {
        predictedDate: patient.predictedNextTransfusionDate,
        confidence: patient.predictionConfidence,
        explanation: patient.predictionExplanation,
        urgency: patient.predictionUrgency || 'normal',
        lastUpdated: patient.predictionLastUpdated
      }
    };
  } catch (error) {
    console.error('Get prediction status error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  updateTransfusionPrediction,
  getPredictionStatus
};
