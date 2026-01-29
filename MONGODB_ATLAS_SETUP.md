# 🗄️ MongoDB Atlas Setup Guide

Complete guide for setting up MongoDB Atlas for ThalAI Guardian production deployment.

---

## Why MongoDB Atlas?

- ✅ **Free Tier Available:** 512MB storage, perfect for getting started
- ✅ **Fully Managed:** No server maintenance required
- ✅ **Automatic Backups:** Built-in backup and recovery
- ✅ **Global Availability:** Deploy in regions worldwide
- ✅ **Security:** Built-in encryption and security features
- ✅ **Scalable:** Easy to upgrade as your app grows

---

## Step-by-Step Setup

### 1. Create Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with:
   - Email and password, OR
   - Google account, OR
   - GitHub account
3. Verify your email address

### 2. Create Organization (Optional)

1. After login, you'll be prompted to create an organization
2. Organization Name: `ThalAI Guardian` (or your choice)
3. Click **"Next"**
4. Skip adding members (click **"Create Organization"**)

### 3. Create Project

1. Click **"New Project"**
2. Project Name: `thalai-guardian-production`
3. Click **"Next"**
4. Skip adding members
5. Click **"Create Project"**

### 4. Build Database Cluster

1. Click **"Build a Database"** or **"Create"**
2. Choose deployment option: **Shared** (Free tier)
3. Cloud Provider & Region:
   - **Provider:** AWS (recommended) or Google Cloud
   - **Region:** Choose closest to your Render.com backend region
     - If backend is in Oregon (US West): Choose `us-west-2`
     - If backend is in Ohio (US East): Choose `us-east-1`
     - If backend is in Frankfurt (EU): Choose `eu-central-1`
4. Cluster Tier: **M0 Sandbox** (Free forever)
5. Cluster Name: `thalai-guardian-cluster` (or your choice)
6. Click **"Create Cluster"**
7. Wait 3-5 minutes for cluster creation

### 5. Security Quickstart

After cluster creation, you'll see a security quickstart:

#### A. Create Database User

1. **Authentication Method:** Username and Password
2. **Username:** `thalai-admin` (or your choice)
3. **Password:** Click **"Autogenerate Secure Password"**
4. **IMPORTANT:** Click the copy icon and **SAVE THIS PASSWORD** somewhere safe!
   - Example: `xK9mP2nQ7vL5wR8t`
5. **Database User Privileges:** Select **"Read and write to any database"**
6. Click **"Create User"**

#### B. Add IP Address

1. You'll see "Where would you like to connect from?"
2. For initial setup, click **"Add My Current IP Address"**
3. **For production:** Click **"Add a Different IP Address"**
   - IP Address: `0.0.0.0/0`
   - Description: `Allow from anywhere (production)`
   - **Note:** This allows connections from any IP. For better security, you can restrict this later to Render.com IPs.
4. Click **"Add Entry"**
5. Click **"Finish and Close"**

### 6. Get Connection String

