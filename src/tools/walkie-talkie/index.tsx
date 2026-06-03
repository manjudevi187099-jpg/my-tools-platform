'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function WalkieTalkieTool() {
  const [frequency, setFrequency] = useState('');
  const [isTunedIn, setIsTunedIn] = useState(false);
  const [mode, setMode] = useState<'ptt' | 'always'>('ptt');
  const [isTalking, setIsTalking] = useState(false);
  const [peersCount, setPeersCount] = useState(0);
  const [error, setError] = useState('');

  const roomRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // ==========================================
 // ==========================================
  // 🎙️ TUNING IN (Connecting P2P)
  // ==========================================
  const handleTuneIn = async () => {
    if (!frequency.trim()) {
      setError('Please enter a frequency name!');
      return;
    }

    try {
      setError('');
      // 1. Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      // Mute initially if in Push-To-Talk mode
      if (stream.getAudioTracks().length > 0) {
        stream.getAudioTracks()[0].enabled = mode === 'always';
      }
      localStreamRef.current = stream;

      // 2. Initialize Trystero P2P Room dynamically
      // 🌟 FIX 1: Added 'as any' to bypass TypeScript's strict type checking here
      const { joinRoom } = (await import('@trystero-p2p/torrent')) as any;
      
      // Use a unique appId for your platform
      const room = joinRoom({ appId: 'ai-tools-platform-walkie' }, frequency.trim().toLowerCase());
      roomRef.current = room;

      // 3. Handle incoming peers and audio
      // 🌟 FIX: yahan () ki jagah = lagana tha
      room.onPeerJoin = (peerId: string) => {
        setPeersCount((prev) => prev + 1);
      };

      room.onPeerLeave = (peerId: string) => {
        setPeersCount((prev) => Math.max(0, prev - 1));
        if (audioElementsRef.current[peerId]) {
          audioElementsRef.current[peerId].remove();
          delete audioElementsRef.current[peerId];
        }
      };

      room.onPeerStream = (remoteStream: MediaStream, peerId: string) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.setAttribute('playsinline', 'true');
        audioElementsRef.current[peerId] = audio;
      };

      // Broadcast our stream to the room
      room.addStream(stream);
      setIsTunedIn(true);
      
      // Broadcast our stream to the room
      room.addStream(stream);
      setIsTunedIn(true);

    } catch (err) {
      console.error(err);
      setError('Microphone access denied or connection failed. Please check permissions.');
    }
  };

  // ==========================================
  // 🔌 TUNING OUT (Disconnecting)
  // ==========================================
  const handleTuneOut = () => {
    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    Object.values(audioElementsRef.current).forEach(audio => audio.remove());
    audioElementsRef.current = {};
    
    setIsTunedIn(false);
    setPeersCount(0);
    setIsTalking(false);
  };

  // ==========================================
  // 🎙️ PUSH TO TALK LOGIC
  // ==========================================
  const startTalking = useCallback(() => {
    if (mode === 'ptt' && localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = true;
      setIsTalking(true);
    }
  }, [mode]);

  const stopTalking = useCallback(() => {
    if (mode === 'ptt' && localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = false;
      setIsTalking(false);
    }
  }, [mode]);

  // Spacebar integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isTunedIn && mode === 'ptt') {
        e.preventDefault(); // Prevent page scroll
        if (!e.repeat) startTalking();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isTunedIn && mode === 'ptt') {
        e.preventDefault();
        stopTalking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isTunedIn, mode, startTalking, stopTalking]);

  // Mode change logic
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = mode === 'always';
      setIsTalking(mode === 'always');
    }
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => handleTuneOut();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto bg-zinc-900 text-white rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="bg-zinc-950 p-6 sm:p-8 text-center border-b border-zinc-800 relative">
        <div className="absolute top-6 right-8 flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${isTunedIn ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-sm font-bold text-zinc-400">{isTunedIn ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          📻 Walkie Talkie
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
          Free, private, P2P voice chat. Tune into any frequency to talk instantly.
        </p>
      </div>

      <div className="p-6 sm:p-10 flex flex-col items-center">
        
        {/* ERROR MESSAGE */}
        {error && (
          <div className="w-full bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {!isTunedIn ? (
          /* ================= TUNING UI ================= */
          <div className="w-full max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <label className="text-zinc-400 font-bold mb-2 self-start pl-2 text-sm uppercase tracking-wider">Set Frequency</label>
            <input 
              type="text" 
              value={frequency}
              onChange={(e) => setFrequency(e.target.value.replace(/\s+/g, '-'))}
              placeholder="e.g. secret-base-99"
              className="w-full bg-zinc-950 border-2 border-zinc-800 text-white p-4 rounded-xl text-xl font-mono text-center focus:border-green-500 outline-none transition-colors mb-6"
            />
            
            <button 
              onClick={handleTuneIn}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-black text-xl py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)]"
            >
              📡 TUNE IN
            </button>
            <p className="text-zinc-500 text-xs text-center mt-6">
              Anyone entering the same frequency will connect to your room instantly.
            </p>
          </div>
        ) : (
          /* ================= WALKIE TALKIE UI ================= */
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            
            <div className="bg-zinc-950 border border-zinc-800 py-3 px-6 rounded-full flex items-center gap-4 mb-8">
               <span className="text-zinc-400 font-medium">Frequency:</span>
               <span className="font-mono text-green-400 font-bold tracking-wider">{frequency.toUpperCase()}</span>
               <div className="w-[1px] h-4 bg-zinc-800 mx-2"></div>
               <span className="text-zinc-400 font-medium">Peers:</span>
               <span className="font-bold text-white">{peersCount}</span>
            </div>

            {/* BIG PTT BUTTON */}
            <div className="mb-12 relative flex justify-center items-center h-64 w-full">
              {mode === 'ptt' ? (
                <button
                  onPointerDown={startTalking}
                  onPointerUp={stopTalking}
                  onPointerLeave={stopTalking}
                  className={`
                    w-48 h-48 sm:w-56 sm:h-56 rounded-full font-black text-2xl sm:text-3xl transition-all duration-150 select-none touch-none
                    flex flex-col items-center justify-center gap-2 border-8
                    ${isTalking 
                      ? 'bg-amber-500 border-amber-600 text-zinc-900 scale-95 shadow-[0_0_50px_rgba(245,158,11,0.6)]' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:border-zinc-600 shadow-2xl'}
                  `}
                >
                  <span className="text-4xl">{isTalking ? '🎙️' : '🤚'}</span>
                  {isTalking ? 'TALKING' : 'HOLD'}
                </button>
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 border-green-600 bg-green-500/10 flex flex-col items-center justify-center gap-2 shadow-[0_0_50px_rgba(22,163,74,0.3)] animate-pulse text-green-400 font-black text-2xl">
                   <span className="text-4xl">🎙️</span>
                   LIVE MIC
                </div>
              )}
            </div>

            {/* CONTROLS */}
            <div className="w-full flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-950 p-4 sm:p-2 rounded-2xl border border-zinc-800">
              
              <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800 w-full sm:w-auto">
                <button 
                  onClick={() => setMode('ptt')}
                  className={`flex-1 sm:px-6 py-2 rounded-lg font-bold text-sm transition ${mode === 'ptt' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Hold to Talk
                </button>
                <button 
                  onClick={() => setMode('always')}
                  className={`flex-1 sm:px-6 py-2 rounded-lg font-bold text-sm transition ${mode === 'always' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Always On
                </button>
              </div>

              <button 
                onClick={handleTuneOut}
                className="w-full sm:w-auto px-8 py-3 bg-red-950 hover:bg-red-900 text-red-500 font-bold rounded-xl transition border border-red-900/50"
              >
                Disconnect
              </button>
            </div>
            
            <p className="text-zinc-600 text-xs mt-6 font-medium">
              Tip: Press & hold Spacebar to talk in PTT mode. Use headphones to prevent echo.
            </p>

          </div>
        )}
      </div>
    </div>
  );
}