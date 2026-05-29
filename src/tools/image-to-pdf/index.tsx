'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from '@cantoo/pdf-lib';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [format, setFormat] = useState('A4');
  const [orientation, setOrientation] = useState('Portrait');
  const [margin, setMargin] = useState('No Margin');
  const [quality, setQuality] = useState('Medium'); 
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newImages = newFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
      setStatus("");
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Browser-based Image Compression Logic
  const compressImage = async (file: File, qualitySetting: string): Promise<{ buffer: ArrayBuffer, isJpg: boolean }> => {
    if (qualitySetting === 'Same As Image (100%)') {
      return { buffer: await file.arrayBuffer(), isJpg: file.type === 'image/jpeg' || file.type === 'image/jpg' };
    }

    let qValue = 0.8;
    if (qualitySetting === 'High') qValue = 0.8;
    if (qualitySetting === 'Medium') qValue = 0.6;
    if (qualitySetting === 'Low') qValue = 0.4;
    if (qualitySetting === 'Very Low') qValue = 0.2;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context failed');
        
        ctx.fillStyle = '#FFFFFF'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', qValue);
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        resolve({ buffer: ab, isJpg: true });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      setStatus("⚠️ Please add at least one image.");
      return;
    }

    setIsProcessing(true);
    setStatus("Compressing images and generating PDF...");

    try {
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        const { buffer: imgBytes, isJpg } = await compressImage(img.file, quality);
        
        let pdfImage;
        if (isJpg) {
          pdfImage = await pdfDoc.embedJpg(imgBytes);
        } else {
          pdfImage = await pdfDoc.embedPng(imgBytes);
        }

        const imgDims = pdfImage.scale(1);
        
        let pageWidth = imgDims.width;
        let pageHeight = imgDims.height;

        if (format === 'A4') {
          pageWidth = 595.28;
          pageHeight = 841.89;
        } else if (format === 'US Letter') {
          pageWidth = 612.00;
          pageHeight = 792.00;
        }

        if (format !== 'Fit (As image size)' && orientation === 'Landscape') {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        let marginVal = 0;
        if (margin === 'Small Margin') marginVal = 20;
        if (margin === 'Big Margin') marginVal = 40;

        const availableWidth = pageWidth - (marginVal * 2);
        const availableHeight = pageHeight - (marginVal * 2);

        const scale = Math.min(availableWidth / imgDims.width, availableHeight / imgDims.height);
        
        const isFit = format === 'Fit (As image size)';
        const drawWidth = isFit ? (imgDims.width - marginVal*2) : (imgDims.width * scale);
        const drawHeight = isFit ? (imgDims.height - marginVal*2) : (imgDims.height * scale);

        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(pdfImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Converted_Images.pdf`;
      a.click();

      setStatus("✅ PDF Created & Downloaded Successfully!");
    } catch (e: any) {
      console.error(e);
      setStatus("❌ Error: Could not convert images. Please try different files.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      
      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option>A4</option>
            <option>Fit (As image size)</option>
            <option>US Letter</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Orientation</label>
          <select value={orientation} onChange={(e) => setOrientation(e.target.value)} disabled={format === 'Fit (As image size)'} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: format === 'Fit (As image size)' ? '#f1f5f9' : '#fff' }}>
            <option>Portrait</option>
            <option>Landscape</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Margin</label>
          <select value={margin} onChange={(e) => setMargin(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option>No Margin</option>
            <option>Small Margin</option>
            <option>Big Margin</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Quality</label>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option>Same As Image (100%)</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
            <option>Very Low</option>
          </select>
        </div>
      </div>

      {status && (
        <div style={{ padding: '12px', background: status.includes('✅') ? '#dcfce7' : status.includes('❌') || status.includes('⚠️') ? '#fee2e2' : '#eff6ff', color: status.includes('✅') ? '#166534' : status.includes('❌') || status.includes('⚠️') ? '#dc2626' : '#1e3a8a', textAlign: 'center', marginBottom: '20px', borderRadius: '6px', fontWeight: 'bold' }}>
          {status}
        </div>
      )}

      {/* Image Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
        {images.map((img) => (
          <div key={img.id} style={{ width: '140px', height: '180px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', background: '#f8fafc' }}>
            <button onClick={() => removeImage(img.id)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>×</button>
            <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
              {(img.file.size / 1024).toFixed(1)} KB
            </p>
            <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '4px', background: '#fff', border: '1px solid #e2e8f0' }}>
              <img src={img.preview} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        ))}

        <div onClick={() => fileInputRef.current?.click()} style={{ width: '140px', height: '180px', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff', color: '#64748b' }}>
          <span style={{ fontSize: '30px', marginBottom: '10px' }}>⊕</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Add Images</span>
        </div>
      </div>

      <input type="file" multiple accept="image/jpeg, image/png, image/jpg" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={() => setImages([])} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Clear All
        </button>
        <button onClick={convertToPdf} disabled={isProcessing} style={{ padding: '12px 25px', background: isProcessing ? '#94a3b8' : '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)' }}>
          {isProcessing ? 'Converting...' : 'Convert To PDF'}
        </button>
      </div>
      
    </div>
  );
}