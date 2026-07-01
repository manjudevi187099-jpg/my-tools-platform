'use client';

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function StealthCalculator() {
  const [display, setDisplay] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [activeRoomPin, setActiveRoomPin] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  
  // Calling States
  const [isCalling, setIsCalling] = useState(false);
  const callContainerRef = useRef<HTMLDivElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); 

  useEffect(() => {
    let storedId = localStorage.getItem('stealth_device_id');
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('stealth_device_id', storedId);
    }
    setDeviceId(storedId);

    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get('session');
    if (sessionToken) {
      try {
        const decodedPin = atob(sessionToken); 
        if (decodedPin) {
          setActiveRoomPin(decodedPin);
          setIsUnlocked(true);
        }
      } catch (e) {
        console.error("Invalid session link");
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUnlocked && activeRoomPin && !isCalling) {
      fetchMessages(activeRoomPin); 
      interval = setInterval(() => {
        fetchMessages(activeRoomPin); 
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isUnlocked, activeRoomPin, isCalling]);

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

  const handleSendMessage = async (textToSend: string = newMessage) => {
    if (!textToSend.trim()) return;
    setLoading(true);
    
    const optimisticMessage = { message: textToSend, sender: deviceId, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMessage]);
    if (textToSend === newMessage) setNewMessage(''); 
    
    try {
      await fetch('/myapi/room/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_pin: activeRoomPin, message: textToSend, sender: deviceId }),
      });
    } catch (error) {
      console.error("Send failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64String = canvas.toDataURL('image/jpeg', 0.6); 
        handleSendMessage(base64String); 
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDestroyRoom = async () => {
    const confirm = window.confirm("WARNING: Yeh chat hamesha ke liye delete ho jayegi. Continue?");
    if (!confirm) return;
    setMessages([]); 
    try {
      await fetch('/myapi/room/destroy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_pin: activeRoomPin }),
      });
    } catch (error) {
      alert("Destroy failed!");
    }
  };

  const copyInviteLink = () => {
    const encodedPin = btoa(activeRoomPin);
    const inviteUrl = `${window.location.origin}/tools/calculator?session=${encodedPin}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('🔗 Direct Invite Link Copied!\nAb aap ise WhatsApp par bhej sakte hain.');
  };

  // 🔥 ZEGO CLOUD DYNAMIC IMPORT LOGIC 🔥
  const startCall = async (isVideo: boolean) => {
    setIsCalling(true);
    
    setTimeout(async () => {
      // 🚨 FIX: Yahan package ko dynamic import kiya hai taaki SSR par error na aaye
      const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

      const appID = 1853479942; 
      const serverSecret = "b96aaa76b05c3c4a515f42b63fec57e6"; 
      
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID, 
        serverSecret, 
        activeRoomPin, 
        deviceId, 
        "Agent_" + deviceId.substring(0,4)
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      
      zp.joinRoom({
        container: callContainerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: isVideo,
        showPreJoinView: false, 
        onLeaveRoom: () => {
          setIsCalling(false); 
        }
      });
    }, 100);
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
            
            {/* Header Area */}
            <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm z-10">
              <div>
                <h2 className="text-md font-black text-gray-800">Room: {activeRoomPin}</h2>
                <p className="text-xs text-green-500 font-bold">● Secure</p>
              </div>
              <div className="flex gap-2 items-center">
                {!isCalling && (
                  <>
                    <button onClick={() => startCall(false)} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200" title="Voice Call">📞</button>
                    <button onClick={() => startCall(true)} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200" title="Video Call">🎥</button>
                  </>
                )}
                <button onClick={handleDestroyRoom} className="text-xs bg-red-100 text-red-600 px-2 py-2 rounded-lg font-bold">💥 Nuke</button>
                <button onClick={() => { setIsUnlocked(false); setIsCalling(false); }} className="text-xs bg-gray-800 text-white px-2 py-2 rounded-lg font-bold">Lock</button>
              </div>
            </div>
            
            {/* 🔴 CALLING INTERFACE */}
            {isCalling && (
              <div className="flex-1 bg-black w-full h-full" ref={callContainerRef}></div>
            )}

            {/* 🟢 CHAT INTERFACE */}
            {!isCalling && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover' }}>
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="bg-white/90 p-4 rounded-xl text-center shadow">
                        <p className="text-2xl mb-1">👻</p>
                        <p className="text-sm font-bold text-gray-700">Room is empty.</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender === deviceId;
                      const isImage = msg.message.startsWith('data:image');
                      
                      return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm'}`}>
                            {isImage ? (
                               <img src={msg.message} alt="Secret File" className="rounded-lg max-w-full h-auto" />
                            ) : (
                               <p className="text-sm break-words">{msg.message}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-white border-t flex gap-2 items-center">
                  <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  </button>

                  <input 
                    type="text" 
                    placeholder="Message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 p-3 bg-gray-100 rounded-full text-gray-800 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    autoComplete="off"
                  />
                  <button onClick={() => handleSendMessage(newMessage)} disabled={loading || !newMessage.trim()} className="p-3 bg-indigo-600 text-white rounded-full shadow-lg disabled:opacity-50 transition">
                    <svg className="w-5 h-5 transform rotate-45 -mt-1 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}