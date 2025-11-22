# ThalAI Guardian - Backend File Tree

```
thalai-backend/
│
├── config/
│   └── db.js                    # MongoDB connection configuration
│
├── controllers/
│   ├── adminController.js       # Admin operations (donors, stats, verification)
│   ├── authController.js        # Authentication (register, login, profile)
│   ├── donorController.js       # Donor availability management
│   └── requestController.js     # Blood request CRUD operations
│
├── middleware/
│   ├── authMiddleware.js        # JWT authentication middleware
│   ├── errorHandler.js          # Global error handling middleware
│   └── roleMiddleware.js        # Role-based access control (RBAC)
│
├── models/
│   ├── donorModel.js            # Donor schema (availability, verification)
│   ├── requestModel.js           # Blood request schema
│   └── userModel.js             # User schema (patient, donor, admin)
│
├── routes/
│   ├── adminRoutes.js           # Admin API routes
│   ├── authRoutes.js            # Authentication routes
│   ├── donorRoutes.js           # Donor routes
│   └── requestRoutes.js         # Request routes
│
├── utils/
│   └── (utility functions)
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── API_DOCUMENTATION.md         # API documentation
├── MODULE2_DOCUMENTATION.md     # Module 2 documentation
├── MODULE3_DOCUMENTATION.md     # Module 3 documentation
├── package.json                 # Dependencies and scripts
├── README.md                    # Backend README
└── server.js                     # Express server entry point
```

## Module Breakdown

### Module 1: User Management
- `models/userModel.js` - User schema with roles
- `models/donorModel.js` - Donor profile schema
- `controllers/authController.js` - Registration, login, profile
- `controllers/donorController.js` - Donor availability
- `routes/authRoutes.js` - Auth endpoints
- `routes/donorRoutes.js` - Donor endpoints
- `middleware/authMiddleware.js` - JWT verification
- `middleware/roleMiddleware.js` - RBAC

### Module 2: Admin & Analytics
- `controllers/adminController.js` - Admin operations
- `routes/adminRoutes.js` - Admin endpoints
- Updated `models/donorModel.js` - Added verification fields

### Module 3: Blood Requests
- `models/requestModel.js` - Request schema
- `controllers/requestController.js` - Request CRUD
- `routes/requestRoutes.js` - Request endpoints

## API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register` - Register user
- `POST /login` - Login user
- `GET /profile` - Get profile
- `PUT /profile` - Update profile

### Donors (`/api/donors`)
- `GET /availability` - Get availability
- `POST /availability` - Update availability

### Admin (`/api/admin`)
- `GET /donors` - List all donors
- `POST /donors/verify` - Verify donor
- `GET /stats` - System statistics

### Requests (`/api/requests`)
- `POST /` - Create request
- `GET /user/:id` - Get user requests
- `GET /` - Get all requests (Admin)
- `GET /:id` - Get request by ID
- `PUT /:id/cancel` - Cancel request

## Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3"
}
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/thalai-guardian
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
```

