# ThalAI Guardian - Frontend File Tree

```
thalai-frontend/
│
├── public/
│   └── (static assets)
│
├── src/
│   ├── api/
│   │   ├── admin.js            # Admin API functions
│   │   ├── auth.js             # Authentication API (with Axios interceptors)
│   │   ├── donor.js            # Donor API functions
│   │   └── requests.js         # Request API functions
│   │
│   ├── components/
│   │   ├── Navigation.jsx      # Role-based navigation component
│   │   ├── ProtectedRoute.jsx  # Route protection with RBAC
│   │   └── StatsCharts.jsx     # Charts for admin dashboard (Recharts)
│   │
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context provider
│   │
│   ├── hooks/
│   │   └── (custom hooks)
│   │
│   ├── pages/
│   │   ├── AdminDashboard.jsx        # Admin dashboard with stats
│   │   ├── AdminRequestManager.jsx   # Admin request management
│   │   ├── DonorDashboard.jsx       # Donor dashboard
│   │   ├── DonorVerification.jsx    # Donor verification page
│   │   ├── Login.jsx                # Login page
│   │   ├── PatientDashboard.jsx      # Patient dashboard with tabs
│   │   ├── PatientRequestForm.jsx    # Create blood request form
│   │   ├── PatientRequestHistory.jsx  # Patient request history
│   │   └── Register.jsx              # Registration page
│   │
│   ├── App.jsx                 # Main app component with routing
│   ├── index.css               # Global styles
│   └── main.jsx                # React entry point
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── README.md                   # Frontend README
└── vite.config.js              # Vite configuration
```

## Module Breakdown

### Module 1: User Management
- `pages/Login.jsx` - Login page
- `pages/Register.jsx` - Registration page
- `pages/PatientDashboard.jsx` - Patient dashboard
- `pages/DonorDashboard.jsx` - Donor dashboard
- `pages/AdminDashboard.jsx` - Admin dashboard
- `api/auth.js` - Auth API with JWT interceptors
- `api/donor.js` - Donor API
- `context/AuthContext.jsx` - Auth state management
- `components/ProtectedRoute.jsx` - Route protection

### Module 2: Admin & Analytics
- `pages/DonorVerification.jsx` - Donor verification
- `pages/AdminDashboard.jsx` - Stats dashboard
- `components/StatsCharts.jsx` - Data visualization
- `api/admin.js` - Admin API

### Module 3: Blood Requests
- `pages/PatientRequestForm.jsx` - Create request form
- `pages/PatientRequestHistory.jsx` - Request history
- `pages/AdminRequestManager.jsx` - Admin request management
- `api/requests.js` - Request API
- Updated `pages/PatientDashboard.jsx` - Added tabs

### Integration
- `components/Navigation.jsx` - Role-based navigation
- Updated `App.jsx` - Integrated navigation
- Auto-refresh in request components

## Component Structure

### Pages
- **Authentication**: Login, Register
- **Patient**: Dashboard (tabs), Request Form, Request History
- **Donor**: Dashboard, Availability Management
- **Admin**: Dashboard, Donor Verification, Request Manager

### Components
- **Navigation**: Role-based navigation bar
- **ProtectedRoute**: Route protection with role checking
- **StatsCharts**: Data visualization (Recharts)

### API Layer
- **auth.js**: Global Axios instance with JWT interceptors
- **admin.js**: Admin operations
- **donor.js**: Donor operations
- **requests.js**: Request operations

## Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "axios": "^1.6.2",
  "recharts": "^2.10.3"
}
```

## Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Patient)
- `/patient-dashboard` - Patient dashboard

### Protected Routes (Donor)
- `/donor-dashboard` - Donor dashboard

### Protected Routes (Admin)
- `/admin-dashboard` - Admin dashboard
- `/admin/donor-verification` - Donor verification
- `/admin/requests` - Request management

## Features

### JWT Authentication
- Token stored in localStorage
- Auto-injection via Axios interceptor
- Auto-logout on 401 errors
- Token refresh handling

### Real-time Updates
- Auto-refresh every 30 seconds for requests
- Status badges with color coding
- Urgency indicators

### Navigation
- Role-based menu items
- Active route highlighting
- Responsive design

