'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface FileItem { id: number; file: File; originalSize: string; newSize: string | null; blob: Blob | null; }

export default function CompressPdf() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(60);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Date.now() + Math.random(), file, originalSize: (file.size / 1024).toFixed(2) + ' KB', newSize: null, blob: null
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const compressAll = async () => {
    setIsProcessing(true);
    const updated = await Promise.all(files.map(async (item) => {
      const pdf = await pdfjsLib.getDocument(URL.createObjectURL(item.file)).promise;
      const newPdf = await PDFDocument.create();
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.0 });
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: ctx!, viewport }).promise;
        const img = canvas.toDataURL('image/jpeg', quality / 100);
        const jpg = await newPdf.embedJpg(img);
        const p = newPdf.addPage([viewport.width, viewport.height]);
        p.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
      }
      const bytes = await newPdf.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      return { ...item, newSize: (blob.size / 1024).toFixed(2) + ' KB', blob };
    }));
    setFiles(updated);
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    files.forEach(f => { if (f.blob) zip.file(f.file.name, f.blob); });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'Compressed_PDFs.zip');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
        <input type="range" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
        <span>{quality}%</span>
        <button onClick={compressAll} style={{ background: '#0056b3', color: '#fff', padding: '8px 16px', borderRadius: '4px' }}>Compress All</button>
        <button onClick={() => setFiles([])} style={{ background: '#dc3545', color: '#fff', padding: '8px 16px', borderRadius: '4px' }}>Delete All</button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
        {files.map(f => (
          <div key={f.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', margin: '0 0 10px' }}>{f.file.name.slice(0, 10)}... <br/> {f.originalSize}</p>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{f.newSize || 'Pending'}</div>
            {f.blob && <a href={URL.createObjectURL(f.blob)} download>Download</a>}
          </div>
        ))}
        {/* Add Files */}
        <label style={{ border: '2px dashed #aaa', padding: '30px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          + Add Files
          <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={downloadZip} style={{ width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Download All as ZIP</button>
      </div>
    </div>
  );
}