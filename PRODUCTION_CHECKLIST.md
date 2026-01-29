# 📋 Production Deployment Checklist

Use this checklist to ensure a smooth deployment process.

---

## Pre-Deployment Checklist

### Code Preparation

- [ ] All code committed and pushed to GitHub
- [ ] No sensitive data (passwords, API keys) in code
- [ ] `.gitignore` properly configured
- [ ] All dependencies listed in `package.json` and `requirements.txt`
- [ ] Environment variable examples created (`.env.example` files)

### Local Testing

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts without errors (`npm start`)
- [ ] AI service starts without errors (`python app.py`)
- [ ] All tests passing (`npm test`)
- [ ] Database connection works locally
- [ ] API endpoints tested (Postman/Thunder Client)

### Configuration Files

- [ ] `vercel.json` created in `thalai-frontend/`
- [ ] `render.yaml` created in `thalai-backend/`
- [ ] `render.yaml` created in `thalai-ai-service/`
- [ ] `.env.production.example` files created
- [ ] CORS configuration updated for production URLs

---

## Deployment Checklist

### 1. MongoDB Atlas

- [ ] Account created
- [ ] Free tier cluster created
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0 for testing)
- [ ] Connection string obtained and tested
- [ ] Database name added to connection string

### 2. Backend Deployment (Render.com)

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web service created
- [ ] Root directory set to `thalai-backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `MONGO_URI` (from MongoDB Atlas)
  - [ ] `JWT_SECRET` (generated securely)
  - [ ] `LOG_LEVEL=info`
  - [ ] `FRONTEND_URL` (will update later)
  - [ ] `AI_SERVICE_URL` (will update later)
- [ ] Service deployed successfully
- [ ] Health endpoint verified: `/api/health`
- [ ] Backend URL saved for later use

### 3. AI Service Deployment (Render.com)

- [ ] Web service created
- [ ] Root directory set to `thalai-ai-service`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
- [ ] Environment variables configured:
  - [ ] `PORT=8000`
  - [ ] `FLASK_ENV=production`
  - [ ] `BACKEND_URL` (from backend deployment)
  - [ ] `FRONTEND_URL` (will update later)
- [ ] Service deployed successfully
- [ ] Health endpoint verified: `/health`
- [ ] AI service URL saved for later use

### 4. Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported
- [ ] Root directory set to `thalai-frontend`
- [ ] Framework preset: Vite
- [ ] Environment variables configured:
  - [ ] `VITE_API_URL` (from backend deployment)
  - [ ] `VITE_AI_SERVICE_URL` (from AI service deployment)
- [ ] Project deployed successfully
- [ ] Frontend URL saved

---

## Post-Deployment Configuration

### Update Environment Variables

- [ ] Backend `FRONTEND_URL` updated with Vercel URL
- [ ] Backend `AI_SERVICE_URL` updated
- [ ] AI Service `FRONTEND_URL` updated with Vercel URL
- [ ] All services redeployed after environment updates

### Database Seeding (Optional)

- [ ] Decision made: seed production database or not
- [ ] If yes: `npm run seed` executed via Render shell
- [ ] Test users created and credentials documented

---

## Verification Checklist

### Backend Verification

- [ ] Health endpoint responds: `GET /api/health`
- [ ] Registration works: `POST /api/auth/register`
- [ ] Login works: `POST /api/auth/login`
- [ ] Protected routes require authentication
- [ ] Database queries work correctly
- [ ] Logs show no errors

### AI Service Verification

- [ ] Health endpoint responds: `GET /health`
- [ ] Model info endpoint works: `GET /model-info`
- [ ] Prediction endpoint works: `POST /predict-next-transfusion`
- [ ] CORS allows frontend requests
- [ ] Logs show no errors

### Frontend Verification

- [ ] Homepage loads correctly
- [ ] All routes accessible (no 404s)
- [ ] Registration form works
- [ ] Login form works
- [ ] Donor dashboard loads
- [ ] Patient dashboard loads
- [ ] Admin dashboard loads (if applicable)
- [ ] API calls succeed (check browser console)
- [ ] No CORS errors in console
- [ ] Responsive design works on mobile
- [ ] Images and assets load correctly

### End-to-End Testing

- [ ] **Donor Flow:**
  - [ ] Register as donor
  - [ ] Login as donor
  - [ ] View dashboard
  - [ ] Upload blood report
  - [ ] Check eligibility status
  - [ ] View donation history

- [ ] **Patient Flow:**
  - [ ] Register as patient
  - [ ] Login as patient
  - [ ] View dashboard
  - [ ] Create blood request
  - [ ] View medical reports
  - [ ] AI prediction works (if applicable)

- [ ] **Admin Flow:**
  - [ ] Login as admin
  - [ ] View all users
  - [ ] Verify donor
  - [ ] Approve blood requests
  - [ ] View system statistics

---

## Security Checklist

- [ ] No API keys or secrets in frontend code
- [ ] JWT tokens stored securely (httpOnly cookies or secure storage)
- [ ] CORS properly configured (not allowing all origins)
- [ ] MongoDB Atlas IP whitelist configured (not 0.0.0.0/0 in production)
- [ ] Strong JWT_SECRET generated
- [ ] Database user has minimal required permissions
- [ ] HTTPS enabled on all services (automatic with Vercel/Render)
- [ ] Environment variables not exposed in logs
- [ ] Rate limiting configured (if applicable)
- [ ] Input validation on all API endpoints

---

## Performance Checklist

- [ ] Frontend build optimized (check bundle size)
- [ ] Images optimized and compressed
- [ ] API responses are fast (\<500ms)
- [ ] Database queries optimized (indexes created)
- [ ] No N+1 query problems
- [ ] Caching implemented where appropriate
- [ ] CDN used for static assets (Vercel does this automatically)

---

## Monitoring & Maintenance

- [ ] Error tracking set up (e.g., Sentry)
- [ ] Uptime monitoring configured (e.g., UptimeRobot)
- [ ] Log aggregation set up (Render provides this)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Database backup schedule configured (MongoDB Atlas)
- [ ] Alerts configured for critical errors
- [ ] Documentation updated with production URLs

---

## Documentation Checklist

- [ ] README.md updated with production deployment info
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Deployment guide created
- [ ] Troubleshooting guide created
- [ ] User credentials documented (for testing)
- [ ] Production URLs documented

---

## Final Checks

- [ ] All services running without errors
- [ ] All environment variables correct
- [ ] Database connection stable
- [ ] Frontend-backend communication working
- [ ] Backend-AI service communication working
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing done (Chrome, Firefox, Safari)
- [ ] Performance acceptable (page load \<3s)

---

## Post-Launch

- [ ] Monitor logs for first 24 hours
- [ ] Check error rates
- [ ] Monitor database performance
- [ ] Collect user feedback
- [ ] Plan for scaling if needed
- [ ] Set up automated backups
- [ ] Create disaster recovery plan
- [ ] Schedule regular maintenance windows

---

## Common Issues & Solutions

### Issue: Services sleeping on free tier

**Impact:** First request after 15 min inactivity takes 30-60s  
**Solution:**

- Use UptimeRobot to ping services every 5 minutes
- Or upgrade to paid tier for always-on services

### Issue: CORS errors

**Impact:** Frontend can't communicate with backend  
**Solution:**

- Verify `FRONTEND_URL` in backend matches Vercel URL exactly
- Check CORS configuration in `server.js`
- Ensure no trailing slashes in URLs

### Issue: Database connection timeout

**Impact:** Backend can't connect to MongoDB  
**Solution:**

- Verify MongoDB Atlas connection string
- Check network access whitelist
- Ensure database user credentials are correct

### Issue: Build failures

**Impact:** Deployment fails  
**Solution:**

- Check build logs in Vercel/Render
- Verify all dependencies are in package.json
- Test build locally first

---

## Upgrade Paths

### When to Upgrade from Free Tier

Consider upgrading when:

- You have consistent traffic (free tier sleeps)
- You need faster response times
- You need more than 512MB database storage
- You need custom domains with SSL
- You need team collaboration features

### Recommended Paid Plans

- **Vercel Pro:** $20/month - Custom domains, better performance
- **Render Standard:** $7/month per service - Always-on, faster builds
- **MongoDB Atlas M10:** $0.08/hour (~$57/month) - More storage, better performance

---

## 🎉 Deployment Complete!

Once all items are checked, your application is production-ready!

**Remember:**

- Monitor regularly
- Keep dependencies updated
- Back up your database
- Document any changes
- Test before deploying updates

---

**Last Updated:** 2026-01-29  
**Version:** 1.0.0
