const ChatbotLog = require('../models/chatbotLogModel');
const chatbotService = require('../services/chatbotService');
const { v4: uuidv4 } = require('uuid');

/**
 * @route   POST /api/chatbot/ask
 * @desc    Get chatbot response
 * @access  Private
 */
const askChatbot = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Generate response
    const result = chatbotService.generateResponse(
      message,
      req.user
    );

    // Get recommendations
    const recommendations = chatbotService.getRecommendations(
      result.intent,
      req.user.role
    );

    // Generate or use provided session ID
    const chatSessionId = sessionId || uuidv4();

    // Save conversation log
    await ChatbotLog.create({
      userId: req.user._id,
      sessionId: chatSessionId,
      userMessage: message,
      botResponse: result.response,
      intent: result.intent,
      confidence: result.confidence,
      metadata: {
        userRole: req.user.role,
        timestamp: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        response: result.response,
        intent: result.intent,
        confidence: result.confidence,
        sessionId: chatSessionId,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Chatbot ask error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chatbot request',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/chatbot/history
 * @desc    Get chat history for user
 * @access  Private
 */
const getChatHistory = async (req, res) => {
  try {
    const { sessionId, limit = 50 } = req.query;

    const query = { userId: req.user._id };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const history = await ChatbotLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('userMessage botResponse intent createdAt sessionId');

    res.status(200).json({
      success: true,
      data: {
        history: history.reverse(), // Oldest first
        total: history.length,
      },
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/chatbot/suggestions
 * @desc    Get initial suggestions for chatbot
 * @access  Private
 */
const getSuggestions = (req, res) => {
  try {
    const suggestions = chatbotService.getInitialSuggestions(req.user);
    res.status(200).json({
      success: true,
      data: {
        suggestions,
      },
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
    });
  }
};

module.exports = {
  askChatbot,
  getChatHistory,
  getSuggestions,
};

