'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
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
      setSelectedPages([]); // Nayi file aane par selection reset karein
      
      const buffer = await uploadedFile.arrayBuffer();
      setFileBuffer(buffer);
      
      const pdf = await PDFDocument.load(buffer);
      const count = pdf.getPageCount();
      setPageCount(count);
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
      // Nayi khali PDF banayein
      const newPdf = await PDFDocument.create();
      // Original PDF load karein
      const loadedPdf = await PDFDocument.load(fileBuffer);
      
      // Page numbers UI me 1 se shuru hote hain, par code me 0 se
      const zeroIndexedPages = selectedPages.map(p => p - 1);
      
      // Chune hue pages copy karein
      const copiedPages = await newPdf.copyPages(loadedPdf, zeroIndexedPages);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      // Nayi PDF save aur download karein
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `TaskSnap_Extracted_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Extraction error:", error);
      alert('Failed to extract pages.');
    } finally {
      setIsExtracting(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setFileBuffer(null);
    setPageCount(0);
    setSelectedPages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Upload Zone */}
      {!file && (
        <div 
          onClick={() => fileInputRef.current?.click()} 
          style={{ padding: '4rem 2rem', border: '2px dashed #4f46e5', borderRadius: '1rem', backgroundColor: '#eef2ff', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✂️</div>
          <h2 style={{ color: '#4f46e5', margin: '0 0 0.5rem 0' }}>Select PDF File to Split</h2>
          <p style={{ color: '#6366f1', margin: 0 }}>Extract pages or split your PDF visually</p>
        </div>
      )}

      <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

      {/* Workspace Zone */}
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
            Click on the page numbers you want to extract:
          </p>

          {/* Grid of Pages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            {Array.from({ length: pageCount }).map((_, idx) => {
              const pageNum = idx + 1;
              const isSelected = selectedPages.includes(pageNum);
              return (
                <div 
                  key={pageNum}
                  onClick={() => togglePageSelection(pageNum)}
                  style={{
                    aspectRatio: '1/1.4',
                    backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                    border: isSelected ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 10px rgba(79, 70, 229, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s ease-in-out',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isSelected ? '#ffffff' : '#475569' }}>
                    {pageNum}
                  </span>
                  {isSelected && <span style={{ fontSize: '0.7rem', color: '#e0e7ff', marginTop: '4px' }}>Selected</span>}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={extractAndDownload}
              disabled={isExtracting || selectedPages.length === 0}
              style={{
                padding: '0.75rem 2.5rem',
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