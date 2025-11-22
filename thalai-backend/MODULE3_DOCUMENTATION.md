# Module 3: Blood Request Module

## Overview
Module 3 implements the blood request management system for patients and administrators.

## Backend Implementation

### Models
- **requestModel.js**: Blood request schema with fields:
  - `patientId` (ObjectId reference to User)
  - `bloodGroup` (enum: A+, A-, B+, B-, AB+, AB-, O+, O-)
  - `unitsRequired` (Number, 1-10)
  - `urgency` (enum: low, medium, high, critical)
  - `status` (enum: pending, searching, completed, cancelled)
  - `location` (hospital, address, city, state, zipCode)
  - `contactPerson` (name, phone, relationship)
  - `notes` (String, max 500 chars)
  - `completedAt`, `cancelledAt`, `cancelledBy`
  - `createdAt`, `updatedAt` (timestamps)

### Controllers
- **requestController.js**: Contains functions:
  1. `createRequest()` - Create new blood request (validates no duplicate active requests)
  2. `getUserRequests()` - Get all requests for a specific patient
  3. `getAllRequests()` - Get all requests with filters (Admin only)
  4. `cancelRequest()` - Cancel a request
  5. `getRequestById()` - Get single request details

### Routes
- **requestRoutes.js**: All routes protected with JWT authentication
  - `POST /api/requests` - Create request (Patient only)
  - `GET /api/requests/user/:id` - Get user's requests
  - `GET /api/requests` - Get all requests (Admin only)
  - `GET /api/requests/:id` - Get request by ID
  - `PUT /api/requests/:id/cancel` - Cancel request

### Validation
- Prevents duplicate active requests (pending/searching) for same patient
- Validates blood group, units (1-10), urgency level
- Role-based access control

## Frontend Implementation

### API Helpers
- **api/requests.js**: Contains functions:
  - `createRequest(requestData)`
  - `getUserRequests(userId)`
  - `getAllRequests(filters)`
  - `getRequestById(requestId)`
  - `cancelRequest(requestId)`

### Components

1. **PatientRequestForm.jsx**:
   - Form to create blood requests
   - Validates all required fields
   - Checks for existing active requests
   - Location and contact person fields
   - Notes field (500 char limit)

2. **PatientRequestHistory.jsx**:
   - Displays patient's request history in table
   - Status badges (pending, searching, completed, cancelled)
   - Urgency badges (low, medium, high, critical)
   - Cancel button for active requests
   - Refresh functionality

3. **AdminRequestManager.jsx**:
   - Lists all blood requests
   - Filter by status, blood group, urgency
   - Status and urgency badges
   - Cancel requests functionality
   - Patient information display

### Dashboard Updates

- **PatientDashboard.jsx**:
  - Added tabs: Profile, Create Request, Request History
  - Integrated PatientRequestForm and PatientRequestHistory
  - Tab-based navigation

- **AdminDashboard.jsx**:
  - Added "Manage Requests" button
  - Links to AdminRequestManager

### Status Badges
- **Pending**: Yellow background
- **Searching**: Light blue background
- **Completed**: Green background
- **Cancelled**: Red background

### Urgency Badges
- **Low**: Green
- **Medium**: Yellow
- **High**: Red
- **Critical**: Dark red

## API Examples

### Create Request
```bash
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "bloodGroup": "O+",
  "unitsRequired": 2,
  "urgency": "high",
  "location": {
    "hospital": "City Hospital",
    "address": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345"
  },
  "contactPerson": {
    "name": "John Doe",
    "phone": "1234567890",
    "relationship": "Family"
  },
  "notes": "Urgent need"
}
```

### Get User Requests
```bash
GET /api/requests/user/:userId
Authorization: Bearer <token>
```

### Get All Requests (Admin)
```bash
GET /api/requests?status=pending&bloodGroup=O+
Authorization: Bearer <token>
```

### Cancel Request
```bash
PUT /api/requests/:requestId/cancel
Authorization: Bearer <token>
```

## Features
- ✅ Form validation
- ✅ Duplicate request prevention
- ✅ Status badges
- ✅ Urgency indicators
- ✅ History table with sorting
- ✅ Admin filtering
- ✅ Role-based access control

