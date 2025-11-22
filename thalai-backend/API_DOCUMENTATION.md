# ThalAI Guardian - API Documentation

## Module 1: User Management Module

### Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Register a new user with role (patient, donor, or admin).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor",
  "bloodGroup": "O+",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345"
  },
  "dateOfBirth": "1990-01-01"
}
```

**Required Fields:**
- `name` (string)
- `email` (string, valid email format)
- `password` (string, min 6 characters)
- `role` (enum: "patient", "donor", "admin")
- `bloodGroup` (enum: "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "bloodGroup": "O+"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 2. Login User
**POST** `/auth/login`

Login user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "bloodGroup": "O+"
    },
    "token": "jwt_token_here"
  }
}
```

**Note:** Token expires in 1 day.

---

### 3. Get User Profile
**GET** `/auth/profile`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "bloodGroup": "O+",
      "phone": "1234567890",
      "address": {...},
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

### 4. Update User Profile
**PUT** `/auth/profile`

Update authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "phone": "9876543210",
  "address": {
    "street": "456 New St",
    "city": "New City",
    "state": "New State",
    "zipCode": "54321"
  },
  "dateOfBirth": "1990-01-01",
  "bloodGroup": "O-"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {...}
  }
}
```

---

## Donor Endpoints

### 5. Update Donor Availability
**POST** `/donors/availability`

Update donor availability status and last donation date.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Access:** Donor role only

**Request Body:**
```json
{
  "availabilityStatus": true,
  "lastDonationDate": "2024-01-15"
}
```

**Required Fields:**
- `availabilityStatus` (boolean: true/false)

**Optional Fields:**
- `lastDonationDate` (string, ISO date format)

**Response (200):**
```json
{
  "success": true,
  "message": "Donor availability updated successfully",
  "data": {
    "donor": {
      "_id": "donor_id",
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "bloodGroup": "O+",
        "phone": "1234567890"
      },
      "availabilityStatus": true,
      "lastDonationDate": "2024-01-15T00:00:00.000Z",
      "totalDonations": 1,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

### 6. Get Donor Availability
**GET** `/donors/availability`

Get donor's availability status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Access:** Donor role only

**Response (200):**
```json
{
  "success": true,
  "data": {
    "donor": {
      "_id": "donor_id",
      "user": {...},
      "availabilityStatus": true,
      "lastDonationDate": "2024-01-15T00:00:00.000Z",
      "totalDonations": 1,
      "notes": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Please provide all required fields: name, email, password, role, bloodGroup"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Required roles: donor"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

---

## Authentication Flow

1. **Register** or **Login** to get a JWT token
2. Include the token in the `Authorization` header for protected routes:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
3. Token expires after 1 day - user needs to login again

---

## Role-Based Access

- **Patient**: Can access patient-specific routes
- **Donor**: Can access donor-specific routes (availability)
- **Admin**: Can access admin-specific routes

Use the `allowRoles()` middleware to protect routes by role.

