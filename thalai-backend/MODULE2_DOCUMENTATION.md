# Module 2: Admin & Analytics Module

## Overview
Module 2 implements admin functionality and analytics for the ThalAI Guardian system.

## Backend Implementation

### Models Updated
- **donorModel.js**: Added verification fields:
  - `isVerified` (Boolean)
  - `verifiedAt` (Date)
  - `verifiedBy` (ObjectId reference to User)

### Controllers
- **adminController.js**: Contains three main functions:
  1. `getDonors()` - Fetches all donors with populated user data
  2. `verifyDonor()` - Verifies a donor and records admin who verified
  3. `getStats()` - Returns system statistics using Mongoose aggregation

### Routes
- **adminRoutes.js**: All routes protected with:
  - `protect` middleware (JWT authentication)
  - `allowRoles('admin')` middleware (RBAC)
  
  Endpoints:
  - `GET /api/admin/donors` - List all donors
  - `POST /api/admin/donors/verify` - Verify a donor
  - `GET /api/admin/stats` - Get system statistics

### Statistics Provided
- `totalPatients` - Count of active patients
- `totalDonors` - Count of active donors
- `verifiedDonors` - Count of verified donors
- `pendingRequests` - Placeholder (for future module)
- `completedRequests` - Placeholder (for future module)
- `donorStats` - Aggregated donor statistics
- `bloodGroupDistribution` - Distribution by blood group

## Frontend Implementation

### API Helpers
- **api/admin.js**: Contains functions:
  - `getDonors()` - Fetch all donors
  - `verifyDonor(donorId)` - Verify a donor
  - `getStats()` - Fetch system statistics

### Components
1. **AdminDashboard.jsx**:
   - Displays 6 stat cards (Patients, Donors, Verified, Pending, Completed, Available)
   - Includes charts via StatsCharts component
   - Quick actions section
   - Navigation to donor verification

2. **DonorVerification.jsx**:
   - Lists all donors in a table
   - Filter by verification status (All, Verified, Unverified)
   - Verify button for unverified donors
   - Shows verification details (who verified and when)

3. **StatsCharts.jsx**:
   - Blood Group Distribution (Pie Chart)
   - Users Overview (Bar Chart)
   - Donor Statistics card

### Dependencies Added
- `recharts` - For data visualization

## Security
- All admin routes protected with JWT authentication
- Role-based access control (only admins can access)
- Token validation on every request

## API Examples

### Get Donors
```bash
GET /api/admin/donors
Authorization: Bearer <token>
```

### Verify Donor
```bash
POST /api/admin/donors/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "donorId": "donor_id_here"
}
```

### Get Stats
```bash
GET /api/admin/stats
Authorization: Bearer <token>
```

## Usage
1. Admin logs in and is redirected to `/admin-dashboard`
2. Dashboard shows system statistics and charts
3. Click "Manage Donors" to go to donor verification page
4. Filter and verify donors as needed
5. Statistics update in real-time

