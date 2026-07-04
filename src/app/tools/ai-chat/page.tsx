'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (Using Flash model for extreme speed)
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

type Message = { role: 'user' | 'ai'; text: string };

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I am Gemini. How can I help you today? 🚀' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      alert("Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file!");
      return;
    }

    const userMessage = input.trim();
    setInput(''); // Clear input instantly for better UX
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const chatContext = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
      const prompt = `Here is the chat history:\n${chatContext}\n\nUser: ${userMessage}\nAI:`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      setMessages((prev) => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [...prev, { role: 'ai', text: "Oops! Something went wrong. Please check your API key or try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'ai', text: 'Chat cleared! What would you like to talk about now? 🚀' }]);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white font-sans flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col h-[90vh] bg-slate-800 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="bg-slate-900/50 p-6 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black">AI Smart Assistant</h1>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Powered by Gemini Flash</p>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* --- CHAT AREA --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* AI Avatar */}
              {msg.role === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Bot size={20} />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm md:text-base leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
              }`}>
                {msg.text}
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center shrink-0 shadow-lg">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}
          
          {/* Loading Animation */}
          {isLoading && (
            <div className="flex gap-4 justify-start animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                <Bot size={20} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600 flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-indigo-400" /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* --- INPUT BOX --- */}
        <div className="p-4 bg-slate-900 border-t border-slate-700">
          <form onSubmit={handleSendMessage} className="flex gap-3 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... (e.g. Write a React component)"
              disabled={isLoading}
              className="flex-1 bg-slate-800 p-4 rounded-2xl border border-slate-600 outline-none focus:border-indigo-500 font-medium disabled:opacity-50 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl font-bold flex items-center justify-center transition-colors shadow-lg"
            >
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}