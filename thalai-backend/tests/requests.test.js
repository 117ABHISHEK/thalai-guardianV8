const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const BloodRequest = require('../models/requestModel');

describe('Blood Request Management Tests', () => {
  let patientToken;
  let adminToken;
  let patientId;
  let requestId;

  const testAddress = {
    street: '123 Test St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001'
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await Patient.deleteMany({});
    await BloodRequest.deleteMany({});

    // Create Patient
    const patientUser = await User.create({
      name: 'John Patient',
      email: 'john@patient.com',
      password: 'password123',
      role: 'patient',
      bloodGroup: 'B+',
      address: testAddress
    });
    patientId = patientUser._id;
    patientToken = patientUser.generateToken();
    await Patient.create({ user: patientId });

    // Create Admin
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@system.com',
      password: 'password123',
      role: 'admin',
      bloodGroup: 'O+',
      address: testAddress
    });
    adminToken = adminUser.generateToken();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Creating Blood Requests', () => {
    test('Should create a blood request successfully', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          bloodGroup: 'B+',
          unitsRequired: 2,
          urgency: 'high',
          location: {
            hospital: 'City Hospital',
            city: 'Mumbai'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.data.request.bloodGroup).toBe('B+');
      requestId = response.body.data.request._id;
    });
  });

  describe('Retrieving & Managing Requests', () => {
    beforeEach(async () => {
      const req = await BloodRequest.create({
        patientId,
        bloodGroup: 'B+',
        unitsRequired: 1,
        status: 'searching',
        urgency: 'medium'
      });
      requestId = req._id;
    });

    test('Should get patient-specific requests', async () => {
      const response = await request(app)
        .get(`/api/requests/user/${patientId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.requests).toHaveLength(1);
    });

    test('Should cancel a request successfully', async () => {
      const response = await request(app)
        .put(`/api/requests/${requestId}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.request.status).toBe('cancelled');
    });
  });
});
