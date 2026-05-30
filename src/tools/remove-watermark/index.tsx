'use client';
import React, { useState } from 'react';
import { PDFDocument, PDFName } from '@cantoo/pdf-lib';

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const deepCleanWatermark = async () => {
    if (!file) return alert("Bhai, pehle file toh upload karo!");
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // PRO LOGIC: Deep PDF Structure Manipulation
      pages.forEach((page) => {
        // 1. Remove Annotations (Watermarks are often saved as Stamp Annotations)
        if (page.node.has(PDFName.of('Annots'))) {
          page.node.delete(PDFName.of('Annots'));
        }

        // 2. Remove Transparent Overlay States (Watermarks use transparency)
        const resources = page.node.Resources();
        if (resources && resources.has(PDFName.of('ExtGState'))) {
          // This strips out all transparency/opacity settings from the page
          resources.delete(PDFName.of('ExtGState')); 
        }

        // Note: Hum XObjects (Images) delete nahi kar rahe warna aapke 
        // form ki photo aur sign bhi delete ho sakti hai.
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deep-cleaned-pdf.pdf';
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error: File bahut zyada heavily encrypted ya corrupted hai.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 text-white">
      <h2 className="text-2xl font-bold mb-2 text-red-500">PRO Watermark Stripper</h2>
      <p className="text-sm text-gray-400 mb-6">Removes hidden stamps, annotations, and transparent layers.</p>
      
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        className="mb-6 w-full p-2 bg-gray-800 rounded border border-gray-600 focus:outline-none" 
      />
      
      <button 
        onClick={deepCleanWatermark} 
        disabled={isProcessing} 
        className="w-full py-4 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-xl font-black text-lg tracking-wide shadow-lg"
      >
        {isProcessing ? 'DEEP CLEANING...' : 'NUKE WATERMARK'}
      </button>
    </div>
  );
}