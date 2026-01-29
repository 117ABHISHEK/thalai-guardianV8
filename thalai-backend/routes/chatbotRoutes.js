const express = require('express');
const router = express.Router();
const { askChatbot, getChatHistory, getSuggestions } = require('../controllers/chatbotController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// @route   POST /api/chatbot/ask
// @desc    Get chatbot response
// @access  Optional
router.post('/ask', optionalProtect, askChatbot);

// @route   GET /api/chatbot/history
// @desc    Get chat history
// @access  Private
router.get('/history', protect, getChatHistory);

// @route   GET /api/chatbot/suggestions
// @desc    Get initial suggestions
// @access  Optional
router.get('/suggestions', optionalProtect, getSuggestions);

module.exports = router;

