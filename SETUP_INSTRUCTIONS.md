# ThalAI Guardian - Complete Setup Instructions

## Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Python 3.8+ (for AI service)
- Twilio account (for SMS)
- e-RaktKosh API key (optional)

---

## Step 1: Backend Setup

```bash
cd thalai-backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/thalai-guardian
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_in_production
FRONTEND_URL=http://localhost:3000

# Module 4 - AI Service
AI_SERVICE_URL=http://localhost:5001

# Module 5 - e-RaktKosh (Optional)
ERAKTKOSH_API_URL=https://api.eraktkosh.in/api
ERAKTKOSH_API_KEY=your_api_key

# Module 7 - Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

Start backend:
```bash
npm run dev
```

---

## Step 2: AI Service Setup

```bash
cd thalai-ai-service
pip install -r requirements.txt
```

Train the model:
```bash
python train_model.py
```

Start AI service:
```bash
python app.py
# Or with Gunicorn:
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

---

## Step 3: Frontend Setup

```bash
cd thalai-frontend
npm install
npm start
```

---

## Step 4: Verify Installation

1. **Backend**: http://localhost:5000/api/health
2. **AI Service**: http://localhost:5001/health
3. **Frontend**: http://localhost:3000

---

## Testing the System

### 1. Register Users
- Register as Patient
- Register as Donor
- Register as Admin

### 2. Test Donor Matching
- Create a blood request
- Click "Find Matches"
- View match results

### 3. Test Chatbot
- Click chatbot button (bottom right)
- Ask questions
- Check responses

### 4. Test Notifications
- Create urgent request
- Verify SMS sent to donors
- Check notification logs

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string
- Verify database name

### AI Service Not Responding
- Check if service is running on port 5001
- Verify model files exist in `models/` folder
- Check Python dependencies

### Twilio SMS Not Sending
- Verify credentials in .env
- Check phone number format (+country code)
- Verify Twilio account balance

### Frontend Not Loading
- Check if backend is running
- Verify API URL in frontend
- Check browser console for errors

---

## Production Deployment

See `PRODUCTION_CHECKLIST.md` for complete deployment guide.

---

## Support

- Documentation: See `MODULES_4-7_DOCUMENTATION.md`
- API Guide: See `POSTMAN_COLLECTION_UPDATED.md`
- File Structure: See `COMPLETE_FILE_TREE.md`

