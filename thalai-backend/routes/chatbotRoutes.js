const express = require('express');
const router = express.Router();
const { askChatbot, getChatHistory } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// @route   POST /api/chatbot/ask
// @desc    Get chatbot response
// @access  Private
router.post('/ask', askChatbot);

// @route   GET /api/chatbot/history
// @desc    Get chat history
// @access  Private
router.get('/history', getChatHistory);

module.exports = router;

