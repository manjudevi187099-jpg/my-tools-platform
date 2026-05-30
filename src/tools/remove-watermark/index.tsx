'use client';
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from '@cantoo/pdf-lib';
import Tesseract from 'tesseract.js';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('NIRAJ CYBER CAFE');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processOCR = async () => {
    if (!file || !watermarkText) return alert("File aur Watermark Text daalein!");
    setIsProcessing(true);
    setStatus('PDF load ho raha hai...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Naya PDF banayenge jisme clean images hongi
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus(`Page ${i} process ho raha hai (Isme time lag sakta hai)...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality for better OCR
        
        // Canvas par PDF page render karein
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;

        setStatus(`Page ${i} par AI OCR chal raha hai...`);
        // AI se text dhoondein
        const { data } = await Tesseract.recognize(canvas, 'eng');
        
      
        // Jo words match kar rahe hain, unhe white color se dhak dein
        const searchWords = watermarkText.toLowerCase().split(' ');
        
        // YAHAN CHANGE KIYA HAI (as any aur word: any lagaya hai)
        (data as any).words.forEach((word: any) => {
          const wordText = word.text.toLowerCase();
          // Agar AI ko watermark ka koi bhi word milta hai
          if (searchWords.some(sw => wordText.includes(sw) && sw.length > 2)) {
            // Us exact coordinate par white rectangle draw karein
            context.fillStyle = '#ffffff';
            // Thoda extra margin lekar dhakein taaki kinare na bachein
            context.fillRect(
              word.bbox.x0 - 5, 
              word.bbox.y0 - 5, 
              (word.bbox.x1 - word.bbox.x0) + 10, 
              (word.bbox.y1 - word.bbox.y0) + 10
            );
          }
        });

        setStatus(`Page ${i} PDF mein add ho raha hai...`);
        // Canvas ko image banakar naye PDF mein daalein
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const img = await newPdf.embedJpg(imgData);
        
        const newPage = newPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(img, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setStatus('Final PDF ban raha hai...');
      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ocr-watermark-removed.pdf';
      a.click();
      
      setStatus('Success! Watermark hat gaya.');
    } catch (error) {
      console.error(error);
      setStatus('Error: Kuch galat ho gaya.');
      alert("Error processing PDF via OCR.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-2 text-indigo-600">AI OCR Watermark Remover</h2>
      <p className="text-sm text-gray-500 mb-6">
        Yeh tool AI se background image mein chhupe text ko dhoond kar automatically erase karta hai.
      </p>
      
      <input 
        type="file" 
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        className="mb-4 w-full p-2 border border-gray-300 rounded" 
      />

      <input 
        type="text" 
        value={watermarkText}
        onChange={(e) => setWatermarkText(e.target.value)}
        placeholder="Watermark text (e.g. NIRAJ CYBER CAFE)"
        className="mb-6 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
      />
      
      <button 
        onClick={processOCR} 
        disabled={isProcessing} 
        className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-md transition-colors ${isProcessing ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {isProcessing ? 'AI Processing...' : 'Remove Watermark (AI)'}
      </button>

      {status && (
        <p className="mt-4 text-sm font-medium text-center text-gray-700 animate-pulse">
          {status}
        </p>
      )}
    </div>
  );
}