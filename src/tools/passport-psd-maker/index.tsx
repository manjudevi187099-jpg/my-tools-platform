'use client';
import React, { useState } from 'react';
import { writePsd } from 'ag-psd';

export default function PassportPsdMaker() {
  const [image, setImage] = useState<string | null>(null);
  const [copies, setCopies] = useState<number>(42);
  const [isProcessing, setIsProcessing] = useState(false);

  // A4 Size at 300 DPI
  const A4_WIDTH = 2480;
  const A4_HEIGHT = 3508;
  const COLS = 6;
  const ROWS = 7;
  const PHOTO_W = Math.floor(A4_WIDTH / COLS); // ~413px
  const PHOTO_H = Math.floor(A4_HEIGHT / ROWS); // ~501px

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  // Image ko passport size (413x501) mein perfect fit (cover) karne ke liye
  const createResizedCanvas = (img: HTMLImageElement, w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imgRatio = img.width / img.height;
    const targetRatio = w / h;

    let drawW = w;
    let drawH = h;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > targetRatio) {
      drawW = h * imgRatio;
      offsetX = (w - drawW) / 2;
    } else {
      drawH = w / imgRatio;
      offsetY = (h - drawH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    return canvas;
  };

  const generateAndDownloadPSD = async () => {
    if (!image) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // 1. Photo ko perfectly resize karein
      const photoCanvas = createResizedCanvas(img, PHOTO_W, PHOTO_H);

      // 2. PSD ke liye layers taiyar karein
      const childrenLayers: any[] = [];

      // Background Layer (White)
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = A4_WIDTH;
      bgCanvas.height = A4_HEIGHT;
      const bgCtx = bgCanvas.getContext('2d');
      if (bgCtx) {
        bgCtx.fillStyle = '#ffffff';
        bgCtx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);
      }
      
      childrenLayers.push({
        name: 'White Background',
        canvas: bgCanvas,
      });

      // 3. User ne jitni photo boli hain, utni layers banayein
      for (let i = 0; i < copies; i++) {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = col * PHOTO_W;
        const y = row * PHOTO_H;

        childrenLayers.push({
          name: `Passport Photo ${i + 1}`,
          canvas: photoCanvas,
          left: x,
          top: y,
        });
      }

      // 4. PSD file banayein
      const psd = {
        width: A4_WIDTH,
        height: A4_HEIGHT,
        children: childrenLayers,
      };

      const buffer = writePsd(psd);
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      // 5. Download karwayein
      const link = document.createElement('a');
      link.download = `A4_Passport_Grid_${copies}_Photos.psd`;
      link.href = url;
      link.click();

    } catch (error) {
      console.error(error);
      alert("Error generating PSD file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">A4 Passport PSD Maker</h2>
          <p className="text-slate-500 mt-2 text-lg">Studio jaisa 6x7 format (A4 Size). Seedha .PSD file download karein.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Box */}
          <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center relative hover:border-blue-500 transition-colors bg-slate-50 min-h-[300px]">
            {image ? (
              <div className="text-center w-full">
                <img src={image} className="max-h-48 mx-auto rounded shadow-md border mb-4" alt="Uploaded" />
                <p className="text-sm font-bold text-emerald-600">Photo Uploaded Successfully!</p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-6xl block mb-4">📸</span>
                <p className="font-bold text-slate-600 text-lg">Upload Single Photo</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>

          {/* Controls */}
          <div className="space-y-6 flex flex-col justify-center">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-4 text-lg">Kitni Photos Chahiye? (1 se 42)</h3>
              <input 
                type="number" 
                min="1" 
                max="42" 
                value={copies} 
                onChange={(e) => setCopies(Number(e.target.value))}
                className="w-full p-4 border-2 border-blue-200 rounded-xl text-2xl font-black text-blue-900 focus:border-blue-600 outline-none text-center" 
              />
              <p className="text-xs text-blue-600 mt-3 font-medium text-center">
                Ye tool ekdum perfect 6x7 grid mein aapki photos ko A4 paper par set karke PSD banayega.
              </p>
            </div>

            <button 
              onClick={generateAndDownloadPSD} 
              disabled={!image || isProcessing}
              className={`w-full py-5 rounded-xl font-black text-xl shadow-lg transition-transform ${!image ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'}`}
            >
              {isProcessing ? 'Generating PSD...' : 'Download .PSD File 📥'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}