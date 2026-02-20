const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const Donor = require('../models/donorModel');
const Doctor = require('../models/doctorModel');

describe('Authentication & Profile Tests', () => {
  const testAddress = {
    street: '123 Test St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001'
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Donor.deleteMany({});
    await Doctor.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('User Registration', () => {
    test('Should register a new patient successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Patient',
          email: 'patient@test.com',
          password: 'password123',
          role: 'patient',
          bloodGroup: 'O+',
          dob: '1995-05-15',
          address: testAddress
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('patient@test.com');
    });

    test('Should register a new doctor successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr Test',
          email: 'doctor@test.com',
          password: 'password123',
          role: 'doctor',
          bloodGroup: 'A+',
          licenseNumber: 'DOC12345',
          specialization: 'Hematology',
          qualification: 'MBBS MD',
          experience: 10,
          address: testAddress
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.role).toBe('doctor');
    });

    test('Should fail registration if name contains numbers', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker 123',
          email: 'hacker@test.com',
          password: 'password123',
          role: 'patient',
          bloodGroup: 'B+',
          address: testAddress
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@test.com',
        password: 'password123',
        role: 'patient',
        bloodGroup: 'AB+',
        isActive: true,
        address: testAddress
      });
    });

    test('Should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('Profile & Password Management', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Profile User',
        email: 'profile@test.com',
        password: 'password123',
        role: 'patient',
        bloodGroup: 'O-',
        address: testAddress
      });
      userId = user._id;
      token = user.generateToken();
      await Patient.create({ user: userId });
    });

    test('Should fetch current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.name).toBe('Profile User');
    });

    test('Should change password successfully', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
