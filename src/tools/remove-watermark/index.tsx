'use client';
import React, { useState } from 'react';
import { PDFDocument, rgb } from '@cantoo/pdf-lib';

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState('bottom-right');
  const [size, setSize] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);

  // Preset logic
  const getCoords = () => {
    const s = size === 'small' ? { w: 100, h: 30 } : size === 'large' ? { w: 300, h: 100 } : { w: 200, h: 50 };
    if (position === 'bottom-right') return { x: 350, y: 50, ...s };
    if (position === 'top-center') return { x: 200, y: 750, ...s };
    return { x: 100, y: 400, ...s }; // Center
  };

  const applyMask = async () => {
    if (!file) return;
    setIsProcessing(true);
    const { x, y, w, h } = getCoords();
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      pdfDoc.getPages().forEach(page => {
        page.drawRectangle({ x, y, width: w, height: h, color: rgb(1, 1, 1) });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermark-removed.pdf';
      a.click();
    } catch (e) {
      alert("Error processing file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-xl font-bold mb-4">Easy Watermark Remover</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 w-full" />
      
      <div className="space-y-4">
        <select onChange={(e) => setPosition(e.target.value)} className="w-full p-3 border rounded-lg">
          <option value="bottom-right">Bottom Right (Kone mein)</option>
          <option value="top-center">Top Center (Upar beech mein)</option>
          <option value="center">Center (Beech mein)</option>
        </select>
        
        <select onChange={(e) => setSize(e.target.value)} className="w-full p-3 border rounded-lg">
          <option value="small">Small Watermark</option>
          <option value="medium">Medium Watermark</option>
          <option value="large">Large Watermark</option>
        </select>
      </div>

      <button onClick={applyMask} disabled={isProcessing} className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-bold">
        {isProcessing ? 'Removing...' : 'Remove Watermark'}
      </button>
    </div>
  );
}