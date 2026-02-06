# ✅ ThalAI Guardian - Production Deployment Checklist

Use this checklist to ensure your production environment is secure, optimized, and fully operational.

---

### 1. Security & Authentication

- [ ] **JWT Secret**: Changed from default/placeholder to a long, random string.
- [ ] **SSL/TLS**: HTTPS enabled via Let's Encrypt or a similar provider.
- [ ] **No Root User**: Node and Python processes are running under a dedicated non-privileged user.
- [ ] **Firewall**: Only ports 80, 443, and necessary SSH ports are open to the public.
- [ ] **CORS**: backend `FRONTEND_URL` exactly matches the production domain.

### 2. Database (MongoDB)

- [ ] **Auth**: Database is password protected (no open 27017).
- [ ] **Backups**: Automated daily/weekly backups are configured.
- [ ] **Monitoring**: Index usage and slow queries are being monitored.

### 3. AI Service (Python/Flask)

- [ ] **Production Server**: Using Gunicorn or uWSGI (not the Flask built-in server).
- [ ] **Models**: All `.pkl` and metadata files are present in the `models/` directory.
- [ ] **Environment**: All `FRONTEND_URL` and `BACKEND_URL` are defined in `.env`.

### 4. Backend (Node/Express)

- [ ] **Process Management**: Managed by PM2 with auto-restart on failure/reboot.
- [ ] **Logging**: Errors are being written to `logs/error.log`.
- [ ] **Dependencies**: Installed with `npm install --production`.

### 5. Frontend (React/Vite)

- [ ] **Source Maps**: Deleted or disabled in production build (to hide source code).
- [ ] **Minification**: Build is successfully minified.
- [ ] **API URL**: `VITE_API_URL` points to the production backend.

### 6. System Monitoring

- [ ] **Uptime Monitoring**: Configured (e.g., UptimeRobot, Pingdom).
- [ ] **Log Rotation**: Configured for `winston` and `gunicorn` logs to prevent disk fill-up.

---

**Status**: ⚙️ Ready for Production
