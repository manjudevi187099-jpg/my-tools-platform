'use client';
import React, { useState, useRef } from 'react';

type Unit = 'PX' | 'INCH' | 'CM' | 'MM';

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [unit, setUnit] = useState<Unit>('PX');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  
  // 🌟 File size (KB) state
  const [maxSizeKb, setMaxSizeKb] = useState<string>(''); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const DPI = 300; 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        setImage(imgUrl);
        const img = new Image();
        img.onload = () => {
          setOriginalSize({ w: img.width, h: img.height });
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
      const targetPxWidth = getDimensionInPixels(w, unit);
      const targetPxHeight = getDimensionInPixels(h, unit);

      canvas.width = targetPxWidth;
      canvas.height = targetPxHeight;

      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, targetPxWidth, targetPxHeight);
      }
      
      let quality = 1.0; 
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      const targetKb = parseFloat(maxSizeKb);
      
      // Agar user ne KB ki limit dali hai (1 se 3000 ke beech)
      if (!isNaN(targetKb) && targetKb > 0 && targetKb <= 3000) {
        const targetBytes = targetKb * 1024;
        let currentBytes = Math.round((dataUrl.length * 3) / 4);
        
        while (currentBytes > targetBytes && quality > 0.05) {
          quality -= 0.05; 
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          currentBytes = Math.round((dataUrl.length * 3) / 4);
        }
      } else if (targetKb > 3000) {
        alert("Maximum allowed size is 3000 KB. Proceeding with best quality.");
      }

      const link = document.createElement('a');
      link.download = `Resized_Image_${targetPxWidth}x${targetPxHeight}.jpg`;
      link.href = dataUrl;
      link.click();
      
      setIsProcessing(false);
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Photo & Signature Resizer</h2>
        <p className="text-slate-500 mt-2">Exact dimensions (PX, CM, MM, INCH) aur file size mein resize karein.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  className="w-full p-3 mt-1 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" 
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Height ({unit})</label>
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 4.5" 
                  className="w-full p-3 mt-1 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" 
                />
              </div>
            </div>
          </div>

          {/* 🌟 YE HAI NAYA BOX JO MISSING THA 🌟 */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4">3. Max File Size (Optional)</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Target Size in KB (1 - 3000)</label>
              <input 
                type="number" 
                min="1"
                max="3000"
                value={maxSizeKb} 
                onChange={(e) => setMaxSizeKb(e.target.value)}
                placeholder="e.g. 50" 
                className="w-full p-3 mt-1 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" 
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">Kitne KB ki file chahiye? (1 KB se 3000 KB ke beech koi bhi number daalein)</p>
            </div>
          </div>

          <button 
            onClick={processAndDownload} 
            disabled={!image || isProcessing}
            className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition-transform ${!image ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'}`}
          >
            {isProcessing ? 'Processing...' : 'Resize & Download 📥'}
          </button>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}