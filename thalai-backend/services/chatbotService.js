const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `You are ThalAI Guardian, a specialized AI assistant for Thalassemia patients and blood donors. 
Your goal is to provide accurate, empathetic, and helpful information about Thalassemia.

Guidelines:
1. Focus on Thalassemia management, diet, symptoms, and blood donation.
2. If asked about medical advice, always add a disclaimer: "Please consult with your hematologist for professional medical advice."
3. Be supportive and encouraging.
4. Keep responses concise and formatted with markdown if necessary.
5. If the user asks about something completely unrelated to health or this platform, politely bring them back to Thalassemia support.`;

/**
 * Chatbot Service - NLP-based responses for Thalassemia support
 */

const responses = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'start', 'greetings', 'who are you', 'how are you'],
    response: (name) => `Hello ${name}! I'm your ThalAI Guardian assistant. I'm here to support you as a member of our community.

How can I help you today?`,
  },
  thanks: {
    patterns: ['thanks', 'thank you', 'ok', 'alright', 'bye', 'goodbye', 'thx', 'thnk', 'tks', 'cool', 'great'],
    response: (name) => `You're very welcome, ${name}! If you have more questions later, I'm always here to help. Stay healthy! (⊙ˍ⊙)`,
  },
  appointment: {
    patterns: ['appointment', 'book', 'schedule', 'doctor', 'visit', 'checkup', 'consultation'],
    response: `You can schedule an appointment with a hematologist directly through ThalAI Guardian. 
    
This service is available for both Patients (for treatment) and Donors (for health clearance/consultation).

Steps:
1. Select "Book Appointment" from the suggestions below.
2. Choose your preferred doctor.
3. Select a date and time.
4. Confirm your booking.

Would you like to start the booking process now?`,
  },
  my_requests: {
    patterns: ['my requests', 'my status', 'check request', 'request history'],
    response: `You can view all your blood requests in the "Request History" section. 

Current counts: 
• Pending: Check dashboard
• Completed: Check history

Would you like to go to your request history?`,
  },
  thalassemia_info: {
    patterns: ['what is', 'thalassemia', 'definition', 'causes', 'inherited', 'genetic'],
    response: `Thalassemia is an inherited blood disorder where the body makes an abnormal form of hemoglobin. Hemoglobin is the protein in red blood cells that carries oxygen.

Key concepts:
• It's genetic (passed from parents to children)
• It leads to excessive red blood cell destruction
• Results in anemia (low red blood cell count)
• Two main types: Alpha and Beta Thalassemia`,
  },
  iron_overload: {
    patterns: ['iron', 'overload', 'chelation', 'ferritin', 'desferal', 'exjade', 'kelfer'],
    response: `Iron overload is a common complication for patients receiving regular transfusions.

Management:
• Chelation therapy helps remove excess iron
• Common drugs: Exjade, Desferal, Kelfer
• Monitor Serum Ferritin levels regularly
• Target Ferritin is usually < 1000 ng/mL`,
  },
  diet_advice: {
    patterns: ['diet', 'eat', 'food', 'nutrition', 'vitamin', 'avoid'],
    response: `Diet recommendations for Thalassemia:

Do's:
• Low-iron diet (if transfused regularly)
• Calcium-rich foods (dairy, almonds)
• Vitamin D and Folic acid supplements
• Stay hydrated

Don'ts:
• Avoid red meat and liver (high iron)
• Avoid iron-fortified cereals
• Limit Vitamin C during meals (enhances iron absorption)`,
  },
  transfusion_schedule: {
    patterns: [
      'transfusion',
      'schedule',
      'when',
      'how often',
      'frequency',
      'interval',
      'blood timing',
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
      'how to donate',
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
      'yellowish',
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
      'danger',
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
      'how to',
      'use',
      'guide',
      'tutorial',
      'support',
      'assistance',
      'how',
      'process',
      'steps',
      'work',
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
    response: `I'm not sure I fully understand that. However, I can help you with:

• Transfusion schedules
• Donor guidelines
• Thalassemia information
• Iron overload & Chelation
• Diet advice
• Symptoms information
• Emergency support

What would you like to know?`,
  },
};

/**
 * Detect intent from user message
 */
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Special handling for legacy/short words
  if (lowerMessage === 'how') return 'system_help';
  if (['thx', 'ok', 'bye'].includes(lowerMessage)) return 'thanks';

  // Check each intent
  for (const [intent, data] of Object.entries(responses)) {
    if (intent === 'general') continue;
    
    for (const pattern of data.patterns) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'i');
      if (regex.test(lowerMessage)) {
        return intent;
      }
    }
  }
  
  return 'general';
};

