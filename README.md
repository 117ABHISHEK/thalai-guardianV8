# ThalAI Guardian

A complete MERN stack project scaffold for the ThalAI Guardian system.

## Project Structure

```
thalai-guardianV8/
├── thalai-backend/          # Backend API (Express + MongoDB)
│   ├── config/              # Configuration files
│   │   └── db.js            # MongoDB connection
│   ├── controllers/         # Route controllers
│   ├── routes/              # API routes
│   │   ├── authRoutes.js    # Authentication routes
│   │   ├── adminRoutes.js   # Admin routes
│   │   ├── requestRoutes.js # Request routes
│   │   └── donorRoutes.js   # Donor routes
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── utils/               # Utility functions
│   ├── server.js            # Express server entry point
│   └── package.json         # Backend dependencies
│
└── thalai-frontend/         # Frontend (React)
    └── src/
        ├── pages/           # Page components
        ├── components/      # Reusable components
        ├── context/         # React Context providers
        ├── hooks/           # Custom React hooks
        └── api/             # API service functions
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd thalai-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/thalai-guardian
PORT=5000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

Frontend structure is ready. Initialize with your preferred React setup (Create React App, Vite, etc.)

## API Endpoints

- `GET /api/health` - Health check
- `/api/auth` - Authentication routes
- `/api/admin` - Admin routes
- `/api/requests` - Request routes
- `/api/donors` - Donor routes

## Technologies

- **Backend**: Express.js, Mongoose, MongoDB
- **Frontend**: React (structure ready)

## Notes

This is a project skeleton. Implementation logic will be added in subsequent development phases.

