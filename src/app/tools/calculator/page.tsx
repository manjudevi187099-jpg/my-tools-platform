'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function StealthCalculator() {
  // Calculator States
  const [display, setDisplay] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Dashboard States
  const [activeRoomPin, setActiveRoomPin] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Normal Calculator Logic + Secret Vault Trigger
  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setDisplay('');
    } else if (val === '=') {
      // 🚨 ASLI JADOO: Agar kisi ne koi number daal kar = dabaya (e.g. 143=)
      // Toh wahi number uska Room ID ban jayega!
      if (display.length >= 3 && !isNaN(Number(display))) {
        setActiveRoomPin(display);
        setIsUnlocked(true);
        setDisplay('');
        fetchMessages(display); // Room khulte hi messages fetch karo
      } else {
        try {
          // eslint-disable-next-line no-eval
          setDisplay(eval(display).toString());
        } catch {
          setDisplay('Error');
        }
      }
    } else {
      setDisplay((prev) => (prev === 'Error' ? val : prev + val));
    }
  };

  const calcButtons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'];

  // Fetch Messages from Supabase
  const fetchMessages = async (pin: string) => {
    try {
      const res = await fetch(`/myapi/room/read?pin=${pin}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  // Send Message to Current Room
  const handleSendMessage = async () => {
    if (!newMessage) return;
    setLoading(true);
    try {
      await fetch('/myapi/room/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_pin: activeRoomPin, message: newMessage }),
      });
      setNewMessage('');
      fetchMessages(activeRoomPin); // Refresh list
    } catch (error) {
      alert("Send failed!");
    } finally {
      setLoading(false);
    }
  };

  // Self-Destruct / Clear Entire Room
  const handleDestroyRoom = async () => {
    const confirm = window.confirm("WARNING: Yeh chat dono taraf se hamesha ke liye delete ho jayegi. Continue?");
    if (!confirm) return;
    try {
      await fetch('/myapi/room/destroy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_pin: activeRoomPin }),
      });
      setMessages([]);
      alert("💥 Room Destroyed!");
    } catch (error) {
      alert("Destroy failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Head><title>Math Calculator</title></Head>

      <div className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700 h-[600px] flex flex-col">
        {!isUnlocked ? (
          /* ---------------- NORMAL CALCULATOR ---------------- */
          <div className="p-6 h-full flex flex-col justify-end">
            <div className="bg-gray-900 p-6 rounded-2xl mb-6 text-right overflow-hidden shadow-inner border border-gray-700">
              <span className="text-4xl font-mono text-green-400 tracking-widest">{display || '0'}</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {calcButtons.map((btn) => (
                <button key={btn} onClick={() => handleCalcClick(btn)}
                  className={`py-4 text-2xl font-bold rounded-xl transition shadow-lg ${
                    btn === 'C' ? 'bg-red-500 text-white' : btn === '=' ? 'bg-green-500 text-white' : 
                    ['/', '*', '-', '+'].includes(btn) ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-100'
                  }`}>
                  {btn}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-6 font-mono">Tip: Type any code + '=' for dashboard</p>
          </div>
        ) : (
          /* ---------------- THE SECRET DASHBOARD ---------------- */
          <div className="bg-white h-full flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div>
                <h2 className="text-lg font-black text-gray-800">🕵️‍♂️ Room: {activeRoomPin}</h2>
                <p className="text-xs text-gray-500">Live Secret Dashboard</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDestroyRoom} className="text-xs bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold hover:bg-red-200" title="Destroy Room">💥 Nuke</button>
                <button onClick={() => setIsUnlocked(false)} className="text-xs bg-gray-200 text-gray-800 px-3 py-2 rounded-lg font-bold">Lock</button>
              </div>
            </div>
            
            {/* Chat Inbox Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p className="text-4xl mb-2">👻</p>
                  <p className="text-sm font-bold">No messages here yet.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-gray-200 max-w-[85%]">
                    <p className="text-gray-800 text-sm">{msg.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1 text-right">Just now</p>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex gap-2">
              <input 
                type="text" 
                placeholder="Type a secret message..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 p-3 border rounded-xl bg-gray-50 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={handleSendMessage} disabled={loading} className="px-5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}