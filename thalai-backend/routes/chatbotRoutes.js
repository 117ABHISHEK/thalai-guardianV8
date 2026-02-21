const express = require('express');
const router = express.Router();
const { askChatbot, getChatHistory, getSuggestions } = require('../controllers/chatbotController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { userLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// @route   POST /api/chatbot/ask
// @desc    Get chatbot response
// @access  Optional
router.post('/ask', 
  optionalProtect, 
  userLimiter, 
  [
    body('message').notEmpty().withMessage('Message is required').isLength({ max: 1000 }).escape(),
    body('sessionId').optional({ nullable: true }).isUUID().withMessage('Invalid session ID format')
  ],
  handleValidationErrors,
  askChatbot
);

// @route   GET /api/chatbot/history
// @desc    Get chat history
// @access  Private
router.get('/history', protect, getChatHistory);

// @route   GET /api/chatbot/suggestions
// @desc    Get initial suggestions
// @access  Optional
router.get('/suggestions', optionalProtect, getSuggestions);

module.exports = router;

