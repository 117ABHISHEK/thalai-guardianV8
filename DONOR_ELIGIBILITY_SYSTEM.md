# Blood Donor Eligibility System Documentation

## Overview
The Blood Donor Eligibility System is a comprehensive validation framework that ensures donor safety and blood quality through automated checks and medical report validation.

## Eligibility Criteria

### 1. Age Requirement ✅
- **Minimum Age**: 18 years old
- **Validation**: Automatic calculation from date of birth
- **Status**: Required for all donors

### 2. Donation Interval (90-Day Rule) ✅
- **Minimum Interval**: 90 days (3 months) between donations
- **Calculation**: Based on `lastDonationDate` and `donationFrequencyMonths`
- **Next Donation Date**: Automatically computed
- **Override**: Admin can manually set eligibility

### 3. Medical History Check ✅
- **Contraindications**: Conditions that prevent donation
  - Active infection
  - Recent surgery
  - Heart disease
  - Cancer
  - HIV/Hepatitis
  - Blood disorders
  - Pregnancy
  - Recent vaccination
- **Validation**: Automatic screening of medical history
- **Admin Review**: Required if no medical history provided

### 4. Blood Report Validation ✅ **NEW**
Comprehensive validation of vital parameters from medical reports:

#### Hemoglobin Levels
- **Minimum Required**: 12.5 g/dL
- **Maximum Safe**: 20 g/dL
- **Reason**: Ensures donor has sufficient hemoglobin for safe donation

#### Blood Pressure
- **Systolic Range**: 90-180 mmHg
- **Diastolic Range**: 60-100 mmHg
- **Reason**: Prevents donation during hypertension or hypotension

#### Pulse Rate
- **Normal Range**: 50-110 bpm
- **Optimal**: 60-100 bpm
- **Reason**: Ensures cardiovascular stability

#### Body Temperature
- **Normal Range**: 35.5-37.5°C
- **Alert Threshold**: >37.5°C (possible infection)
- **Reason**: Prevents donation during fever or illness

#### Report Validity
- **Maximum Age**: 90 days (3 months)
- **Reason**: Ensures current health status
- **Action**: Donors must submit recent reports

### 5. Health Clearance ✅
- **Authority**: Admin/Medical Staff only
- **Requirement**: Must be granted after reviewing medical documents
- **Override**: Admin can grant clearance despite missing reports

### 6. Verification Status ✅
- **Authority**: Admin only
- **Requirement**: Donor identity and documents must be verified
- **Purpose**: Ensures authenticity and prevents fraud

## Eligibility Status Values

### `eligible`
- All checks passed
- Donor can donate blood immediately
- Display: Green badge ✅

### `ineligible`
- One or more checks failed
- Donation not permitted
- Display: Red badge ❌
- Includes specific reason(s)

### `deferred`
- Default status for new donors
- Pending admin review
- Display: Yellow badge ⏳

## Blood Report Requirements

### Required Fields (at least one)
- Hemoglobin (g/dL)
- Blood Pressure (Systolic/Diastolic)
- Pulse Rate (bpm)
- Temperature (°C)

### Optional Fields
- Height (cm)
- Weight (kg)
- Notes

### Submission Process
1. Donor uploads medical report via "Health Reports & Metrics" tab
2. System validates vital parameters automatically
3. Report must be within 90 days
4. Admin reviews and grants health clearance
5. Eligibility status updated automatically

## Validation Flow

```
Donor Registration
    ↓
Age Check (18+)
    ↓
Submit Medical Reports
    ↓
Blood Report Validation
    ├── Hemoglobin Check
    ├── Blood Pressure Check
    ├── Pulse Rate Check
    └── Temperature Check
    ↓
Admin Review
    ├── Verify Identity
    ├── Review Medical History
    └── Grant Health Clearance
    ↓
Donation Interval Check (90 days)
    ↓
Eligibility Determination
    ├── All Checks Pass → ELIGIBLE ✅
    ├── Any Check Fails → INELIGIBLE ❌
    └── Pending Review → DEFERRED ⏳
```

