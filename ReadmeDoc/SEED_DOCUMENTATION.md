# Database Seed Documentation

## Overview
This document describes the enhanced seed data for the ThalAI Guardian system, including comprehensive medical reports with blood parameters, height/weight tracking, and complete eligibility validation data.

## Seed Data Summary

### Total Records
- **Users**: 21 total
  - 1 Admin
  - 10 Patients
  - 10 Donors
- **Medical Reports**: 200 total (10 per user)
- **Donor History**: ~50-70 records
- **Blood Requests**: 10 records

---

## User Accounts

### Admin Account
```
Email: admin@thalai.com
Password: password123
Role: admin
Blood Group: O+
```

### Patient Accounts (10 total)

| # | Name | Email | Blood Group | City | Medical Reports |
|---|------|-------|-------------|------|-----------------|
| 1 | Rajesh Kumar | patient1@thalai.com | A- | Delhi | 10 |
| 2 | Priya Sharma | patient2@thalai.com | B+ | Bangalore | 10 |
| 3 | Arjun Patel | patient3@thalai.com | O- | Pune | 10 |
| 4 | Sneha Reddy | patient4@thalai.com | A+ | Hyderabad | 10 |
| 5 | Amit Singh | patient5@thalai.com | AB+ | Mumbai | 10 |
| 6 | Neha Gupta | patient6@thalai.com | O+ | Chennai | 10 |
| 7 | Karan Malhotra | patient7@thalai.com | B- | Kolkata | 10 |
| 8 | Pooja Iyer | patient8@thalai.com | A- | Bangalore | 10 |
| 9 | Rahul Verma | patient9@thalai.com | AB- | Delhi | 10 |
| 10 | Ananya Das | patient10@thalai.com | O- | Mumbai | 10 |

**Password for all**: `password123`

### Donor Accounts (10 total)

| # | Name | Email | Blood Group | City | Status | Eligibility |
|---|------|-------|-------------|------|--------|-------------|
| 1 | Vikram Singh | donor1@thalai.com | O+ | Mumbai | ✅ Verified | ✅ Eligible |
| 2 | Anita Reddy | donor2@thalai.com | A+ | Mumbai | ✅ Verified | ✅ Eligible |
| 3 | Ramesh Iyer | donor3@thalai.com | B+ | Delhi | ✅ Verified | ❌ Ineligible |
| 4 | Sunita Mehta | donor4@thalai.com | AB+ | Bangalore | ✅ Verified | ✅ Eligible |
| 5 | Mohammed Ali | donor5@thalai.com | O- | Pune | ✅ Verified | ✅ Eligible |
| 6 | Kavita Desai | donor6@thalai.com | A- | Mumbai | ❌ Pending | ❌ Deferred |
| 7 | Suresh Kumar | donor7@thalai.com | B- | Delhi | ❌ Pending | ❌ Deferred |
| 8 | Deepa Nair | donor8@thalai.com | AB- | Chennai | ✅ Verified | ✅ Eligible |
| 9 | Arun Joshi | donor9@thalai.com | O+ | Hyderabad | ✅ Verified | ✅ Eligible |
| 10 | Meera Kapoor | donor10@thalai.com | A+ | Kolkata | ✅ Verified | ❌ Ineligible |

**Password for all**: `password123`

---

## Medical Reports Structure

### Patient Medical Reports (Thalassemia Profile)
Each patient has **10 monthly medical reports** with the following parameters:

```javascript
{
  title: "Thalassemia Profile - [Month Year]",
  reportDate: Date (monthly intervals),
  hemoglobin: 7-10 g/dL (low for thalassemia patients),
  ferritin: 800-2000 ng/mL (iron overload indicator),
  sgpt: 20-60 U/L (liver function),
  sgot: 20-60 U/L (liver function),
  creatinine: 0.6-1.2 mg/dL (kidney function),
  heightCm: 140-170 cm (varies per report),
  weightKg: 35-60 kg (varies per report),
  notes: "Recent thalassemia screening" or "Follow-up report #X"
}
```

