'use client';
import React, { useState, useRef } from 'react';

type Unit = 'PX' | 'INCH' | 'CM' | 'MM';

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [unit, setUnit] = useState<Unit>('PX');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // DPI setting for print-quality conversion (Standard for forms)
  const DPI = 300; 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        setImage(imgUrl);
        // Get original dimensions
        const img = new Image();
        img.onload = () => {
          setOriginalSize({ w: img.width, h: img.height });
          // Default to original pixels
          if (unit === 'PX') {
            setWidth(img.width.toString());
            setHeight(img.height.toString());
          }
        };
        img.src = imgUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Unit Conversion Logic to Pixels
  const getDimensionInPixels = (val: number, currentUnit: Unit) => {
    switch (currentUnit) {
      case 'INCH': return Math.round(val * DPI);
      case 'CM': return Math.round(val * (DPI / 2.54));
      case 'MM': return Math.round(val * (DPI / 25.4));
      case 'PX': 
      default: return Math.round(val);
    }
  };

  const processAndDownload = async () => {
    const w = parseFloat(width);
    const h = parseFloat(height);

    if (!image || !canvasRef.current || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      alert("Please enter valid width and height!");
      return;
    }

    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.src = image;

    img.onload = () => {
      // Calculate target pixels based on selected unit
      const targetPxWidth = getDimensionInPixels(w, unit);
      const targetPxHeight = getDimensionInPixels(h, unit);

      canvas.width = targetPxWidth;
      canvas.height = targetPxHeight;

      if (ctx) {
        // Fill white background in case of transparent PNGs
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw image stretched to exactly match the target dimensions
        ctx.drawImage(img, 0, 0, targetPxWidth, targetPxHeight);
      }
      
      // Download
      const link = document.createElement('a');
      link.download = `Resized_Image_${targetPxWidth}x${targetPxHeight}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      
      setIsProcessing(false);
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Photo & Signature Resizer</h2>
        <p className="text-slate-500 mt-2">Exact dimensions (PX, CM, MM, INCH) mein apni photo ya signature resize karein.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Upload & Preview */}
        <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] relative hover:border-blue-500 transition-colors bg-slate-50">
          {image ? (
            <div className="text-center w-full">
              <img src={image} className="max-h-48 mx-auto rounded shadow-md border mb-4" alt="Preview" />
              <p className="text-sm font-bold text-slate-500">Original: {originalSize.w} x {originalSize.h} PX</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-6xl block mb-4">🖼️</span>
              <p className="font-bold text-slate-600 text-lg">Upload Photo / Signature</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>

        {/* Right Side: Controls */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">1. Select Unit</h3>
            <div className="flex bg-slate-200 rounded-xl p-1 gap-1">
              {(['PX', 'INCH', 'CM', 'MM'] as Unit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-2 font-bold rounded-lg text-sm transition-all ${unit === u ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">2. Enter Dimensions</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Width ({unit})</label>
                <input 
                  type="number" 
                  value={width} 
                  onChange={(e) => setWidth(e.target.value)} 
                  placeholder="e.g. 3.5"
                  className="w-full p-4 mt-1 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" 
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Height ({unit})</label>
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 4.5" 
                  className="w-full p-4 mt-1 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={processAndDownload} 
            disabled={!image || isProcessing}
            className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition-transform ${!image ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'}`}
          >
            {isProcessing ? 'Processing...' : 'Resize & Download 📥'}
          </button>
          
          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}