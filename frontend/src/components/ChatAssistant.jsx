import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Send, 
  MessageSquare, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  Leaf
} from "lucide-react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5001";

export default function ChatAssistant({ farmData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      text: "Hello! 🌱 I'm **AgriGuide AI**, your smart farming assistant. I can help you understand your farm conditions, disaster risks, and what actions to take. Ask me anything!" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What should I do today?",
    "Why is drought risk high?",
    "How can I prevent pest outbreak?",
    "What does soil moisture mean?",
    "Is my farm safe now?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMessage = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/chat`, {
        message: textToSend,
        farmData: farmData || {}
      });
      
      setMessages((prev) => [...prev, { role: "assistant", text: response.data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", text: "I'm having trouble connecting to the AI service. Please check your internet connection and try again.", isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple markdown-like bold rendering
  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-black">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* 🟢 FLOATING ACTION BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[150] bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-4 md:p-5 rounded-full shadow-2xl shadow-emerald-900/40 flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
            <MessageSquare size={26} className="group-hover:hidden" />
            <Sparkles size={26} className="hidden group-hover:block" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 💬 CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[200] w-[calc(100vw-3rem)] md:w-[420px] h-[620px] max-h-[85vh] bg-white rounded-[32px] shadow-2xl shadow-slate-900/20 border border-slate-200/80 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-5 flex items-center justify-between flex-shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px]"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-900/30">
                  <Leaf size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-base leading-tight">AgriGuide AI</h3>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Powered by Gemini
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 relative z-10"
              >
                <ChevronDown size={24} />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 px-4 py-2 flex items-start gap-2 border-b border-amber-100 flex-shrink-0">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-800 font-bold leading-tight">
                Prototype advisory system. Please confirm critical decisions with an agricultural officer.
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 relative">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Leaf size={14} className="text-emerald-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-emerald-600 text-white rounded-br-sm font-medium" 
                      : msg.isError 
                        ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm font-medium"
                        : "bg-white text-slate-700 border border-slate-200/80 shadow-sm rounded-bl-sm font-medium"
                  }`}>
                    {renderText(msg.text)}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Animation */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Leaf size={14} className="text-emerald-600" />
                  </div>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm px-5 py-4 flex gap-1.5 items-center">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length < 3 && !isLoading && (
              <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="inline-block px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-sm flex-shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AgriGuide anything..."
                  className="w-full pl-5 pr-14 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
              <p className="text-center mt-3 text-[9px] font-bold uppercase tracking-widest text-slate-300">
                AgriGuide AI · Gemini Flash · AgriWatch
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
