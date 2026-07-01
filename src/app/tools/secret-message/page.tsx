'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircleQuestion, Lock, UserCircle, KeyRound, 
  Copy, RefreshCw, Send, Sparkles, CheckCircle2, EyeOff
} from 'lucide-react';

export default function SecretMessageDashboard() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('secret_username');
    const savedPin = localStorage.getItem('secret_pin');
    if (savedUser && savedPin) {
      setUsername(savedUser);
      setPin(savedPin);
      handleAuth(savedUser, savedPin);
    }
  }, []);

  const handleAuth = async (authUser = username, authPin = pin) => {
    if (!authUser || !authPin || authPin.length < 4) {
      setError('Please enter a username and a 4-digit PIN!');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/myapi/secret/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUser, pin: authPin }),
      });
      const data = await res.json();
      
      if (data.success) {
        setIsLoggedIn(true);
        localStorage.setItem('secret_username', data.username);
        localStorage.setItem('secret_pin', authPin);
        fetchMessages(data.username, authPin);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('System error! Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (fetchUser = username, fetchPin = pin) => {
    setIsFetching(true);
    try {
      const res = await fetch('/myapi/secret/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fetchUser, pin: fetchPin }),
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (err) {
      console.error("Failed to fetch messages");
    } finally {
      setIsFetching(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/msg/${username}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('secret_username');
    localStorage.removeItem('secret_pin');
    setIsLoggedIn(false);
    setUsername('');
    setPin('');
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 font-sans text-white selection:bg-pink-500">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-3xl mb-4 shadow-lg shadow-pink-500/30 transform rotate-12">
            <MessageCircleQuestion size={32} className="text-white -rotate-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Anonymous Messages
          </h1>
          <p className="text-slate-400 font-medium">Get honest & secret feedback from your friends.</p>
        </div>

        {!isLoggedIn ? (
          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md mx-auto animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black text-white mb-6 text-center">Create Link / Login</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                  <UserCircle size={14}/> Username
                </label>
                <div className="flex">
                  <span className="bg-slate-700 border border-r-0 border-slate-600 px-4 py-4 rounded-l-xl font-medium text-slate-400">@</span>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} placeholder="rahul99" className="w-full bg-slate-900 border border-slate-600 px-4 py-4 rounded-r-xl outline-none focus:border-pink-500 transition-colors font-bold text-white placeholder:text-slate-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                  <KeyRound size={14}/> Secret PIN (Min 4 Digits)
                </label>
                <input type="password" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 1234" className="w-full bg-slate-900 border border-slate-600 px-4 py-4 rounded-xl outline-none focus:border-pink-500 transition-colors font-black text-white tracking-widest text-center text-lg placeholder:text-slate-600 placeholder:font-normal" />
              </div>
              {error && <p className="text-red-400 text-sm font-bold text-center bg-red-400/10 py-2 rounded-lg">{error}</p>}
              <button onClick={() => handleAuth()} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-black text-sm flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/25 disabled:opacity-50">
                {isLoading ? <><RefreshCw size={18} className="animate-spin"/> PROCESSING...</> : <><Sparkles size={18}/> GET MY LINK</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Send size={150} className="-rotate-12 transform translate-x-10 -translate-y-10" />
              </div>
              <div className="relative z-10">
                <h3 className="text-white font-black text-2xl mb-1">Your Secret Link is Ready!</h3>
                <p className="text-pink-100 font-medium mb-6">Copy this link and put it on your Instagram bio or WhatsApp status.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-black/20 border border-white/20 rounded-xl px-4 py-3 flex items-center overflow-hidden">
                    <span className="text-white font-mono text-sm truncate">{typeof window !== 'undefined' ? `${window.location.origin}/msg/${username}` : ''}</span>
                  </div>
                  <button onClick={handleCopyLink} className="px-6 py-3 bg-white text-purple-700 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-lg">
                    {isCopied ? <><CheckCircle2 size={18}/> COPIED!</> : <><Copy size={18}/> COPY LINK</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Lock size={18} className="text-pink-400"/> Secret Inbox ({messages.length})
                </h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => fetchMessages()} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-700 rounded-lg">
                    <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={handleLogout} className="text-xs font-bold text-red-400 hover:text-red-300 px-3 py-2 bg-red-400/10 rounded-lg transition-colors">
                    LOGOUT
                  </button>
                </div>
              </div>
              <div className="p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <EyeOff size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-bold text-lg text-slate-400">Inbox is empty!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="bg-slate-700/50 p-5 rounded-2xl border border-slate-600 relative group hover:border-pink-500/50 transition-colors">
                        <p className="text-white font-medium text-lg leading-snug mb-3">"{msg.message}"</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}