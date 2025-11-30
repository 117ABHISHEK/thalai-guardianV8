# ThalAI Guardian - Complete File Tree

## Backend Structure

```
thalai-backend/
│
├── config/
│   └── db.js                          # MongoDB connection
│
├── controllers/
│   ├── adminController.js             # Admin operations
│   ├── authController.js              # Authentication
│   ├── donorController.js            # Donor management
│   ├── requestController.js           # Request management
│   ├── matchController.js            # Donor matching (Module 4)
│   ├── externalController.js         # e-RaktKosh integration (Module 5)
│   ├── chatbotController.js          # Chatbot (Module 6)
│   └── notificationController.js     # Notifications (Module 7)
│
├── middleware/
│   ├── authMiddleware.js             # JWT authentication
│   ├── roleMiddleware.js             # RBAC
│   └── errorHandler.js               # Global error handling
│
├── models/
│   ├── userModel.js                   # User schema
│   ├── donorModel.js                  # Donor schema
│   ├── requestModel.js                # Request schema
│   ├── donorHistoryModel.js          # Donation history (Module 4)
│   ├── matchLogModel.js              # Match logs (Module 4)
│   ├── chatbotLogModel.js            # Chat logs (Module 6)
│   └── notificationModel.js          # Notification logs (Module 7)
│
├── routes/
│   ├── authRoutes.js                  # Auth endpoints
│   ├── adminRoutes.js                 # Admin endpoints
│   ├── donorRoutes.js                 # Donor endpoints
│   ├── requestRoutes.js               # Request endpoints
│   ├── matchRoutes.js                # Matching endpoints (Module 4)
│   ├── externalRoutes.js             # External API (Module 5)
│   ├── chatbotRoutes.js              # Chatbot endpoints (Module 6)
│   └── notificationRoutes.js         # Notification endpoints (Module 7)
│
├── services/
│   ├── eraktService.js               # e-RaktKosh service (Module 5)
│   ├── chatbotService.js             # Chatbot logic (Module 6)
│   └── notificationService.js        # Twilio service (Module 7)
│
├── utils/
│   └── donorMatching.js              # Matching algorithm (Module 4)
│
├── .env                               # Environment variables
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
├── package.json                       # Dependencies
├── server.js                          # Express server
├── README.md                          # Backend README
├── API_DOCUMENTATION.md               # API docs
├── FILE_TREE.md                       # File structure
├── POSTMAN_COLLECTION.md             # Postman guide
├── MODULE2_DOCUMENTATION.md          # Module 2 docs
└── MODULE3_DOCUMENTATION.md          # Module 3 docs
```

## AI Service Structure

```
thalai-ai-service/
│
├── app.py                             # Flask API server
├── train_model.py                     # Model training script
├── requirements.txt                   # Python dependencies
├── README.md                          # AI service README
└── models/                            # Trained models
    ├── availability_model.pkl        # ML model
    └── scaler.pkl                    # Feature scaler
```

## Frontend Structure

```
thalai-frontend/
│
├── public/                            # Static assets
│
├── src/
│   ├── api/
│   │   ├── auth.js                    # Auth API
│   │   ├── admin.js                   # Admin API
│   │   ├── donor.js                   # Donor API
│   │   ├── requests.js                # Request API
│   │   ├── match.js                   # Matching API (Module 4)
│   │   ├── chatbot.js                 # Chatbot API (Module 6)
│   │   └── notifications.js           # Notification API (Module 7)
│   │
│   ├── components/
│   │   ├── Navigation.jsx             # Navigation bar
│   │   ├── ProtectedRoute.jsx         # Route protection
│   │   ├── StatsCharts.jsx            # Admin charts
│   │   └── ChatbotWidget.jsx         # Chatbot UI (Module 6)
│   │
│   ├── context/
│   │   └── AuthContext.jsx            # Auth context
│   │
│   ├── hooks/                         # Custom hooks
│   │
│   ├── pages/
│   │   ├── Login.jsx                  # Login page
│   │   ├── Register.jsx               # Registration
│   │   ├── PatientDashboard.jsx      # Patient dashboard
│   │   ├── DonorDashboard.jsx        # Donor dashboard
│   │   ├── AdminDashboard.jsx         # Admin dashboard
│   │   ├── PatientRequestForm.jsx    # Create request
│   │   ├── PatientRequestHistory.jsx # Request history
│   │   ├── AdminRequestManager.jsx   # Admin requests
│   │   ├── DonorVerification.jsx     # Donor verification
│   │   └── DonorMatchResults.jsx     # Match results (Module 4)
│   │
│   ├── App.jsx                        # Main app component
│   ├── main.jsx                       # React entry point
│   └── index.css                     # Global styles
│
├── .env                               # Environment variables
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore
├── index.html                         # HTML template
├── package.json                       # Dependencies
├── vite.config.js                     # Vite config
├── README.md                          # Frontend README
└── FILE_TREE.md                       # File structure
```

## Root Structure

```
thalai-guardianV8/
│
├── thalai-backend/                    # Backend application
├── thalai-frontend/                   # Frontend application
├── thalai-ai-service/                 # AI microservice (Module 4)
├── README.md                          # Project README
├── INTEGRATION_GUIDE.md               # Integration guide
├── FINAL_SUMMARY.md                   # Project summary
├── PRODUCTION_CHECKLIST.md            # Production checklist
└── MODULES_4-7_DOCUMENTATION.md       # Modules 4-7 docs
```

## Module Breakdown

### Module 1: User Management
- Models: userModel, donorModel
- Controllers: authController, donorController
- Routes: authRoutes, donorRoutes

### Module 2: Admin & Analytics
- Controllers: adminController
- Routes: adminRoutes
- Components: StatsCharts

### Module 3: Blood Requests
- Models: requestModel
- Controllers: requestController
- Routes: requestRoutes
- Pages: PatientRequestForm, PatientRequestHistory, AdminRequestManager

### Module 4: Donor Matching & AI
- Models: donorHistoryModel, matchLogModel
- Controllers: matchController
- Routes: matchRoutes
- Services: AI microservice (Python)
- Utils: donorMatching.js
- Pages: DonorMatchResults

### Module 5: e-RaktKosh Integration
- Services: eraktService.js
- Controllers: externalController.js
- Routes: externalRoutes.js

### Module 6: Chatbot
- Models: chatbotLogModel
- Services: chatbotService.js
- Controllers: chatbotController.js
- Routes: chatbotRoutes.js
- Components: ChatbotWidget.jsx
- API: chatbot.js

### Module 7: Notifications
- Models: notificationModel
- Services: notificationService.js
- Controllers: notificationController.js
- Routes: notificationRoutes.js
- API: notifications.js

## Total File Count

- Backend: ~30 files
- Frontend: ~20 files
- AI Service: 4 files
- Documentation: 10+ files

## Dependencies Summary

### Backend
- express, mongoose, cors, dotenv
- jsonwebtoken, bcryptjs
- axios, twilio, uuid

### Frontend
- react, react-dom, react-router-dom
- axios, recharts

### AI Service
- Flask, flask-cors
- numpy, pandas, scikit-learn
- gunicorn

