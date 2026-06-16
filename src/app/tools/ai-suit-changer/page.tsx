'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

// 👔 10 Suits
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

export default function ManualSuitFitter() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedSuit, setSelectedSuit] = useState('1');
  
  // 🔥 NEW: Advanced Suit Adjustments State
  const [scaleX, setScaleX] = useState(1.2); // Width
  const [scaleY, setScaleY] = useState(1.2); // Height
  const [rotation, setRotation] = useState(0); // Angle
  const [suitPos, setSuitPos] = useState({ x: 100, y: 200 });
  
  const [isDraggingSuit, setIsDraggingSuit] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Eraser Tool & Undo State
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [eraserSize, setEraserSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [undoHistory, setUndoHistory] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suitImgRef = useRef<HTMLImageElement>(null);

  // 1️⃣ Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhoto(url);
      setUndoHistory([]);
      
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = 400;
          canvas.height = 500;
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
    }
  };

  // 2️⃣ Eraser Logic & Undo
  const startErasing = (e: any) => {
    if (!isEraserMode) return;
    const canvas = canvasRef.current;
    if (canvas) {
      setUndoHistory((prev) => [...prev, canvas.toDataURL()]);
    }
    setIsErasing(true);
    erase(e);
  };

  const stopErasing = () => {
    setIsErasing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
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

  // 3️⃣ Suit Dragging Logic
  const handleSuitMouseDown = (e: any) => {
    if (isEraserMode) return; 
    setIsDraggingSuit(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX - suitPos.x, y: clientY - suitPos.y };
  };

  const handleSuitMouseMove = (e: any) => {
    if (!isDraggingSuit || isEraserMode) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setSuitPos({
      x: clientX - dragStartPos.current.x,
      y: clientY - dragStartPos.current.y,
    });
  };

  const handleSuitMouseUp = () => setIsDraggingSuit(false);

  // 4️⃣ Final Merge & Download HD
  const downloadHDPhoto = () => {
    const baseCanvas = canvasRef.current;
    const suitImg = suitImgRef.current;
    
    if (baseCanvas && suitImg) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = baseCanvas.width;
      finalCanvas.height = baseCanvas.height;
      const ctx = finalCanvas.getContext('2d');
      
      if (ctx) {
        // Draw User Photo first
        ctx.drawImage(baseCanvas, 0, 0);
        
        // Draw Suit with Advanced Transformations
        ctx.globalCompositeOperation = 'source-over';
        ctx.save();
        
        // Move to position, rotate, and scale independently
        ctx.translate(suitPos.x, suitPos.y);
        ctx.rotate((rotation * Math.PI) / 180);
        
        const finalWidth = suitImg.width * scaleX;
        const finalHeight = suitImg.height * scaleY;
        
        ctx.drawImage(suitImg, 0, 0, finalWidth, finalHeight);
        ctx.restore();
        
        const link = document.createElement('a');
        link.download = 'DhamakaTools_Studio_HD.png';
        link.href = finalCanvas.toDataURL('image/png', 1.0);
        link.click();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm font-bold text-purple-600 mb-4 inline-block">← Back to Tools</Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4">👔 Manual HD Suit Fitter</h1>
          <p className="text-lg text-slate-500 font-medium">Fit the suit yourself, adjust width/height, erase extra edges, and download HD!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row gap-8">
          
          <div className="w-full md:w-1/3 flex flex-col space-y-6">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <h3 className="font-bold mb-3">1. Upload Photo</h3>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
            </div>

            {photo && (
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
                  <h3 className="font-bold">3. Pro Adjustments</h3>
                  
                  {/* Advanced Sliders */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 flex justify-between">
                        <span>↔️ Chaudai (Width)</span> <span>{Math.round(scaleX * 100)}%</span>
                      </label>
                      <input type="range" min="0.5" max="2.5" step="0.01" value={scaleX} onChange={(e) => setScaleX(parseFloat(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 flex justify-between">
                        <span>↕️ Lambaai (Height)</span> <span>{Math.round(scaleY * 100)}%</span>
                      </label>
                      <input type="range" min="0.5" max="2.5" step="0.01" value={scaleY} onChange={(e) => setScaleY(parseFloat(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 flex justify-between">
                        <span>🔄 Ghumana (Rotate)</span> <span>{rotation}°</span>
                      </label>
                      <input type="range" min="-45" max="45" step="1" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full" />
                    </div>
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
                          <button 
                            onClick={handleUndo} 
                            disabled={undoHistory.length === 0}
                            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↩️ Undo Action
                          </button>
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

          <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 overflow-hidden relative min-h-[500px]">
            {!photo ? (
              <p className="text-slate-400 font-bold">Upload a photo to start tailoring...</p>
            ) : (
              <div 
                ref={containerRef}
                className="relative overflow-hidden shadow-2xl bg-white border border-slate-200"
                style={{ width: 400, height: 500, cursor: isEraserMode ? 'crosshair' : 'default' }}
                onMouseUp={stopErasing}
                onMouseLeave={stopErasing}
                onTouchEnd={stopErasing}
                onMouseMove={handleSuitMouseMove}
                onTouchMove={handleSuitMouseMove}
              >
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 z-10"
                  onMouseDown={startErasing}
                  onMouseMove={erase}
                  onTouchStart={startErasing}
                  onTouchMove={erase}
                />

                <img 
                  ref={suitImgRef}
                  src={`/suits/suit${selectedSuit}.png`} 
                  alt="Suit"
                  draggable={false}
                  className="absolute z-20 hover:outline hover:outline-2 hover:outline-dashed hover:outline-purple-500 cursor-grab active:cursor-grabbing"
                  style={{
                    left: `${suitPos.x}px`,
                    top: `${suitPos.y}px`,
                    transform: `scaleX(${scaleX}) scaleY(${scaleY}) rotate(${rotation}deg)`,
                    transformOrigin: 'top left',
                    pointerEvents: isEraserMode ? 'none' : 'auto',
                  }}
                  onMouseDown={handleSuitMouseDown}
                  onTouchStart={handleSuitMouseDown}
                  onMouseUp={handleSuitMouseUp}
                  onTouchEnd={handleSuitMouseUp}
                />
              </div>
            )}
            
            {photo && (
              <p className="text-xs text-slate-400 font-bold mt-4">
                {isEraserMode ? 'Tip: Drag on photo to erase old clothes.' : 'Tip: Drag the suit and use sliders to fit it perfectly.'}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}