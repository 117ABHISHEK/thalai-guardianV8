const { GoogleGenerativeAI } = require("@google/generative-ai");
const Patient = require("../models/patientModel");
const Donor = require("../models/donorModel");
const { getPredictionStatus } = require("../utils/aiPrediction");

// Initialize Gemini
// Initialize at top-level but allow re-initialization if needed
let genAI;
let model;

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
    patterns: ['hi', 'hello', 'hey', 'start', 'greetings', 'who are you', 'how are you', 'helo', 'hii', 'hy'],
    response: (name) => `Hello ${name}! I'm your ThalAI Guardian assistant. I'm here to support you with any questions about Thalassemia or blood donation.
    
How can I help you today?`,
  },
  thanks: {
    patterns: ['thanks', 'thank you', 'ok', 'alright', 'bye', 'goodbye', 'thx', 'thnk', 'tks', 'cool', 'great', 'thanks for help'],
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
    patterns: ['thalassemia', 'definition', 'causes', 'inherited', 'genetic', 'it', 'condition'],
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
• View matches in "Request History" section
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
    response: `I'm here to support you with Thalassemia management and blood donation. 
    
It seems I didn't quite catch that. Could you try rephrasing or asking about:
• Thalassemia symptoms or schedules
• Donor guidelines & eligibility
• Diet and iron overload advice
• Emergency support`,
  },
};

/**
 * Detect intent from user message
 */
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Special handling for legacy/short words
  if (lowerMessage === 'how' || lowerMessage.includes('how to use')) return 'system_help';
  if (['thx', 'ok', 'bye'].includes(lowerMessage)) return 'thanks';

  // Specific check for info to avoid overriding casual questions
  if (lowerMessage.includes('what is thalassemia') || lowerMessage.includes('tell me about thalassemia')) return 'thalassemia_info';

  // Check each intent
  for (const [intent, data] of Object.entries(responses)) {
    if (intent === 'general' || intent === 'thalassemia_info') continue;
    
    for (const pattern of data.patterns) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'i');
      if (regex.test(lowerMessage)) {
        return intent;
      }
    }
  }

  // Fallback to thalassemia_info ONLY if keywords present (since it's the main topic)
  const thalassemiaKeywords = ['thalassemia', 'genetic', 'hemoglobin', 'inherited'];
  if (thalassemiaKeywords.some(k => lowerMessage.includes(k))) return 'thalassemia_info';
  
  return 'general';
};

/**
 * Generate chatbot response
 */
