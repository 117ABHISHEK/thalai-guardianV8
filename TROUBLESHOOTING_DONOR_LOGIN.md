logger.error("Eligibility computation error", {
error: eligibilityError.message,
donorId: donor.\_id,
userId: req.user.\_id,
});
// Return donor data without eligibility if computation fails
eligibility = {
eligible: false,
reason: "Unable to compute eligibility - please contact admin",
checks: {},
nextPossibleDate: null,
};
}

```

### Benefits

- ✅ Prevents server crashes
- ✅ Provides user-friendly error messages
- ✅ Logs detailed errors for debugging
- ✅ Allows donors to still access their dashboard
- ✅ Graceful degradation of functionality

---

## Testing the Fix

### 1. Login as Donor

```

Email: donor1@thalai.com
Password: password123

```

**Expected Behavior:**

- ✅ Login successful
- ✅ Dashboard loads
- ✅ Eligibility status displays (or shows error message if computation fails)
- ✅ No server error on screen

### 2. Check Backend Logs

If eligibility computation fails, check:

```

thalai-backend/logs/error.log
thalai-backend/logs/combined.log

````

Look for:

- "Eligibility computation error"
- Donor ID and User ID
- Error message and stack trace

### 3. Verify Data

If errors persist, verify donor has:

- ✅ Valid `dob` field
- ✅ `heightCm` and `weightKg` values
- ✅ Medical reports (optional but recommended)
- ✅ User reference populated

---

## Common Issues & Solutions

### Issue 1: "Donor profile not found"

**Cause:** No donor document exists for the user
**Solution:**

```bash
# Re-seed the database
cd thalai-backend
npm run seed
````

### Issue 2: "Unable to compute eligibility"

**Cause:** Missing or invalid data in donor profile
**Solution:**

1. Check backend logs for specific error
2. Verify donor has all required fields
3. Check if `dob` is a valid date
4. Ensure user reference is populated

### Issue 3: Eligibility shows "Pending admin review"

**Cause:** Donor not verified or health clearance not granted
**Solution:**

1. Login as admin (admin@thalai.com)
2. Navigate to donor verification
3. Verify the donor
4. Grant health clearance

---

## Debugging Steps

### 1. Check Backend Terminal

Look for error messages when donor logs in

### 2. Check Browser Console

```
F12 → Console tab
Look for API errors or network failures
```

### 3. Check Network Tab

```
F12 → Network tab
Filter: XHR
Look for failed requests to /api/donors/availability or /api/donors/profile
```

### 4. Test API Directly

```bash
# Get auth token first (login)
# Then test donor endpoints

curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/donors/availability
```

---

## Prevention

### Best Practices

1. ✅ Always wrap eligibility computation in try-catch
2. ✅ Log errors with context (donorId, userId)
3. ✅ Return graceful fallback data
4. ✅ Validate donor data before computation
5. ✅ Use proper error messages for users

### Data Validation

Ensure all donors have:

- Valid `dob` (Date object)
- `heightCm` (number, 50-250)
- `weightKg` (number, 20-250)
- `user` reference (ObjectId)
- `eligibilityStatus` ('eligible', 'ineligible', or 'deferred')

---

## Verification Checklist

After implementing the fix:

- [ ] Donor can login without server error
- [ ] Dashboard loads successfully
- [ ] Eligibility status displays (or shows graceful error)
- [ ] No console errors
- [ ] Backend logs errors properly (if any)
- [ ] All donor endpoints working
- [ ] Profile page accessible
- [ ] Health metrics form functional

---

## Status

✅ **FIXED** - Error handling added to donor controllers
✅ **TESTED** - Graceful degradation working
✅ **DOCUMENTED** - Troubleshooting guide created

---

**Last Updated**: 2025-11-28
**Fixed By**: Thalai Guardian Development Team
**Version**: 2.0.1 (Error Handling Enhancement)
