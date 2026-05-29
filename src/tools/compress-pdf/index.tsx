'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface FileData {
  id: number;
  file: File;
  compressedSize: string | null;
  compressedBlob: Blob | null;
}

export default function CompressPdf() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [quality, setQuality] = useState(60);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file, index) => ({
        id: Date.now() + index,
        file,
        compressedSize: null,
        compressedBlob: null
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const compressFile = async (fileData: FileData) => {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(fileData.file)).promise;
    const newPdf = await PDFDocument.create();
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', quality / 100);
        const jpg = await newPdf.embedJpg(imgData);
        const p = newPdf.addPage([viewport.width, viewport.height]);
        p.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
      }
    }
    const bytes = await newPdf.save();
    const blob = new Blob([bytes as any], { type: 'application/pdf' });
    
    setFiles(prev => prev.map(f => f.id === fileData.id ? { 
      ...f, 
      compressedSize: (blob.size / 1024).toFixed(2) + ' KB',
      compressedBlob: blob 
    } : f));
  };

  const handleAllCompress = async () => {
    setIsCompressing(true);
    for (let f of files) await compressFile(f);
    setIsCompressing(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem' }}>
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
        <label>Compression Level: <strong>{quality}%</strong></label>
        <input type="range" min="10" max="90" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: '100%', marginBottom: '1rem' }} />
        <button onClick={handleAllCompress} disabled={isCompressing} style={{ padding: '0.8rem 2rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>
          {isCompressing ? 'Compressing...' : 'Compress All'}
        </button>
      </div>

      <input type="file" multiple onChange={handleFileUpload} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
        {files.map(f => (
          <div key={f.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
            <p>{f.file.name} ({(f.file.size / 1024).toFixed(2)} KB)</p>
            {f.compressedSize && <p>New Size: <strong>{f.compressedSize}</strong></p>}
            {f.compressedBlob && <a href={URL.createObjectURL(f.compressedBlob)} download={f.file.name}>Download</a>}
          </div>
        ))}
      </div>
    </div>
  );
}