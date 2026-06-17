'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Rnd } from 'react-rnd'; 
import ReactCrop, { type Crop } from 'react-image-crop'; 
import 'react-image-crop/dist/ReactCrop.css'; 

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

// 🔥 MOBILE FRIENDLY BIG CIRCULAR HANDLES
const handleStyle = {
  width: '24px', 
  height: '24px', 
  background: '#ffffff',
  border: '4px solid #2563eb', 
  borderRadius: '50%', // Gole handles!
  boxShadow: '0 4px 8px rgba(0,0,0,0.4)', 
  transition: 'opacity 0.2s ease',
};

const ASPECT_RATIO = 3.5 / 4.5;
const CANVAS_WIDTH = 350;
const CANVAS_HEIGHT = 450;

export default function ManualSuitFitter() {
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [croppedWebP, setCroppedWebP] = useState<string | null>(null);
  
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 60, x: 20, y: 10, height: 60 });
  const imgRef = useRef<HTMLImageElement>(null);

  const [selectedSuit, setSelectedSuit] = useState('1');
  const [suitBox, setSuitBox] = useState({ x: 50, y: 150, width: 250, height: 320 });
  const [rotation, setRotation] = useState(0); 
  const [isBoxVisible, setIsBoxVisible] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const [isEraserMode, setIsEraserMode] = useState(false);
  const [eraserSize, setEraserSize] = useState(25);
  const [isErasing, setIsErasing] = useState(false);
  const [undoHistory, setUndoHistory] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const suitImgRef = useRef<HTMLImageElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setOriginalPhoto(url);
      setCroppedWebP(null);
      setUndoHistory([]);
    }
  };

  const handleConfirmCrop = () => {
    if (!imgRef.current) return;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
        0, 0, CANVAS_WIDTH, CANVAS_HEIGHT
      );

      const webpUrl = canvas.toDataURL('image/webp', 0.9);
      setCroppedWebP(webpUrl);
      
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

  // --- 🔥 LIVE ERASER LOGIC ---
  const startErasing = (e: any) => {
    if (!isEraserMode) return;
    const canvas = canvasRef.current;
    if (canvas) {
      // Save state BEFORE drawing starts
      setUndoHistory((prev) => [...prev, canvas.toDataURL()]);
    }
    setIsErasing(true);
    erase(e);
  };

  const stopErasing = () => {
    setIsErasing(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.beginPath(); // Reset path
  };

  const erase = (e: any) => {
    if (!isErasing || !isEraserMode) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      
      // Calculate exact scaling to fix mouse alignment
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      if (ctx) {
        ctx.globalCompositeOperation = 'destination-out'; // This makes pixels transparent
        ctx.lineWidth = eraserSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0,0,0,1)'; // Important to erase
        
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
        // Clear canvas and redraw the old state
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  };

  const downloadHDPhoto = () => {
    const baseCanvas = canvasRef.current;
    const suitImg = suitImgRef.current;
    
    if (baseCanvas && suitImg) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = baseCanvas.width;
      finalCanvas.height = baseCanvas.height;
      const ctx = finalCanvas.getContext('2d');
      
      if (ctx) {
        // Safe check for white background if user erased too much
        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        ctx.drawImage(baseCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.translate(suitBox.x + suitBox.width / 2, suitBox.y + suitBox.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(suitImg, -suitBox.width / 2, -suitBox.height / 2, suitBox.width, suitBox.height);
        ctx.restore();
        
        const link = document.createElement('a');
        link.download = 'Passport_Pro_HD.png';
        link.href = finalCanvas.toDataURL('image/png', 1.0);
        link.click();
      }
    }
  };

  const handleOpacity = isBoxVisible && !isEraserMode ? 1 : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm font-bold text-purple-600 mb-4 inline-block">← Back to Tools</Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4">👔 Pro Passport Suit Fitter</h1>
          <p className="text-lg text-slate-500 font-medium">Big handles for smooth drag, and LIVE ERASER to instantly cut old clothes!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row gap-8">
          
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
                  <h3 className="font-bold">3. Tools & Eraser</h3>
                  
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

                  <div className="pt-4 border-t border-slate-200">
                    <button 
                      onClick={() => setIsEraserMode(!isEraserMode)}
                      className={`w-full py-3 px-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${isEraserMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 border-2 border-red-600' : 'bg-slate-800 text-white hover:bg-black shadow-lg'}`}
                    >
                      {isEraserMode ? '🛑 Stop Erasing (Move Suit)' : '🧹 Erase Extra Clothes'}
                    </button>
                    
                    {isEraserMode && (
                      <div className="mt-4 p-4 bg-red-50 rounded-xl border-2 border-red-200 shadow-inner">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-bold text-red-700">Eraser Size</label>
                          <button 
                            onClick={handleUndo} 
                            disabled={undoHistory.length === 0}
                            className="text-sm font-black bg-white border-2 border-slate-300 hover:border-slate-800 text-slate-800 px-4 py-1.5 rounded-lg disabled:opacity-50 transition-all flex items-center gap-1 active:bg-slate-100"
                          >
                            ↩️ Undo
                          </button>
                        </div>
                        <input type="range" min="10" max="80" value={eraserSize} onChange={(e) => setEraserSize(parseInt(e.target.value))} className="w-full accent-red-500" />
                        <p className="text-xs text-red-500 mt-2 font-medium">Tip: Trace around the suit. Sticking-out clothes will vanish instantly!</p>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={downloadHDPhoto} className="w-full bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30 text-xl border-b-4 border-green-800 active:border-b-0 active:mt-1">
                  ⬇️ Download HD Photo
                </button>
              </>
            )}
          </div>

          <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 relative min-h-[500px] overflow-hidden p-4">
            
            {!originalPhoto && !croppedWebP && (
              <p className="text-slate-400 font-bold">Upload a photo to start tailoring...</p>
            )}

            {originalPhoto && !croppedWebP && (
              <div className="flex flex-col items-center w-full">
                <h3 className="font-bold mb-4 text-purple-600 bg-purple-100 px-4 py-2 rounded-full">✂️ Set Face for 3.5x4.5 Passport Size</h3>
                <ReactCrop 
                  crop={crop} 
                  onChange={(c) => setCrop(c)} 
                  aspect={ASPECT_RATIO} 
                  className="max-h-[400px] border-4 border-white shadow-xl"
                >
                  <img ref={imgRef} src={originalPhoto} alt="Upload" className="max-h-[400px] object-contain" />
                </ReactCrop>
                <button 
                  onClick={handleConfirmCrop}
                  className="mt-6 bg-purple-600 text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-purple-600/40 hover:bg-purple-700 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                  ✅ Confirm Crop & Add Suit
                </button>
              </div>
            )}

            {croppedWebP && (
              <div 
                className={`relative shadow-2xl bg-white border-4 ${isEraserMode ? 'border-red-500' : 'border-slate-200'} transition-colors`}
                style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, cursor: isEraserMode ? 'crosshair' : 'default' }}
                onMouseUp={stopErasing} onMouseLeave={stopErasing} onTouchEnd={stopErasing}
              >
                {/* 🖌️ LIVE BASE CANVAS */}
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 z-10"
                  onMouseDown={startErasing} onMouseMove={erase} onTouchStart={startErasing} onTouchMove={erase}
                />

                {/* 👔 DRAGGABLE SUIT (Stays visible & fully opaque during erasing, just passes clicks through) */}
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
                  
                  // 🔥 MAGIC: pointer-events-none lets the mouse "fall through" the suit to the canvas behind it when erasing!
                  className={`z-20 flex items-center justify-center ${isEraserMode ? 'pointer-events-none' : ''}`}
                  style={{ transform: `translate(${suitBox.x}px, ${suitBox.y}px) rotate(${rotation}deg)`, willChange: 'transform' }}
                  
                  enableResizing={!isEraserMode}
                  disableDragging={isEraserMode}
                  lockAspectRatio={false} 
                  
                  // Big Circular Handles
                  resizeHandleStyles={{
                    topLeft: { ...handleStyle, marginTop: '-12px', marginLeft: '-12px', opacity: handleOpacity },
                    topRight: { ...handleStyle, marginTop: '-12px', marginRight: '-12px', opacity: handleOpacity },
                    bottomLeft: { ...handleStyle, marginBottom: '-12px', marginLeft: '-12px', opacity: handleOpacity },
                    bottomRight: { ...handleStyle, marginBottom: '-12px', marginRight: '-12px', opacity: handleOpacity },
                    top: { ...handleStyle, marginTop: '-12px', left: '50%', transform: 'translateX(-50%)', opacity: handleOpacity },
                    bottom: { ...handleStyle, marginBottom: '-12px', left: '50%', transform: 'translateX(-50%)', opacity: handleOpacity },
                    left: { ...handleStyle, marginLeft: '-12px', top: '50%', transform: 'translateY(-50%)', opacity: handleOpacity },
                    right: { ...handleStyle, marginRight: '-12px', top: '50%', transform: 'translateY(-50%)', opacity: handleOpacity }
                  }}
                >
                  <img 
                    ref={suitImgRef} src={`/suits/suit${selectedSuit}.png`} alt="Suit"
                    draggable={false} 
                    className={`block transition-all duration-300 ${isBoxVisible && !isEraserMode ? 'outline outline-2 outline-dashed outline-blue-500/50' : ''}`}
                    style={{ width: '100%', height: '100%', objectFit: 'fill', pointerEvents: 'none' }} 
                  />
                </Rnd>

              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}