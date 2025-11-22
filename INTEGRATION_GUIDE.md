# ThalAI Guardian - Integration Guide

## Overview
This document provides a complete guide for the integrated ThalAI Guardian MERN application with all three modules.

## Prerequisites

### Backend
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Frontend
- Node.js (v16 or higher)
- npm or yarn

## Installation

### Backend Setup

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
```

Start backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd thalai-frontend
npm install
```

Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

## Module Integration

### Module 1: User Management
- ✅ User registration with roles (patient, donor, admin)
- ✅ JWT authentication
- ✅ Profile management
- ✅ Donor availability management
- ✅ Role-based access control

### Module 2: Admin & Analytics
- ✅ Donor verification
- ✅ System statistics
- ✅ Data visualization (charts)
- ✅ Admin dashboard

### Module 3: Blood Requests
- ✅ Request creation
- ✅ Request history
- ✅ Admin request management
- ✅ Status tracking

## Key Features

### Authentication
- JWT tokens stored in localStorage
- Auto-logout on token expiration
- Protected routes with role checking
- Global Axios interceptor for token injection

### Real-time Updates
- Auto-refresh every 30 seconds for requests
- Status badges with color coding
- Urgency indicators

### Navigation
- Role-based navigation menu
- Active route highlighting
- Responsive design

### Error Handling
- Global error handler middleware
- Environment-aware logging
- User-friendly error messages
- Proper HTTP status codes

### Security
- CORS configuration
- JWT token validation
- Role-based access control
- Password hashing with bcrypt
- Input validation

## API Testing

See `thalai-backend/POSTMAN_COLLECTION.md` for complete Postman collection guide.

## File Structure

See:
- `thalai-backend/FILE_TREE.md` - Backend structure
- `thalai-frontend/FILE_TREE.md` - Frontend structure

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/thalai-guardian
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas or production DB
4. Set proper `FRONTEND_URL`
5. Use process manager (PM2)

### Frontend
1. Build: `npm run build`
2. Serve with nginx or similar
3. Configure API URL
4. Enable HTTPS

## Testing Checklist

### Backend Routes
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/auth/profile
- [ ] PUT /api/auth/profile
- [ ] GET /api/donors/availability
- [ ] POST /api/donors/availability
- [ ] GET /api/admin/donors
- [ ] POST /api/admin/donors/verify
- [ ] GET /api/admin/stats
- [ ] POST /api/requests
- [ ] GET /api/requests/user/:id
- [ ] GET /api/requests (admin)
- [ ] PUT /api/requests/:id/cancel

### Frontend Pages
- [ ] Login page
- [ ] Register page
- [ ] Patient dashboard (all tabs)
- [ ] Donor dashboard
- [ ] Admin dashboard
- [ ] Donor verification
- [ ] Request management

### Features
- [ ] JWT token injection
- [ ] Auto-logout on 401
- [ ] Role-based navigation
- [ ] Request auto-refresh
- [ ] Status badges
- [ ] Form validation
- [ ] Error handling

## Troubleshooting

### CORS Issues
- Check `FRONTEND_URL` in backend `.env`
- Verify CORS configuration in `server.js`

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration (1 day)
- Clear localStorage and re-login

### Database Issues
- Verify MongoDB connection string
- Check MongoDB is running
- Verify database name

### Build Issues
- Clear node_modules and reinstall
- Check Node.js version
- Verify all dependencies installed

## Support

For issues or questions, refer to:
- Backend README: `thalai-backend/README.md`
- Frontend README: `thalai-frontend/README.md`
- API Documentation: `thalai-backend/API_DOCUMENTATION.md`

