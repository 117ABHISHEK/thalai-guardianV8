import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/auth';

const ChatbotWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        // Personlized welcome message
        const firstName = user?.name ? user.name.split(' ')[0] : 'there';
        setMessages([
          {
            type: 'bot',
            text: `Hello ${firstName}! I'm the ThalAI Guardian chatbot. I'm here to help you with Thalassemia related queries. How can I help you today?`,
            timestamp: new Date(),
          },
        ]);
      }
      
      // Fetch initial suggestions if not already loaded
      if (initialSuggestions.length === 0) {
        fetchSuggestions();
      }
    }
  }, [isOpen, user]);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/chatbot/suggestions');
      setInitialSuggestions(response.data.data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAction = (action) => {
    switch (action) {
      case 'create_request':
      case 'create_urgent_request':
        if (user?.role === 'patient') {
          navigate('/patient-dashboard');
          // We can't easily open the modal from here, but we can redirect
        }
        break;
      case 'update_availability':
        navigate('/donor-dashboard');
        break;
      case 'book_appointment':
        if (user?.role === 'patient') {
          navigate('/book-appointment');
        } else {
          navigate('/patient-dashboard'); // Placeholder for non-patients
        }
        break;
      case 'history_redirect':
        navigate('/patient-dashboard'); // History is usually there
        break;
      default:
        console.log('Action not implemented:', action);
    }
    setIsOpen(false); // Close chatbot on navigation
  };

  const handleSend = async (forcedMessage = null, actionTrigger = null) => {
    const textToSend = forcedMessage || inputMessage;
    
    if (actionTrigger && actionTrigger !== 'message') {
      handleAction(actionTrigger);
      return;
    }

    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    if (!forcedMessage) setInputMessage('');

    // Add user message
    const newUserMessage = {
      type: 'user',
      text: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await api.post('/chatbot/ask', {
        message: userMessage,
        sessionId,
      });

      const botResponse = {
        type: 'bot',
        text: response.data.data.response,
        intent: response.data.data.intent,
        recommendations: response.data.data.recommendations || [],
        timestamp: new Date(),
      };

      if (!sessionId && response.data.data.sessionId) {
        setSessionId(response.data.data.sessionId);
      }

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion.text, suggestion.action);
  };

  const handleClearChat = () => {
    setMessages([
      {
        type: 'bot',
        text: "Chat cleared! How can I help you now?",
        timestamp: new Date(),
      },
    ]);
    setSessionId(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-health-blue text-white rounded-full shadow-lg hover:rotate-12 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center text-3xl animate-bounce-slow"
          title="Open Chatbot"
        >
          <span className="mb-1">💬</span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-slide-up border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-health-blue to-blue-600 text-white p-5 rounded-t-xl flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-inner animate-spin-slow">
                🩸
              </div>
              <div>
                <h3 className="text-lg font-bold">ThalAI Guardian</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs opacity-90 font-medium">Online Helper</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors group"
                title="Clear Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="space-y-3">
                <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-health-blue text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                  >
                    {msg.text.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations as Bubbles */}
                {msg.type === 'bot' && msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1">
                    {msg.recommendations.map((rec, idx) => (
                      <button
                        key={idx}
                        className="px-4 py-2 bg-white border border-blue-200 rounded-full text-xs font-semibold text-health-blue hover:bg-health-blue hover:text-white hover:border-health-blue transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 active:scale-95"
                        onClick={() => handleSuggestionClick(rec)}
                      >
                        {rec.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Initial Suggestions (only if few messages exist) */}
            {messages.length === 1 && initialSuggestions.length > 0 && (
              <div className="pt-2 animate-fade-in">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider ml-1 mb-2">Frequently Asked</p>
                <div className="flex flex-wrap gap-2 px-1">
                  {initialSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:border-health-blue hover:text-health-blue transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 active:scale-95"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-400 rounded-2xl rounded-tl-none shadow-sm p-4 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="How can I help you today?..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-health-blue/20 focus:bg-white transition-all"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputMessage.trim()}
              className="w-11 h-11 bg-health-blue hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-health-blue/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale disabled:shadow-none transform active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;



