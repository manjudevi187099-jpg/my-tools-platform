'use client';
import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from '@cantoo/pdf-lib';

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('Confidential');
  const [rotation, setRotation] = useState(45);
  const [fontName, setFontName] = useState('Helvetica');
  const [size, setSize] = useState(36);
  const [transparency, setTransparency] = useState(0.5);
  const [pageRange, setPageRange] = useState({ from: 1, to: 1 });
  const [isProcessing, setIsProcessing] = useState(false);

  const applyWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const font = await pdfDoc.embedFont(
        fontName === 'Courier' ? StandardFonts.Courier : 
        fontName === 'TimesRoman' ? StandardFonts.TimesRoman : 
        StandardFonts.Helvetica
      );

      const pages = pdfDoc.getPages();
      const endPage = Math.min(pageRange.to, pages.length);

      for (let i = pageRange.from - 1; i < endPage; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        page.drawText(text, {
          x: width / 4,
          y: height / 2,
          size: size,
          font: font,
          color: rgb(0, 0, 0),
          opacity: transparency,
          rotate: degrees(rotation),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermarked.pdf';
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error processing PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">PDF Watermark Tool</h2>
        <p className="text-gray-500 text-sm mt-1">Apne documents ko secure aur branded banayein.</p>
      </div>

      <div className="space-y-5">
        {/* File Upload */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors text-center">
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        </div>

        {/* Text Input */}
        <input 
          type="text" 
          placeholder="Watermark Text (e.g. NIRAJ CYBER CAFE)" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
        />

        {/* Grid Settings */}
        <div className="grid grid-cols-2 gap-4">
          <select onChange={(e) => setRotation(Number(e.target.value))} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            {[0, 45, 90, 135, 180].map(r => <option key={r} value={r}>{r}° Rotation</option>)}
          </select>
          <select onChange={(e) => setFontName(e.target.value)} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            {['Helvetica', 'Courier', 'TimesRoman'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Transparency */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Transparency</span>
            <span>{Math.round(transparency * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" max="1" step="0.1" 
            value={transparency} 
            onChange={(e) => setTransparency(Number(e.target.value))} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
          />
        </div>

        {/* Page Range */}
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="From Page" onChange={(e) => setPageRange({...pageRange, from: Number(e.target.value)})} className="p-3 border border-gray-200 rounded-lg"/>
          <input type="number" placeholder="To Page" onChange={(e) => setPageRange({...pageRange, to: Number(e.target.value)})} className="p-3 border border-gray-200 rounded-lg"/>
        </div>

        {/* Action Button */}
        <button 
          onClick={applyWatermark} 
          disabled={isProcessing} 
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
        >
          {isProcessing ? 'Processing...' : 'Apply Watermark Now'}
        </button>
      </div>
    </div>
  );
}