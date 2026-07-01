'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [deviceId, setDeviceId] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Generate unique ID for user & Check Direct Link
  useEffect(() => {
    // Apni pehchan ke liye ek unique ID banayenge taaki apni chat right side dikhe
    let storedId = localStorage.getItem('stealth_device_id');
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('stealth_device_id', storedId);
    }
    setDeviceId(storedId);

    // Direct Invite Link Check (?session=Base64PIN)
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get('session');
    if (sessionToken) {
      try {
        const decodedPin = atob(sessionToken); // Decode Base64
        if (decodedPin) {
          setActiveRoomPin(decodedPin);
          setIsUnlocked(true);
        }
      } catch (e) {
        console.error("Invalid session link");
      }
    }
  }, []);

  // 2. Auto-Refresh (Polling)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUnlocked && activeRoomPin) {
      fetchMessages(activeRoomPin); // Turant fetch karo
      interval = setInterval(() => {
        fetchMessages(activeRoomPin); // Har 2 second mein naye messages laao
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isUnlocked, activeRoomPin]);

  // 3. Scroll to bottom automatically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setDisplay('');
    } else if (val === '=') {
      if (display.length >= 3 && !isNaN(Number(display))) {
        setActiveRoomPin(display);
        setIsUnlocked(true);
        setDisplay('');
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

  const fetchMessages = async (pin: string) => {
    try {
      const res = await fetch('/myapi/room/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      await fetch('/myapi/room/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_pin: activeRoomPin, message: newMessage, sender: deviceId }),
      });
      setNewMessage('');
      fetchMessages(activeRoomPin);
    } catch (error) {
      alert("Send failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleDestroyRoom = async () => {
    const confirm = window.confirm("WARNING: Yeh chat hamesha ke liye delete ho jayegi. Continue?");
    if (!confirm) return;
    try {
      await fetch('/myapi/room/destroy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_pin: activeRoomPin }),
      });
      setMessages([]);
    } catch (error) {
      alert("Destroy failed!");
    }
  };

  // Direct Link Generator
  const copyInviteLink = () => {
    const encodedPin = btoa(activeRoomPin); // Pin ko base64 mein chupa diya
    const inviteUrl = `${window.location.origin}/tools/calculator?session=${encodedPin}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('🔗 Direct Invite Link Copied!\nAb aap ise WhatsApp par bhej sakte hain.');
  };

  const calcButtons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Head><title>Math Calculator</title></Head>

      <div className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700 h-[650px] flex flex-col">
        {!isUnlocked ? (
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
          </div>
        ) : (
          <div className="bg-[#f0f2f5] h-full flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-white shadow-sm z-10">
              <div>
                <h2 className="text-lg font-black text-gray-800">Room: {activeRoomPin}</h2>
                <p className="text-xs text-green-500 font-bold">● Online</p>
              </div>
              <div className="flex gap-2">
                <button onClick={copyInviteLink} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-bold hover:bg-indigo-200">🔗 Invite</button>
                <button onClick={handleDestroyRoom} className="text-xs bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold hover:bg-red-200">💥 Nuke</button>
                <button onClick={() => setIsUnlocked(false)} className="text-xs bg-gray-800 text-white px-3 py-2 rounded-lg font-bold">Lock</button>
              </div>
            </div>
            
            {/* Chat Inbox Area (WhatsApp Style) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover' }}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-white/80 p-4 rounded-xl text-center shadow">
                    <p className="text-2xl mb-1">👻</p>
                    <p className="text-sm font-bold text-gray-700">Room is empty.</p>
                    <p className="text-xs text-gray-500">Send a message or invite someone!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === deviceId;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm'}`}>
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Message..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 p-3 bg-gray-100 rounded-full text-gray-800 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button onClick={handleSendMessage} disabled={loading || !newMessage.trim()} className="p-3 bg-indigo-600 text-white rounded-full shadow-lg disabled:opacity-50 transition">
                <svg className="w-5 h-5 transform rotate-45 -mt-1 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}