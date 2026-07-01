'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SendSecretMessage() {
  const params = useParams();
  const rawUsername = params.username as string;
  const username = rawUsername ? rawUsername.toLowerCase().trim() : '';
  
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Kuch toh likho dost!');
      return;
    }
    
    setIsSending(true);
    setError('');

    try {
      const res = await fetch('/myapi/secret/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message }),
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSent(true);
      } else {
        setError(data.error || 'User not found!');
      }
    } catch (err) {
      setError('Network Error! Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 font-sans text-white flex flex-col items-center justify-center selection:bg-pink-500">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full mx-auto mb-4 shadow-lg shadow-pink-500/40 flex items-center justify-center">
            <span className="text-3xl font-black">{username.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-black">Send a Secret Message to</h1>
          <p className="text-pink-400 font-bold text-xl mt-1">@{username}</p>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">100% Anonymous</p>
        </div>

        {!isSent ? (
          <div className="bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-700">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Type your secret message here... (They won't know who sent it!)"
              className="w-full bg-slate-900 border border-slate-600 p-4 rounded-2xl outline-none focus:border-pink-500 transition-colors font-medium text-white resize-none placeholder:text-slate-500"
            />
            
            {error && <p className="text-red-400 text-xs font-bold mt-3 text-center">{error}</p>}
            
            <button 
              onClick={handleSendMessage}
              disabled={isSending}
              className="w-full mt-4 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-black text-sm flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/25 disabled:opacity-50"
            >
              {isSending ? 'SENDING...' : <><Send size={18}/> SEND ANONYMOUSLY</>}
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 text-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Message Sent!</h2>
            <p className="text-slate-400 font-medium mb-6">Your secret message has been delivered to @{username}.</p>
            
            <Link href="/tools/secret-message">
              <button className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
                <Sparkles size={18}/> CREATE YOUR OWN LINK
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}