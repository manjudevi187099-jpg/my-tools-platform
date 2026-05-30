'use client';
import React, { useState } from 'react';
import { PDFDocument, rgb } from '@cantoo/pdf-lib';

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyMask = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Diagonal masking: Poore page par white stripes draw karna
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        
        // Diagonal stripes chalana
        for (let i = -height; i < width; i += 30) {
          page.drawLine({
            start: { x: i, y: 0 },
            end: { x: i + height, y: height },
            thickness: 20, // Line ki motai - isse kam/zyada kar sakte ho
            color: rgb(1, 1, 1), // White color (Background match)
          });
        }
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
      alert("Error processing file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-xl font-bold mb-4">Pro Watermark Remover</h2>
      <p className="text-sm text-gray-500 mb-4">Ye tool diagonal watermark ko white stripes se cover kar dega.</p>
      
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 w-full" />
      
      <button onClick={applyMask} disabled={isProcessing} className="w-full mt-2 py-3 bg-red-600 text-white rounded-lg font-bold">
        {isProcessing ? 'Removing Watermark...' : 'Remove Watermark (Diagonal)'}
      </button>
    </div>
  );
}