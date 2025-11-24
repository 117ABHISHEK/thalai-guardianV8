/**
 * Donor Registration and Eligibility Tests
 * Tests 90-day rule, age validation, and eligibility computation
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const { computeEligibility } = require('../services/eligibilityService');

describe('Donor Registration and Eligibility Tests', () => {
  // Clear database before each test
  beforeEach(async () => {
    await User.deleteMany({});
    await Donor.deleteMany({});
  });

  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Age Validation', () => {
    test('Should reject donor registration if age < 18', async () => {
      const donorData = {
        name: 'Young Donor',
        email: 'young@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: '2010-01-01', // 14 years old
        heightCm: 150,
        weightKg: 45,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('18 years old');
      expect(response.body.error).toBe('AGE_REQUIREMENT_NOT_MET');
    });

    test('Should accept donor registration if age is exactly 18', async () => {
      // Calculate date exactly 18 years ago
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

      const donorData = {
        name: 'Adult Donor',
        email: 'adult@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: eighteenYearsAgo.toISOString().split('T')[0],
        heightCm: 175,
        weightKg: 70,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('donor');
    });

    test('Should reject donor registration if age is 17 years and 364 days', async () => {
      // Calculate date 17 years and 364 days ago
      const almostEighteen = new Date();
      almostEighteen.setFullYear(almostEighteen.getFullYear() - 18);
      almostEighteen.setDate(almostEighteen.getDate() + 1); // One day short of 18

      const donorData = {
        name: 'Almost Adult',
        email: 'almost@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: almostEighteen.toISOString().split('T')[0],
        heightCm: 175,
        weightKg: 70,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('18 years old');
    });

    test('Should accept patient registration with age < 18', async () => {
      const patientData = {
        name: 'Young Patient',
        email: 'youngpatient@example.com',
        password: 'password123',
        role: 'patient',
        bloodGroup: 'A-',
        dob: '2010-01-01',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(patientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('patient');
    });
  });

  describe('90-Day Donation Interval Rule', () => {
    test('Should reject donor registration if last donation was < 90 days ago', async () => {
      // Last donation 60 days ago
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const donorData = {
        name: 'Recent Donor',
        email: 'recent@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: '1990-01-01',
        heightCm: 175,
        weightKg: 70,
        lastDonationDate: sixtyDaysAgo.toISOString().split('T')[0],
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('DONATION_INTERVAL_NOT_MET');
      expect(response.body.nextPossibleDate).toBeDefined();
      expect(response.body.daysSince).toBeLessThan(90);
    });

    test('Should accept donor registration if last donation was exactly 90 days ago', async () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const donorData = {
        name: 'Eligible Donor',
        email: 'eligible@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: '1990-01-01',
        heightCm: 175,
        weightKg: 70,
        lastDonationDate: ninetyDaysAgo.toISOString().split('T')[0],
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    test('Should accept donor registration if last donation was 89 days ago (boundary test)', async () => {
      const eightyNineDaysAgo = new Date();
      eightyNineDaysAgo.setDate(eightyNineDaysAgo.getDate() - 89);

      const donorData = {
        name: 'Almost Eligible',
        email: 'almosteligible@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: '1990-01-01',
        heightCm: 175,
        weightKg: 70,
        lastDonationDate: eightyNineDaysAgo.toISOString().split('T')[0],
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(422);

      expect(response.body.error).toBe('DONATION_INTERVAL_NOT_MET');
    });

    test('Should accept donor registration if no previous donation', async () => {
      const donorData = {
        name: 'New Donor',
        email: 'newdonor@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: '1990-01-01',
        heightCm: 175,
        weightKg: 70,
        // No lastDonationDate
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Eligibility Service', () => {
    test('Should compute eligibility correctly for eligible donor', async () => {
      // Create eligible donor
      const user = await User.create({
        name: 'Eligible Donor',
        email: 'eligible@test.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dateOfBirth: '1990-01-01',
      });

      const donor = await Donor.create({
        user: user._id,
        dob: '1990-01-01',
        heightCm: 175,
        weightKg: 70,
        isVerified: true,
        healthClearance: true,
        lastDonationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
      });

      await donor.populate('user');

      const eligibility = computeEligibility(donor);
      
      expect(eligibility.eligible).toBe(true);
      expect(eligibility.nextPossibleDate).toBeDefined();
      expect(eligibility.checks.ageCheck.passed).toBe(true);
      expect(eligibility.checks.donationIntervalCheck.passed).toBe(true);
    });

    test('Should compute eligibility correctly for ineligible donor (recent donation)', async () => {
      const user = await User.create({
        name: 'Recent Donor',
        email: 'recent@test.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dateOfBirth: '1990-01-01',
      });

      const donor = await Donor.create({
        user: user._id,
        dob: '1990-01-01',
        heightCm: 175,
        weightKg: 70,
        isVerified: true,
        healthClearance: true,
        lastDonationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      });

      await donor.populate('user');

      const eligibility = computeEligibility(donor);
      
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.checks.donationIntervalCheck.passed).toBe(false);
      expect(eligibility.nextPossibleDate).toBeDefined();
    });

    test('Should compute nextPossibleDate correctly', async () => {
      const user = await User.create({
        name: 'Test Donor',
        email: 'test@test.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dateOfBirth: '1990-01-01',
      });

      const lastDonationDate = new Date('2024-01-01');
      const donor = await Donor.create({
        user: user._id,
        dob: '1990-01-01',
        heightCm: 175,
        weightKg: 70,
        lastDonationDate,
        donationFrequencyMonths: 3,
      });

      await donor.populate('user');

      const eligibility = computeEligibility(donor);
      
      // Next possible date should be 90 days from last donation
      const expectedDate = new Date(lastDonationDate);
      expectedDate.setDate(expectedDate.getDate() + 90);
      
      expect(eligibility.nextPossibleDate).toBeDefined();
      expect(new Date(eligibility.nextPossibleDate).toDateString()).toBe(expectedDate.toDateString());
    });
  });

  describe('Height and Weight Validation', () => {
    test('Should reject if height < 50 cm', async () => {
      const donorData = {
        name: 'Invalid Height',
        email: 'invalid@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: '1990-01-01',
        heightCm: 40, // Too short
        weightKg: 70,
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('Should reject if weight < 20 kg', async () => {
      const donorData = {
        name: 'Invalid Weight',
        email: 'invalidw@example.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        dob: '1990-01-01',
        heightCm: 175,
        weightKg: 15, // Too light
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(donorData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

module.exports = app;

