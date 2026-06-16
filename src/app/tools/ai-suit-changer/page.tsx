'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Rnd } from 'react-rnd'; 
import ReactCrop, { type Crop } from 'react-image-crop'; // 🔥 NEW: Crop Tool
import 'react-image-crop/dist/ReactCrop.css'; // 🔥 Crop tool ki styling

const SUIT_OPTIONS = [
  { id: '1', name: 'Black Formal', emoji: '🕴️' },
  { id: '2', name: 'Navy Blue Tux', emoji: '👔' },
  { id: '3', name: 'Grey Business', emoji: '🏢' },
  { id: '4', name: 'White Blazer', emoji: '🧥' },
  { id: '5', name: 'Maroon Party', emoji: '🍷' },
  { id: '6', name: 'Checkered', emoji: '🏁' },
  { id: '7', name: 'Cream Casual', emoji: '☕' },
  { id: '8', name: 'Royal Velvet', emoji: '👑' },
  { id: '9', name: 'Olive Green', emoji: '🌿' },
  { id: '10', name: 'Pinstripe', emoji: '💼' },
];

const handleStyle = {
  width: '14px', height: '14px', background: '#ffffff',
  border: '2px solid #2563eb', borderRadius: '2px',
  boxShadow: '0 0 4px rgba(0,0,0,0.3)', transition: 'opacity 0.3s ease',
};

// Standard Passport Size Ratio (3.5 / 4.5)
const ASPECT_RATIO = 3.5 / 4.5;
const CANVAS_WIDTH = 350;
const CANVAS_HEIGHT = 450;

