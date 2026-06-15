'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AiSuitChanger() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User se photo lena
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
    }
  };

  // FastAPI Backend ko photo bhejna
  const generateSuit = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('outfit_type', 'professional_suit'); // Aap backend me alag alag kapde set kar sakte hain

    try {
      // YAHAN AAPKE FASTAPI (RENDER) KA LINK AAYEGA
      const response = await fetch('https://your-fastapi-app.onrender.com/generate-suit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to generate image from backend.");

      const blob = await response.blob();
      const newImageUrl = URL.createObjectURL(blob);
      setResultUrl(newImageUrl);
      
    } catch (err) {
      console.error(err);
      setError("Kuch technical error aaya bhai. Backend check karo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-sm font-bold text-purple-600 hover:text-purple-800 mb-4 inline-block">← Back to Tools</Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">👔 AI Suit Changer</h1>
          <p className="text-lg text-slate-500 font-medium">Turn your casual photos into professional headshots using AI.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Side: Upload & Preview */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-black text-slate-800">1. Upload Photo</h3>
              
              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-4xl mb-3">📸</span>
                    <p className="mb-2 text-sm text-slate-600 font-bold">Click or drag image here</p>
                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                  <button onClick={() => setPreviewUrl(null)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full text-xs font-bold shadow-md hover:bg-red-600">✕</button>
                </div>
              )}

              {previewUrl && !resultUrl && (
                <button 
                  onClick={generateSuit} 
                  disabled={isProcessing}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-purple-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed shadow-lg"
                >
                  {isProcessing ? '✨ AI is designing your suit...' : '👔 Generate Suit'}
                </button>
              )}

              {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg">{error}</p>}
            </div>

            {/* Right Side: Result & Download */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-black text-slate-800">2. AI Result</h3>
              
              <div className="w-full h-64 border-2 border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden relative">
                {isProcessing ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Connecting to Hugging Face...</p>
                  </div>
                ) : resultUrl ? (
                  <img src={resultUrl} alt="AI Result" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 font-medium">
                    <span className="text-4xl block mb-2">✨</span>
                    Result will appear here
                  </div>
                )}
              </div>

              {resultUrl && (
                <a 
                  href={resultUrl} 
                  download="DhamakaTools_AI_Suit.png"
                  className="w-full block text-center bg-green-500 text-white font-black py-4 rounded-xl hover:bg-green-600 transition-colors shadow-lg"
                >
                  ⬇️ Download Photo
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}