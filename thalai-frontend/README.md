# ThalAI Guardian - Frontend

React frontend for the ThalAI Guardian system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
thalai-frontend/
├── src/
│   ├── api/              # API helper functions
│   │   ├── auth.js       # Authentication API calls
│   │   └── donor.js      # Donor API calls
│   ├── components/       # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── context/          # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── DonorDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
└── package.json
```

## Features

### Module 1: User Management

- ✅ User Registration (Patient, Donor, Admin)
- ✅ User Login with JWT
- ✅ Protected Routes based on roles
- ✅ User Profile Management
- ✅ Donor Availability Management
- ✅ Auto-logout on token expiration
- ✅ JWT token stored in localStorage

## Routes

- `/login` - Login page
- `/register` - Registration page
- `/patient-dashboard` - Patient dashboard (Patient only)
- `/donor-dashboard` - Donor dashboard (Donor only)
- `/admin-dashboard` - Admin dashboard (Admin only)
- `/dashboard` - Auto-redirects based on user role

## Authentication Flow

1. User registers or logs in
2. JWT token is stored in localStorage
3. Token is automatically included in API requests
4. Protected routes check for valid token
5. Auto-logout if token is invalid or expired

## Technologies

- React 18
- React Router v6
- Axios
- Vite

