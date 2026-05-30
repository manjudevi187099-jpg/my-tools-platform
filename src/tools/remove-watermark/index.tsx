'use client';
import React, { useState } from 'react';
import { PDFDocument, rgb } from '@cantoo/pdf-lib';

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState({ x: 100, y: 100, w: 200, h: 50 }); // Mask area
  const [isProcessing, setIsProcessing] = useState(false);

  const applyMask = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        // Watermark ki jagah ek white rectangle draw kar rahe hain
        page.drawRectangle({
          x: coords.x,
          y: coords.y,
          width: coords.w,
          height: coords.h,
          color: rgb(1, 1, 1), // White color
          borderColor: rgb(1, 1, 1),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermark-removed.pdf';
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error processing PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl border">
      <h2 className="text-xl font-bold mb-4">Pro Watermark Remover (Area Masking)</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 w-full" />
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input type="number" placeholder="X (Left)" onChange={(e) => setCoords({...coords, x: Number(e.target.value)})} className="p-2 border rounded"/>
        <input type="number" placeholder="Y (Bottom)" onChange={(e) => setCoords({...coords, y: Number(e.target.value)})} className="p-2 border rounded"/>
        <input type="number" placeholder="Width" onChange={(e) => setCoords({...coords, w: Number(e.target.value)})} className="p-2 border rounded"/>
        <input type="number" placeholder="Height" onChange={(e) => setCoords({...coords, h: Number(e.target.value)})} className="p-2 border rounded"/>
      </div>

      <button onClick={applyMask} disabled={isProcessing} className="w-full py-4 bg-red-600 text-white rounded-xl">
        {isProcessing ? 'Masking...' : 'Remove Watermark (Mask Area)'}
      </button>
      <p className="text-xs text-gray-500 mt-2">Note: X, Y coordinates trial-and-error se set karein.</p>
    </div>
  );
}