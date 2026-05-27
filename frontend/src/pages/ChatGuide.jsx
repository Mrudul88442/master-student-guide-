import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, User, Bot, Sparkles, MessageSquare, Trash2 } from 'lucide-react';

export default function ChatGuide() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: "Hello! I'm Smart Guide AI. I can help you with college choices, career paths, and exam strategies. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/chatbot/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: "I'm having trouble connecting to my brain. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: 1, role: 'bot', text: "Chat cleared. How can I assist you now?" }]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-32 pb-16 px-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary-400" /> Career <span className="text-gradient">AI Counselor</span>
          </h1>
          <p className="text-slate-400 text-sm">Powered by Gemini AI for personalized guidance</p>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow glass-panel rounded-3xl overflow-hidden flex flex-col border-slate-700/50">
        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-600' : 'bg-slate-800'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-primary-400" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50'}`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div className="p-4 bg-slate-800/80 rounded-2xl rounded-tl-none border border-slate-700/50">
                  <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
          <form onSubmit={handleSend} className="flex gap-3">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about colleges, careers, or studies..."
              className="flex-grow bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary-500 transition-all shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white p-4 rounded-2xl transition-all shadow-lg shadow-primary-900/20 active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Smart Guide AI Advisor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