## API Endpoints

### Get Donor Profile with Eligibility
```
GET /api/donors/profile
Authorization: Bearer <token>

Response:
{
  "donor": {
    "eligibilityStatus": "eligible|ineligible|deferred",
    "eligibilityReason": "string",
    "nextPossibleDonationDate": "Date",
    "checks": {
      "ageCheck": { "passed": boolean, "reason": "string" },
      "donationIntervalCheck": { "passed": boolean, "reason": "string" },
      "medicalHistoryCheck": { "passed": boolean, "reason": "string" },
      "bloodReportCheck": { "passed": boolean, "reason": "string" },
      "healthClearanceCheck": { "passed": boolean, "reason": "string" },
      "verificationCheck": { "passed": boolean, "reason": "string" }
    },
    "recentBloodReport": {
      "hemoglobin": number,
      "bpSystolic": number,
      "bpDiastolic": number,
      "pulseRate": number,
      "temperature": number,
      "reportDate": "Date"
    }
  }
}
```

### Update Donor Availability
```
POST /api/donors/availability
Authorization: Bearer <token>

Body:
{
  "availabilityStatus": boolean,
  "lastDonationDate": "Date"
}
```

### Admin: Update Donor Eligibility
```
PUT /api/admin/donors/:donorId/eligibility
Authorization: Bearer <admin-token>

Body:
{
  "eligibilityStatus": "eligible|ineligible|deferred",
  "eligibilityReason": "string",
  "healthClearance": boolean
}
```

## Frontend Components

### DonorDashboard
- **Location**: `thalai-frontend/src/pages/DonorDashboard.jsx`
- **Features**:
  - Overview tab with stats
  - Profile management
  - Health Reports & Metrics tab
  - Eligibility status link

### HealthMetricsForm
- **Location**: `thalai-frontend/src/components/HealthMetricsForm.jsx`
- **Features**:
  - Add medical reports
  - Input vital parameters (Hemoglobin, BP, Pulse, Temperature)
  - Height and Weight tracking per report
  - Real-time validation

### DonorProfile
- **Location**: `thalai-frontend/src/pages/DonorProfile.jsx`
- **Features**:
  - Detailed eligibility status display
  - Color-coded badges
  - Breakdown of all checks
  - Next possible donation date
  - Recent blood report summary

## Backend Services

### eligibilityService.js
- **Location**: `thalai-backend/services/eligibilityService.js`
- **Functions**:
  - `computeEligibility(donorDoc)` - Main eligibility computation
  - `validateBloodReport(report)` - Validates vital parameters
  - `getMostRecentBloodReport(reports)` - Retrieves latest report
  - `validateDonorRegistration(donorData)` - Registration validation
  - `calculateAge(dob)` - Age calculation
  - `daysSinceLastDonation(date)` - Interval calculation

## Database Models

### Donor Model
- **Location**: `thalai-backend/models/donorModel.js`
- **Key Fields**:
  - `eligibilityStatus`: enum ['eligible', 'ineligible', 'deferred']
  - `eligibilityReason`: string
  - `healthClearance`: boolean
  - `isVerified`: boolean
  - `lastDonationDate`: Date
  - `nextPossibleDonationDate`: Date
  - `medicalReports`: Array of reports with vitals
  - `medicalHistory`: Array of conditions

## Logging

### Eligibility Changes
- **File**: `thalai-backend/logs/eligibility.log`
- **Events**:
  - Eligibility status changes
  - Health clearance granted/revoked
  - Admin overrides
  - Validation failures

### Log Format
```json
{
  "timestamp": "ISO-8601",
  "level": "info|warn|error",
  "message": "Eligibility status changed",
  "type": "eligibility_change",
  "donorId": "ObjectId",
  "userId": "ObjectId",
  "oldStatus": "string",
  "newStatus": "string",
  "reason": "string",
  "adminId": "ObjectId"
}
```