### Donor Medical Reports (Health Checkup)
Each donor has **10 monthly medical reports** with the following parameters:

```javascript
{
  title: "Health Checkup - [Month Year]",
  reportDate: Date (monthly intervals),
  hemoglobin: 13-16 g/dL (normal for donors),
  bpSystolic: 110-140 mmHg (blood pressure),
  bpDiastolic: 70-90 mmHg (blood pressure),
  pulseRate: 60-90 bpm (heart rate),
  temperature: 36.5-37.2°C (body temperature),
  heightCm: 160-185 cm (varies per report),
  weightKg: 55-85 kg (varies per report),
  notes: "Latest health checkup - all parameters normal" or "Regular checkup #X"
}
```

---

## Patient Profiles

### Transfusion History
Each patient has **3-10 transfusion records** with:
- Date: Monthly intervals
- Units: 1-2 units per transfusion
- Hemoglobin value: 7-10 g/dL
- Hospital and doctor information
- Notes

### Comorbidities
Every 3rd patient (33%) has:
- Condition: "Iron Overload"
- Severity: "moderate"
- Diagnosis date: 1 year ago

---

## Donor Profiles

### Eligibility Distribution
- **Eligible Donors**: 6 out of 10 (60%)
  - Verified: Yes
  - Health Clearance: Yes
  - Last Donation: 95+ days ago
  - Medical Reports: 10 recent reports
  - Status: "eligible"

- **Ineligible Donors**: 2 out of 10 (20%)
  - Verified: Yes
  - Health Clearance: Yes
  - Last Donation: 45 days ago (too recent)
  - Medical Reports: 10 recent reports
  - Status: "ineligible"
  - Reason: "Donation interval requirement not met"

- **Pending Donors**: 2 out of 10 (20%)
  - Verified: No
  - Health Clearance: No
  - Medical Reports: 10 recent reports
  - Status: "deferred"
  - Reason: "Pending admin review and health clearance"

### Medical History
Every 4th donor (25%) has:
- Condition: "Seasonal Allergies"
- Details: "Mild pollen allergy"
- Is Contraindication: No

### Donation History
- Verified donors: 2-10 donations each
- Donation interval: 90 days (3 months)
- All donations tracked in DonorHistory collection

---

## Blood Requests

### Request Distribution
- **Total Requests**: 10
- **Status Distribution**:
  - Pending: ~25%
  - Searching: ~25%
  - Matched: ~25%
  - Completed: ~25%

### Urgency Levels
- Low: ~25%
- Medium: ~25%
- High: ~25%
- Critical: ~25%

### Request Details
Each request includes:
- Patient ID and blood group
- Units required: 1-3 units
- Hospital and location information
- Contact person details
- Creation date: Random within last 30 days

---

## Running the Seed

### Seed Database
```bash
cd thalai-backend
npm run seed
```

### Destroy Data
```bash
cd thalai-backend
npm run seed -- -d
# or
npm run seed -- --destroy
```

---

## Expected Output

