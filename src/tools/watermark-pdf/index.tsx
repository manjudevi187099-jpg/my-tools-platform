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
      
      // Font selection logic
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
          rotate: degrees(rotation), // Fixed: Using degrees function
        });
      }

      const pdfBytes = await pdfDoc.save();
      // Fixed: Wrapped pdfBytes in [] for Blob
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
    <div className="p-6 bg-white rounded-xl shadow-md max-w-2xl mx-auto space-y-4 border border-slate-200">
      <h2 className="text-xl font-bold">PDF Watermark Tool</h2>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      
      <input type="text" placeholder="Watermark Text" value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 border rounded" />
      
      <div className="grid grid-cols-2 gap-4">
        <select onChange={(e) => setRotation(Number(e.target.value))} className="p-2 border rounded">
          {[0, 45, 90, 135, 180, 225, 270].map(r => <option key={r} value={r}>{r} degrees</option>)}
        </select>
        <select onChange={(e) => setFontName(e.target.value)} className="p-2 border rounded">
          {['Helvetica', 'Courier', 'TimesRoman'].map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label>Transparency: {Math.round(transparency * 100)}%</label>
        <input type="range" min="0.1" max="1" step="0.1" value={transparency} onChange={(e) => setTransparency(Number(e.target.value))} />
      </div>

      <div className="flex gap-2">
        <input type="number" placeholder="From Page" onChange={(e) => setPageRange({...pageRange, from: Number(e.target.value)})} className="w-full p-2 border rounded"/>
        <input type="number" placeholder="To Page" onChange={(e) => setPageRange({...pageRange, to: Number(e.target.value)})} className="w-full p-2 border rounded"/>
      </div>

      <button onClick={applyWatermark} disabled={isProcessing} className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
        {isProcessing ? 'Processing...' : 'Apply Watermark'}
      </button>
    </div>
  );
}