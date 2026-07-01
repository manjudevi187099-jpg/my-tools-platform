'use client';

import React, { useState } from 'react';
import { FileCode, Download, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function SVGConverter() {
  const [svgInput, setSvgInput] = useState('');
  const [output, setOutput] = useState('');

  // 1. SVG to JSX Converter (Developer Focused)
  const convertToJSX = () => {
    let jsx = svgInput
      .replace(/class=/g, 'className=')
      .replace(/fill-rule=/g, 'fillRule=')
      .replace(/clip-rule=/g, 'clipRule=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=');
    
    setOutput(jsx);
  };

  // 2. SVG to PNG/JPG Converter (Design Focused)
  const downloadImage = (format: 'png' | 'jpeg') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const blob = new Blob([svgInput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      canvas.width = img.width || 500;
      canvas.height = img.height || 500;
      ctx?.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL(`image/${format === 'png' ? 'png' : 'jpeg'}`);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `converted-image.${format}`;
      link.click();
    };
    img.src = url;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-2">3. 🖼️ SVG to JSX / PNG/JPG Converter</h1>
        <p className="text-slate-400 mb-8">Professional tool for developers and designers. Fast, Secure, and Client-side.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* INPUT AREA */}
          <textarea 
            className="w-full h-96 bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 outline-none focus:border-indigo-500 font-mono text-sm transition-all"
            placeholder="Paste your SVG code here..."
            onChange={(e) => setSvgInput(e.target.value)}
          />
          
          {/* OUTPUT / ACTION AREA */}
          <div className="space-y-4">
            <button onClick={convertToJSX} className="w-full p-4 bg-indigo-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg">
              <FileCode size={20}/> Convert to JSX Component
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => downloadImage('png')} className="p-4 bg-emerald-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg">
                <ImageIcon size={20}/> Download PNG
              </button>
              <button onClick={() => downloadImage('jpeg')} className="p-4 bg-orange-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-lg">
                <ImageIcon size={20}/> Download JPG
              </button>
            </div>
          </div>
        </div>

        {output && (
          <div className="mt-8 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-xl">JSX Output:</h2>
              <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs font-bold bg-slate-700 px-3 py-2 rounded-lg">COPY CODE</button>
            </div>
            <pre className="bg-black p-6 rounded-3xl overflow-x-auto text-indigo-300 font-mono text-sm border border-slate-700">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}