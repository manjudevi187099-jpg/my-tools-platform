'use client';
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from '@cantoo/pdf-lib';

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function InvertPdfColors() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        // Invert Colors using Canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          data[j] = 255 - data[j];     // R
          data[j + 1] = 255 - data[j + 1]; // G
          data[j + 2] = 255 - data[j + 2]; // B
        }
        context.putImageData(imageData, 0, 0);

        // Convert to PDF Image
        const pngImage = await newPdfDoc.embedPng(canvas.toDataURL('image/png'));
        const newPage = newPdfDoc.addPage([viewport.width / 2, viewport.height / 2]);
        newPage.drawImage(pngImage, { x: 0, y: 0, width: viewport.width / 2, height: viewport.height / 2 });
      }

      const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'white-background.pdf';
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
      <h2 className="text-2xl font-bold mb-4">Dark to White PDF Converter</h2>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 w-full p-2 border rounded" />
      <button onClick={processPdf} disabled={isProcessing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all">
        {isProcessing ? 'Processing High Quality...' : 'Convert to White Background'}
      </button>
    </div>
  );
}