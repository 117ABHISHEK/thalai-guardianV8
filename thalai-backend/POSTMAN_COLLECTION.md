# Postman Collection Guide - ThalAI Guardian API

## Setup Instructions

1. Import the environment variables:
   - Create a new environment in Postman
   - Add variables:
     - `base_url`: `http://localhost:5000/api`
     - `token`: (will be set after login)

2. Create a collection: "ThalAI Guardian API"

## Authentication Endpoints

### 1. Register User
```
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "bloodGroup": "O+"
}
```

**Response**: Copy the `token` from response and set it in environment variable.

### 2. Login
```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**: Copy the `token` and set in environment variable.

### 3. Get Profile
```
GET {{base_url}}/auth/profile
Authorization: Bearer {{token}}
```

### 4. Update Profile
```
PUT {{base_url}}/auth/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "1234567890"
}
```

## Donor Endpoints

### 5. Get Donor Availability
```
GET {{base_url}}/donors/availability
Authorization: Bearer {{token}}
```

### 6. Update Donor Availability
```
POST {{base_url}}/donors/availability
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "availabilityStatus": true,
  "lastDonationDate": "2024-01-15"
}
```

## Admin Endpoints

### 7. Get All Donors
```
GET {{base_url}}/admin/donors
Authorization: Bearer {{token}}
```

### 8. Verify Donor
```
POST {{base_url}}/admin/donors/verify
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "donorId": "donor_id_here"
}
```

### 9. Get System Stats
```
GET {{base_url}}/admin/stats
Authorization: Bearer {{token}}
```

## Request Endpoints

### 10. Create Blood Request (Patient)
```
POST {{base_url}}/requests
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "bloodGroup": "O+",
  "unitsRequired": 2,
  "urgency": "high",
  "location": {
    "hospital": "City Hospital",
    "city": "City",
    "state": "State"
  }
}
```

### 11. Get User Requests
```
GET {{base_url}}/requests/user/:userId
Authorization: Bearer {{token}}
```

### 12. Get All Requests (Admin)
```
GET {{base_url}}/requests?status=pending&bloodGroup=O+
Authorization: Bearer {{token}}
```

### 13. Get Request by ID
```
GET {{base_url}}/requests/:requestId
Authorization: Bearer {{token}}
```

### 14. Cancel Request
```
PUT {{base_url}}/requests/:requestId/cancel
Authorization: Bearer {{token}}
```

## Health Check

### 15. Health Check
```
GET {{base_url}}/health
```

## Testing Workflow

1. **Register a Patient**:
   - Use endpoint #1
   - Save token from response

2. **Login**:
   - Use endpoint #2
   - Update token in environment

3. **Create Request**:
   - Use endpoint #10
   - Note the request ID

4. **Get Requests**:
   - Use endpoint #11 with patient user ID

5. **Register Admin**:
   - Use endpoint #1 with role: "admin"
   - Login and get admin token

6. **Admin Operations**:
   - Get all requests (#12)
   - Get stats (#9)
   - Verify donors (#8)

## Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Error Response Format

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

