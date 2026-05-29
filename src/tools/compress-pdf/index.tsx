'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface FileItem {
  id: number;
  file: File;
  originalSize: string;
  newSize: string | null;
  blob: Blob | null;
}

export default function CompressPdf() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(60);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Date.now() + Math.random(),
        file,
        originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        newSize: null,
        blob: null
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const compressAll = async () => {
    setIsCompressing(true);
    const updatedFiles = [...files];

    for (let item of updatedFiles) {
      try {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(item.file)).promise;
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
        item.newSize = (blob.size / 1024).toFixed(2) + ' KB';
        item.blob = blob;
      } catch (e) { console.error(e); }
    }
    setFiles(updatedFiles);
    setIsCompressing(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        <span>Compression Level</span>
        <input type="range" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
        <span>{quality}%</span>
        <button onClick={compressAll} disabled={isCompressing} style={{ background: '#0056b3', color: '#fff', padding: '5px 15px' }}>Compress</button>
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        {files.map(f => (
          <div key={f.id} style={{ border: '1px solid #ccc', padding: '10px', width: '150px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px' }}>{f.file.name.slice(0, 10)}... {f.originalSize}</p>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>New: {f.newSize || '...'}</div>
            {f.blob && <a href={URL.createObjectURL(f.blob)} download={f.file.name}>Download</a>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <input type="file" multiple onChange={handleFileUpload} />
      </div>
    </div>
  );
}