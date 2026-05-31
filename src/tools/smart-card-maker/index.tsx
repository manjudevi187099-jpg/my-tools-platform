'use client';
import React, { useState, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { writePsd } from 'ag-psd';
import { jsPDF } from 'jspdf'; 

type DocType = 'Aadhaar' | 'PAN' | 'Voter ID' | 'DL' | 'RC' | 'APAAR' | 'Custom';
type PrintFormat = 'Single' | 'JointH' | 'JointV';

interface SheetCard {
  id: string;
  docType: DocType;
  printFormat: PrintFormat;
  canvas: HTMLCanvasElement;
}

// 🌟 SMART SIZES (CR80 Standard) at 300 DPI
const CARD_FORMATS = {
  Single: { name: 'Single Card (Front OR Back)', pxW: 1011, pxH: 638, mmW: 85.6, mmH: 54.0 },
  JointH: { name: 'Joint Card - Horizontal (Front + Back)', pxW: 2022, pxH: 638, mmW: 171.2, mmH: 54.0 },
  JointV: { name: 'Joint Card - Vertical (Front + Back)', pxW: 1011, pxH: 1276, mmW: 85.6, mmH: 108.0 },
};

export default function SmartCardMaker() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 40, height: 40, x: 10, y: 10 });
  const [docType, setDocType] = useState<DocType>('Aadhaar');
  const [printFormat, setPrintFormat] = useState<PrintFormat>('JointH'); 
  
  const [sheetCards, setSheetCards] = useState<SheetCard[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imageRef = useRef<HTMLImageElement | null>(null);

  // A4 Size (PSD) at 300 DPI
  const A4_W = 2480;
  const A4_H = 3508;

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

    const fmt = CARD_FORMATS[printFormat];
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    
    canvas.width = fmt.pxW;
    canvas.height = fmt.pxH;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sw = crop.width * scaleX;
    const sh = crop.height * scaleY;

    ctx.drawImage(imageRef.current, sx, sy, sw, sh, 0, 0, fmt.pxW, fmt.pxH);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, fmt.pxW, fmt.pxH);

    const newCard: SheetCard = {
      id: Math.random().toString(36).substr(2, 9),
      docType,
      printFormat,
      canvas: canvas,
    };

    if (sheetCards.length >= 10) {
      alert("A4 Sheet limit reached!");
      return;
    }

    setSheetCards([...sheetCards, newCard]);
  };

  const removeCard = (id: string) => {
    setSheetCards(sheetCards.filter(c => c.id !== id));
  };

  // 🌟 NAYA: PERFECT CENTER PDF LAYOUT ENGINE
  const generateAndDownloadPDF = () => {
    if (sheetCards.length === 0) return;
    setIsProcessing(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const PDF_W = 210;
      
      const PDF_MARGIN_X_SINGLE = 14.4; 
      const PDF_GAP_X = 10;
      const PDF_MARGIN_Y = 10; 
      const PDF_GAP_Y = 3.5; 

      let currX = PDF_MARGIN_X_SINGLE; 
      let currY = PDF_MARGIN_Y; 
      let rowMaxH = 0;

      sheetCards.forEach((card) => {
        const fmt = CARD_FORMATS[card.printFormat];
        let drawX = currX;
        let drawY = currY;

        if (card.printFormat === 'JointH') {
           if (currX > PDF_MARGIN_X_SINGLE) {
               currX = PDF_MARGIN_X_SINGLE;
               currY += rowMaxH + PDF_GAP_Y;
               rowMaxH = 0;
           }
           drawX = (PDF_W - fmt.mmW) / 2; // Perfectly Center JointH
           drawY = currY;
           
           rowMaxH = Math.max(rowMaxH, fmt.mmH);
           currX = PDF_W; // Force newline for next item
        } else {
           if (currX + fmt.mmW > PDF_W - 10) {
               currX = PDF_MARGIN_X_SINGLE;
               currY += rowMaxH + PDF_GAP_Y;
               rowMaxH = 0;
           }
           drawX = currX;
           drawY = currY;
           
           rowMaxH = Math.max(rowMaxH, fmt.mmH);
           currX = drawX + fmt.mmW + PDF_GAP_X;
        }

        const imgData = card.canvas.toDataURL('image/jpeg', 1.0);
        doc.addImage(imgData, 'JPEG', drawX, drawY, fmt.mmW, fmt.mmH);
        
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.rect(drawX, drawY, fmt.mmW, fmt.mmH);
      });

      doc.save(`Smart_Cards_A4_Print_${sheetCards.length}_Items.pdf`);

    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🌟 NAYA: PERFECT CENTER PSD LAYOUT ENGINE
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
      // Fixed: White paper layer perfectly aligned at 0,0
      childrenLayers.push({ name: 'White A4 Paper', canvas: bgCanvas, left: 0, top: 0 });

      const MARGIN_X_SINGLE = 189; // Perfectly centers 2 single cards
      const GAP_X = 80; 
      const MARGIN_Y = 80;  // Optimized Top Margin to fit 5 Rows safely
      const GAP_Y = 45; // Space between rows

      let currX = MARGIN_X_SINGLE; 
      let currY = MARGIN_Y; 
      let rowMaxH = 0;

      sheetCards.forEach((card, index) => {
        const fmt = CARD_FORMATS[card.printFormat];
        let drawX = currX;
        let drawY = currY;

        if (card.printFormat === 'JointH') {
           // Agar pehle se line me koi single card hai, toh ise nayi line me dalo
           if (currX > MARGIN_X_SINGLE) {
               currX = MARGIN_X_SINGLE;
               currY += rowMaxH + GAP_Y;
               rowMaxH = 0;
           }
           // JointH Card ko A4 ke ekdum Center me set karo
           drawX = (A4_W - fmt.pxW) / 2; 
           drawY = currY;
           
           rowMaxH = Math.max(rowMaxH, fmt.pxH);
           currX = A4_W; // Force next card to a new line
        } else {
           // Single or JointV Card
           if (currX + fmt.pxW > A4_W - 150) {
               currX = MARGIN_X_SINGLE;
               currY += rowMaxH + GAP_Y;
               rowMaxH = 0;
           }
           drawX = currX;
           drawY = currY;
           
           rowMaxH = Math.max(rowMaxH, fmt.pxH);
           currX = drawX + fmt.pxW + GAP_X;
        }

        childrenLayers.push({
          name: `${card.docType} ${index + 1} (${card.printFormat})`,
          canvas: card.canvas,
          left: drawX,
          top: drawY,
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
        <p className="text-slate-500 mt-2 text-lg">Crop Single or Joint ID cards and arrange them perfectly on an A4 sheet. Direct PDF support.</p>
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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Print Layout Size</label>
              <select value={printFormat} onChange={(e) => setPrintFormat(e.target.value as PrintFormat)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 focus:border-blue-500 outline-none text-blue-800">
                <option value="Single">{CARD_FORMATS.Single.name}</option>
                <option value="JointH">{CARD_FORMATS.JointH.name}</option>
                <option value="JointV">{CARD_FORMATS.JointV.name}</option>
              </select>
            </div>
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
                  <div key={card.id} className={`relative group bg-slate-50 border border-slate-200 rounded p-2 shadow-sm text-center ${card.printFormat === 'JointH' ? 'col-span-2' : 'col-span-1'}`}>
                    <span className="block text-[10px] font-bold text-slate-500 mb-1">{card.docType} {index + 1} ({card.printFormat})</span>
                    <img src={card.canvas.toDataURL()} alt="Card Preview" className="w-full h-auto object-contain rounded-sm border border-slate-300 max-h-32 mx-auto" />
                    
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
               Automatically centers exactly 5 Joint cards on one A4 sheet without overflowing.
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