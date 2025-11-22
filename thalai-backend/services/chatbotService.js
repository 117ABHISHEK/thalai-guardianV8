/**
 * Chatbot Service - NLP-based responses for Thalassemia support
 */

const responses = {
  transfusion_schedule: {
    patterns: [
      'transfusion',
      'schedule',
      'when',
      'how often',
      'frequency',
      'interval',
    ],
    response: `Thalassemia patients typically need blood transfusions every 2-4 weeks, depending on their condition. 

Key points:
• Regular transfusions help maintain hemoglobin levels
• Schedule is determined by your hematologist
• Pre-transfusion hemoglobin should be 9-10.5 g/dL
• Post-transfusion target is 12-14 g/dL

Please consult your doctor for your specific schedule.`,
  },
  donor_guidelines: {
    patterns: [
      'donor',
      'donate',
      'eligibility',
      'requirements',
      'who can',
      'guidelines',
    ],
    response: `Blood Donor Eligibility Guidelines:

Age: 18-65 years
Weight: Minimum 45 kg
Hemoglobin: Minimum 12.5 g/dL (women) or 13.5 g/dL (men)
Health: Good general health, no recent illness
Interval: Minimum 56 days between donations

You cannot donate if:
• Pregnant or recently gave birth
• Have certain medical conditions
• Taking certain medications
• Recent travel to malaria-endemic areas

For detailed guidelines, visit your nearest blood bank.`,
  },
  symptoms: {
    patterns: [
      'symptom',
      'sign',
      'feel',
      'pain',
      'tired',
      'weak',
      'dizzy',
      'pale',
    ],
    response: `Common Thalassemia Symptoms:

Mild to Moderate:
• Fatigue and weakness
• Pale or yellowish skin
• Slow growth in children
• Dark urine

Severe (Beta Thalassemia Major):
• Severe anemia
• Enlarged spleen
• Bone deformities
• Delayed growth

If you experience severe symptoms, contact your doctor immediately.`,
  },
  emergency: {
    patterns: [
      'emergency',
      'urgent',
      'help',
      'critical',
      'immediate',
      'now',
      'asap',
    ],
    response: `🚨 EMERGENCY SUPPORT:

If you're experiencing:
• Severe shortness of breath
• Chest pain
• Very low energy
• Fainting or dizziness
• Severe pain

IMMEDIATE ACTIONS:
1. Call emergency services: 108 or 102
2. Contact your hematologist
3. Go to nearest hospital emergency
4. Inform them about your thalassemia condition

For blood requirement, create an urgent request on ThalAI Guardian.`,
  },
  system_help: {
    patterns: [
      'help',
      'how to',
      'use',
      'guide',
      'tutorial',
      'support',
      'assistance',
    ],
    response: `ThalAI Guardian System Help:

📋 CREATE REQUEST:
1. Go to "Create Request" tab
2. Fill in blood group, units needed
3. Add location and urgency level
4. Submit request

🔍 FIND DONORS:
• System automatically matches donors
• View matches in "Request History"
• Top matches are notified automatically

👤 FOR DONORS:
• Update availability status
• Set last donation date
• Get matched with requests

💬 CHATBOT:
• Ask about transfusion schedules
• Get donor guidelines
• Learn about symptoms
• Emergency support

Need more help? Contact admin support.`,
  },
  general: {
    patterns: [],
    response: `Hello! I'm the ThalAI Guardian chatbot. I can help you with:

• Transfusion schedules
• Donor guidelines
• Symptoms information
• Emergency support
• System usage help

What would you like to know?`,
  },
};

/**
 * Detect intent from user message
 */
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check each intent
  for (const [intent, data] of Object.entries(responses)) {
    if (intent === 'general') continue;
    
    for (const pattern of data.patterns) {
      if (lowerMessage.includes(pattern)) {
        return intent;
      }
    }
  }
  
  return 'general';
};

/**
 * Generate chatbot response
 */
const generateResponse = (message, userId = null, userRole = null) => {
  const intent = detectIntent(message);
  const responseData = responses[intent];
  
  let response = responseData.response;
  
  // Add role-specific information
  if (userRole === 'patient') {
    response += '\n\n💡 Tip: You can create a blood request from your dashboard.';
  } else if (userRole === 'donor') {
    response += '\n\n💡 Tip: Keep your availability status updated to help patients.';
  }
  
  return {
    response,
    intent,
    confidence: 0.85,
  };
};

/**
 * Get contextual recommendations
 */
const getRecommendations = (intent, userRole) => {
  const recommendations = [];
  
  if (intent === 'transfusion_schedule' && userRole === 'patient') {
    recommendations.push({
      type: 'action',
      text: 'Create Blood Request',
      action: 'create_request',
    });
  }
  
  if (intent === 'donor_guidelines' && userRole === 'donor') {
    recommendations.push({
      type: 'action',
      text: 'Update Availability',
      action: 'update_availability',
    });
  }
  
  if (intent === 'emergency') {
    recommendations.push({
      type: 'action',
      text: 'Create Urgent Request',
      action: 'create_urgent_request',
    });
  }
  
  return recommendations;
};

module.exports = {
  generateResponse,
  detectIntent,
  getRecommendations,
};

