# ThalAI Guardian - Modules 4-7 Documentation

## Overview
Complete documentation for advanced modules: Donor Matching & AI Prediction, e-RaktKosh Integration, Chatbot Support, and Notification System.

---

## MODULE 4: Donor Matching & AI Prediction

### Features
- Intelligent donor matching algorithm
- AI-powered availability prediction
- Scoring system with multiple factors
- Real-time match results

### Backend Files
- `models/donorHistoryModel.js` - Donation history tracking
- `models/matchLogModel.js` - Match logging
- `utils/donorMatching.js` - Matching algorithm
- `controllers/matchController.js` - Match endpoints
- `routes/matchRoutes.js` - Match routes

### AI Microservice (Python)
- `thalai-ai-service/app.py` - Flask API
- `thalai-ai-service/train_model.py` - Model training
- `thalai-ai-service/requirements.txt` - Dependencies

### API Endpoints
```
POST /api/match/find
GET  /api/match/top
```

### Matching Algorithm
1. **Blood Group Compatibility** - Checks compatibility matrix
2. **Location Score** - City/state matching (0-50 points)
3. **Availability Score** - Status and verification (0-50 points)
4. **Donation Frequency** - History-based scoring (0-50 points)
5. **AI Prediction** - ML model prediction (0-100 points)
6. **Urgency Multiplier** - Adjusts final score

### Setup AI Service
```bash
cd thalai-ai-service
pip install -r requirements.txt
python train_model.py
python app.py
```

---

## MODULE 5: e-RaktKosh Integration

### Features
- External API integration
- Unified donor data format
- Merged search results

### Backend Files
- `services/eraktService.js` - Integration service
- `controllers/externalController.js` - External endpoints
- `routes/externalRoutes.js` - External routes

### API Endpoints
```
GET  /api/external/eraktkosh/search
POST /api/external/merge
```

### Configuration
```env
ERAKTKOSH_API_URL=https://api.eraktkosh.in/api
ERAKTKOSH_API_KEY=your_api_key
```

---

## MODULE 6: Chatbot Support

### Features
- NLP-based responses
- Intent detection
- Contextual recommendations
- Conversation logging

### Backend Files
- `models/chatbotLogModel.js` - Conversation logs
- `services/chatbotService.js` - Chatbot logic
- `controllers/chatbotController.js` - Chatbot endpoints
- `routes/chatbotRoutes.js` - Chatbot routes

### Frontend Files
- `components/ChatbotWidget.jsx` - Floating chatbot UI
- `api/chatbot.js` - Chatbot API

### API Endpoints
```
POST /api/chatbot/ask
GET  /api/chatbot/history
```

### Supported Intents
- `transfusion_schedule` - Transfusion information
- `donor_guidelines` - Donor eligibility
- `symptoms` - Symptom information
- `emergency` - Emergency support
- `system_help` - System usage help
- `general` - General queries

---

## MODULE 7: Notification System (Twilio)

### Features
- SMS notifications via Twilio
- Automatic triggers
- Notification logging
- Multi-channel support

### Backend Files
- `models/notificationModel.js` - Notification logs
- `services/notificationService.js` - Twilio integration
- `controllers/notificationController.js` - Notification endpoints
- `routes/notificationRoutes.js` - Notification routes

### Frontend Files
- `api/notifications.js` - Notification API

### API Endpoints
```
POST /api/notifications/send (Admin)
GET  /api/notifications
PUT  /api/notifications/:id/read
```

### Notification Types
- `donor_match` - New match found
- `request_approved` - Request approved
- `request_status_update` - Status changed
- `urgent_request` - Urgent request broadcast
- `admin_alert` - Admin notifications
- `system` - System notifications

### Configuration
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Automatic Triggers
- Donor match found → SMS to top 3 donors
- Request status update → SMS to patient
- Urgent request → Broadcast to nearby donors
- Admin alerts → SMS to all admins

---

## Frontend Components

### DonorMatchResults.jsx
- Displays matched donors with scores
- Score breakdown visualization
- Contact information
- Real-time updates

### ChatbotWidget.jsx
- Floating chat button
- Real-time messaging
- Typing indicators
- Recommendation buttons
- Chat history

### Integration
- Added to `App.jsx` for global access
- Integrated with PatientRequestHistory
- Route: `/matches/:requestId`

---

## Environment Variables

### Backend (.env)
```env
# Existing
MONGODB_URI=mongodb://localhost:27017/thalai-guardian
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000

# Module 4 - AI Service
AI_SERVICE_URL=http://localhost:5001

# Module 5 - e-RaktKosh
ERAKTKOSH_API_URL=https://api.eraktkosh.in/api
ERAKTKOSH_API_KEY=your_api_key

# Module 7 - Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### AI Service (.env)
```env
PORT=5001
```

---

## Installation & Setup

### Backend Dependencies
```bash
cd thalai-backend
npm install
```

New packages:
- `axios` - HTTP client
- `twilio` - SMS service
- `uuid` - Session IDs

### AI Service Setup
```bash
cd thalai-ai-service
pip install -r requirements.txt
python train_model.py  # Train model
python app.py          # Start service
```

### Frontend
No new dependencies required.

---

## Testing

### Postman Collection
See `thalai-backend/POSTMAN_COLLECTION.md` for updated endpoints.

### Test Scenarios

1. **Donor Matching**
   - Create a blood request
   - Call `/api/match/find`
   - Verify matches and scores

2. **Chatbot**
   - Send message to `/api/chatbot/ask`
   - Check intent detection
   - Verify recommendations

3. **Notifications**
   - Trigger match → Check SMS sent
   - Verify notification logs

4. **e-RaktKosh**
   - Search external donors
   - Merge with internal results

---

## File Structure

### Backend
```
thalai-backend/
├── models/
│   ├── donorHistoryModel.js
│   ├── matchLogModel.js
│   ├── chatbotLogModel.js
│   └── notificationModel.js
├── services/
│   ├── eraktService.js
│   ├── chatbotService.js
│   └── notificationService.js
├── controllers/
│   ├── matchController.js
│   ├── externalController.js
│   ├── chatbotController.js
│   └── notificationController.js
├── routes/
│   ├── matchRoutes.js
│   ├── externalRoutes.js
│   ├── chatbotRoutes.js
│   └── notificationRoutes.js
└── utils/
    └── donorMatching.js
```

### AI Service
```
thalai-ai-service/
├── app.py
├── train_model.py
├── requirements.txt
├── models/
│   ├── availability_model.pkl
│   └── scaler.pkl
└── README.md
```

### Frontend
```
thalai-frontend/src/
├── components/
│   └── ChatbotWidget.jsx
├── pages/
│   └── DonorMatchResults.jsx
└── api/
    ├── match.js
    ├── chatbot.js
    └── notifications.js
```

---

## Production Deployment

### AI Service
```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

### Backend
- Ensure all environment variables set
- Configure Twilio credentials
- Set AI service URL
- Enable e-RaktKosh API key

### Frontend
- Build: `npm run build`
- Deploy static files
- Configure API URLs

---

## Troubleshooting

### AI Service Not Responding
- Check if service is running on port 5001
- Verify model files exist
- Check logs for errors

### Twilio SMS Not Sending
- Verify credentials in .env
- Check phone number format
- Verify Twilio account balance

### Matching Not Working
- Ensure donors are verified
- Check blood group compatibility
- Verify location data

---

## Support

For issues or questions:
- Check individual module documentation
- Review API documentation
- Check error logs
- Verify environment variables

