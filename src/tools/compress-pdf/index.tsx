'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface FileItem { id: number; file: File; originalSize: string; newSize: string | null; blob: Blob | null; thumb: string | null; }

export default function CompressPdf() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(60);
  const [status, setStatus] = useState("Reduce PDF file size quickly right in your browser. 100% private.");
  const [isProcessing, setIsProcessing] = useState(false);

  const getThumbnail = async (file: File) => {
    try {
      const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.2 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: ctx!, viewport }).promise;
      return canvas.toDataURL('image/png');
    } catch { return null; }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setStatus("Generating previews...");
    const newFiles = await Promise.all(Array.from(e.target.files).map(async file => {
      const thumb = await getThumbnail(file);
      return { id: Date.now() + Math.random(), file, originalSize: (file.size/1024).toFixed(0)+' KB', newSize: null, blob: null, thumb };
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setStatus("Ready to compress");
  };

  const compressAll = async () => {
    setIsProcessing(true);
    setStatus("Compression in progress...");
    const updated = await Promise.all(files.map(async (item) => {
      try {
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
        return { ...item, newSize: (blob.size / 1024).toFixed(0) + ' KB', blob };
      } catch { return item; }
    }));
    setFiles(updated);
    setStatus("Compression Complete!");
    setIsProcessing(false);
  };

  const removeFile = (id: number) => setFiles(files.filter(f => f.id !== id));

  const downloadZip = async () => {
    const zip = new JSZip();
    files.filter(f => f.blob).forEach(f => zip.file(f.file.name, f.blob!));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'Compressed_PDFs.zip');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center' }}>PDF Compressor Engine</h2>
      <div style={{ padding: '15px', background: status === "Compression Complete!" ? '#dcfce7' : '#f8fafc', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', border: '1px solid #e2e8f0', borderRadius: '6px' }}>{status}</div>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '25px', justifyContent: 'center' }}>
        <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
        <span>{quality}%</span>
        <button onClick={compressAll} disabled={isProcessing} style={{ background: '#0056b3', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Compress All</button>
        <button onClick={() => setFiles([])} style={{ background: '#dc3545', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete All</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
        {files.map(f => (
          <div key={f.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => removeFile(f.id)} style={{ position: 'absolute', top: 5, right: 5, border: 'none', background: '#ffeded', color: 'red', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>×</button>
            {f.thumb && <img src={f.thumb} style={{ width: '100%', height: '80px', objectFit: 'contain', background: '#f1f5f9' }} />}
            <p style={{ fontSize: '10px', margin: '5px 0' }}>{f.file.name.slice(0, 10)}... <br/> {f.originalSize}</p>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#059669' }}>{f.newSize || 'Pending'}</div>
            {f.blob && <a href={URL.createObjectURL(f.blob)} download={f.file.name} style={{ display: 'block', marginTop: '5px', color: '#0056b3', fontSize: '12px', fontWeight: 'bold' }}>Download</a>}
          </div>
        ))}
        <label style={{ border: '2px dashed #aaa', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
          <span>+ Add Files</span>
          <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <button onClick={downloadZip} style={{ width: '100%', marginTop: '25px', padding: '14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }}>Download All as ZIP</button>
    </div>
  );
}