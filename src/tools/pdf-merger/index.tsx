'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument, PDFPage } from 'pdf-lib'; // Imported PDFPage explicitly

interface FileObject {
  id: string;
  file: File;
  name: string;
  size: string;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      const mappedFiles = selectedFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file: file,
        name: file.name,
        size: formatSize(file.size)
      }));
      setFiles(prev => [...prev, ...mappedFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const mergePdfsNow = async () => {
    if (files.length < 2) {
      alert("Please upload at least 2 PDF files to merge.");
      return;
    }

    try {
      setIsMerging(true);
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of files) {
        const fileBuffer = await fileObj.file.arrayBuffer();
        const pdfToMerge = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
        
        // Fixed: Defined explicit type for 'page' as PDFPage
        copiedPages.forEach((page: PDFPage) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("PDF Merging failed:", error);
      alert("An error occurred while merging your PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />

      <div 
        onClick={() => fileInputRef.current?.click()}
        style={{ 
          padding: '2.5rem', 
          border: '2px dashed #cbd5e1', 
          borderRadius: '0.75rem', 
          backgroundColor: '#f8fafc', 
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        <p style={{ color: '#475569', fontWeight: '600' }}>📂 Click to select your PDF files here</p>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Supports multiple high-quality PDF documents</span>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f1f5f9', fontSize: '0.85rem', fontWeight: '600' }}>
            Queue List ({files.length} Files Selected)
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {files.map((fileObj, index) => (
              <li key={fileObj.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: index !== files.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{fileObj.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fileObj.size}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(fileObj.id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={mergePdfsNow}
          disabled={isMerging || files.length < 2}
          style={{ 
            padding: '0.75rem 1.75rem', 
            backgroundColor: files.length < 2 ? '#94a3b8' : '#4f46e5', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '0.5rem', 
            fontWeight: '600', 
            cursor: files.length < 2 ? 'not-allowed' : 'pointer'
          }}
        >
          {isMerging ? 'Merging Documents...' : 'Merge PDFs Now'}
        </button>
      </div>
    </div>
  );
}