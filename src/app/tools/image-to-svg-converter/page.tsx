'use client';

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, FileCode, Upload, Download, RefreshCw, Sparkles } from 'lucide-react';
// @ts-ignore - imagetracerjs doesn't have official TS types, so we ignore the warning
import ImageTracer from 'imagetracerjs';

export default function ImageToSvgConverter() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a valid image
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid PNG, JPG, or JPEG file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        setSvgOutput(''); // Clear previous output
      }
    };
    reader.readAsDataURL(file);
  };

  // --- IMAGE TO SVG TRACING LOGIC ---
  const convertToSvg = () => {
    if (!imageSrc) return alert("Please upload an image first!");
    
    setIsConverting(true);

    // ImageTracer takes the Image URL and a callback function
    // 'posterized2' is a good default preset for logos and flat illustrations
    setTimeout(() => {
      try {
        ImageTracer.imageToSVG(
          imageSrc,
          (svgStr: string) => {
            setSvgOutput(svgStr);
            setIsConverting(false);
          },
          'posterized2' // You can change this to 'default', 'artistic', or 'bw'
        );
      } catch (error) {
        console.error("Conversion failed:", error);
        alert("Something went wrong during conversion.");
        setIsConverting(false);
      }
    }, 100); // Small timeout to allow UI to show loading state
  };

  // --- DOWNLOAD LOGIC ---
  const downloadSvg = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vectorized-image.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <Sparkles className="text-pink-500" /> JPG/PNG to SVG Converter
        </h1>
        <p className="text-slate-400 mb-8">Turn raster images (JPG, PNG) into scalable vector graphics (SVG) instantly.</p>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* --- UPLOAD & PREVIEW AREA --- */}
          <div className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden">
            
            {imageSrc ? (
              <div className="w-full h-full flex flex-col items-center">
                <img src={imageSrc} alt="Preview" className="max-h-64 object-contain mb-6 rounded-xl shadow-lg" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                >
                  CHANGE IMAGE
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-2">
                  <ImageIcon size={32} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1">Upload an Image</h3>
                  <p className="text-sm text-slate-400">Supports JPG, PNG, WEBP</p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-6 py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20"
                >
                  <Upload size={18} /> SELECT FILE
                </button>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>

          {/* --- ACTION & OUTPUT AREA --- */}
          <div className="flex flex-col justify-center space-y-6">
            <button 
              onClick={convertToSvg} 
              disabled={!imageSrc || isConverting}
              className="w-full p-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConverting ? (
                <><RefreshCw size={24} className="animate-spin" /> TRACING PIXELS...</>
              ) : (
                <><FileCode size={24} /> CONVERT TO SVG VECTOR</>
              )}
            </button>

            {svgOutput && (
              <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                    <Sparkles size={18} /> Vectorization Complete!
                  </h3>
                </div>
                <div 
                  className="w-full h-48 bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2"
                  dangerouslySetInnerHTML={{ __html: svgOutput }} 
                />
                
                <div className="flex gap-3">
                  <button 
                    onClick={downloadSvg}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={18} /> DOWNLOAD .SVG
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(svgOutput)}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    COPY CODE
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}