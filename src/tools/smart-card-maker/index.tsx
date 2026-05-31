'use client';
import React, { useState, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { writePsd } from 'ag-psd';
import { jsPDF } from 'jspdf'; 

type DocType = 'Aadhaar' | 'PAN' | 'Voter ID' | 'DL' | 'RC' | 'APAAR' | 'Custom';

interface SheetCard {
  id: string;
  docType: DocType;
  canvas: HTMLCanvasElement;
}

export default function SmartCardMaker() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 40, height: 40, x: 10, y: 10 });
  const [docType, setDocType] = useState<DocType>('Aadhaar');
  
  const [sheetCards, setSheetCards] = useState<SheetCard[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imageRef = useRef<HTMLImageElement | null>(null);

  // A4 Size (PSD) at 300 DPI
  const A4_W = 2480;
  const A4_H = 3508;
  const CARD_W = 1011; 
  const CARD_H = 638;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  const addCardToSheet = async () => {
    if (!imageRef.current || !crop.width || !crop.height) {
        alert("Please select a valid area to crop!");
        return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sw = crop.width * scaleX;
    const sh = crop.height * scaleY;

    // Draw cropped area and fit it to CR80 size
    ctx.drawImage(imageRef.current, sx, sy, sw, sh, 0, 0, CARD_W, CARD_H);

    // Border for easy cutting
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, CARD_W, CARD_H);

    const newCard: SheetCard = {
      id: Math.random().toString(36).substr(2, 9),
      docType,
      canvas: canvas,
    };

    if (sheetCards.length >= 10) {
      alert("A4 Sheet is full! Maximum 10 cards can fit on one page.");
      return;
    }

    setSheetCards([...sheetCards, newCard]);
  };

  const removeCard = (id: string) => {
    setSheetCards(sheetCards.filter(c => c.id !== id));
  };

  const generateAndDownloadPDF = () => {
    if (sheetCards.length === 0) return;
    setIsProcessing(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const startX = 15; 
      const startY = 15; 
      const cardWidthMm = 85.6;
      const cardHeightMm = 54.0;
      const gapX = 10; 
      const gapY = 5;  

      sheetCards.forEach((card, index) => {
        const col = index % 2; 
        const row = Math.floor(index / 2);

        const x = startX + col * (cardWidthMm + gapX);
        const y = startY + row * (cardHeightMm + gapY);

        const imgData = card.canvas.toDataURL('image/jpeg', 1.0);
        
        doc.addImage(imgData, 'JPEG', x, y, cardWidthMm, cardHeightMm);
        
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.rect(x, y, cardWidthMm, cardHeightMm);
      });

      doc.save(`Smart_Cards_A4_Print_${sheetCards.length}_Items.pdf`);

    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAndDownloadPSD = async () => {
    if (sheetCards.length === 0) return;
    setIsProcessing(true);

    try {
      const childrenLayers: any[] = [];
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = A4_W;
      bgCanvas.height = A4_H;
      const bgCtx = bgCanvas.getContext('2d');
      if (bgCtx) {
        bgCtx.fillStyle = '#ffffff';
        bgCtx.fillRect(0, 0, A4_W, A4_H);
      }
      childrenLayers.push({ name: 'White A4 Paper', canvas: bgCanvas });

      const MARGIN_X = 150; 
      const MARGIN_Y = 150; 
      const GAP_X = A4_W - (MARGIN_X * 2) - (CARD_W * 2); 
      const GAP_Y = 50; 

      sheetCards.forEach((card, index) => {
        const col = index % 2; 
        const row = Math.floor(index / 2);
        const x = MARGIN_X + (col * (CARD_W + GAP_X));
        const y = MARGIN_Y + (row * (CARD_H + GAP_Y));

        childrenLayers.push({
          name: `${card.docType} ${index + 1}`,
          canvas: card.canvas,
          left: x,
          top: y,
        });
      });

      const psd = { width: A4_W, height: A4_H, children: childrenLayers };
      const buffer = writePsd(psd);
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      
      const link = document.createElement('a');
      link.download = `Smart_Cards_A4_${sheetCards.length}_Items.psd`;
      link.href = URL.createObjectURL(blob);
      link.click();

    } catch (error) {
      console.error(error);
      alert("Failed to generate PSD.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Smart Card Maker</h2>
        <p className="text-slate-500 mt-2 text-lg">Crop ID cards and arrange them perfectly on an A4 sheet. Direct PDF printing support.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: UPLOAD & CROP */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-slate-800">1. Crop Document</h3>
            {imageSrc && (
              <button onClick={() => setImageSrc(null)} className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-lg transition-colors">
                🗑️ Clear & Upload New
              </button>
            )}
          </div>

          {!imageSrc ? (
             <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center relative hover:border-blue-500 transition-colors bg-slate-50 min-h-[400px]">
               <span className="text-6xl block mb-4">📄</span>
               <p className="font-bold text-slate-700 text-xl">Upload Document Scan</p>
               <p className="text-sm text-slate-400 mt-2">Upload any document to start cropping</p>
               <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
             </div>
          ) : (
            <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-300 text-center flex items-center justify-center min-h-[400px] p-2 relative">
              <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow z-10">
                ✂️ Free Crop Enabled
              </span>
              <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                <img 
                  ref={imageRef} 
                  src={imageSrc} 
                  alt="Crop Preview" 
                  className="max-h-[500px] w-auto object-contain"
                  crossOrigin="anonymous"
                />
              </ReactCrop>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Document Type</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value as DocType)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 focus:border-blue-500 outline-none">
              <option value="Aadhaar">Aadhaar Format</option>
              <option value="PAN">PAN Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="DL">Driving License (DL)</option>
              <option value="RC">RC Book</option>
              <option value="APAAR">APAAR Card</option>
              <option value="Custom">Custom Card</option>
            </select>
          </div>

          <button 
            onClick={addCardToSheet}
            disabled={!imageSrc}
            className={`w-full mt-6 py-4 rounded-xl font-black text-xl shadow-lg transition-transform ${!imageSrc ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02]'}`}
          >
            ✂️ Crop & Add To Sheet
          </button>
        </div>

        {/* RIGHT COLUMN: A4 LAYOUT PREVIEW */}
        <div className="lg:col-span-5 bg-slate-100 rounded-3xl border border-slate-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-slate-800">2. A4 Live Preview</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200">
              {sheetCards.length} / 10 Cards
            </span>
          </div>

          <div className="flex-1 bg-white border border-slate-300 shadow-inner rounded-xl p-4 overflow-y-auto min-h-[400px]">
            {sheetCards.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-2">📋</span>
                <p className="font-medium text-center px-4 text-sm">Crop and add cards from the left side to build your A4 print sheet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sheetCards.map((card, index) => (
                  <div key={card.id} className="relative group bg-slate-50 border border-slate-200 rounded p-2 shadow-sm text-center">
                    <span className="block text-[10px] font-bold text-slate-500 mb-1">{card.docType} {index + 1}</span>
                    <img src={card.canvas.toDataURL()} alt="Card Preview" className="w-full h-auto object-cover rounded-sm border border-slate-300" />
                    
                    <button 
                      onClick={() => removeCard(card.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
             <p className="text-xs text-slate-500 font-medium text-center mb-3">
               Automatically scales to exact CR80 format (85.6 × 54 mm). Ready for direct A4 printing.
             </p>
             
             <div className="flex gap-3">
                <button 
                  onClick={generateAndDownloadPSD}
                  disabled={sheetCards.length === 0 || isProcessing}
                  className={`flex-1 py-4 rounded-xl font-black text-sm shadow-md transition-all ${sheetCards.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}
                >
                  Download .PSD
                </button>
                <button 
                  onClick={generateAndDownloadPDF}
                  disabled={sheetCards.length === 0 || isProcessing}
                  className={`flex-1 py-4 rounded-xl font-black text-sm shadow-xl transition-transform ${sheetCards.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1'}`}
                >
                  Direct Print .PDF 🖨️
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}