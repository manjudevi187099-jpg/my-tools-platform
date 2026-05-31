'use client';
import React, { useState, useEffect } from 'react';
import { writePsd } from 'ag-psd';

type PaperSize = 'A4' | '4x6';

export default function PassportPsdMaker() {
  const [image, setImage] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [copies, setCopies] = useState<number>(42);
  const [borderWidth, setBorderWidth] = useState<number>(3); // Default 3px cutting border
  const [isProcessing, setIsProcessing] = useState(false);

  // Paper Formats (300 DPI High Resolution)
  const formats = {
    'A4': { w: 2480, h: 3508, cols: 6, rows: 7, maxPhotos: 42 },
    '4x6': { w: 1200, h: 1800, cols: 2, rows: 4, maxPhotos: 8 }
  };

  // Jab paper badle, toh automatically copies uske max photos par set ho jayein
  useEffect(() => {
    setCopies(formats[paperSize].maxPhotos);
  }, [paperSize]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  // 🌟 ADVANCE LOGIC: Image resize + Smart Cutting Border
  const createResizedCanvas = (img: HTMLImageElement, w: number, h: number, border: number) => {
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

    // Image ko perfectly center crop karna
    if (imgRatio > targetRatio) {
      drawW = h * imgRatio;
      offsetX = (w - drawW) / 2;
    } else {
      drawH = w / imgRatio;
      offsetY = (h - drawH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

    // 🌟 BORDER LOGIC: Har photo ke kinare black outline (Stroke) banana
    if (border > 0) {
      ctx.strokeStyle = '#000000'; // Black Color
      // Line width double ki hai kyunki aadha border canvas ke bahar chala jata hai
      ctx.lineWidth = border * 2; 
      ctx.strokeRect(0, 0, w, h);
    }

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

      const currentFormat = formats[paperSize];
      const PHOTO_W = Math.floor(currentFormat.w / currentFormat.cols);
      const PHOTO_H = Math.floor(currentFormat.h / currentFormat.rows);

      // 1. Photo prepare karein with selected Border
      const photoCanvas = createResizedCanvas(img, PHOTO_W, PHOTO_H, borderWidth);

      // 2. Layers array banayein (Sabse pehle background)
      const childrenLayers: any[] = [];

      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = currentFormat.w;
      bgCanvas.height = currentFormat.h;
      const bgCtx = bgCanvas.getContext('2d');
      if (bgCtx) {
        bgCtx.fillStyle = '#ffffff';
        bgCtx.fillRect(0, 0, currentFormat.w, currentFormat.h);
      }
      
      childrenLayers.push({
        name: 'White Paper Background',
        canvas: bgCanvas,
      });

      // 3. User ne jitni photos maangi hain, utni hi grid mein lagayein
      const totalPhotosToPrint = Math.min(copies, currentFormat.maxPhotos);
      
      for (let i = 0; i < totalPhotosToPrint; i++) {
        const col = i % currentFormat.cols;
        const row = Math.floor(i / currentFormat.cols);
        const x = col * PHOTO_W;
        const y = row * PHOTO_H;

        childrenLayers.push({
          name: `Passport Photo ${i + 1}`,
          canvas: photoCanvas,
          left: x,
          top: y,
        });
      }

      // 4. Final PSD generate karein
      const psd = {
        width: currentFormat.w,
        height: currentFormat.h,
        children: childrenLayers,
      };

      const buffer = writePsd(psd);
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      // 5. Download karwayein
      const link = document.createElement('a');
      link.download = `Studio_Grid_${paperSize}_${totalPhotosToPrint}_Photos.psd`;
      link.href = url;
      link.click();

    } catch (error) {
      console.error(error);
      alert("Error generating PSD file. Please try a different image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Studio PSD Maker</h2>
          <p className="text-slate-500 mt-2 text-lg">Border wali photos ke sath A4 ya 4x6 inch format mein PSD grid banayein.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT: Upload Box */}
          <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center relative hover:border-blue-500 transition-colors bg-slate-50 min-h-[350px]">
            {image ? (
              <div className="text-center w-full">
                <img src={image} className="max-h-64 mx-auto rounded shadow-lg border-2 border-slate-300 mb-4 object-contain" alt="Uploaded" />
                <button onClick={() => setImage(null)} className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg">
                  🗑️ Remove Photo
                </button>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-6xl block mb-4">📸</span>
                <p className="font-bold text-slate-700 text-xl">Upload Passport Photo</p>
                <p className="text-sm text-slate-400 mt-2">JPG, PNG supported</p>
              </div>
            )}
            {!image && <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />}
          </div>

          {/* RIGHT: Studio Settings */}
          <div className="space-y-6 flex flex-col justify-center">
            
            {/* Setting 1: Paper Size */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-3">1. Select Paper Size</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPaperSize('A4')}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all ${paperSize === 'A4' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}
                >
                  A4 Sheet (42 Photos)
                </button>
                <button 
                  onClick={() => setPaperSize('4x6')}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all ${paperSize === '4x6' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'}`}
                >
                  4x6 Jumbo (8 Photos)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Setting 2: Total Copies */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-2">2. How Many Photos?</h3>
                <input 
                  type="number" 
                  min="1" 
                  max={formats[paperSize].maxPhotos} 
                  value={copies} 
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="w-full p-3 border rounded-xl text-xl font-black text-center focus:border-blue-500 outline-none" 
                />
                <p className="text-[10px] text-slate-400 mt-2 text-center">Max {formats[paperSize].maxPhotos} for {paperSize}</p>
              </div>

              {/* Setting 3: Cutting Border */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-2">3. Cutting Border (px)</h3>
                <input 
                  type="number" 
                  min="0" 
                  max="15" 
                  value={borderWidth} 
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="w-full p-3 border rounded-xl text-xl font-black text-center focus:border-blue-500 outline-none" 
                />
                <p className="text-[10px] text-slate-400 mt-2 text-center">0 for no border, 3 is standard.</p>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={generateAndDownloadPSD} 
              disabled={!image || isProcessing}
              className={`w-full py-5 mt-4 rounded-xl font-black text-xl shadow-xl transition-all ${!image ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#0f172a] hover:bg-blue-600 text-white hover:-translate-y-1'}`}
            >
              {isProcessing ? 'Creating Layers...' : 'Download HD .PSD File 📥'}
            </button>
            <p className="text-center text-xs text-slate-400 font-medium">Fully layered PSD file. Open directly in Adobe Photoshop.</p>

          </div>
        </div>

      </div>
    </div>
  );
}