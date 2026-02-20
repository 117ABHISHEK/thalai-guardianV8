const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');
const ChatbotLog = require('../models/chatbotLogModel');

describe('Chatbot Service Tests', () => {
  let token;
  let userId;

  const testAddress = {
    street: '123 Test St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001'
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await ChatbotLog.deleteMany({});

    // Create User
    const user = await User.create({
      name: 'Chat User',
      email: 'chat@test.com',
      password: 'password123',
      role: 'patient',
      bloodGroup: 'B-',
      address: testAddress
    });
    userId = user._id;
    token = user.generateToken();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Chatbot Interactions', () => {
    test('Should get chatbot response (Guest)', async () => {
      const response = await request(app)
        .post('/api/chatbot/ask')
        .send({ message: 'What is Thalassemia?' });

      expect(response.status).toBe(200);
      expect(response.body.data.intent).toBe('thalassemia_info');
    });

    test('Should get chatbot response (Authenticated)', async () => {
      const response = await request(app)
        .post('/api/chatbot/ask')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Tell me about diet' });

      expect(response.status).toBe(200);
      expect(response.body.data.intent).toBe('diet_advice');
    });
  });
});
