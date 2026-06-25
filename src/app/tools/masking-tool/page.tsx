'use client';

import React, { useState, useRef } from 'react';
import { Download, UploadCloud, Eraser, Undo, EyeOff, ImageIcon, PaintBucket, Loader2, ShieldAlert } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';

interface Mask {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  type: string;
}

export default function ImageMaskingTool() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Image State
  const [image, setImage] = useState<string | null>(null);
  
  // Masking States
  const [masks, setMasks] = useState<Mask[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  
  // Settings
  const [maskType, setMaskType] = useState('solid'); // 'solid' or 'blur'
  const [maskColor, setMaskColor] = useState('#1a1a1a'); // Default Black/Slate

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMasks([]); // Clear masks on new image
      };
      reader.readAsDataURL(file);
    }
  };

  // Mouse Handlers for Drawing Masks
  const getMousePos = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!image) return;
    const pos = getMousePos(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    setCurrentPos(getMousePos(e));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    // Ignore tiny accidental clicks
    if (w > 10 && h > 10) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      setMasks([...masks, { id: Date.now(), x, y, w, h, color: maskColor, type: maskType }]);
    }
  };

  const undoLastMask = () => {
    setMasks(masks.slice(0, -1));
  };

  const clearAllMasks = () => {
    setMasks([]);
  };

  // Download Handler
  const downloadImage = async (format: 'png' | 'jpeg') => {
    if (!previewRef.current || !image) return;
    setIsDownloading(true);
    try {
      const exportFunc = format === 'png' ? toPng : toJpeg;
      const dataUrl = await exportFunc(previewRef.current, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `Secure_Masked_Image.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <EyeOff className="w-10 h-10 text-indigo-600" />
            Secure Image Masking Tool
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Hide sensitive data like Account numbers, IDs, or Faces before sharing.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: CONTROLS ================= */}
          <div className="xl:col-span-4 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col max-h-[85vh] overflow-y-auto">
            
            {/* UPLOAD SECTION */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><UploadCloud className="w-4 h-4"/> Upload Document / Image</label>
              <div className="relative border-2 border-dashed border-indigo-300 bg-indigo-50 rounded-xl p-4 text-center hover:bg-indigo-100 transition-colors cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <ImageIcon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-indigo-700">Click to upload image</p>
                <p className="text-[10px] text-indigo-500 mt-1">JPG, PNG supported</p>
              </div>
            </div>

            {/* MASKING TOOLS */}
            <div className={`space-y-6 ${!image ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> Mask Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Mask Style</label>
                    <div className="flex gap-2">
                      <button onClick={() => setMaskType('solid')} className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${maskType === 'solid' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>Solid Box</button>
                      <button onClick={() => setMaskType('blur')} className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${maskType === 'blur' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>Blur Effect</button>
                    </div>
                  </div>

                  {maskType === 'solid' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Box Color</label>
                      <div className="flex gap-3">
                        <button onClick={() => setMaskColor('#1a1a1a')} className={`w-8 h-8 rounded-full bg-[#1a1a1a] shadow-sm border-2 ${maskColor === '#1a1a1a' ? 'border-indigo-500 scale-110' : 'border-transparent'}`} title="Black"></button>
                        <button onClick={() => setMaskColor('#ffffff')} className={`w-8 h-8 rounded-full bg-[#ffffff] shadow-sm border-2 ${maskColor === '#ffffff' ? 'border-indigo-500 scale-110' : 'border-slate-300'}`} title="White"></button>
                        <button onClick={() => setMaskColor('#dc2626')} className={`w-8 h-8 rounded-full bg-[#dc2626] shadow-sm border-2 ${maskColor === '#dc2626' ? 'border-indigo-500 scale-110' : 'border-transparent'}`} title="Red"></button>
                        <button onClick={() => setMaskColor('#2563eb')} className={`w-8 h-8 rounded-full bg-[#2563eb] shadow-sm border-2 ${maskColor === '#2563eb' ? 'border-indigo-500 scale-110' : 'border-transparent'}`} title="Blue"></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={undoLastMask} className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300">
                  <Undo className="w-4 h-4" /> Undo Last
                </button>
                <button onClick={clearAllMasks} className="flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg border border-red-200">
                  <Eraser className="w-4 h-4" /> Clear All
                </button>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className={`mt-auto pt-6 space-y-3 ${!image ? 'opacity-50 pointer-events-none' : ''}`}>
              <button onClick={() => downloadImage('jpeg')} disabled={isDownloading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Save as JPG
              </button>
              <button onClick={() => downloadImage('png')} disabled={isDownloading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Save as High-Res PNG
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: WORKSPACE ================= */}
          <div className="xl:col-span-8 bg-slate-200 rounded-3xl p-4 md:p-8 flex items-center justify-center overflow-auto shadow-inner min-h-[60vh] border-2 border-dashed border-slate-300 bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
            
            {!image ? (
              <div className="text-center text-slate-400">
                <EyeOff className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="font-bold text-lg">No Image Uploaded</p>
                <p className="text-sm">Upload an image to start masking sensitive data.</p>
              </div>
            ) : (
              <div className="relative shadow-2xl bg-white select-none">
                {/* INSTRUCTIONS BADGE */}
                <div className="absolute -top-10 left-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-t-lg shadow-md flex items-center gap-2">
                  <PaintBucket className="w-4 h-4" /> Click and Drag over the image to draw a mask.
                </div>

                {/* THE MASKING CANVAS (WRAPPER) */}
                <div 
                  ref={previewRef} 
                  className="relative cursor-crosshair overflow-hidden"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img src={image} alt="Workspace" draggable={false} className="max-w-full block" style={{ maxHeight: '75vh' }} />
                  
                  {/* Render Existing Masks */}
                  {masks.map((mask) => (
                    <div 
                      key={mask.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: mask.x,
                        top: mask.y,
                        width: mask.w,
                        height: mask.h,
                        backgroundColor: mask.type === 'solid' ? mask.color : 'transparent',
                        backdropFilter: mask.type === 'blur' ? 'blur(12px)' : 'none',
                        border: mask.type === 'blur' ? '1px solid rgba(0,0,0,0.1)' : 'none'
                      }}
                    ></div>
                  ))}

                  {/* Render Current Drawing Mask */}
                  {isDrawing && (
                    <div 
                      className="absolute pointer-events-none border-2 border-dashed border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                      style={{
                        left: Math.min(startPos.x, currentPos.x),
                        top: Math.min(startPos.y, currentPos.y),
                        width: Math.abs(currentPos.x - startPos.x),
                        height: Math.abs(currentPos.y - startPos.y),
                        backgroundColor: maskType === 'solid' ? maskColor : 'rgba(255,255,255,0.2)',
                        opacity: maskType === 'solid' ? 0.8 : 1,
                        backdropFilter: maskType === 'blur' ? 'blur(12px)' : 'none',
                      }}
                    ></div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}