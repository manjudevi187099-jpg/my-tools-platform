'use client';

import React, { useState } from 'react';
import { removeBackground as imglyRemoveBg } from '@imgly/background-removal';

export default function RemoveBgTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
    setBgColor('transparent');
  };

  const removeBackground = async () => {
    if (!imageFile) return;

    setLoading(true);
    setProgress('AI is processing your image... Please wait ⏳');

    try {
      // 🔥 Yahan humne dynamically poora absolute URL bana liya hai
      const fullPublicPath = window.location.origin + "/imgly/";

      const blob = await imglyRemoveBg(imageFile, {
        publicPath: fullPublicPath,
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          setProgress(`Processing: ${percent}%`);
        }
      });
      
      setProcessedUrl(URL.createObjectURL(blob));
      setProgress('');
    } catch (error) {
      console.error("BG Removal Error:", error);
      setProgress('Error processing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = processedUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (bgColor !== 'transparent') {
        ctx!.fillStyle = bgColor;
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx!.drawImage(img, 0, 0);

      const format = bgColor === 'transparent' ? 'image/png' : 'image/jpeg';
      const ext = bgColor === 'transparent' ? 'png' : 'jpg';

      const link = document.createElement('a');
      link.download = `bg-removed-${Date.now()}.${ext}`;
      link.href = canvas.toDataURL(format, 1.0);
      link.click();
    };
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
      <h2 className="text-3xl font-black text-slate-900 mb-2">🪄 Remove BG</h2>
      <p className="text-slate-500 mb-8 font-medium">Remove background instantly and add custom colors. 100% Free & Private.</p>

      {!previewUrl && (
        <div className="border-4 border-dashed border-slate-200 rounded-3xl p-12 hover:border-purple-500 transition-colors bg-slate-50">
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg" 
            onChange={handleImageUpload} 
            className="hidden" 
            id="file-upload" 
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <span className="text-6xl mb-4">📤</span>
            <span className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 hover:shadow-lg transition-all">
              Upload Image
            </span>
          </label>
        </div>
      )}

      {previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">Original Image</h3>
            <img src={previewUrl} alt="Original" className="w-full h-auto rounded-xl object-contain max-h-[400px]" />
            
            {!processedUrl && (
              <button 
                onClick={removeBackground}
                disabled={loading}
                className={`mt-6 w-full py-4 rounded-xl font-bold text-lg text-white transition-all ${
                  loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:-translate-y-1'
                }`}
              >
                {loading ? '🪄 Removing BG...' : '✂️ Remove Background'}
              </button>
            )}
            
            {loading && <p className="mt-3 text-purple-600 font-bold animate-pulse">{progress}</p>}
          </div>

          {processedUrl && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4">Final Result</h3>
              
              <div 
                className="w-full h-auto rounded-xl overflow-hidden max-h-[400px] flex items-center justify-center border"
                style={{ 
                  backgroundColor: bgColor !== 'transparent' ? bgColor : 'transparent',
                  backgroundImage: bgColor === 'transparent' ? 'repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                  backgroundPosition: '0 0, 10px 10px',
                  backgroundSize: '20px 20px'
                }}
              >
                <img src={processedUrl} alt="Processed" className="max-w-full max-h-[400px] object-contain" />
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-600">Background:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setBgColor('transparent')} className={`px-4 py-2 rounded-lg text-sm font-bold ${bgColor === 'transparent' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Transparent</button>
                    <input 
                      type="color" 
                      value={bgColor !== 'transparent' ? bgColor : '#ffffff'} 
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setPreviewUrl(null); setProcessedUrl(null); }} className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-300">
                    Upload New
                  </button>
                  <button onClick={handleDownload} className="flex-[2] bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 shadow-md">
                    ⬇️ Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}