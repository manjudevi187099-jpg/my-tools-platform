'use client';

import React, { useState, useRef } from 'react';
import { FileCode, Image as ImageIcon, Upload, Copy } from 'lucide-react';

export default function SVGConverter() {
  const [svgInput, setSvgInput] = useState('');
  const [output, setOutput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSvgInput(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  // --- SVG TO JSX CONVERTER ---
  const convertToJSX = () => {
    if (!svgInput.trim()) return alert("Please paste or upload SVG code first!");

    let jsx = svgInput
      .replace(/class=/g, 'className=')
      .replace(/fill-rule=/g, 'fillRule=')
      .replace(/clip-rule=/g, 'clipRule=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=');
    
    setOutput(jsx);
  };

  // --- SVG TO PNG/JPG CONVERTER ---
  const downloadImage = (format: 'png' | 'jpeg') => {
    if (!svgInput.trim()) return alert("Please paste or upload SVG code first!");

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Create a Blob from the SVG string
    const blob = new Blob([svgInput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      // Set canvas dimensions based on SVG size (default to 500 if not specified)
      canvas.width = img.width || 500;
      canvas.height = img.height || 500;
      
      // Draw a white background for JPEG so it doesn't become black
      if (format === 'jpeg') {
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx?.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL(`image/${format}`);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `converted-image.${format}`;
      link.click();
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          🖼️ SVG to JSX / PNG / JPG 
        </h1>
        <p className="text-slate-400 mb-8">Professional tool for developers and designers. Fast, Secure, and 100% Client-side.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* --- INPUT AREA --- */}
          <div className="flex flex-col gap-4">
            
            {/* Upload Button */}
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Input SVG</label>
              <input 
                type="file" 
                accept=".svg" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Upload size={14}/> UPLOAD .SVG FILE
              </button>
            </div>

            <textarea 
              value={svgInput}
              className="w-full h-80 bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 outline-none focus:border-indigo-500 font-mono text-sm transition-all custom-scrollbar"
              placeholder="Paste your SVG code here or upload a file..."
              onChange={(e) => setSvgInput(e.target.value)}
            />
          </div>
          
          {/* --- OUTPUT / ACTION AREA --- */}
          <div className="space-y-4 pt-9">
            <button 
              onClick={convertToJSX} 
              className="w-full p-4 bg-indigo-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg"
            >
              <FileCode size={20}/> Convert to JSX Component
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => downloadImage('png')} 
                className="p-4 bg-emerald-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg"
              >
                <ImageIcon size={20}/> Download PNG
              </button>
              
              <button 
                onClick={() => downloadImage('jpeg')} 
                className="p-4 bg-orange-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-lg"
              >
                <ImageIcon size={20}/> Download JPG
              </button>
            </div>
          </div>
        </div>

        {/* --- JSX OUTPUT DISPLAY --- */}
        {output && (
          <div className="mt-8 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-xl flex items-center gap-2">
                <FileCode className="text-indigo-400"/> JSX Output:
              </h2>
              <button 
                onClick={() => navigator.clipboard.writeText(output)} 
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Copy size={14} /> COPY CODE
              </button>
            </div>
            <pre className="bg-black p-6 rounded-3xl overflow-x-auto text-indigo-300 font-mono text-sm border border-slate-700 custom-scrollbar">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}