const generateResponse = async (message, user = null, history = []) => {
  const intent = detectIntent(message);
  const responseData = responses[intent];
  const userName = user?.name ? user.name.split(' ')[0] : 'there';
  const role = user?.role || 'Guest';
  
  // Get base response (either string or from function)
  let baseKnowledge = typeof responseData.response === 'function' 
    ? responseData.response(userName) 
    : responseData.response;

  // FETCH DYNAMIC CLINICAL DATA (THE "API" PART)
  let clinicalContext = "";
  if (user && user._id) {
    try {
      if (role.toLowerCase() === 'patient' && (intent === 'transfusion_schedule' || intent === 'general')) {
        const prediction = await getPredictionStatus(user._id);
        if (prediction.success && prediction.prediction.predictedDate) {
          clinicalContext += `\n- Next Transfusion Prediction (from AI Service): ${new Date(prediction.prediction.predictedDate).toDateString()}`;
          clinicalContext += `\n- Confidence: ${(prediction.prediction.confidence * 100).toFixed(0)}%`;
          clinicalContext += `\n- Urgency: ${prediction.prediction.urgency.toUpperCase()}`;
          clinicalContext += `\n- AI Explanation: ${prediction.prediction.explanation}`;
        }
      } else if (role.toLowerCase() === 'donor' && (intent === 'donor_guidelines' || intent === 'general')) {
        const donorData = await Donor.findOne({ user: user._id });
        if (donorData && donorData.lastDonationDate) {
          clinicalContext += `\n- User's Last Donation: ${new Date(donorData.lastDonationDate).toDateString()}`;
          if (donorData.nextPossibleDonationDate) {
            clinicalContext += `\n- Next Possible Donation Date: ${new Date(donorData.nextPossibleDonationDate).toDateString()}`;
            const eligible = donorData.nextPossibleDonationDate <= new Date() ? "Yes" : "No (Too soon)";
            clinicalContext += `\n- Eligible Today based on interval: ${eligible}`;
          }
        }
      }
    } catch (err) {
      console.error("Clinical context fetch error:", err);
    }
  }

  let response;
  let confidence = 0.85;

  // Use Gemini if available to provide a smarter, contextual response
  const rawApiKey = process.env.GEMINI_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : null;
  const isApiConfigured = apiKey && apiKey.length > 10 && apiKey !== 'your_gemini_api_key_here';

  if (!isApiConfigured) {
    console.log('🤖 Chatbot: Gemini API Key missing or too short. Key Start:', apiKey ? apiKey.substring(0, 4) : 'NULL');
  }

  if (isApiConfigured) {
    try {
      const axios = require('axios');
      if (!genAI) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        genAI = new GoogleGenerativeAI(apiKey);
        console.log(`🤖 Chatbot: SDK Initialized (Key: ${apiKey.substring(0, 8)}...)`);
        
        // Scout for allowed models to debug 404s
        try {
          const scout = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
          const models = scout.data.models ? scout.data.models.map(m => m.name.replace('models/', '')) : [];
          console.log('📡 [SCOUT] Models allowed for this key:', models.join(', '));
        } catch (sErr) {
          console.error('📡 [SCOUT] Failed to list models:', sErr.response?.data?.error?.message || sErr.message);
        }
      }

      // Dynamic Discovery: Use models found by Scout first
      let scoutedModelNames = [];
      try {
        const scout = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        scoutedModelNames = scout.data.models ? scout.data.models.map(m => m.name.replace('models/', '')) : [];
        if (scoutedModelNames.length > 0) {
          console.log(`📡 [DYNAMIC] Trying scouted models: ${scoutedModelNames.slice(0, 3).join(', ')}`);
        }
      } catch (e) {
        console.warn('Scout failed, using defaults.');
      }

      // Exhaustive list - Prioritizing models the Scout actually found
      const attempts = [];
      
      // Add scouted models to the top of the list
      scoutedModelNames.slice(0, 3).forEach(m => {
        attempts.push({ model: m, version: "v1" });
        attempts.push({ model: m, version: "v1beta" });
      });

      // Standard search if scout found nothing or top few fail
      attempts.push(
        { model: "gemini-2.0-flash", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-pro", version: "v1" }
      );
      
      let lastError = null;

      for (const attempt of attempts) {
        try {
          const currentModel = genAI.getGenerativeModel(
            { model: attempt.model },
            { apiVersion: attempt.version }
          );
          
          const historyContext = history.length > 0 
            ? history.map(h => `User: ${h.userMessage}\nAssistant: ${h.botResponse}`).join('\n')
            : 'No previous history in this session.';

          // If intent is general, don't force it to use the "didn't catch that" text as the source of truth
          const isGeneral = intent === 'general';
          const promptBaseInfo = isGeneral 
            ? "No specific thalassemia fact found for this query." 
            : `RELIABLE FACT: "${baseKnowledge}"`;

          const prompt = `
Context:
- Platform: ThalAI Guardian (Thalassemia Support Platform)
- User Name: ${userName}
- User Role: ${role}
- Identified Topic: ${intent.replace('_', ' ')}
- ${promptBaseInfo}
${clinicalContext ? `- USER CLINICAL DATA: ${clinicalContext}` : ""}

Recent History:
${historyContext}

Current Message: "${message}"

${SYSTEM_PROMPT}

Task:
1. If the message is a general query (like "what is a cat" or "who made you"), answer it directly but keep it brief.
2. If it's medical or platform-specific, use the "RELIABLE FACT" and platform context.
3. Be professional and empathetic.
`;
          const result = await currentModel.generateContent(prompt);
          response = result.response.text();
          confidence = 0.98;
          
          console.log(`✅ Chatbot Connected! Using ${attempt.model} (${attempt.version})`);
          break; 
        } catch (err) {
          lastError = err;
          console.warn(`⚠️ Attempt failed: ${attempt.model} on ${attempt.version}`);
          continue; 
        }
      }

      // --- PHASE 3: RAW HTTP FALLBACK (Only if Phase 2 failed) ---
      if (!response) {
        console.log('🔄 Chatbot: SDK failed. Attempting Raw HTTP Fallback...');
        
        for (const attempt of attempts) {
          try {
            const restUrl = `https://generativelanguage.googleapis.com/${attempt.version}/models/${attempt.model}:generateContent?key=${apiKey}`;
            
            const restPayload = {
              contents: [{
                parts: [{ text: `${SYSTEM_PROMPT}\n\nContext: ${baseKnowledge}\n\nUser: ${message}` }]
              }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
            };

            const restResponse = await axios.post(restUrl, restPayload);
            
            if (restResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
              response = restResponse.data.candidates[0].content.parts[0].text;
              confidence = 0.95;
              console.log(`🚀 [REST SUCCESS] Connected via Raw HTTP using ${attempt.model} (${attempt.version})`);
              break;
            }
          } catch (restErr) {
            console.warn(`❌ REST Attempt failed for ${attempt.model}:`, restErr.response?.data?.error?.message || restErr.message);
          }
        }
      }

      if (!response && lastError) throw lastError;

    } catch (error) {
      console.error('❌ Gemini Exhaustive Search Failed:', error.message);
      if (error.message.includes('404')) {
        console.error('🚨 [CRITICAL] 404 NOT FOUND: Your key is not authorized for Generative AI. PLEASE use AI Studio (aistudio.google.com).');
      }
      response = baseKnowledge;
      confidence = 0.5;
    }
  } else {
    response = baseKnowledge;
  }
  
  // Final polish - append context-aware tips if not already handled by AI
  if (response.length < 500 && !response.includes('💡 Tip')) {
    const tipIntents = ['thalassemia_info', 'symptoms', 'transfusion_schedule', 'emergency', 'general'];
    if (tipIntents.includes(intent)) {
      if (role.toLowerCase() === 'patient') {
        response += '\n\n💡 Tip: Check your dashboard for the latest blood request status.';
      } else if (role.toLowerCase() === 'donor') {
        response += '\n\n💡 Tip: Ensure your availability status is "Active" to receive matches.';
      }
    }
  }
  
  return {
    response,
    intent,
    confidence,
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

