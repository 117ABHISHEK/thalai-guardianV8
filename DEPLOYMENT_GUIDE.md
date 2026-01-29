# 🚀 ThalAI Guardian - Complete Deployment Guide

This guide will walk you through deploying the ThalAI Guardian application to production using **Vercel** (frontend), **Render.com** (backend & AI service), and **MongoDB Atlas** (database).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment (Render.com)](#backend-deployment)
4. [AI Service Deployment (Render.com)](#ai-service-deployment)
5. [Frontend Deployment (Vercel)](#frontend-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- [ ] GitHub account (for code repository)
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Render.com account (sign up at [render.com](https://render.com))
- [ ] MongoDB Atlas account (sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- [ ] Your code pushed to a GitHub repository

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create a Cluster

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Build a Database"** or **"Create"**
3. Choose **FREE** tier (M0 Sandbox)
4. Select a **Cloud Provider** (AWS recommended) and **Region** (closest to your backend server)
5. Name your cluster (e.g., `thalai-guardian-cluster`)
6. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 2: Create Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `thalai-admin` (or your choice)
5. **Generate a secure password** and **SAVE IT** (you'll need this!)
6. Database User Privileges: Select **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for production, you can restrict this later)
   - This adds `0.0.0.0/0` to the IP whitelist
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string. It looks like:
   ```
   mongodb+srv://thalai-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual database user password
7. **Add database name** after `.net/`:
   ```
   mongodb+srv://thalai-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/thalai-guardian?retryWrites=true&w=majority
   ```
8. **SAVE THIS CONNECTION STRING** - you'll need it for backend deployment

---

## 🔧 Backend Deployment (Render.com)

### Step 1: Prepare Repository

Ensure your code is pushed to GitHub with the `render.yaml` file in the `thalai-backend` directory.

### Step 2: Create Web Service

1. Log in to [Render.com](https://render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub repository**
4. Select your repository: `thalai-guardianV8`

### Step 3: Configure Service

Fill in the following details:

- **Name**: `thalai-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `thalai-backend`
- **Runtime**: **Node**
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: **Free**

### Step 4: Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key              | Value                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `NODE_ENV`       | `production`                                                                               |
| `PORT`           | `5000`                                                                                     |
| `MONGO_URI`      | Your MongoDB Atlas connection string from above                                            |
| `JWT_SECRET`     | Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `LOG_LEVEL`      | `info`                                                                                     |
| `FRONTEND_URL`   | Leave blank for now (we'll update after frontend deployment)                               |
| `AI_SERVICE_URL` | Leave blank for now (we'll update after AI service deployment)                             |

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll see a URL like: `https://thalai-backend.onrender.com`
4. **SAVE THIS URL** - you'll need it for frontend and AI service

### Step 6: Verify Backend

1. Visit: `https://your-backend-url.onrender.com/api/health`
2. You should see: `{"message": "ThalAI Guardian API is running"}`

---

## 🤖 AI Service Deployment (Render.com)

### Step 1: Create Web Service

1. In Render.com, click **"New +"** → **"Web Service"**
2. Connect your **GitHub repository** (same as before)
3. Select your repository: `thalai-guardianV8`

### Step 2: Configure Service

Fill in the following details:

- **Name**: `thalai-ai-service` (or your choice)
- **Region**: Choose same as backend
- **Branch**: `main`
- **Root Directory**: `thalai-ai-service`
- **Runtime**: **Python 3**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
- **Instance Type**: **Free**

### Step 3: Environment Variables

Add the following:

| Key            | Value                               |
| -------------- | ----------------------------------- |
| `PORT`         | `8000`                              |
| `FLASK_ENV`    | `production`                        |
| `BACKEND_URL`  | Your backend URL from previous step |
| `FRONTEND_URL` | Leave blank for now                 |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll see a URL like: `https://thalai-ai-service.onrender.com`
4. **SAVE THIS URL**

### Step 5: Verify AI Service

1. Visit: `https://your-ai-service-url.onrender.com/health`
2. You should see: `{"status": "healthy", ...}`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Environment

1. In your local `thalai-frontend` directory, create `.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_AI_SERVICE_URL=https://your-ai-service-url.onrender.com
   ```
2. **DO NOT** commit this file (it's in `.gitignore`)

### Step 2: Deploy to Vercel

1. Log in to [Vercel](https://vercel.com/)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `thalai-guardianV8`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `thalai-frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### Step 3: Environment Variables

In Vercel project settings, add:

| Key                   | Value                                      |
| --------------------- | ------------------------------------------ |
| `VITE_API_URL`        | `https://your-backend-url.onrender.com`    |
| `VITE_AI_SERVICE_URL` | `https://your-ai-service-url.onrender.com` |

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. You'll get a URL like: `https://thalai-guardian.vercel.app`
4. **SAVE THIS URL**

---

## 🔄 Post-Deployment Configuration

### Update Backend Environment Variables

1. Go to Render.com → Your backend service → **"Environment"**
2. Update these variables:
   - `FRONTEND_URL`: Your Vercel URL (e.g., `https://thalai-guardian.vercel.app`)
   - `AI_SERVICE_URL`: Your AI service URL (e.g., `https://thalai-ai-service.onrender.com`)
3. Click **"Save Changes"** (this will trigger a redeploy)

### Update AI Service Environment Variables

1. Go to Render.com → Your AI service → **"Environment"**
2. Update:
   - `FRONTEND_URL`: Your Vercel URL
3. Click **"Save Changes"**

### Seed Production Database (Optional)

If you want to populate your production database with test data:

1. In Render.com backend service, go to **"Shell"** tab
2. Run: `npm run seed`
3. This will create test users, patients, donors, etc.

---

## ✅ Verification

### 1. Test Backend API

```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected: `{"message": "ThalAI Guardian API is running"}`

### 2. Test AI Service

```bash
curl https://your-ai-service-url.onrender.com/health
```

Expected: `{"status": "healthy", ...}`

### 3. Test Frontend

1. Visit your Vercel URL
2. Try to register a new user
3. Try to log in
4. Check if dashboards load correctly

### 4. Test Full Flow

1. Register as a donor
2. Upload blood report
3. Check eligibility status
4. Register as a patient
5. Create blood request
6. Test AI prediction (if applicable)

---

## 🐛 Troubleshooting

### Issue: Backend shows "Application Error"

**Solution:**

- Check Render logs: Service → **"Logs"** tab
- Verify `MONGO_URI` is correct
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Issue: Frontend can't connect to backend

**Solution:**

- Verify `VITE_API_URL` in Vercel environment variables
- Check browser console for CORS errors
- Ensure backend `FRONTEND_URL` matches your Vercel URL exactly

### Issue: AI Service fails to start

**Solution:**

- Check Render logs for Python errors
- Verify `requirements.txt` has all dependencies
- Ensure start command is: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`

### Issue: Database connection fails

**Solution:**

- Verify MongoDB Atlas connection string format
- Check database user credentials
- Ensure network access allows `0.0.0.0/0`
- Test connection string locally first

### Issue: Free tier services sleep after inactivity

**Solution:**

- Render free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Consider upgrading to paid tier for production use
- Or use a service like [UptimeRobot](https://uptimerobot.com/) to ping your services

---

## 🎉 Success!

Your ThalAI Guardian application is now live! 🚀

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.onrender.com`
- **AI Service**: `https://your-ai-service.onrender.com`

### Next Steps

1. **Custom Domain** (Optional): Add a custom domain in Vercel settings
2. **Monitoring**: Set up error tracking (e.g., Sentry)
3. **Analytics**: Add Google Analytics or similar
4. **Performance**: Monitor with Vercel Analytics
5. **Security**: Review and tighten CORS policies
6. **Backup**: Set up MongoDB Atlas automated backups

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Need Help?** Check the logs:

- Vercel: Project → **"Deployments"** → Click deployment → **"View Function Logs"**
- Render: Service → **"Logs"** tab
- MongoDB: Atlas → **"Monitoring"** tab