/**
 * Generate chatbot response
 */
const generateResponse = async (message, user = null) => {
  const intent = detectIntent(message);
  const responseData = responses[intent];
  const userName = user?.name ? user.name.split(' ')[0] : 'there';
  const role = user?.role;
  
  // Get base response (either string or from function)
  const baseResponse = typeof responseData.response === 'function' 
    ? responseData.response(userName) 
    : responseData.response;

  let response;
  let confidence = 0.85;

  // Use Gemini if available to provide a smarter, contextual response
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const prompt = `
User Context:
- Name: ${userName}
- Role: ${role || 'Visitor'}
- Message: "${message}"
- System Identified Intent: ${intent}
- Base Knowledge Point: "${baseResponse}"

${SYSTEM_PROMPT}

Your Task:
1. Provide a natural, empathetic response to the user's message.
2. Use the "Base Knowledge Point" as your factual source for Thalassemia-specific info.
3. If the user's question is specific (e.g., "what to avoid" in diet), focus your answer on those specific details while using the Base Knowledge as a guide.
4. Maintain a supportive tone.
5. If the identified intent is 'general', you have more freedom but stay within Thalassemia/Health bounds.
6. Keep your answer concise (under 150 words).
`;
      const result = await model.generateContent(prompt);
      response = result.response.text();
      confidence = 0.98;
    } catch (error) {
      console.error('Gemini API Error:', error);
      response = baseResponse;
      confidence = 0.5;
    }
  } else {
    // Fallback to static response if no API key
    response = baseResponse;
  }
  
  // Only add tip for relevant intents for patients/donors
  const tipIntents = ['thalassemia_info', 'symptoms', 'transfusion_schedule', 'emergency', 'general'];
  if (tipIntents.includes(intent)) {
    if (role === 'patient') {
      response += '\n\n💡 Tip: You can create a blood request from your dashboard.';
    } else if (role === 'donor') {
      response += '\n\n💡 Tip: Keep your availability status updated to help patients.';
    }
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
  
  if (intent === 'greetings' || intent === 'general') {
    recommendations.push({ text: 'Book Appointment', action: 'book_appointment' });
    recommendations.push({ text: 'What is Thalassemia?', action: 'message' });
    if (userRole === 'patient') {
      recommendations.push({ text: 'Create Request', action: 'create_request' });
    }
  }

  if (intent === 'appointment') {
    recommendations.push({ text: 'Book Appointment Now', action: 'book_appointment', type: 'action' });
    recommendations.push({ text: 'View My Appointments', action: 'view_appointments', type: 'action' });
  }

  if (intent === 'my_requests') {
    recommendations.push({ text: 'Go to Request History', action: 'history_redirect', type: 'action' });
  }

  if (intent === 'thalassemia_info') {
    recommendations.push({ text: 'Symptoms', action: 'message' });
    recommendations.push({ text: 'Diet Advice', action: 'message' });
  }

  if (intent === 'iron_overload') {
    recommendations.push({ text: 'Diet Advice', action: 'message' });
    recommendations.push({ text: 'Transfusion Info', action: 'message' });
  }

  if (intent === 'transfusion_schedule' && userRole === 'patient') {
    recommendations.push({
      type: 'action',
      text: 'Create Blood Request',
      action: 'create_request',
    });
    recommendations.push({ text: 'Diet Advice', action: 'message' });
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

/**
 * Get initial suggestions for new chat
 */
const getInitialSuggestions = (user) => {
  const userName = user?.name ? user.name.split(' ')[0] : 'there';
  const role = user?.role;

  const suggestions = [
    { text: `Hi ${userName}!`, action: 'message' },
    { text: 'What is Thalassemia?', action: 'message' },
  ];

  if (role === 'patient') {
    suggestions.push({ text: 'Book Appointment', action: 'message' });
    suggestions.push({ text: 'Create Blood Request', action: 'create_request' });
    suggestions.push({ text: 'My Requests', action: 'message' });
  } else if (role === 'donor') {
    suggestions.push({ text: 'Donate Blood', action: 'message' });
    suggestions.push({ text: 'Update Availability', action: 'update_availability' });
    suggestions.push({ text: 'Donor Guidelines', action: 'message' });
  } else {
    // Visitor or role not specified
    suggestions.push({ text: 'Book Appointment', action: 'message' });
  }

  return suggestions;
};

module.exports = {
  generateResponse,
  detectIntent,
  getRecommendations,
  getInitialSuggestions,
};

