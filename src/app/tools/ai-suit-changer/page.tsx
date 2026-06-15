'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

// 🔥 10 Premium Suits ka Data
const SUIT_OPTIONS = [
  { id: '1', name: 'Black Formal', emoji: '🕴️', color: 'bg-slate-900' },
  { id: '2', name: 'Navy Blue Tuxedo', emoji: '👔', color: 'bg-blue-900' },
  { id: '3', name: 'Grey Business', emoji: '🏢', color: 'bg-gray-500' },
  { id: '4', name: 'White Blazer', emoji: '🧥', color: 'bg-slate-100' },
  { id: '5', name: 'Maroon Party', emoji: '🍷', color: 'bg-red-900' },
  { id: '6', name: 'Checkered Suit', emoji: '🏁', color: 'bg-stone-600' },
  { id: '7', name: 'Cream Casual', emoji: '☕', color: 'bg-amber-100' },
  { id: '8', name: 'Royal Velvet', emoji: '👑', color: 'bg-purple-900' },
  { id: '9', name: 'Olive Green', emoji: '🌿', color: 'bg-emerald-900' },
  { id: '10', name: 'CEO Pinstripe', emoji: '💼', color: 'bg-slate-800' },
];

export default function AiSuitChanger() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuit, setSelectedSuit] = useState('1');

  // 🔥 Auto WebP Converter (Quality maintained, size reduced)
  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.split('.')[0] + '.webp', { type: 'image/webp' });
              resolve(webpFile);
            } else {
              resolve(file); // fallback
            }
          }, 'image/webp', 0.9); // 90% quality HD
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(originalFile));
      setResultUrl(null);
      setError(null);
      
      // Convert to WebP instantly in background
      const webpFile = await convertToWebP(originalFile);
      setSelectedFile(webpFile);
    }
  };

  const generateSuit = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('suit_id', selectedSuit); // Sending chosen suit to backend

    try {
      // ⚠️ YAHAN APNA RENDER KA URL DAALEIN
      const response = await fetch('https://your-fastapi-app.onrender.com/api/generate-suit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Server thoda busy hai, dobara try karein.");

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message || "Kuch technical error aaya bhai.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-10">
          <Link href="/" className="text-sm font-bold text-purple-600 hover:text-purple-800 mb-4 inline-block">← Back to Tools</Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4">👔 Premium AI Suit Changer</h1>
          <p className="text-lg text-slate-500 font-medium">Smart WebP Compression • 10+ Styles • Studio Quality</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100">
          
          {/* 🔥 10 SUITS SELECTOR (Live Visuals) */}
          <div className="mb-10">
            <h3 className="text-lg font-black text-slate-800 mb-4">Step 1: Choose Your Style</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {SUIT_OPTIONS.map((suit) => (
                <button
                  key={suit.id}
                  onClick={() => setSelectedSuit(suit.id)}
                  className={`flex-shrink-0 w-32 p-4 rounded-2xl border-2 transition-all snap-center flex flex-col items-center justify-center gap-2 ${
                    selectedSuit === suit.id ? 'border-purple-600 bg-purple-50 shadow-md scale-105' : 'border-slate-100 bg-white hover:border-purple-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${suit.color} flex items-center justify-center text-2xl shadow-inner border border-white/20`}>
                    {suit.emoji}
                  </div>
                  <span className="text-xs font-bold text-center">{suit.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Upload Area */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-black text-slate-800">Step 2: Upload Your Photo</h3>
              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer bg-purple-50/50 hover:bg-purple-100 transition-colors">
                  <span className="text-5xl mb-3">📸</span>
                  <p className="mb-2 text-sm text-slate-600 font-bold">Click to Upload</p>
                  <p className="text-xs text-slate-500 font-medium">Auto-converts to HD WebP</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm">
                  <img src={previewUrl} alt="Preview" className="w-full h-72 object-cover" />
                  <button onClick={() => setPreviewUrl(null)} className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-full text-xs font-bold shadow-lg hover:bg-red-600 transition-transform hover:scale-110">✕</button>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20">
                    {selectedFile?.type === 'image/webp' ? '✅ Optimized WebP' : 'Original'}
                  </div>
                </div>
              )}

              {previewUrl && !resultUrl && (
                <button 
                  onClick={generateSuit} 
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-lg py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Tailoring Your Suit...' : `Wear ${SUIT_OPTIONS.find(s => s.id === selectedSuit)?.name} ✨`}
                </button>
              )}
            </div>

            {/* Result Area */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-black text-slate-800">Step 3: Studio Result</h3>
              
              <div className="w-full h-72 border-2 border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden relative shadow-inner">
                {isProcessing ? (
                  <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">✂️</div>
                    </div>
                    {/* 🔥 HUGGING FACE TEXT HATA DIYA HAI 🔥 */}
                    <p className="text-sm font-black text-slate-700">AI Tailor is working...</p>
                    <p className="text-xs font-bold text-slate-400 animate-pulse text-center max-w-[200px]">
                      Analyzing body shape & adjusting fabric lighting. Please wait...
                    </p>
                  </div>
                ) : resultUrl ? (
                  <img src={resultUrl} alt="AI Result" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 font-medium flex flex-col items-center">
                    <span className="text-5xl block mb-4 opacity-50">👔</span>
                    <p>Your studio-quality photo<br/>will appear here</p>
                  </div>
                )}
              </div>

              {resultUrl && (
                <a 
                  href={resultUrl} 
                  download="DhamakaTools_Studio.webp"
                  className="w-full block text-center bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-black transition-colors shadow-lg"
                >
                  ⬇️ Download HD Photo
                </a>
              )}
              {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}