export default function ManualSuitFitter() {
  // --- States ---
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [croppedWebP, setCroppedWebP] = useState<string | null>(null);
  
  // Crop States
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, x: 25, y: 10, height: 50 });
  const imgRef = useRef<HTMLImageElement>(null);

  // Editor States
  const [selectedSuit, setSelectedSuit] = useState('1');
  const [suitBox, setSuitBox] = useState({ x: 50, y: 150, width: 250, height: 320 });
  const [rotation, setRotation] = useState(0); 
  const [isBoxVisible, setIsBoxVisible] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Eraser States
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [eraserSize, setEraserSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [undoHistory, setUndoHistory] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const suitImgRef = useRef<HTMLImageElement>(null);

  // --- 1. Upload & Show Cropper ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setOriginalPhoto(url);
      setCroppedWebP(null); // Reset
      setUndoHistory([]);
    }
  };

  // --- 2. Process Crop & Convert to Light WebP ---
  const handleConfirmCrop = () => {
    if (!imgRef.current) return;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    
    // Scale crop coordinates to actual image size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw cropped area to canvas
      ctx.drawImage(
        image,
        crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
        0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
      );

      // 🔥 JAADU: Convert to lightweight WebP (Solves lagging issue)
      const webpUrl = canvas.toDataURL('image/webp', 0.8);
      setCroppedWebP(webpUrl);
      
      // Load onto main editor canvas
      const newImg = new Image();
      newImg.src = webpUrl;
      newImg.onload = () => {
        const mainCanvas = canvasRef.current;
        if (mainCanvas) {
          mainCanvas.width = CANVAS_WIDTH;
          mainCanvas.height = CANVAS_HEIGHT;
          mainCanvas.getContext('2d')?.drawImage(newImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
      };
    }
  };

  // --- 3. Smart Timer Functions ---
  const showBox = () => {
    if (isEraserMode) return;
    setIsBoxVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const startHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setIsBoxVisible(false), 2000);
  };

  useEffect(() => {
    showBox();
    startHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [selectedSuit]);

  // --- 4. Eraser Logic ---
  const startErasing = (e: any) => {
    if (!isEraserMode) return;
    const canvas = canvasRef.current;
    if (canvas) setUndoHistory((prev) => [...prev, canvas.toDataURL()]);
    setIsErasing(true);
    erase(e);
  };

  const stopErasing = () => {
    setIsErasing(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.beginPath();
  };

  const erase = (e: any) => {
    if (!isErasing || !isEraserMode) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (ctx) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = eraserSize;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const lastState = undoHistory[undoHistory.length - 1];
      setUndoHistory((prev) => prev.slice(0, -1));
      const img = new Image();
      img.src = lastState;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  };

  // --- 5. Download ---
  const downloadHDPhoto = () => {
    const baseCanvas = canvasRef.current;
    const suitImg = suitImgRef.current;
    
    if (baseCanvas && suitImg) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = baseCanvas.width;
      finalCanvas.height = baseCanvas.height;
      const ctx = finalCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(baseCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.translate(suitBox.x + suitBox.width / 2, suitBox.y + suitBox.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(suitImg, -suitBox.width / 2, -suitBox.height / 2, suitBox.width, suitBox.height);
        ctx.restore();
        
        const link = document.createElement('a');
        link.download = 'Passport_Suit_HD.png';
        link.href = finalCanvas.toDataURL('image/png', 1.0);
        link.click();
      }
    }
  };

  const handleOpacity = isBoxVisible && !isEraserMode ? 1 : 0;
  const pointerEvents = isBoxVisible && !isEraserMode ? 'auto' : 'none';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm font-bold text-purple-600 mb-4 inline-block">← Back to Tools</Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4">👔 Pro Passport Suit Fitter</h1>
          <p className="text-lg text-slate-500 font-medium">Auto WebP compression, perfectly smooth dragging, and standard 3.5x4.5 ratio!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row gap-8">
          
          {/* LEFT PANEL */}
          <div className="w-full md:w-1/3 flex flex-col space-y-6">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <h3 className="font-bold mb-3">1. Upload Photo</h3>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
            </div>

            {croppedWebP && (
              <>
                <div>
                  <h3 className="font-bold mb-3">2. Choose Suit</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {SUIT_OPTIONS.map((suit) => (
                      <button key={suit.id} onClick={() => setSelectedSuit(suit.id)} className={`p-2 text-xl rounded-lg border-2 ${selectedSuit === suit.id ? 'border-purple-600 bg-purple-100' : 'border-slate-100 hover:bg-slate-50'}`} title={suit.name}>
                        {suit.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="font-bold">3. Tools</h3>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 flex justify-between">
                      <span>🔄 Gardan Ghumana (Rotate)</span> <span>{rotation}°</span>
                    </label>
                    <input 
                      type="range" min="-45" max="45" step="1" value={rotation} 
                      onChange={(e) => { setRotation(parseInt(e.target.value)); showBox(); startHideTimer(); }} 
                      className="w-full" 
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button 
                      onClick={() => setIsEraserMode(!isEraserMode)}
                      className={`w-full py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${isEraserMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                      {isEraserMode ? '🧹 Stop Erasing (Move Suit)' : '🧹 Erase Extra Clothes'}
                    </button>
                    
                    {isEraserMode && (
                      <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-500">Eraser Size</label>
                          <button onClick={handleUndo} disabled={undoHistory.length === 0} className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg disabled:opacity-50">↩️ Undo Action</button>
                        </div>
                        <input type="range" min="5" max="50" value={eraserSize} onChange={(e) => setEraserSize(parseInt(e.target.value))} className="w-full" />
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={downloadHDPhoto} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-black transition-colors shadow-lg shadow-slate-900/20 text-lg">
                  ⬇️ Download HD Photo
                </button>
              </>
            )}
          </div>

          {/* RIGHT PANEL - CROPPER OR EDITOR */}
          <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 relative min-h-[500px] overflow-hidden p-4">
            
            {!originalPhoto && !croppedWebP && (
              <p className="text-slate-400 font-bold">Upload a photo to start tailoring...</p>
            )}

            {/* STEP 1: CROPPER */}
            {originalPhoto && !croppedWebP && (
              <div className="flex flex-col items-center w-full">
                <h3 className="font-bold mb-4 text-purple-600 bg-purple-100 px-4 py-2 rounded-full">✂️ Set Face for 3.5x4.5 Passport Size</h3>
                <ReactCrop 
                  crop={crop} 
                  onChange={(c) => setCrop(c)} 
                  aspect={ASPECT_RATIO} // 🔥 3.5 by 4.5 Lock
                  className="max-h-[400px]"
                >
                  <img ref={imgRef} src={originalPhoto} alt="Upload" className="max-h-[400px] object-contain" />
                </ReactCrop>
                <button 
                  onClick={handleConfirmCrop}
                  className="mt-6 bg-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-600/30 hover:bg-purple-700"
                >
                  ✅ Confirm Crop & Add Suit
                </button>
              </div>
            )}

            {/* STEP 2: MAIN EDITOR */}
            {croppedWebP && (
              <div 
                className="relative shadow-2xl bg-white border border-slate-200"
                style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, cursor: isEraserMode ? 'crosshair' : 'default' }}
                onMouseUp={stopErasing} onMouseLeave={stopErasing} onTouchEnd={stopErasing}
              >
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 z-10"
                  onMouseDown={startErasing} onMouseMove={erase} onTouchStart={startErasing} onTouchMove={erase}
                />

                {!isEraserMode && (
                  <Rnd
                    size={{ width: suitBox.width, height: suitBox.height }}
                    position={{ x: suitBox.x, y: suitBox.y }}
                    onDragStart={showBox}
                    onDragStop={(e, d) => { setSuitBox((prev) => ({ ...prev, x: d.x, y: d.y })); startHideTimer(); }}
                    onResizeStart={showBox}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      setSuitBox({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10), ...position });
                      startHideTimer();
                    }}
                    onMouseDown={showBox} onTouchStart={showBox}
                    minWidth={60} minHeight={60}
                    className={`z-20 flex items-center justify-center transition-all duration-200 ${isBoxVisible && !isEraserMode ? 'border-2 border-dashed border-blue-500' : 'border-2 border-transparent'}`}
                    style={{ transform: `translate(${suitBox.x}px, ${suitBox.y}px) rotate(${rotation}deg)`, willChange: 'transform' }} // 🔥 willChange makes drag buttery smooth
                    enableResizing={{ top: !isEraserMode, right: !isEraserMode, bottom: !isEraserMode, left: !isEraserMode, topRight: !isEraserMode, bottomRight: !isEraserMode, bottomLeft: !isEraserMode, topLeft: !isEraserMode }}
                    resizeHandleStyles={{
                      topLeft: { ...handleStyle, marginTop: '-7px', marginLeft: '-7px', opacity: handleOpacity, pointerEvents: pointerEvents as any },
                      topRight: { ...handleStyle, marginTop: '-7px', marginRight: '-7px', opacity: handleOpacity, pointerEvents: pointerEvents as any },
                      bottomLeft: { ...handleStyle, marginBottom: '-7px', marginLeft: '-7px', opacity: handleOpacity, pointerEvents: pointerEvents as any },
                      bottomRight: { ...handleStyle, marginBottom: '-7px', marginRight: '-7px', opacity: handleOpacity, pointerEvents: pointerEvents as any },
                      top: { ...handleStyle, marginTop: '-7px', left: '50%', transform: 'translateX(-50%)', opacity: handleOpacity, pointerEvents: pointerEvents as any },
                      bottom: { ...handleStyle, marginBottom: '-7px', left: '50%', transform: 'translateX(-50%)', opacity: handleOpacity, pointerEvents: pointerEvents as any },
                      left: { ...handleStyle, marginLeft: '-7px', top: '50%', transform: 'translateY(-50%)', opacity: handleOpacity, pointerEvents: pointerEvents as any },
                      right: { ...handleStyle, marginRight: '-7px', top: '50%', transform: 'translateY(-50%)', opacity: handleOpacity, pointerEvents: pointerEvents as any }
                    }}
                    disableDragging={isEraserMode} lockAspectRatio={false} 
                  >
                    <img 
                      ref={suitImgRef} src={`/suits/suit${selectedSuit}.png`} alt="Suit"
                      draggable={false} className="pointer-events-none block"
                      style={{ width: '100%', height: '100%', objectFit: 'fill' }} 
                    />
                  </Rnd>
                )}
                
                {isEraserMode && (
                  <img 
                    ref={suitImgRef} src={`/suits/suit${selectedSuit}.png`} alt="Suit"
                    className="absolute z-20 opacity-50 pointer-events-none"
                    style={{ left: `${suitBox.x}px`, top: `${suitBox.y}px`, width: `${suitBox.width}px`, height: `${suitBox.height}px`, transform: `rotate(${rotation}deg)` }}
                  />
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}