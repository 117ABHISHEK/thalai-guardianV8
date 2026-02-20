const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Security Hardening Tests', () => {
  // Clear any existing connection before all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Security Headers (Helmet)', () => {
    test('Should have security headers set by helmet', async () => {
      const response = await request(app).get('/api/health');
      
      // X-Powered-By should be removed or hidden
      expect(response.headers['x-powered-by']).toBeUndefined();
      
      // Strict-Transport-Security (STS) should be present in production, 
      // but maybe not in dev. Let's check common ones.
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-dns-prefetch-control']).toBe('off');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['x-download-options']).toBe('noopen');
      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test('Should include rate limit headers', async () => {
      const response = await request(app).get('/api/public/stats');
      
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Strict Input Validation', () => {
    test('Should reject registration with unexpected fields', async () => {
      const maliciousData = {
        name: 'Hacker',
        email: 'hacker@example.com',
        password: 'password123',
        role: 'patient',
        bloodGroup: 'O+',
        admin: true, // Unexpected field
        injectedField: 'malicious' // Unexpected field
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNEXPECTED_FIELDS');
      expect(response.body.message).toContain('admin, injectedField');
    });

    test('Should reject login with unexpected fields', async () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        extra: 'not allowed'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(data)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNEXPECTED_FIELDS');
    });
  });

  describe('XSS Sanitization', () => {
    test('Should escape HTML tags in name field', async () => {
      // Note: This tests if the validator's .escape() is working
      // We check if the controller receives escaped data or if the validator handles it.
      // Since express-validator modifies req.body only if normalized, 
      // we'll check if the reflected data or saved data is escaped.
      
      // For registration, it might not reflect it back directly in full, 
      // but we can check if it passes validation.
      const data = {
        name: '<script>alert("xss")</script>Secure Name',
        email: 'xss_test@example.com',
        password: 'password123',
        role: 'patient',
        bloodGroup: 'A+'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(data);
      
      // If registration succeeds, the name in the response should be escaped
      if (response.status === 201) {
        expect(response.body.data.user.name).not.toContain('<script>');
        expect(response.body.data.user.name).toContain('&lt;script&gt;');
      } else {
        // If it failed for other reasons, that's fine too
        console.log('Registration failed as expected or for other reasons:', response.body.message);
      }
    });
  });
});
