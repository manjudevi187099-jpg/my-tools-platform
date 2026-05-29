'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, PDFPage } from 'pdf-lib';

interface FileObject {
  id: string;
  file: File;
  name: string;
  size: string;
  previewUrl?: string;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragItem = useRef<number | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSuccessMessage(null);
      const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      
      const mappedFiles = selectedFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file: file,
        name: file.name,
        size: formatSize(file.size),
        previewUrl: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...mappedFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // 🚀 Mobile Arrow Shifters
  const moveCardLeft = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index - 1];
    newFiles[index - 1] = newFiles[index];
    newFiles[index] = temp;
    setFiles(newFiles);
  };

  const moveCardRight = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index + 1];
    newFiles[index + 1] = newFiles[index];
    newFiles[index] = temp;
    setFiles(newFiles);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    setTimeout(() => { if (e.target instanceof HTMLElement) e.target.style.opacity = '0.4'; }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    e.preventDefault();
    if (dragItem.current === null || dragItem.current === position) return;
    const newFiles = [...files];
    const draggedFileContent = newFiles[dragItem.current];
    newFiles.splice(dragItem.current, 1);
    newFiles.splice(position, 0, draggedFileContent);
    dragItem.current = position;
    setFiles(newFiles);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
    dragItem.current = null;
  };

  const mergePdfsNow = async () => {
    if (files.length < 2) {
      alert("Please upload at least 2 PDF files to merge.");
      return;
    }

    try {
      setIsMerging(true);
      setSuccessMessage(null);
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of files) {
        const fileBuffer = await fileObj.file.arrayBuffer();
        const pdfToMerge = await PDFDocument.load(fileBuffer as ArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
        copiedPages.forEach((page: PDFPage) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
// TypeScript warning bypass: Cast to 'any' for Blob conversion
const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TaskSnap_Merged_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
      setFiles([]);
      setSuccessMessage("🎉 Success! Your PDFs have been safely merged and downloaded.");

    } catch (error) {
      console.error("PDF Merging failed:", error);
      alert("An error occurred while merging your PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 🚀 SMART RESPONSIVE CSS INJECTOR */}
      <style>{`
        .pdf-grid-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          width: 100%;
        }
        .pdf-card {
          width: 200px;
          height: 260px;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          cursor: grab;
        }
        .mobile-arrows { display: none; }
        .desktop-iframe { display: block; width: 100%; height: 100%; border: none; pointer-events: none; }
        .mobile-fallback { display: none; }

        /* 📱 MOBILE VIEW RULES */
        @media (max-width: 640px) {
          .pdf-grid-container {
            gap: 0.75rem;
          }
          .pdf-card {
            width: calc(50% - 0.375rem); /* 2 columns exactly */
            height: 220px;
          }
          .desktop-iframe { display: none !important; }
          .mobile-fallback { 
            display: flex !important; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            width: 100%; 
            height: 100%; 
            background-color: #f8fafc; 
            color: #ef4444; 
          }
          .mobile-arrows {
            display: flex;
            position: absolute;
            bottom: 60px;
            left: 0;
            width: 100%;
            justify-content: space-between;
            padding: 0 0.5rem;
            z-index: 40;
          }
          .mobile-arrows button {
            background: rgba(15, 23, 42, 0.7);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.8rem;
          }
        }
      `}</style>

      <input type="file" multiple accept=".pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

      {successMessage && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '0.5rem', textAlign: 'center' }}>
          {successMessage}
        </div>
      )}

      {/* Upload Zone */}
      <div style={{ width: '100%', marginBottom: '2rem' }}>
        <div onClick={() => fileInputRef.current?.click()} style={{ padding: '2.5rem 1rem', border: '2px dashed #6366f1', borderRadius: '0.75rem', backgroundColor: '#f5f3ff', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📂</div>
          <p style={{ color: '#4338ca', fontWeight: '700', fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Drop PDFs here or Click</p>
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Queue ({files.length} Files)</h3>
            <span style={{ fontSize: '0.75rem', color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
              Drag cards or use arrows to reorder
            </span>
          </div>

          <div className="pdf-grid-container">
            {files.map((fileObj, index) => (
              <div
                key={fileObj.id}
                className="pdf-card"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Action Buttons */}
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 30, display: 'flex', gap: '4px' }}>
                  <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setPreviewModalUrl(fileObj.previewUrl || null)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '0.75rem' }}>🔍</button>
                  <button onMouseDown={(e) => e.stopPropagation()} onClick={() => removeFile(fileObj.id)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '0.75rem' }}>❌</button>
                </div>

                {/* Badge Number */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 30, backgroundColor: '#4f46e5', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {index + 1}
                </div>

                {/* Thumbnail Area */}
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}></div>
                  
                  {/* Desktop Live Preview */}
                  {fileObj.previewUrl && (
                    <iframe src={`${fileObj.previewUrl}#view=FitH&toolbar=0&navpanes=0`} className="desktop-iframe" title="thumbnail" />
                  )}
                  
                  {/* Mobile Clean Fallback */}
                  <div className="mobile-fallback">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#475569' }}>PDF FILE</span>
                  </div>
                </div>

                {/* Mobile Touch Reorder Arrows */}
                <div className="mobile-arrows">
                  <button onClick={(e) => { e.stopPropagation(); moveCardLeft(index); }}>◀</button>
                  <button onClick={(e) => { e.stopPropagation(); moveCardRight(index); }}>▶</button>
                </div>

                {/* Footer Metadata */}
                <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', zIndex: 30 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.75rem', color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={fileObj.name}>
                    {fileObj.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>{fileObj.size}</div>
                </div>

              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <button 
              onClick={mergePdfsNow}
              disabled={isMerging || files.length < 2}
              style={{ width: '100%', maxWidth: '300px', padding: '0.9rem', backgroundColor: files.length < 2 ? '#cbd5e1' : '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: files.length < 2 ? 'not-allowed' : 'pointer' }}
            >
              {isMerging ? 'Merging...' : `Merge PDFs`}
            </button>
          </div>

        </div>
      )}

      {previewModalUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setPreviewModalUrl(null)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>❌ Close</button>
          </div>
          <div style={{ width: '100%', maxWidth: '900px', height: '80vh', backgroundColor: '#ffffff', borderRadius: '0.5rem', overflow: 'hidden' }}>
             {/* Note: Mobile par Modal ke andar click karke user native viewer me open kar sakta hai */}
            <iframe src={`${previewModalUrl}#toolbar=0`} style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        </div>
      )}

    </div>
  );
}