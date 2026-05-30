'use client';
import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, degrees } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clickPos, setClickPos] = useState<{x: number, y: number} | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState<{w: number, h: number} | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setClickPos(null); // Reset click

    // PDF ka pehla page screen par dikhane ke liye (Preview)
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 }); // Adjust scale as needed

    setPdfDimensions({ w: viewport.width, h: viewport.height });

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
    const rect = canvas.getBoundingClientRect();
    
    // Scale fix for accurate clicking
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setClickPos({ x, y });
  };

  const removeWatermark = async () => {
    if (!file || !clickPos || !pdfDimensions) return alert("Pehle PDF preview par watermark ko click (tick) karein!");
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        // Canvas (Top-Left) coordinate ko PDF (Bottom-Left) coordinate mein badalna
        const pdfX = (clickPos.x / pdfDimensions.w) * width;
        const pdfY = height - ((clickPos.y / pdfDimensions.h) * height);

        // Jahan user ne click kiya wahan ek bada diagonal mask lagana
        page.drawRectangle({
          x: pdfX - 50, // Box ko center karne ke liye
          y: pdfY - 20,
          width: 400,   // Lamba box (Watermark chupane ke liye)
          height: 60,   // Box ki motai
          color: rgb(1, 1, 1), // White color
          rotate: degrees(45), // Diagonal watermark ke liye tilt
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clean-pdf-clicked.pdf';
      a.click();
    } catch (error) {
      console.error(error);
      alert("Error aa gaya watermark hatane mein.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-2 text-red-600">Smart Click Watermark Remover</h2>
      <p className="text-sm text-gray-500 mb-4">
        1. PDF upload karein.<br/>
        2. Niche Preview mein watermark ke theek upar <b>Click (Tick)</b> karein.<br/>
        3. Remove button dabayein, saare pages se us jagah ka watermark hat jayega.
      </p>
      
      <input 
        type="file" 
        accept="application/pdf"
        onChange={handleFileChange} 
        className="mb-4 w-full p-2 border border-gray-300 rounded" 
      />

      {file && (
        <div className="relative border-2 border-dashed border-gray-400 mb-4 overflow-auto max-h-96 text-center bg-gray-50">
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick} 
            className="cursor-crosshair mx-auto shadow-sm"
          />
          {clickPos && (
            <div 
              className="absolute w-4 h-4 bg-red-600 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-white"
              style={{ left: `${(clickPos.x / (pdfDimensions?.w || 1)) * 100}%`, top: `${(clickPos.y / (pdfDimensions?.h || 1)) * 100}%` }}
            />
          )}
        </div>
      )}
      
      <button 
        onClick={removeWatermark} 
        disabled={isProcessing || !clickPos} 
        className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-md transition-colors ${clickPos ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {isProcessing ? 'Removing Watermark...' : clickPos ? 'Remove Watermark Now' : 'Pehle Watermark Par Click Karein'}
      </button>
    </div>
  );
}