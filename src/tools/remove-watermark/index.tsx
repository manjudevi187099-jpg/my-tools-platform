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

      // Masking logic: Har page par ek white overlay
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        // Page ke upar ek bada white rectangle draw kar rahe hain 
        // jo watermark ko dhak dega
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: height,
          color: rgb(1, 1, 1),
          opacity: 0, // Placeholder for future logic
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
      alert("Error processing file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-xl font-bold mb-4">Remove PDF Watermark</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 w-full" />
      <button onClick={applyMask} disabled={isProcessing} className="w-full py-3 bg-red-600 text-white rounded-lg font-bold">
        {isProcessing ? 'Processing...' : 'Remove Watermark'}
      </button>
    </div>
  );
}