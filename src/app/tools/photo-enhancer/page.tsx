'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function PhotoEnhancerPage() {
  // 🔥 FIX 2: TypeScript ko bataya ki inme khali(null) ya text(string/File) aa sakta hai
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔥 FIX 1: 'e' ko bataya ki ye ek HTML File Input hai
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setEnhancedUrl(null);
      setError('');
    }
  };

  const handleEnhance = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://pdfnexa-backend.onrender.com/api/enhance-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kuch gadbad ho gayi!');
      }

      setEnhancedUrl(data.enhanced_image_url);
    } catch (err: any) { 
      // 🔥 FIX 3: err ko 'any' type de diya taaki TypeScript pareshaan na kare
      setError(err.message || 'Server se connect nahi ho paya!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Link href="/" className="text-purple-600 font-bold mb-8 inline-block">← Back to DhamakaTools</Link>
      
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-2">✨ AI Photo Enhancer</h1>
        <p className="text-slate-500 mb-8 font-medium">Purani, blur ya pixelated photos ko 1-click mein HD banayein (Powered by GFPGAN).</p>

        <div className="border-2 border-dashed border-purple-200 bg-purple-50 p-8 rounded-2xl text-center mb-8">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-upload" />
          <label htmlFor="photo-upload" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-purple-700 transition">
            Upload Blur Photo
          </label>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-4 rounded-xl font-bold mb-6">❌ {error}</div>}

        {preview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="text-center">
              <h3 className="font-bold text-slate-500 mb-4 uppercase tracking-wider">Before (Blur)</h3>
              <img src={preview} alt="Original" className="rounded-2xl border border-slate-200 w-full h-auto object-cover shadow-sm" />
            </div>

            {/* After */}
            <div className="text-center flex flex-col justify-center items-center bg-slate-50 rounded-2xl border border-slate-200 p-4 min-h-[300px]">
              <h3 className="font-bold text-purple-600 mb-4 uppercase tracking-wider">After (HD)</h3>
              
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-slate-600 animate-pulse">AI is repairing face... Please wait ⏳</p>
                </div>
              ) : enhancedUrl ? (
                <>
                  <img src={enhancedUrl} alt="Enhanced" className="rounded-2xl w-full h-auto object-cover shadow-lg mb-4" />
                  <a href={enhancedUrl} download="DhamakaTools_HD_Photo.jpg" target="_blank" rel="noreferrer" className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 w-full">
                    ⬇️ Download HD Photo
                  </a>
                </>
              ) : (
                <button onClick={handleEnhance} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-black text-lg hover:opacity-90 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  ✨ Magic Enhance
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}