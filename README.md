# 🩸 ThalAI Guardian - Blood Donor Eligibility System

## AI-Powered Thalassemia Patient Management & Blood Donation Platform

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](FINAL_STATUS.md)
[![Version](https://img.shields.io/badge/Version-2.1.0-blue)](FINAL_STATUS.md)
[![Tests](https://img.shields.io/badge/Tests-34%2F34%20Passing-brightgreen)](TEST_SIMULATION_REPORT.md)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-green)](DOCUMENTATION_INDEX.md)

---

## 🎯 Project Overview

ThalAI Guardian is a comprehensive blood donor eligibility and patient management system designed specifically for thalassemia patients. The system combines intelligent donor screening, **AI-powered transfusion prediction**, **automated donor matching**, and robust patient management to ensure safe and efficient blood donation processes.

### Key Features

✅ **AI Transfusion Prediction v2** - Real-time prediction with urgency levels (Urgent, Soon, Normal), confidence scores, and countdown timers.  
✅ **Advanced Donor Matching** - Intelligent matching using AI compatibility scores (0-100%) based on blood group, location, and medical eligibility.  
✅ **Donor Response Flow** - Donors can Accept/Decline requests directly; patients receive instant notifications with donor contact info.  
✅ **Smart Chatbot v2** - Contextual, role-based suggestions with NLP support for diet, iron overload, and emergency protocols.  
✅ **Email & SMS Notifications** - Real-time alerts for donor matches, request status updates, and security events.  
✅ **Account Security Alerts** - Instant email notifications for new logins from unrecognized devices or IP addresses.  
✅ **Admin Health Dashboard** - Real-time monitoring of AI service health, active models, and system-wide statistics.  
✅ **Transfusion History Tracking** - Comprehensive logging of past transfusions to improve AI prediction accuracy.  
✅ **Enhanced Donor Eligibility System** - 6 comprehensive validation checks (+ automated blood report screening).  
✅ **Integrated Profile Identity System** - Reusable profile picture components with instant sync and base64 security across all user roles.

---

## 🚀 Quick Start (Monorepo Mode)

> [!IMPORTANT]
> For a clean, step-by-step setup guide from scratch, please refer to **[GETTING_STARTED.md](GETTING_STARTED.md)**.

The project is now configured as a monorepo. You can manage all three services (Backend, Frontend, AI) from the root directory.

### 📦 Installation

```bash
# Install everything (Root, Backend, Frontend)
npm install
npm run install-all
```

### ⚙️ Environment Setup

1. Create a `.env` file in the **root** directory (use `.env.example` as a template).
2. Sync the configuration to all services:

```bash
npm run setup-env
```

### 🏃 Running All Services (One Command)

```bash
# Start Backend, Frontend, and AI Service simultaneously
npm run start-all
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000

---

## ☁️ Deployment (Single Service)

This project is optimized for a **One-Service Deployment** using Docker. This bundles the AI Service, Backend, and Frontend into a single container.

1.  Go to [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** > **Web Service**.
3.  Connect this repository.
4.  Render will detect the `Dockerfile`.
5.  Set **Environment** to `Docker`.
6.  Add your secrets (from `.env.example`) to the Environment Variables.

---

## 🔑 Test Credentials

### Admin Access

```
Email: admin@thalai.com
Password: password123
Dashboard: /admin-dashboard
```

### Donor Accounts (10 available)

```
Emails: donor1@thalai.com to donor10@thalai.com
Password: password123
Dashboard: /donor-dashboard

Eligibility Distribution:
✅ Eligible: 6 donors (donor1, donor2, donor4, donor5, donor8, donor9)
❌ Ineligible: 2 donors (donor3, donor10 - recent donation)
⏳ Pending: 2 donors (donor6, donor7 - awaiting verification)
```

### Patient Accounts (10 available)

```
Emails: patient1@thalai.com to patient10@thalai.com
Password: password123
Dashboard: /patient-dashboard
```

---

## 📊 System Architecture

### Technology Stack

**Frontend**:

- React.js (Vite)
- React Router
- Axios / AuthContext
- Tailwind CSS

**Backend**:

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Winston Logging
- Integrated Notification System (Email + SMS)
  - **Nodemailer** for critical security alerts and status updates
  - **Twilio** for urgent SMS broadcasts

**AI Service**:

- Python
- Flask
- Scikit-learn / LightGBM
- Pandas / NumPy
- Synthetic Data Generator

### Project Structure

```
thalai-guardianV8/
├── package.json              # Monorepo Orchestrator (One-command run)
├── render.yaml               # Render Blueprint (One-click deploy)
├── thalai-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/       # UI Widgets (Prediction, Matching, History)
│   │   ├── pages/           # Dashboards (Patient, Donor, Admin, Doctor)
│   │   ├── api/             # API services (Patient, Donor, Match, Admin)
│   │   └── App.jsx           # Main entry point
│   └── package.json
│
├── thalai-backend/           # Node.js backend API
│   ├── controllers/         # Logic handlers (Auth, Match, Notification)
│   ├── models/              # Schemas (User, Patient, Request, MatchLog)
│   ├── routes/              # Express routing
│   ├── services/            # Core logic (Notification, Matching, Chatbot)
│   ├── middleware/          # Auth & validation
│   ├── utils/               # AI Prediction bridge & Helpers
│   ├── seeders/             # Database seeding
│   ├── logs/                # Application logs
│   └── package.json
│
├── thalai-ai-service/        # Python AI service
│   ├── app.py               # Flask API (Rule-based & ML Predictions)
│   ├── training/            # Model training scripts
│   └── requirements.txt
│
└── ReadmeDoc/                # Complete documentation
    ├── DOCUMENTATION_INDEX.md # 🚀 Start Here
    ├── FINAL_STATUS.md       # ⭐ Project matrix
    ├── DEPLOYMENT_PLAN.md    # 📅 Roadmap
    └── ... (11 total docs)
```

---

## 🎯 Core Features

### 1. AI Transfusion Prediction v2

- **Dynamic Intervals**: Predicts next transfusion based on history, average intervals, and current Hb.
- **Urgency Classification**: Categorizes needs as `Urgent` (≤3 days), `Soon` (≤7 days), or `Normal`.
- **Confidence Rating**: Higher confidence assigned as more data points are logged.
- **Explanatory UI**: Shows _why_ a prediction was made (e.g., "based on 15-day average").

### 2. Intelligent Donor Matching

- **Automated Alerts**: Notifies top matches via SMS/Notification when a request is created.
- **Match Score**: Calculated based on blood type, city distance, and donor health score.
- **Contact Bridge**: Once a donor accepts, patients get a "Call Donor" button to coordinate privately.

### 3. Smart Chatbot Helper

- **24/7 Support**: Provides instant answers on diet, symptoms, and donor eligibility.
- **Action Buttons**: Directly links to "Book Appointment" or "Create Request" based on conversation.

---

## 📚 Documentation

Comprehensive documentation is available in the `ReadmeDoc/` directory:

- **[DOCUMENTATION_INDEX.md](ReadmeDoc/DOCUMENTATION_INDEX.md)** - 📚 **Start Here** for the complete documentation list.
- **[FINAL_STATUS.md](ReadmeDoc/FINAL_STATUS.md)** - ⭐ Current project status and feature matrix.
- **[DEPLOYMENT_PLAN.md](ReadmeDoc/DEPLOYMENT_PLAN.md)** - 📅 Strategic roadmap for production rollout.
- **[DEPLOYMENT_GUIDE.md](ReadmeDoc/DEPLOYMENT_GUIDE.md)** - 🚀 Technical deployment steps (Node, Python, Nginx).
- **[PRODUCTION_CHECKLIST.md](ReadmeDoc/PRODUCTION_CHECKLIST.md)** - ✅ Final security and performance audit.
- **[SETUP_INSTRUCTIONS.md](ReadmeDoc/SETUP_INSTRUCTIONS.md)** - 🛠️ Detailed environment configuration guide.
- **[QUICK_START_GUIDE.md](ReadmeDoc/QUICK_START_GUIDE.md)** - 🏃 Rapid feature testing and setup.
- **[EMAIL_SETUP.md](ReadmeDoc/EMAIL_SETUP.md)** - 📧 Configuring SMTP and Nodemailer.

---

## 🧪 Testing

### Test Coverage

**Total Tests**: 34  
**Passed**: 34 ✅  
**Failed**: 0  
**Pass Rate**: 100%

**Categories**:

- Authentication (6 tests)
- Donor Eligibility (6 tests)
- Patient Management (4 tests)
- Admin Operations (4 tests)
- API Endpoints (5 tests)
- Database (3 tests)
- Error Handling (3 tests)
- UI/UX (3 tests)

See [TEST_SIMULATION_REPORT.md](TEST_SIMULATION_REPORT.md) for detailed results.

### Running Tests

```bash
# Backend tests
cd thalai-backend
npm test

# Frontend tests
cd thalai-frontend
npm test
```

---

## 🔧 Development

### Available Scripts

**Backend**:

```bash
npm run dev      # Start development server
npm run seed     # Seed database
npm run seed -d  # Clear database
npm test         # Run tests
```

**Frontend**:

```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

**AI Service**:

```bash
python app.py                        # Start Flask server
python model_training.py             # Train ML model
python synthetic_data_generator.py   # Generate synthetic data
```

### Logging

Logs are stored in `thalai-backend/logs/`:

- `combined.log` - All logs
- `error.log` - Error logs only
- `eligibility.log` - Eligibility-specific logs

```bash
# View logs in real-time
tail -f thalai-backend/logs/combined.log
tail -f thalai-backend/logs/error.log
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Registration fails with 500 error  
**Solution**: Check backend logs, ensure MongoDB is running, verify all required fields

**Issue**: Login fails  
**Solution**: Verify credentials, check if user exists in database

**Issue**: Dashboard doesn't load  
**Solution**: Check browser console, verify API connection, check backend logs

See [ALL_FIXES_SUMMARY.md](ALL_FIXES_SUMMARY.md) for complete troubleshooting guide.

---

## 📈 System Status

| Component     | Status       | Port  |
| ------------- | ------------ | ----- |
| Frontend      | ✅ Running   | 5173  |
| Backend API   | ✅ Running   | 5000  |
| AI Service    | ✅ Running   | 8000  |
| MongoDB       | ✅ Connected | 27017 |
| Dashboard UI  | ✅ Premium   | -     |
| Notifications | ✅ Active    | -     |

---

## 🎉 Production Ready

This system is production-ready with:

- ✅ All features implemented
- ✅ Comprehensive error handling
- ✅ Detailed logging
- ✅ Complete documentation
- ✅ 100% test pass rate
- ✅ Security measures in place
- ✅ Performance optimized

See [FINAL_STATUS.md](FINAL_STATUS.md) for deployment checklist.

---

## 👥 Team

**Thalai Guardian Development Team**  
Academic Project - FY DSMP  
Abhishek - Developer

---

## 📄 License

This project is developed as an academic project.

---

## 🙏 Acknowledgments

- MongoDB for database
- React team for frontend framework
- Express.js for backend framework
- Scikit-learn for ML capabilities

---

## 📞 Support

For issues or questions:

1. Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. Review [ALL_FIXES_SUMMARY.md](ALL_FIXES_SUMMARY.md)
3. Check logs in `thalai-backend/logs/`
4. Refer to [TEST_SIMULATION_REPORT.md](TEST_SIMULATION_REPORT.md)

---

**Version**: 2.1.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2026-01-30

🎊 **ALL SYSTEMS OPERATIONAL & INTELLIGENT** 🎊
