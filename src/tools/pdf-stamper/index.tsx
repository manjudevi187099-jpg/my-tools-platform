'use client';
import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfStamper() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Stamp ki details
  const [stampText, setStampText] = useState('VERIFIED ✅');
  const [stampColor, setStampColor] = useState('green');
  
  // Click Position state
  const [clickPos, setClickPos] = useState<{x: number, y: number, cWidth: number, cHeight: number} | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setClickPos(null);

    // Preview generate karna
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // Pehle page ka preview
    const viewport = page.getViewport({ scale: 1.2 }); // Scale thoda bada clear dekhne ke liye

    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Canvas ke exact coordinates nikalna
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClickPos({ x, y, cWidth: rect.width, cHeight: rect.height });
  };

  const applyStamp = async () => {
    if (!file || !clickPos) return alert("Pehle PDF preview par click karke jagah chunein!");
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Filhal pehle page par stamp laga rahe hain
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Canvas coordinates ko PDF coordinates (Bottom-Left origin) mein badalna
      const pdfX = (clickPos.x / clickPos.cWidth) * width;
      const pdfY = height - ((clickPos.y / clickPos.cHeight) * height);

      // Color logic
      const colorRGB = stampColor === 'green' ? rgb(0, 0.6, 0) : stampColor === 'red' ? rgb(0.8, 0, 0) : rgb(0, 0, 0.8);

      // PDF par text stamp draw karna
      firstPage.drawText(stampText, {
        x: pdfX - 40, // Center karne ke liye thoda left shift
        y: pdfY,
        size: 28,
        font: font,
        color: colorRGB,
        rotate: degrees(15), // Thoda tircha stamp look dene ke liye
        opacity: 0.8,
      });

      // Rectangle border for real stamp feel
      firstPage.drawRectangle({
        x: pdfX - 50,
        y: pdfY - 10,
        width: font.widthOfTextAtSize(stampText, 28) + 20,
        height: 40,
        borderColor: colorRGB,
        borderWidth: 3,
        rotate: degrees(15),
        opacity: 0.8,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stamped-${file.name}`;
      a.click();
      
    } catch (error) {
      console.error(error);
      alert("Error aa gaya stamp lagane mein.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-2 text-indigo-600">Interactive PDF Stamper</h2>
      <p className="text-sm text-gray-500 mb-6">
        Click on the document to add a custom verification stamp.
      </p>
      
      <input 
        type="file" 
        accept="application/pdf"
        onChange={handleFileChange} 
        className="mb-4 w-full p-2 border border-gray-300 rounded" 
      />

      {file && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stamp Text</label>
            <input 
              type="text" 
              value={stampText} 
              onChange={(e) => setStampText(e.target.value)} 
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stamp Color</label>
            <select 
              value={stampColor} 
              onChange={(e) => setStampColor(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="green">Green (Verified/Approved)</option>
              <option value="red">Red (Rejected/Void)</option>
              <option value="blue">Blue (Draft/Review)</option>
            </select>
          </div>
        </div>
      )}

      {file && (
        <div className="relative border-2 border-dashed border-gray-400 mb-6 overflow-auto max-h-96 text-center bg-gray-50 rounded">
          <p className="text-xs text-gray-400 p-2 absolute top-0 w-full bg-white bg-opacity-70">
            Click anywhere on the document to place your stamp
          </p>
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick} 
            className="cursor-crosshair mx-auto shadow-sm mt-8"
          />
          {/* Target Indicator (Jahan click kiya hai) */}
          {clickPos && (
            <div 
              className="absolute w-6 h-6 bg-transparent border-4 border-indigo-500 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
              style={{ 
                left: `${(clickPos.x / clickPos.cWidth) * 100}%`, 
                top: `calc(2rem + ${(clickPos.y / clickPos.cHeight) * (canvasRef.current?.getBoundingClientRect().height || 0)}px)` 
              }}
            />
          )}
        </div>
      )}
      
      <button 
        onClick={applyStamp} 
        disabled={isProcessing || !clickPos} 
        className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-md transition-colors ${clickPos ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {isProcessing ? 'Applying Stamp...' : clickPos ? 'Apply Stamp & Download' : 'Step 2: Click on PDF to select location'}
      </button>
    </div>
  );
}