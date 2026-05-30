'use client';
import React, { useState } from 'react';
import { PDFDocument, PDFName } from '@cantoo/pdf-lib';

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cleanWatermarkLayers = async () => {
    if (!file) return alert("Pehle file upload karein!");
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        // Remove Annotations & Stamps
        if (page.node.has(PDFName.of('Annots'))) {
          page.node.delete(PDFName.of('Annots'));
        }
        // Remove transparent overlays
        const resources = page.node.Resources();
        if (resources && resources.has(PDFName.of('ExtGState'))) {
          resources.delete(PDFName.of('ExtGState')); 
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned-pdf.pdf';
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error processing file. File corrupted ho sakti hai.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-2 text-blue-600">PDF Watermark Remover</h2>
      <p className="text-sm text-gray-500 mb-6">
        Yeh tool PDF se text aur layer-based watermarks ko automatically hata deta hai.
      </p>
      
      <input 
        type="file" 
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        className="mb-6 w-full p-2 border border-gray-300 rounded" 
      />
      
      <button 
        onClick={cleanWatermarkLayers} 
        disabled={isProcessing} 
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl font-bold text-lg shadow-md"
      >
        {isProcessing ? 'Processing...' : 'Remove Watermark'}
      </button>
    </div>
  );
}