import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/auth';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Bot, Send, X, RefreshCw, Minus, Sparkles, Command } from 'lucide-react';

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
      fetchSuggestions();
      if (messages.length === 0) {
        const firstName = user?.name ? user.name.split(' ')[0] : 'Hero';
        setMessages([
          {
            type: 'bot',
            text: `Sync complete. Hello ${firstName}! I am your ThalAI Guardian Assistant. I have indexed the latest clinical records. How can I assist your medical journey today?`,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [isOpen, user?._id]);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/chatbot/suggestions');
      setInitialSuggestions(response.data.data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAction = (action) => {
    const role = user?.role || 'patient';
    switch (action) {
      case 'create_request':
      case 'create_urgent_request':
        navigate('/patient-dashboard?tab=request');
        break;
      case 'update_availability':
        navigate('/donor-dashboard');
        break;
      case 'book_appointment':
        navigate('/book-appointment');
        break;
      case 'view_appointments':
        navigate(`/${role}-dashboard?tab=appointments`);
        break;
      case 'history_redirect':
        navigate('/patient-dashboard?tab=history');
        break;
      default: console.log('Action not implemented:', action);
    }
    setIsOpen(false);
  };

  const handleSend = async (forcedMessage = null, actionTrigger = null) => {
    const textToSend = forcedMessage || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    if (!forcedMessage) setInputMessage('');

    setMessages((prev) => [...prev, { type: 'user', text: userMessage, timestamp: new Date() }]);

    if (actionTrigger && actionTrigger !== 'message') {
      setTimeout(() => handleAction(actionTrigger), 600);
      return;
    }
    
    setLoading(true);
    try {
      const payload = { message: userMessage };
      if (sessionId) payload.sessionId = sessionId;
      const response = await api.post('/chatbot/ask', payload);
      if (!sessionId && response.data.data.sessionId) setSessionId(response.data.data.sessionId);
      setMessages((prev) => [...prev, {
        type: 'bot',
        text: response.data.data.response,
        intent: response.data.data.intent,
        recommendations: response.data.data.recommendations || [],
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, { type: 'bot', text: 'Intelligence link interrupted. Please retry.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 bg-slate-900 border border-white/10 text-white rounded-[24px] shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 z-[9998] flex items-center justify-center group ${isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}`}
      >
        <Sparkles className="w-8 h-8 group-hover:text-sky-400 transition-colors" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 rounded-full border-2 border-white shadow-sm" />
      </button>

      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[calc(100vw-2rem)] sm:w-[420px] h-[calc(100vh-8rem)] sm:h-[700px] bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl flex flex-col z-[9999] overflow-hidden animate-reveal border border-slate-100">
          {/* AI Header */}
          <div className="bg-slate-900 p-6 flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Command className="w-24 h-24 text-white" />
             </div>
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                   <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-display font-black tracking-tight leading-none mb-1.5">Intelligence Core</h3>
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Neural Link Active</span>
                  </div>
                </div>
             </div>
             <div className="flex items-center gap-2 relative z-10">
                <button onClick={() => setMessages([{ type: 'bot', text: "Memory banks cleared. Resetting session context.", timestamp: new Date() }])} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><RefreshCw className="w-4 h-4 text-white" /></button>
                <button onClick={() => setIsOpen(false)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><Minus className="w-4 h-4 text-white" /></button>
             </div>
          </div>

          {/* Neural Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-6 no-scrollbar backdrop-blur-sm">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-reveal`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                  msg.type === 'user' ? 'bg-sky-500 text-white rounded-tr-lg' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-lg'
                }`}>
                  {msg.type === 'bot' ? (
                    <div className="prose prose-slate max-w-none text-inherit">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.type === 'bot' && msg.recommendations?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 w-full">
                    {msg.recommendations.map((rec, idx) => (
                      <button key={idx} onClick={() => handleSend(rec.text, rec.action)} className="px-4 py-2 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-sky-600 uppercase tracking-widest hover:bg-sky-50 transition-all shadow-sm">
                        {rec.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 p-4 bg-white/50 rounded-2xl border border-slate-100 w-fit">
                 <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Command Input Area */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex gap-3 items-center bg-slate-50 border border-slate-100 rounded-2xl p-2 pl-4 transition-all focus-within:bg-white focus-within:border-sky-200 focus-within:shadow-xl focus-within:shadow-sky-500/5">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Initialize medical query..."
                className="flex-1 bg-transparent border-none text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-medium"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !inputMessage.trim()}
                className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-sky-600 transition-all disabled:opacity-30 disabled:grayscale"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
