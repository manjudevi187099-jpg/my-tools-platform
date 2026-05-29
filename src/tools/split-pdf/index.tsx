'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// 🚀 BULLETPROOF WORKER SETUP (Direct CDN Link, kabhi fail nahi hoga)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// 🖼️ Naya Thumbnail Component (Bina strict-mode cancellation bug ke)
const PageThumbnail = ({ pdfDoc, pageNum, isSelected, onClick }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    const renderPage = async () => {
      if (!canvasRef.current || !pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        // Scale 1.0 rakha hai taaki image ekdam clear aur HD aaye
        const viewport = page.getViewport({ scale: 1.0 }); 
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context && isMounted) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          // Render cancel nahi karenge taaki canvas blank na ho
          await page.render({ canvasContext: context, viewport }).promise;
        }
      } catch (err) {
        console.error(`Page ${pageNum} render issue:`, err);
      }
    };

    renderPage();

    return () => {
      isMounted = false; // Memory safe cleanup
    };
  }, [pdfDoc, pageNum]);

  return (
    <div 
      onClick={onClick}
      style={{
        position: 'relative',
        aspectRatio: '1/1.4',
        backgroundColor: '#ffffff',
        border: isSelected ? '3px solid #4f46e5' : '1px solid #cbd5e1',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.4)' : '0 2px 4px rgba(0,0,0,0.05)',
        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.15s ease-in-out',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Asli PDF Page ki Photo (Canvas) */}
      <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Selected hone par bada Tick Mark */}
      {isSelected && (
        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#4f46e5', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }}>
          ✓
        </div>
      )}

      {/* Niche Page Number ka Badge */}
      <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', backgroundColor: isSelected ? '#4f46e5' : 'rgba(15, 23, 42, 0.9)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '1rem', zIndex: 10 }}>
        Page {pageNum}
      </div>
    </div>
  );
};

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<any>(null); 
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    try {
      setFile(uploadedFile);
      setSelectedPages([]); 
      setPdfJsDoc(null);
      
      const buffer = await uploadedFile.arrayBuffer();
      setFileBuffer(buffer);
      
      // 1. Load for Extracting (PDF-lib)
      const pdf = await PDFDocument.load(buffer);
      setPageCount(pdf.getPageCount());

      // 2. Load for Visual Viewing (PDF.js)
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer));
      const visualPdf = await loadingTask.promise;
      setPdfJsDoc(visualPdf);

    } catch (error) {
      console.error("PDF load error:", error);
      alert('Error reading the PDF. It might be encrypted or corrupted.');
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNum) 
        ? prev.filter(p => p !== pageNum) 
        : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const selectAllPages = () => {
    const all = Array.from({ length: pageCount }, (_, i) => i + 1);
    setSelectedPages(all);
  };

  const extractAndDownload = async () => {
    if (!fileBuffer || selectedPages.length === 0) return;
    setIsExtracting(true);
    
    try {
      const newPdf = await PDFDocument.create();
      const loadedPdf = await PDFDocument.load(fileBuffer);
      const zeroIndexedPages = selectedPages.map(p => p - 1);
      
      const copiedPages = await newPdf.copyPages(loadedPdf, zeroIndexedPages);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Extracted_Pages_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to extract pages.');
    } finally {
      setIsExtracting(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setFileBuffer(null);
    setPdfJsDoc(null);
    setPageCount(0);
    setSelectedPages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {!file && (
        <div onClick={() => fileInputRef.current?.click()} style={{ padding: '4rem 2rem', border: '2px dashed #4f46e5', borderRadius: '1rem', backgroundColor: '#eef2ff', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✂️</div>
          <h2 style={{ color: '#4f46e5', margin: '0 0 0.5rem 0' }}>Select PDF File to Split</h2>
          <p style={{ color: '#6366f1', margin: 0 }}>Extract pages or split your PDF visually</p>
        </div>
      )}

      <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

      {file && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{file.name}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Total Pages: {pageCount} | Selected: {selectedPages.length}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={selectAllPages} style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>Select All</button>
              <button onClick={() => setSelectedPages([])} style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>Clear</button>
              <button onClick={resetTool} style={{ padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>❌ Close File</button>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#4f46e5', marginBottom: '1rem', fontWeight: '500' }}>
            Click on the pages you want to extract:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem', maxHeight: '550px', overflowY: 'auto', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            {pdfJsDoc ? (
              Array.from({ length: pageCount }).map((_, idx) => {
                const pageNum = idx + 1;
                const isSelected = selectedPages.includes(pageNum);
                return (
                  <PageThumbnail
                    key={pageNum}
                    pdfDoc={pdfJsDoc}
                    pageNum={pageNum}
                    isSelected={isSelected}
                    onClick={() => togglePageSelection(pageNum)}
                  />
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
                ⏳ Rendering visual pages... please wait.
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={extractAndDownload}
              disabled={isExtracting || selectedPages.length === 0}
              style={{
                padding: '1rem 3rem',
                fontSize: '1.1rem',
                fontWeight: '700',
                backgroundColor: selectedPages.length === 0 ? '#cbd5e1' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: selectedPages.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: selectedPages.length > 0 ? '0 4px 6px rgba(16, 185, 129, 0.25)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {isExtracting ? 'Extracting...' : `Split & Download PDF (${selectedPages.length} Pages)`}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}