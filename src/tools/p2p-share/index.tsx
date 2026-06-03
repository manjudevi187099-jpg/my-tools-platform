'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function P2PFileShare() {
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  
  // Sender States
  const [file, setFile] = useState<File | null>(null);
  const [shareCode, setShareCode] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  
  // Receiver States
  const [inputCode, setInputCode] = useState('');
  
  // Common Status States
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  
  // Refs for PeerJS (to avoid state closures in callbacks)
  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);

  // Helper: Generate random 6 character code
  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  // ==========================================
  // 📤 SENDER LOGIC
  // ==========================================
  const startHosting = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('Generating secure room code...');
    setProgress(0);
    
    // Dynamic import to prevent Next.js SSR issues with WebRTC
    const Peer = (await import('peerjs')).default;
    const code = generateCode();
    
    const peer = new Peer(code);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setShareCode(id);
      setIsReady(true);
      setStatus('Waiting for receiver to connect...');
    });

    peer.on('connection', (conn) => {
      connRef.current = conn;
      setStatus('Receiver connected! Starting transfer...');
      
      conn.on('open', () => {
        // Send metadata first
        conn.send({ 
          type: 'meta', 
          name: selectedFile.name, 
          size: selectedFile.size, 
          mime: selectedFile.type 
        });

        // PeerJS handles Blob natively. We just send the file.
        // For visual feedback, we simulate a fast progress bar here.
        setStatus('Transferring file data directly...');
        let simProgress = 0;
        const interval = setInterval(() => {
          simProgress += 10;
          if(simProgress <= 90) setProgress(simProgress);
        }, 200);

        // Actual Send
        conn.send({ type: 'file', data: selectedFile });
        
        setTimeout(() => {
          clearInterval(interval);
          setProgress(100);
          setStatus('File sent successfully! ✅');
        }, 2500); // Wait for PeerJS buffer
      });
    });

    peer.on('error', (err) => {
      setStatus(`Error: ${err.message}`);
    });
  };

  // ==========================================
  // 📥 RECEIVER LOGIC
  // ==========================================
  const connectAndReceive = async () => {
    if (!inputCode) return;
    setStatus('Connecting to sender...');
    setProgress(0);

    const Peer = (await import('peerjs')).default;
    const peer = new Peer();
    peerRef.current = peer;

    let incomingFileName = 'downloaded_file';
    let incomingMime = 'application/octet-stream';

    peer.on('open', () => {
      const conn = peer.connect(inputCode.toUpperCase());
      connRef.current = conn;

      conn.on('open', () => {
        setStatus('Connected! Waiting for file...');
      });

      conn.on('data', (data: any) => {
        if (data.type === 'meta') {
          incomingFileName = data.name;
          incomingMime = data.mime;
          setStatus(`Receiving: ${data.name}...`);
          setProgress(50);
        } 
        else if (data.type === 'file') {
          setProgress(100);
          setStatus('File received! Downloading... ✅');
          
          // Create download link
          const blob = new Blob([data.data], { type: incomingMime });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = incomingFileName;
          a.click();
          URL.revokeObjectURL(url);
          
          // Disconnect after saving
          setTimeout(() => {
            peer.destroy();
          }, 1000);
        }
      });
    });

    peer.on('error', (err) => {
      setStatus(`Connection failed: ${err.message}. Please check the code.`);
    });
  };


  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex flex-col items-center font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-indigo-600 mb-2">P2P Secure Share</h1>
        <p className="text-slate-500">Send files directly between devices. No servers, 100% private. ⚡</p>
      </div>

      <div className="w-full max-w-3xl bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200">
        
        {/* MODE SWITCHER */}
        <div className="flex space-x-2 mb-8 bg-slate-100 p-1.5 rounded-xl">
          <button 
            onClick={() => { setMode('send'); setStatus(''); setShareCode(''); setProgress(0); setFile(null); }}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'send' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            📤 SEND FILE
          </button>
          <button 
            onClick={() => { setMode('receive'); setStatus(''); setProgress(0); }}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'receive' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            📥 RECEIVE FILE
          </button>
        </div>

        {/* ======================= SEND MODE ======================= */}
        {mode === 'send' && (
          <div className="animate-in fade-in duration-300">
            {!shareCode ? (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 transition-colors">
                <div className="text-5xl mb-4">📁</div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Select a file to send</h3>
                <p className="text-sm text-slate-500 mb-6">Any size, any format. Direct transfer.</p>
                
                <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer shadow-md transition-all">
                  Browse Files
                  <input type="file" className="hidden" onChange={(e) => { if(e.target.files?.[0]) startHosting(e.target.files[0]) }} />
                </label>
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Your Share Code</p>
                <div className="text-5xl font-black text-indigo-600 tracking-[0.2em] mb-6 select-all">
                  {shareCode}
                </div>
                
                {file && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 inline-block text-left w-full max-w-sm">
                    <p className="text-sm font-bold text-slate-700 line-clamp-1">📄 {file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                  </div>
                )}

                {/* Progress / Status */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm font-semibold text-slate-600 animate-pulse">{status}</p>
              </div>
            )}
          </div>
        )}

        {/* ======================= RECEIVE MODE ======================= */}
        {mode === 'receive' && (
          <div className="animate-in fade-in duration-300 text-center p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Enter Share Code</h3>
            <p className="text-slate-500 mb-6 text-sm">Ask the sender for the 6-character code.</p>
            
            <input 
              type="text" 
              value={inputCode} 
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full max-w-sm text-center text-4xl font-black tracking-[0.2em] uppercase border-2 border-slate-300 rounded-2xl py-4 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all mb-6 text-slate-800"
              placeholder="XXXXXX"
            />
            
            <button 
              onClick={connectAndReceive}
              disabled={inputCode.length !== 6}
              className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-md transition-all text-lg"
            >
              Connect & Download
            </button>

            {status && (
              <div className="mt-8">
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm font-semibold text-slate-600">{status}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}