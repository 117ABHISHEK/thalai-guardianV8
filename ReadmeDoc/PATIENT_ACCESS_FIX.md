# 🐛 Bug Fix: Patient Access Denied for Blood Requests

## Issue

Patients were seeing "Access Denied" when trying to view their own blood request history or when the system checked for active requests.

## Root Cause

- The backend `getUserRequests` endpoint expects the `User ID` as a parameter and compares it with the authenticated user's ID.
- The frontend was passing `user._id`.
- Immediately after login, the user object in the context comes from the login response, which uses `id` instead of `_id`.
- This caused `user._id` to be `undefined`, leading to a mismatch in the backend check (`req.user._id !== "undefined"`), resulting in a 403 Forbidden error.

## Fix Implemented

Updated the frontend to use `user._id || user.id` when calling `getUserRequests`. This ensures a valid ID is always passed, regardless of whether the user object comes from the login response or a profile fetch.

### Files Modified

1.  `thalai-frontend/src/pages/PatientRequestHistory.jsx`
2.  `thalai-frontend/src/pages/PatientRequestForm.jsx`

## Verification

1.  Log in as a patient (e.g., `patient1@thalai.com`).
2.  Navigate to the "My Requests" tab.
3.  You should now see the list of blood requests (or "No blood requests found") instead of "Access Denied" or an error message.
4.  Navigate to "Create Request". The system should correctly check for active requests without error.
