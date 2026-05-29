'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(50); // Slider default 50%
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile?.type === 'application/pdf') {
      setFile(uploadedFile);
      setCompressedSize(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const fileUrl = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(fileUrl).promise;
      const newPdf = await PDFDocument.create();
      const qualityFactor = quality / 100; // Slider 0-100 ko 0-1 mein badla

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          
          const compressedImageBase64 = canvas.toDataURL('image/jpeg', qualityFactor);
          const jpgImage = await newPdf.embedJpg(compressedImageBase64);
          const newPage = newPdf.addPage([viewport.width, viewport.height]);
          newPage.drawImage(jpgImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setCompressedSize(((blob.size / 1024) / 1024).toFixed(2) + ' MB');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Compressed_${file.name}`;
      link.click();
    } catch (err) { alert('Compression failed!'); } 
    finally { setIsProcessing(false); }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center' }}>PDF Compressor</h2>
      
      {/* Slider */}
      <div style={{ margin: '2rem 0' }}>
        <label>Compression Level: <strong>{quality}%</strong></label>
        <input type="range" min="10" max="90" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: '100%' }} />
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} />
      
      {file && (
        <div style={{ marginTop: '2rem' }}>
          <p>Original: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          {compressedSize && <p>New Size: <strong>{compressedSize}</strong></p>}
          <button onClick={handleCompress} disabled={isProcessing} style={{ width: '100%', padding: '1rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>
            {isProcessing ? 'Compressing...' : 'Compress & Download'}
          </button>
        </div>
      )}
    </div>
  );
}