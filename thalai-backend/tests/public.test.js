const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const BloodRequest = require('../models/requestModel');
const Doctor = require('../models/doctorModel');

describe('Public API Tests', () => {
  const testAddress = {
    street: '123 Test St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001'
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await Donor.deleteMany({});
    await BloodRequest.deleteMany({});
    await Doctor.deleteMany({});

    // Seed data
    const patientUser = await User.create({
      name: 'Public Patient', email: 'p@test.com', password: 'password', role: 'patient', bloodGroup: 'A+', address: testAddress
    });
    
    const donorUser = await User.create({
      name: 'Public Donor', email: 'd@test.com', password: 'password', role: 'donor', bloodGroup: 'O-', address: testAddress
    });
    
    const doctorUser = await User.create({
      name: 'Public Doctor', email: 'doc@test.com', password: 'password', role: 'doctor', bloodGroup: 'B+', address: testAddress
    });

    await Donor.create({
      user: donorUser._id,
      dob: '1990-01-01',
      isVerified: true,
      availabilityStatus: true,
      totalDonations: 5
    });

    await Doctor.create({
      user: doctorUser._id,
      isVerified: true,
      licenseNumber: 'LIC-12345',
      specialization: 'Hematology',
      qualification: 'MBBS MD'
    });

    await BloodRequest.create({
      patientId: patientUser._id,
      bloodGroup: 'A+',
      unitsRequired: 2,
      urgency: 'high',
      status: 'pending'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Should fetch public statistics', async () => {
    const response = await request(app).get('/api/public/stats');
    expect(response.status).toBe(200);
  });

  test('Should fetch verified donor list', async () => {
    const response = await request(app).get('/api/public/donors');
    expect(response.status).toBe(200);
    expect(response.body.data.donors).toBeDefined();
  });
});
