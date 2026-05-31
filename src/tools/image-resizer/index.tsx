'use client';
import React, { useState, useRef } from 'react';

type Unit = 'PX' | 'INCH' | 'CM' | 'MM';

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0, kb: 0 });
  const [unit, setUnit] = useState<Unit>('PX');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [maxSizeKb, setMaxSizeKb] = useState<string>(''); 
  const [customFileName, setCustomFileName] = useState<string>('Resized_Photo');
  
  // Preview State
  const [previewData, setPreviewData] = useState<{ url: string; kb: string; w: number; h: number } | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const DPI = 300; 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Get Original KB
      const originalKb = (file.size / 1024).toFixed(2);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        setImage(imgUrl);
        setPreviewData(null); // Reset preview on new upload
        const img = new Image();
        img.onload = () => {
          setOriginalSize({ w: img.width, h: img.height, kb: parseFloat(originalKb) });
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

  const generatePreview = async () => {
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
      
      let bestUrl = canvas.toDataURL('image/jpeg', 1.0);
      let bestSizeKb = (Math.round((bestUrl.length * 3) / 4) / 1024);
      
      const targetKb = parseFloat(maxSizeKb);
      
      // 🌟 BINARY SEARCH ALGORITHM (For exact KB targeting) 🌟
      if (!isNaN(targetKb) && targetKb > 0 && targetKb <= 3000) {
        let minQ = 0.01;
        let maxQ = 1.0;
        let targetBytes = targetKb * 1024;
        let currentBytes = Math.round((bestUrl.length * 3) / 4);

        if (currentBytes > targetBytes) {
          // Loop 8 times to find the perfect quality match
          for (let i = 0; i < 8; i++) {
            let midQ = (minQ + maxQ) / 2;
            let tempUrl = canvas.toDataURL('image/jpeg', midQ);
            let tempBytes = Math.round((tempUrl.length * 3) / 4);

            if (tempBytes <= targetBytes) {
              bestUrl = tempUrl;
              bestSizeKb = tempBytes / 1024;
              minQ = midQ; // Try to go a bit higher quality without exceeding limit
            } else {
              maxQ = midQ; // Still too big, lower the max quality
            }
          }
        }
      }

      setPreviewData({
        url: bestUrl,
        kb: bestSizeKb.toFixed(2),
        w: targetPxWidth,
        h: targetPxHeight
      });
      
      setIsProcessing(false);
    };
  };

  const handleDownload = () => {
    if (!previewData) return;
    const link = document.createElement('a');
    link.download = `${customFileName || 'Resized_Photo'}.jpg`;
    link.href = previewData.url;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Photo & Signature Resizer</h2>
        <p className="text-slate-500 mt-2">Exact dimensions, targeted KB size, aur preview ke sath form ready image banayein.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Upload & Preview */}
        <div className="space-y-6">
          <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] relative hover:border-blue-500 transition-colors bg-slate-50">
            {image ? (
              <div className="text-center w-full">
                <img src={image} className="max-h-40 mx-auto rounded shadow-md border mb-4" alt="Original" />
                <p className="text-sm font-bold text-slate-500">Original Size: {originalSize.kb} KB</p>
                <p className="text-xs text-slate-400">{originalSize.w} x {originalSize.h} PX</p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-6xl block mb-4">🖼️</span>
                <p className="font-bold text-slate-600 text-lg">Upload Photo / Signature</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>

          {/* 🌟 NAYA PREVIEW SECTION 🌟 */}
          {previewData && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-bold text-emerald-800 mb-4">Final Preview</h3>
              <img src={previewData.url} className="max-h-48 mx-auto rounded shadow-lg border-2 border-emerald-300 mb-4 bg-white" alt="Preview" />
              
              <div className="flex justify-center gap-6 mb-6 text-sm font-bold">
                <div className="bg-white px-4 py-2 rounded-lg text-emerald-700 shadow-sm">
                  New Size: <span className="text-lg">{previewData.kb} KB</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg text-emerald-700 shadow-sm">
                  Dims: <span className="text-lg">{previewData.w}x{previewData.h} PX</span>
                </div>
              </div>
              
              <button onClick={handleDownload} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black text-xl shadow-lg transition-transform hover:scale-[1.02]">
                Download Now 📥
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Settings */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">1. Select Unit</h3>
            <div className="flex bg-slate-200 rounded-xl p-1 gap-1">
              {(['PX', 'INCH', 'CM', 'MM'] as Unit[]).map((u) => (
                <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 font-bold rounded-lg text-sm transition-all ${unit === u ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`}>
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
                <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 3.5" className="w-full p-3 mt-1 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Height ({unit})</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 4.5" className="w-full p-3 mt-1 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4">3. Max File Size (Optional)</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Target Size in KB</label>
              <input type="number" min="1" max="3000" value={maxSizeKb} onChange={(e) => setMaxSizeKb(e.target.value)} placeholder="e.g. 50" className="w-full p-3 mt-1 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" />
              <p className="text-xs text-slate-500 mt-2">Example: Agar form mein "Max 50 KB" maanga hai, toh yahan 50 likhein.</p>
            </div>
          </div>

          {/* 🌟 NAYA FILE NAME BOX 🌟 */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">4. File Name (Optional)</h3>
            <div>
              <input type="text" value={customFileName} onChange={(e) => setCustomFileName(e.target.value)} placeholder="e.g. SSC_Photo_2024" className="w-full p-3 border rounded-xl text-lg font-bold focus:border-blue-500 outline-none" />
              <p className="text-xs text-slate-500 mt-2">Download hone wali file ka naam.</p>
            </div>
          </div>

          <button onClick={generatePreview} disabled={!image || isProcessing} className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition-transform ${!image ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'}`}>
            {isProcessing ? 'Generating...' : 'Generate Preview ✨'}
          </button>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}