```
🔄 Starting enhanced seed process with medical reports...
🧹 Clearing existing data...
✅ Existing data cleared.
✅ Admin user created: admin@thalai.com
✅ 10 patient users created
✅ 10 patient profiles created with medical reports
✅ 10 donor users created
✅ 10 donor profiles created with medical reports and eligibility data
✅ 50-70 donor history records created
✅ 10 blood requests created

📊 ENHANCED SEED SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Total Users: 21
   - Admin: 1
   - Patients: 10 (with 10 medical reports each)
   - Donors: 10 (with 10 medical reports each)
🩸 Donor Profiles:
   - Verified: 8
   - Eligible: 6
   - Pending Verification: 2
📋 Blood Requests: 10
   - Pending: 2-3
   - Searching: 2-3
   - Matched: 2-3
   - Completed: 2-3
📝 Donor History Records: 50-70
📄 Total Medical Reports: 200
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Testing Scenarios

### 1. Eligible Donor Login
```
Email: donor1@thalai.com
Password: password123
Expected: Can see "Eligible" status, can donate
```

### 2. Ineligible Donor Login (Recent Donation)
```
Email: donor3@thalai.com
Password: password123
Expected: "Ineligible" status, must wait 90 days
```

### 3. Pending Donor Login
```
Email: donor6@thalai.com
Password: password123
Expected: "Deferred" status, pending verification
```

### 4. Patient Login
```
Email: patient1@thalai.com
Password: password123
Expected: Can view transfusion history and medical reports
```

### 5. Admin Login
```
Email: admin@thalai.com
Password: password123
Expected: Can verify donors, view all data
```

---

## Data Validation

### Blood Report Validation
All donor medical reports are validated against:
- Hemoglobin: 12.5-20 g/dL ✅ (seed data: 13-16 g/dL)
- BP Systolic: 90-180 mmHg ✅ (seed data: 110-140 mmHg)
- BP Diastolic: 60-100 mmHg ✅ (seed data: 70-90 mmHg)
- Pulse Rate: 50-110 bpm ✅ (seed data: 60-90 bpm)
- Temperature: 35.5-37.5°C ✅ (seed data: 36.5-37.2°C)
- Report Age: < 90 days ✅ (seed data: monthly reports)

### Eligibility Validation
All eligible donors pass:
- Age Check: 18+ years ✅
- Donation Interval: 90+ days ✅
- Medical History: No contraindications ✅
- Blood Report: All parameters normal ✅
- Health Clearance: Granted ✅
- Verification: Completed ✅

---

## Database Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "admin" | "patient" | "donor",
  bloodGroup: String,
  phone: String,
  address: Object,
  dateOfBirth: Date,
  isActive: Boolean
}
```

### Donors Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  dob: Date,
  heightCm: Number,
  weightKg: Number,
  medicalHistory: Array,
  medicalReports: Array (10 reports with vitals + height/weight),
  lastDonationDate: Date,
  donationFrequencyMonths: 3,
  totalDonations: Number,
  availabilityStatus: Boolean,
  isVerified: Boolean,
  verifiedBy: ObjectId (ref: User),
  healthClearance: Boolean,
  eligibilityStatus: "eligible" | "ineligible" | "deferred",
  eligibilityReason: String,
  eligibilityLastChecked: Date
}
```

### Patients Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  transfusionHistory: Array (3-10 records),
  lastTransfusionDate: Date,
  medicalReports: Array (10 reports with thalassemia parameters + height/weight),
  currentHb: Number,
  currentHbDate: Date,
  comorbidities: Array
}
```

---

## Notes

### Realistic Data
- All dates are calculated relative to current date
- Blood parameters are within medically realistic ranges
- Donation intervals follow 90-day rule
- Patient hemoglobin levels reflect thalassemia condition
- Donor hemoglobin levels are normal/healthy

### Height and Weight Tracking
- Each medical report includes height and weight
- Values vary slightly between reports (realistic growth/change)
- Patients: 140-170 cm, 35-60 kg
- Donors: 160-185 cm, 55-85 kg

### Eligibility Scenarios
- **Scenario 1**: Eligible donors (60%) - All checks pass
- **Scenario 2**: Ineligible donors (20%) - Recent donation (<90 days)
- **Scenario 3**: Deferred donors (20%) - Pending verification

---

## Troubleshooting

### Seed Fails
```bash
# Check MongoDB connection
# Verify .env file has correct MONGO_URI
# Ensure MongoDB is running
```

### Duplicate Key Error
```bash
# Run destroy first
npm run seed -- -d
# Then seed again
npm run seed
```

### Missing Data
```bash
# Check console output for errors
# Verify all models are imported correctly
# Check database connection
```

---

**Last Updated**: 2025-11-28  
**Version**: 2.0 (Enhanced with Medical Reports)  
**Total Records**: 200+ medical reports, 21 users, 10 requests
