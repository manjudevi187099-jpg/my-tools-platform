'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setProgress(0);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(10);

    try {
      const fileUrl = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(fileUrl).promise;
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          const compressedImageBase64 = canvas.toDataURL('image/jpeg', 0.5);
          const jpgImage = await newPdf.embedJpg(compressedImageBase64);
          const newPage = newPdf.addPage([viewport.width, viewport.height]);
          newPage.drawImage(jpgImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }
        setProgress(Math.round(((i) / pdf.numPages) * 100));
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' }); // 🚀 Fixed type error
      const compressedUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = compressedUrl;
      link.download = `Compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(compressedUrl);
    } catch (error) {
      console.error("Compression error:", error);
      alert('Error compressing the PDF.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      {!file ? (
        <div onClick={() => fileInputRef.current?.click()} style={{ padding: '4rem', border: '2px dashed #f59e0b', borderRadius: '1rem', backgroundColor: '#fffbeb', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem' }}>🗜️</div>
          <h2>Select PDF to Compress</h2>
        </div>
      ) : (
        <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
          <h3>{file.name}</h3>
          {isProcessing && <div style={{ height: '10px', background: '#e2e8f0' }}><div style={{ width: `${progress}%`, background: '#f59e0b', height: '100%' }}></div></div>}
          <button onClick={handleCompress} disabled={isProcessing} style={{ padding: '1rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
            {isProcessing ? 'Compressing...' : 'Compress PDF'}
          </button>
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
    </div>
  );
}