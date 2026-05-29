'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// 🚀 Worker setup
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
      // 1. PDF load karein
      const fileUrl = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(fileUrl).promise;
      const newPdf = await PDFDocument.create();

      // 2. Har page ko compress karein
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Scale 1.5 rakha hai normal quality ke liye (size chhota karne me madad karega)
        const viewport = page.getViewport({ scale: 1.5 }); 
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({ canvasContext: context, viewport }).promise;
          
          // 🚀 Asli Compression Yahan Hai: Quality 0.5 (50%)
          const compressedImageBase64 = canvas.toDataURL('image/jpeg', 0.5);
          
          const jpgImage = await newPdf.embedJpg(compressedImageBase64);
          const newPage = newPdf.addPage([viewport.width, viewport.height]);
          
          newPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          });
        }
        
        // Progress bar update
        setProgress(Math.round(((i) / pdf.numPages) * 100));
      }

      // 3. Compressed PDF save karein
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const compressedUrl = URL.createObjectURL(blob);

      // Download
      const link = document.createElement('a');
      link.href = compressedUrl;
      link.download = `Compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(compressedUrl);
      
    } catch (error) {
      console.error("Compression error:", error);
      alert('Error compressing the PDF. It might be too large or corrupted.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const resetTool = () => {
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {!file && (
        <div onClick={() => fileInputRef.current?.click()} style={{ padding: '4rem 2rem', border: '2px dashed #f59e0b', borderRadius: '1rem', backgroundColor: '#fffbeb', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗜️</div>
          <h2 style={{ color: '#d97706', margin: '0 0 0.5rem 0' }}>Select PDF to Compress</h2>
          <p style={{ color: '#f59e0b', margin: 0 }}>Shrink your PDF size quickly and privately</p>
        </div>
      )}

      <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

      {file && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a' }}>{file.name}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={resetTool} style={{ padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>❌ Close</button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              ⚠️ Note: This tool optimizes scanned documents heavily. Text may become non-selectable.
            </p>
          </div>

          {isProcessing && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '1rem', height: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, backgroundColor: '#f59e0b', height: '100%', transition: 'width 0.3s' }}></div>
              </div>
              <p style={{ textAlign: 'center', color: '#d97706', fontWeight: 'bold', marginTop: '0.5rem' }}>Compressing: {progress}%</p>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleCompress} 
              disabled={isProcessing} 
              style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: '700', backgroundColor: isProcessing ? '#cbd5e1' : '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '0.5rem', cursor: isProcessing ? 'not-allowed' : 'pointer', boxShadow: isProcessing ? 'none' : '0 4px 6px rgba(245, 158, 11, 0.25)', transition: 'all 0.2s' }}
            >
              {isProcessing ? 'Processing...' : '🗜️ Compress PDF Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}