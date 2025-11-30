# 🚀 Quick Start Guide - Production Features

## Overview

This guide helps you quickly set up and test the production-ready features for ThalAI Guardian.

## ✅ What's Been Implemented

1. **Extended Donor Model** - Age validation, 90-day rule, eligibility tracking
2. **Patient Model** - Transfusion history for ML prediction
3. **Eligibility Service** - Comprehensive eligibility computation
4. **Validation System** - express-validator integration
5. **ML Microservice** - Python Flask API for transfusion prediction
6. **Admin Tools** - Eligibility reporting and management

## 🏃 Quick Setup

### 1. Backend Setup

```bash
cd thalai-backend

# Install dependencies (if not already installed)
npm install

# Install express-validator (already done)
npm install express-validator

# Seed database (optional)
npm run seed

# Start server
npm run dev
```

Server runs on `http://localhost:5000`

### 2. ML Service Setup

```bash
cd thalai-ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train model (first time only)
python train_model.py

# Start service
python app.py
```

Service runs on `http://localhost:8000`

## 🧪 Quick Tests

### 1. Test Donor Registration (Age < 18)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Young Donor",
    "email": "young@example.com",
    "password": "password123",
    "role": "donor",
    "bloodGroup": "O+",
    "dob": "2010-01-01",
    "heightCm": 150,
    "weightKg": 45
  }'
```

**Expected:** 400 error - "Must be at least 18 years old"

### 2. Test Donor Registration (Donation Interval < 90 Days)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Donor",
    "email": "test@example.com",
    "password": "password123",
    "role": "donor",
    "bloodGroup": "O+",
    "dob": "1990-01-01",
    "heightCm": 175,
    "weightKg": 70,
    "lastDonationDate": "2024-01-15"
  }'
```

**Expected:** 422 error with `nextPossibleDate` field

### 3. Test Valid Donor Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Valid Donor",
    "email": "valid@example.com",
    "password": "password123",
    "role": "donor",
    "bloodGroup": "O+",
    "dob": "1990-01-01",
    "heightCm": 175,
    "weightKg": 70,
    "lastDonationDate": "2023-12-01"
  }'
```

**Expected:** 201 success with token

### 4. Test Eligibility Report (Admin)

```bash
# First, login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@thalai.com",
    "password": "password123"
  }'

# Then get eligibility report (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/admin/donors/eligibility-report \
  -H "Authorization: Bearer TOKEN"
```

**Expected:** 200 with eligibility report

### 5. Test ML Prediction

```bash
curl -X POST http://localhost:8000/predict-next-transfusion \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "test_patient",
    "history": [
      {"date": "2024-01-15", "units": 2, "hb_value": 8.5},
      {"date": "2024-02-20", "units": 2, "hb_value": 8.2}
    ],
    "lastHb": 8.0,
    "age": 25,
    "weightKg": 50,
    "comorbidities": ["thalassemia"],
    "currentDate": "2024-03-01"
  }'
```

**Expected:** Prediction with nextDate, confidence, explanation

## 📝 Sample Requests

### Register a Patient (No Age Restriction)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Patient Child",
    "email": "patient@example.com",
    "password": "password123",
    "role": "patient",
    "bloodGroup": "A-",
    "dob": "2015-01-01"
  }'
```

**Expected:** 201 success (patients can be < 18)

### Verify Donor (Admin)

```bash
curl -X POST http://localhost:5000/api/admin/donors/verify \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "DONOR_ID",
    "healthClearance": true,
    "eligibilityStatus": "eligible",
    "eligibilityReason": "All checks passed"
  }'
```

## 🔍 Key Features to Test

1. **Age Validation** - Donors must be 18+
2. **90-Day Rule** - Donation interval enforcement
3. **Eligibility Status** - eligible/ineligible/deferred
4. **Health Clearance** - Admin-managed
5. **ML Prediction** - Next transfusion date
6. **Eligibility Report** - Comprehensive admin report

## 📚 Documentation

- `PRODUCTION_FEATURES_IMPLEMENTATION.md` - Detailed implementation
- `PRODUCTION_FEATURES_COMPLETE_SUMMARY.md` - Complete summary
- `IMPLEMENTATION_COMPLETE.md` - Final summary
- `thalai-ai-service/README.md` - ML service docs

## ⚠️ Important Notes

1. **ML Model:** Train the model first (`python train_model.py`)
2. **Database:** Seed the database for test data (`npm run seed`)
3. **Tokens:** Replace `TOKEN` with actual JWT tokens from login
4. **Dates:** Use ISO format (YYYY-MM-DD) for dates
5. **Environment:** Ensure `.env` file has required variables

## 🎯 Next Steps

1. Train ML model
2. Test all endpoints
3. Build frontend components
4. Write tests
5. Add logging

---

**All core backend functionality is ready to use!** ✅

