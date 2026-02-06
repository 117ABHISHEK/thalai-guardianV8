# 🚀 ThalAI Guardian - Full Deployment Guide

This document provides comprehensive instructions for deploying the **ThalAI Guardian** system to a production environment. The system consists of three main components: a Node.js Backend API, a React Frontend Application, and a Python AI Service.

---

## 🏗️ Architecture Overview

The system is designed with a microservices-inspired architecture:

1.  **Frontend**: React (Vite) - Client-side interface.
2.  **Backend**: Node.js (Express) - Core logic, authentication, and database management.
3.  **AI Service**: Python (Flask) - Heavy computational logic for transfusion prediction and donor matching.
4.  **Database**: MongoDB - Persistent storage for users, medical records, and logs.

---

## 📋 Prerequisites

Before deployment, ensure the following are available on your server:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Python** (v3.9 or higher)
- **MongoDB** (v5.0 or higher / MongoDB Atlas)
- **Git** for version control
- **Process Manager** (e.g., PM2 for Node, Gunicorn for Python)
- **Nginx** (recommended as a reverse proxy)

---

## 🔐 Environment Variables

You must configure environment variables for all services. Refer to the table below for required keys.

### 1. Backend API (`thalai-backend/.env`)

| Variable         | Description                    | Example                       |
| :--------------- | :----------------------------- | :---------------------------- |
| `NODE_ENV`       | Environment mode               | `production`                  |
| `PORT`           | API Port                       | `5000`                        |
| `MONGO_URI`      | MongoDB Connection String      | `mongodb+srv://...`           |
| `JWT_SECRET`     | Secure key for authentication  | `[LongRandomString]`          |
| `AI_SERVICE_URL` | URL where AI Service is hosted | `http://localhost:8000`       |
| `FRONTEND_URL`   | URL of the frontend app        | `https://thalai-guardian.com` |
| `TWILIO_SID`     | Twilio Account SID (Optional)  | `AC...`                       |
| `TWILIO_TOKEN`   | Twilio Auth Token (Optional)   | `[Token]`                     |

### 2. AI Service (`thalai-ai-service/.env`)

| Variable       | Description                        | Example                           |
| :------------- | :--------------------------------- | :-------------------------------- |
| `PORT`         | Flask Port                         | `8000`                            |
| `FLASK_ENV`    | Flask mode                         | `production`                      |
| `MODEL_PATH`   | Path to trained models             | `./models/`                       |
| `FRONTEND_URL` | URL of the frontend app (for CORS) | `https://thalai-guardian.com`     |
| `BACKEND_URL`  | URL of the backend API (for CORS)  | `https://api.thalai-guardian.com` |

### 3. Frontend (`thalai-frontend/.env`)

| Variable              | Description              | Example                               |
| :-------------------- | :----------------------- | :------------------------------------ |
| `VITE_API_URL`        | Base URL for Backend API | `https://api.thalai-guardian.com/api` |
| `VITE_AI_SERVICE_URL` | Base URL for AI Service  | `https://ai.thalai-guardian.com`      |

---

## 📦 Deployment Steps

### Step 1: Clone and Prepare

```bash
git clone <your-repo-url>
cd thalai-guardianV8
```

### Step 2: Backend Deployment (Node.js)

1. Navigate to the backend directory:
   ```bash
   cd thalai-backend
   npm install --production
   ```
2. Create and configure `.env` file.
3. Seed the database (if first time):
   ```bash
   npm run seed
   ```
4. Start with PM2:
   ```bash
   pm2 start server.js --name thalai-backend
   ```

### Step 3: AI Service Deployment (Python)

1. Navigate to the AI service directory:
   ```bash
   cd ../thalai-ai-service
   python -m venv venv
   source venv/bin/activate # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Start with Gunicorn:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:8000 app:app --daemon
   ```

### Step 4: Frontend Deployment (React)

1. Navigate to the frontend directory:
   ```bash
   cd ../thalai-frontend
   npm install
   ```
2. Create and configure `.env` with production URLs.
3. Build the application:
   ```bash
   npm run build
   ```
4. Deploy the `dist` folder to a static host (Vercel, Netlify) or serve via Nginx.

---

## 🌐 Nginx Reverse Proxy Configuration

To serve all services under a single domain with SSL, use the following Nginx configuration:

```nginx
server {
    listen 80;
    server_name thalai-guardian.com;

    # Frontend Static Files
    location / {
        root /var/www/thalai-frontend/dist;
        try_files $uri /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # AI Service Proxy
    location /ai/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## ✅ Post-Deployment Checklist

- [ ] **SSL Certificates**: Ensure HTTPS is enabled via Let's Encrypt / Certbot.
- [ ] **Database Backups**: Schedule regular backups for MongoDB.
- [ ] **Logging**: Monitor `thalai-backend/logs/error.log` for any runtime issues.
- [ ] **Health Checks**:
  - Backend: `GET /api/health`
  - AI Service: `GET /health`
- [ ] **Security**: Ensure Node.js and Python processes are NOT running as root.
- [ ] **CORS**: Verify that `FRONTEND_URL` in backend `.env` matches your production domain.

---

## 🛠️ Troubleshooting

- **502 Bad Gateway**: Check if PM2 or Gunicorn processes are running (`pm2 status` / `ps aux`).
- **CORS Errors**: Ensure the backend `.env` has the correct `FRONTEND_URL`.
- **MongoDB Connection Error**: Verify firewall settings on port 27017 or check MongoDB Atlas IP Whitelist.
- **Model Loading Error**: Ensure the trained model files are present in `thalai-ai-service/models/`.

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Project**: ThalAI Guardian V8
