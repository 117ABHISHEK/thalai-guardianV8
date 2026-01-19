const express = require('express');
const router = express.Router();
const { askChatbot, getChatHistory, getSuggestions } = require('../controllers/chatbotController');
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

// @route   GET /api/chatbot/suggestions
// @desc    Get initial suggestions
// @access  Private
router.get('/suggestions', getSuggestions);

module.exports = router;

