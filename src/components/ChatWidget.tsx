'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dhamakaToolsDirectory } from '../data/toolsList'; 
import ReactMarkdown from 'react-markdown'; // <-- NAYA IMPORT

type Message = { role: 'user' | 'ai'; text: string };

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! Welcome to DhamakaTools. Need any help?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      if (!apiKey) throw new Error("API Key Missing");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are the official advanced customer support AI for DhamakaTools (dhamakatools.com). DhamakaTools is a completely FREE online platform with 71 premium utility tools.

YOUR MISSION:
Understand the user's problem, suggest the absolute best tool for them from the directory, and ALWAYS provide the exact URL link.

${dhamakaToolsDirectory}

RULES:
- Be highly energetic, professional, and helpful.
- ALWAYS give the direct link to the tool you suggest.
- Act like you just know the website inside out.`
      });

      const chatContext = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
      const prompt = `Chat history:\n${chatContext}\n\nUser: ${userMessage}\nAI:`;
      
      const result = await model.generateContent(prompt);
      setMessages((prev) => [...prev, { role: 'ai', text: result.response.text() }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: 'ai', text: "Sorry, I am facing a technical issue connecting to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      
      {/* --- Chat Window --- */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-bold text-sm">DhamakaTools Support</h3>
                <p className="text-[10px] text-indigo-200">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1"><Bot size={14} className="text-white"/></div>}
                
                <div className={`p-3 text-sm rounded-xl max-w-[85%] ${
                  msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'
                }`}>
                  {/* --- NAYA MARKDOWN RENDERER --- */}
                  {msg.role === 'ai' ? (
                    <ReactMarkdown 
                      components={{
                        a: ({node, ...props}) => <a {...props} className="text-blue-400 font-semibold underline hover:text-blue-300" target="_blank" rel="noopener noreferrer" />,
                        p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                        strong: ({node, ...props}) => <strong {...props} className="text-white font-bold" />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>

              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1"><Bot size={14} className="text-white"/></div>
                <div className="p-3 text-sm rounded-xl bg-slate-700 text-slate-200 rounded-tl-none flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-indigo-400" /> Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-800 border-t border-slate-700">
            <form onSubmit={handleSendMessage} className="flex gap-2 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-900 p-2 px-3 rounded-xl border border-slate-600 outline-none focus:border-indigo-500 text-sm text-white transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Floating Button --- */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform hover:scale-110"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}