## Testing

### Test Cases
1. **Age Validation**
   - Under 18 years → Ineligible
   - 18+ years → Pass

2. **Donation Interval**
   - < 90 days since last donation → Ineligible
   - ≥ 90 days → Pass

3. **Blood Report Validation**
   - Hemoglobin < 12.5 g/dL → Ineligible
   - BP out of range → Ineligible
   - Elevated temperature → Ineligible
   - All parameters normal → Pass

4. **Report Age**
   - > 90 days old → Ineligible
   - ≤ 90 days → Pass

5. **Medical History**
   - Contraindication present → Ineligible
   - No contraindications → Pass

6. **Admin Controls**
   - Health clearance granted → Pass
   - Verification completed → Pass

## User Workflows

### Donor Registration & Eligibility
1. Register as donor with basic info (age 18+)
2. Complete profile with medical history
3. Upload recent blood report (< 90 days)
4. Wait for admin verification
5. Admin reviews documents and grants health clearance
6. System computes eligibility automatically
7. Donor can check status on dashboard
8. If eligible, can mark availability for donation

### Donation Process
1. Check eligibility status (must be "eligible")
2. Verify 90 days have passed since last donation
3. Submit current health report if needed
4. Admin performs final health check
5. Donation proceeds if all checks pass
6. System updates lastDonationDate
7. Eligibility automatically set to "ineligible" for 90 days
8. Next donation date calculated and displayed

## Admin Workflows

### Donor Verification
1. Review donor registration details
2. Verify identity documents
3. Check medical history for contraindications
4. Review blood reports
5. Validate vital parameters
6. Grant health clearance if appropriate
7. Set verification status
8. System computes eligibility automatically

### Manual Override
1. Review donor case
2. Assess special circumstances
3. Manually set eligibility status
4. Provide detailed reason
5. Grant/revoke health clearance
6. Changes logged automatically

## Security & Privacy

### Access Control
- **Donors**: Can view own eligibility status only
- **Admins**: Can view and modify all donor eligibilities
- **Patients**: No access to donor eligibility data

### Data Protection
- Medical reports encrypted at rest
- Sensitive health data access logged
- HIPAA-compliant data handling
- Audit trail for all eligibility changes

## Future Enhancements

### Planned Features
1. **Automated Reminders**
   - Notify donors when eligible to donate again
   - Remind to submit updated blood reports

2. **Advanced Analytics**
   - Eligibility trends over time
   - Common disqualification reasons
   - Donor retention metrics

3. **Mobile App Integration**
   - Push notifications for eligibility status
   - Quick blood report upload via camera

4. **AI-Powered Screening**
   - Predict potential health issues
   - Recommend preventive measures
   - Optimize donation scheduling

## Troubleshooting

### Common Issues

#### "Blood report required for eligibility"
- **Cause**: No medical report submitted
- **Solution**: Upload recent blood report via Health Reports tab

#### "Blood report outdated"
- **Cause**: Latest report is > 90 days old
- **Solution**: Submit a new blood report within 90 days

#### "Hemoglobin too low"
- **Cause**: Hemoglobin < 12.5 g/dL
- **Solution**: Improve iron intake, consult doctor, retest after treatment

#### "Donation interval requirement not met"
- **Cause**: < 90 days since last donation
- **Solution**: Wait until next possible donation date (displayed on dashboard)

#### "Pending admin verification"
- **Cause**: Admin has not verified donor yet
- **Solution**: Wait for admin review, ensure all documents submitted

## Support

For technical issues or questions:
- **Email**: support@thalai-guardian.com
- **Documentation**: `/docs/eligibility`
- **Admin Portal**: `/admin/donors`

---

**Last Updated**: 2025-11-28
**Version**: 2.0
**Author**: Thalai Guardian Development Team