1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. **Driver:** Node.js
4. **Version:** 4.1 or later
5. You'll see a connection string like:
   ```
   mongodb+srv://thalai-admin:<password>@thalai-guardian-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Copy this string**
7. **Replace `<password>`** with your actual password (the one you saved earlier)
8. **Add database name** after `.net/`:
   ```
   mongodb+srv://thalai-admin:xK9mP2nQ7vL5wR8t@thalai-guardian-cluster.xxxxx.mongodb.net/thalai-guardian?retryWrites=true&w=majority
   ```

### 7. Test Connection (Optional but Recommended)

Before deploying, test the connection locally:

1. In your `thalai-backend/.env` file, temporarily add:
   ```env
   MONGO_URI=mongodb+srv://thalai-admin:YOUR_PASSWORD@cluster.mongodb.net/thalai-guardian?retryWrites=true&w=majority
   ```
2. Start your backend: `npm run dev`
3. Check logs for: `✅ MongoDB Connected`
4. If successful, you're ready to deploy!

---

## Connection String Format Explained

```
mongodb+srv://[username]:[password]@[cluster-url]/[database-name]?[options]
```

- **mongodb+srv://**: Protocol (SRV record for automatic failover)
- **username**: Database user (e.g., `thalai-admin`)
- **password**: User password (e.g., `xK9mP2nQ7vL5wR8t`)
- **cluster-url**: Your cluster URL (e.g., `thalai-guardian-cluster.abc123.mongodb.net`)
- **database-name**: Database name (e.g., `thalai-guardian`)
- **options**: Connection options (e.g., `retryWrites=true&w=majority`)

---

## Important Security Notes

### ⚠️ Never Commit Connection Strings

- **NEVER** commit your connection string to Git
- **NEVER** share your password publicly
- Use environment variables for all sensitive data

### 🔒 Secure Your Password

- Use a password manager to store your database password
- Don't use the same password for multiple services
- Rotate passwords periodically

### 🌐 IP Whitelist Best Practices

**For Development:**

- Use `0.0.0.0/0` to allow from anywhere

**For Production:**

- Restrict to specific IPs if possible
- Render.com uses dynamic IPs, so `0.0.0.0/0` is often necessary
- Monitor access logs regularly

---

## Database Structure

After deployment, your database will have these collections:

- `users` - All users (donors, patients, admins, doctors)
- `medicalreports` - Patient medical reports
- `bloodrequests` - Blood donation requests
- `donations` - Donation records
- `appointments` - Doctor appointments
- `notifications` - User notifications

---

## Monitoring Your Database

### View Data

1. In MongoDB Atlas, go to **"Browse Collections"**
2. Select your database: `thalai-guardian`
3. Browse collections and documents
4. You can manually add/edit/delete documents here

### Monitor Performance

1. Go to **"Metrics"** tab
2. View:
   - Connections
   - Network traffic
   - Operations per second
   - Storage usage

### Set Up Alerts

1. Go to **"Alerts"** tab
2. Click **"Add New Alert"**
3. Configure alerts for:
   - High connection count
   - Low storage space
   - Unusual query patterns

---

## Backup & Recovery

### Automatic Backups (Paid Tiers)

- M10+ clusters include automatic backups
- Free M0 tier does NOT include automatic backups

### Manual Backup (Free Tier)

For free tier, you can manually export data:

1. Use `mongodump` to export:
   ```bash
   mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/thalai-guardian"
   ```
2. Schedule this as a cron job for regular backups

### Export Data

1. In Atlas, go to **"Collections"**
2. Select a collection
3. Click **"Export Collection"**
4. Choose JSON or CSV format

---

## Upgrading from Free Tier

### When to Upgrade

Consider upgrading when:

- You need more than 512MB storage
- You need automatic backups
- You need better performance
- You have high traffic

### Upgrade Process

1. Go to your cluster
2. Click **"Upgrade"** or **"Modify"**
3. Choose a paid tier (M10, M20, etc.)
4. Upgrade is seamless - no downtime!

### Pricing

- **M0 (Free):** $0/month - 512MB storage
- **M10 (Shared):** ~$0.08/hour (~$57/month) - 10GB storage
- **M20 (Dedicated):** ~$0.20/hour (~$146/month) - 20GB storage

---

## Troubleshooting

### Issue: "Authentication failed"

**Cause:** Wrong username or password  
**Solution:**

- Verify username matches database user
- Check password (no extra spaces)
- Ensure password is URL-encoded if it contains special characters

### Issue: "Connection timeout"

**Cause:** IP not whitelisted  
**Solution:**

- Add `0.0.0.0/0` to IP whitelist
- Check network connectivity
- Verify cluster is running

### Issue: "Database not found"

**Cause:** Database name not in connection string  
**Solution:**

- Add database name after `.net/`: `.net/thalai-guardian?...`

### Issue: "Too many connections"

**Cause:** Connection pool not closed properly  
**Solution:**

- Use connection pooling
- Close connections after use
- Check for connection leaks in code

---

## Best Practices

### 1. Use Connection Pooling

Already configured in your app:

```javascript
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

### 2. Create Indexes

For better query performance:

```javascript
// In your models
userSchema.index({ email: 1 });
medicalReportSchema.index({ userId: 1, createdAt: -1 });
```

### 3. Monitor Slow Queries

1. Go to **"Performance Advisor"** in Atlas
2. Review slow queries
3. Add indexes as recommended

### 4. Regular Maintenance

- Review and delete old data
- Monitor storage usage
- Update indexes as needed
- Review security settings monthly

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [Security Checklist](https://docs.atlas.mongodb.com/security-checklist/)
- [Performance Best Practices](https://docs.atlas.mongodb.com/best-practices/)

---

## Quick Reference

### Your Connection String Template

```
mongodb+srv://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_CLUSTER].mongodb.net/thalai-guardian?retryWrites=true&w=majority
```

### Environment Variable

Add to Render.com backend:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/thalai-guardian?retryWrites=true&w=majority
```

---

**✅ MongoDB Atlas Setup Complete!**

You're now ready to deploy your backend with a production-ready database.

Next step: [Deploy Backend to Render.com](DEPLOYMENT_GUIDE.md#backend-deployment)
