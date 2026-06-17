'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Stage, Layer, Image as KonvaImage, Transformer, Line } from 'react-konva';
import useImage from 'use-image';
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

const ASPECT_RATIO = 3.5 / 4.5;
const CANVAS_WIDTH = 350;
const CANVAS_HEIGHT = 450;

export default function ManualSuitFitter() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [croppedWebP, setCroppedWebP] = useState<string | null>(null);
  const [selectedSuit, setSelectedSuit] = useState('1');
  
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 60, x: 20, y: 10, height: 60 });
  const imgRef = useRef<HTMLImageElement>(null);

  const stageRef = useRef<any>(null);
  const suitRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [bgImg] = useImage(croppedWebP || '');
  const [suitImg] = useImage(`/suits/suit${selectedSuit}.png`);

  const [isEraserMode, setIsEraserMode] = useState(false);
  const [eraserSize, setEraserSize] = useState(25);
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhoto(url);
      setCroppedWebP(null);
      setLines([]);
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
      setCroppedWebP(canvas.toDataURL('image/webp', 1.0));
    }
  };

  useEffect(() => {
    if (!isEraserMode && suitRef.current && trRef.current) {
      trRef.current.nodes([suitRef.current]);
      trRef.current.getLayer().batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isEraserMode, suitImg, croppedWebP, selectedSuit]);

  const handleMouseDown = (e: any) => {
    if (!isEraserMode) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], size: eraserSize }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isEraserMode || !isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleUndo = () => {
    setLines(lines.slice(0, -1)); 
  };

  const downloadHDPhoto = () => {
    if (stageRef.current) {
      trRef.current?.nodes([]); 
      setTimeout(() => {
        const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 }); 
        const link = document.createElement('a');
        link.download = 'Passport_Pro_HD.png';
        link.href = dataURL;
        link.click();
        if (!isEraserMode && suitRef.current) {
          trRef.current?.nodes([suitRef.current]); 
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm font-bold text-purple-600 mb-4 inline-block">← Back to Tools</Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4">👔 Pro Passport Studio</h1>
          <p className="text-lg text-slate-500 font-medium">Independent sleeve stretching & Live background eraser!</p>
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
                      <span>🔄 Gardan Ghumana (Rotate)</span>
                    </label>
                    <input 
                      type="range" min="-45" max="45" step="1" defaultValue="0"
                      onChange={(e) => { 
                        if(suitRef.current && trRef.current) {
                          suitRef.current.rotation(parseInt(e.target.value));
                          trRef.current.getLayer().batchDraw();
                        }
                      }} 
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
                            disabled={lines.length === 0}
                            className="text-sm font-black bg-white border-2 border-slate-300 hover:border-slate-800 text-slate-800 px-4 py-1.5 rounded-lg disabled:opacity-50 transition-all flex items-center gap-1 active:bg-slate-100"
                          >
                            ↩️ Undo
                          </button>
                        </div>
                        <input type="range" min="10" max="80" value={eraserSize} onChange={(e) => setEraserSize(parseInt(e.target.value))} className="w-full accent-red-500" />
                        <p className="text-xs text-red-500 mt-2 font-medium">Tip: The suit is locked while erasing. Trace around it safely!</p>
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
            
            {!croppedWebP && photo && (
               <div className="flex flex-col items-center w-full">
                  <h3 className="font-bold mb-4 text-purple-600 bg-purple-100 px-4 py-2 rounded-full">✂️ Set Face for 3.5x4.5 Passport Size</h3>
                  <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={ASPECT_RATIO} className="max-h-[400px] border-4 border-white shadow-xl">
                    <img ref={imgRef} src={photo} alt="Upload" className="max-h-[400px] object-contain" />
                  </ReactCrop>
                  <button onClick={handleConfirmCrop} className="mt-6 bg-purple-600 text-white font-bold py-3 px-10 rounded-xl shadow-lg hover:bg-purple-700">
                    ✅ Confirm Crop & Add Suit
                  </button>
              </div>
            )}

            {croppedWebP && (
              <div className={`relative shadow-2xl bg-white border-4 ${isEraserMode ? 'border-red-500' : 'border-slate-200'} transition-colors`}>
                <Stage 
                  ref={stageRef} 
                  width={CANVAS_WIDTH} 
                  height={CANVAS_HEIGHT}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                  style={{ cursor: isEraserMode ? 'crosshair' : 'default' }}
                >
                  <Layer>
                    {bgImg && <KonvaImage image={bgImg} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />}
                    {lines.map((line, i) => (
                      <Line
                        key={i}
                        points={line.points}
                        stroke="#000000"
                        strokeWidth={line.size}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                        globalCompositeOperation="destination-out" 
                      />
                    ))}
                  </Layer>

                  <Layer>
                    {suitImg && (
                      <KonvaImage 
                        ref={suitRef}
                        image={suitImg}
                        x={50} y={150} width={250} height={320}
                        draggable={!isEraserMode}
                        listening={!isEraserMode} 
                      />
                    )}
                    <Transformer 
                      ref={trRef} 
                      keepRatio={false} // 🔥 THIS ALLOWS INDEPENDENT SHOULDER STRETCHING
                      anchorSize={24}
                      anchorCornerRadius={12}
                      anchorFill="#ffffff"
                      anchorStroke="#2563eb"
                      anchorStrokeWidth={4}
                      borderStroke="#2563eb"
                      // 🔥 BUG FIX: Prevent image disappearing when collapsing 'inside'
                      boundBoxFunc={(oldBox, newBox) => {
                        // Enforce minimum dimensions. If the new box is too small, revert to the old box.
                        const MIN_DIMENSION = 20; // minimum 20 pixels

                        // Check absolute dimensions to handle flipping scenarios correctly
                        if (Math.abs(newBox.width) < MIN_DIMENSION || Math.abs(newBox.height) < MIN_DIMENSION) {
                          return oldBox; // reject transformation
                        }
                        return newBox;
                      }}
                    />
                  </Layer>
                </Stage>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}