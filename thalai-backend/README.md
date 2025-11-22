# ThalAI Guardian - Backend

Backend API for the ThalAI Guardian system built with Express.js and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/thalai-guardian
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
thalai-backend/
├── config/          # Configuration files (DB connection, etc.)
├── controllers/     # Route controllers
├── routes/          # API routes
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── utils/           # Utility functions
└── server.js        # Entry point
```

## API Routes

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Register a new user (patient, donor, or admin)
- `POST /api/auth/login` - Login user and get JWT token
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Donor Routes (`/api/donors`)
- `POST /api/donors/availability` - Update donor availability status (Protected, Donor only)
- `GET /api/donors/availability` - Get donor availability status (Protected, Donor only)

### Other Routes
- `/api/admin` - Admin routes
- `/api/requests` - Request routes
- `/api/health` - Health check endpoint

## Module 1: User Management

### Features Implemented:
- ✅ User Registration with roles (patient, donor, admin)
- ✅ User Login with JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ JWT middleware for token verification
- ✅ Role-Based Access Control (RBAC) middleware
- ✅ User Profile management (GET/PUT)
- ✅ Donor Availability management

### Authentication:
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

