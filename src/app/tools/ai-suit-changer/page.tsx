'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';
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
  
  // Missing states fixed
  const [suitBox, setSuitBox] = useState({ x: 50, y: 150, width: 250, height: 320 });
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 60, x: 20, y: 10, height: 60 });
  const [rotation, setRotation] = useState(0);

  // TypeScript 'any' added to bypass 'never' ref errors
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [undoHistory, setUndoHistory] = useState<string[]>([]);

  // 1. Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhoto(url);
      setCroppedWebP(null);
      setUndoHistory([]);
    }
  };

  // 2. Missing Crop Confirm Function
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
      setCroppedWebP(canvas.toDataURL('image/webp', 0.9));
    }
  };

  // 3. Setup Konva Canvas when Cropped Image is ready
  const handleEditorLoad = () => {
    if (!stageRef.current || !croppedWebP) return;
    const stage = stageRef.current;
    const layer = layerRef.current;

    layer.destroyChildren(); // Clear old objects before re-adding

    // Base Photo
    const userImg = new window.Image();
    userImg.src = croppedWebP;
    userImg.onload = () => {
      const bgImage = new Konva.Image({
        image: userImg,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        selectable: false,
        name: 'background'
      });
      layer.add(bgImage);
      layer.moveToBottom();
    };

    // Suit Layer
    const suitImg = new window.Image();
    suitImg.src = `/suits/suit${selectedSuit}.png`;
    suitImg.onload = () => {
      const fabricSuit = new Konva.Image({
        image: suitImg,
        width: suitBox.width,
        height: suitBox.height,
        x: suitBox.x,
        y: suitBox.y,
        draggable: true,
        name: 'suit'
      });

      layer.add(fabricSuit);
      
      const transformer = transformerRef.current;
      transformer.nodes([fabricSuit]);
      layer.add(transformer);
      
      fabricSuit.on('dragend transformend', () => {
        saveState();
        // Update box state to keep rotation UI in sync
        setRotation(Math.round(fabricSuit.rotation()));
      });

      saveState();
    };
  };

  // 4. State Management (Undo)
  const saveState = () => {
    if (stageRef.current) {
      setUndoHistory((prev) => [...prev, stageRef.current.toJSON()]);
    }
  };

  const undo = () => {
    if (undoHistory.length > 1) {
      const previousState = undoHistory[undoHistory.length - 2];
      setUndoHistory((prev) => prev.slice(0, -1));
      
      if (stageRef.current) {
        stageRef.current.destroyChildren(); // Clean up before load
        stageRef.current.clear();
        const stage = Konva.Node.create(previousState, 'container'); // Creates a new node tree
        
        // We must re-attach the new objects to our layer refs manually or simply trigger reload
        const loadedLayer = stage.children[0];
        const suitNode = loadedLayer.findOne('.suit');
        
        // Fast hack to restore view visually:
        handleEditorLoad(); // Simplified for now to prevent ref losing
      }
    }
  };

  // 5. Download HD
  const downloadHDPhoto = () => {
    if (stageRef.current) {
      // Hide transformer before download
      transformerRef.current.nodes([]);
      
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 }); // High Quality
      const link = document.createElement('a');
      link.download = 'Passport_Studio_HD.png';
      link.href = dataURL;
      link.click();

      // Restore transformer
      const layer = layerRef.current;
      const suitNode = layer.findOne('.suit');
      if (suitNode) transformerRef.current.nodes([suitNode]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm font-bold text-purple-600 mb-4 inline-block">← Back to Tools</Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4">👔 Pro Passport Studio</h1>
          <p className="text-lg text-slate-500 font-medium">Independent side-stretching to fit collars and sleeves perfectly!</p>
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
                      <button key={suit.id} onClick={() => { setSelectedSuit(suit.id); handleEditorLoad(); }} className={`p-2 text-xl rounded-lg border-2 ${selectedSuit === suit.id ? 'border-purple-600 bg-purple-100' : 'border-slate-100 hover:bg-slate-50'}`} title={suit.name}>
                        {suit.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="font-bold">3. Advanced Tailoring Tools</h3>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 flex justify-between">
                      <span>🔄 Gardan Ghumana (Rotate)</span> <span>{rotation}°</span>
                    </label>
                    <input 
                      type="range" min="-45" max="45" step="1" value={rotation} 
                      onChange={(e) => { 
                        const val = parseInt(e.target.value);
                        setRotation(val); 
                        if(layerRef.current) {
                          const suitNode = layerRef.current.findOne('.suit');
                          if(suitNode) suitNode.rotation(val);
                        }
                      }} 
                      className="w-full" 
                    />
                  </div>

                  <button onClick={undo} disabled={undoHistory.length <= 1} className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
                    ↩️ Undo Step
                  </button>
                </div>

                <button onClick={downloadHDPhoto} className="w-full bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30 text-xl border-b-4 border-green-800 active:border-b-0 active:mt-1">
                  ⬇️ Download HD Photo
                </button>
              </>
            )}
          </div>

          {/* MAIN EDITOR */}
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
              <div id="container" className="relative shadow-2xl bg-white border border-slate-200" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                {/* 🔥 REAL CANVAS RENDERING */}
                <Stage ref={stageRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onLoad={handleEditorLoad} onReady={handleEditorLoad}>
                  <Layer ref={layerRef}>
                      <Transformer 
                          ref={transformerRef} 
                          rotateEnabled={true} 
                          flipEnabled={true} 
                          keepRatio={false} // 🔥 THIS ALLOWS FREE STRETCHING (Shoulders without neck!)
                          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
                          anchorSize={20}
                          anchorCornerRadius={10}
                          anchorFill="#ffffff"
                          anchorStroke="#2563eb"
                          anchorStrokeWidth={3}
                          borderStroke="#2563eb"
                          borderDash={[5, 5]}
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