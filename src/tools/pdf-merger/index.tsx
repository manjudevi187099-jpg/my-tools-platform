'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      files.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, [files]);

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedFiles = Array.from(files);
    const [removed] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, removed);
    setFiles(reorderedFiles);
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
        
        copiedPages.forEach((page: PDFPage) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const mergedPdfArray = new Uint8Array(mergedPdfBytes);
      const blob = new Blob([mergedPdfArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TaskSnap_Merged_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      files.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });

      setFiles([]);
      setSuccessMessage("🎉 Success! Your PDFs have been safely merged and downloaded.");

    } catch (error) {
      console.error("PDF Merging failed:", error);
      alert("An error occurred while merging your PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 2rem 1.5rem', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      
      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />

      {successMessage && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '0.5rem', fontWeight: '500', textAlign: 'center', width: '100%' }}>
          {successMessage}
        </div>
      )}

      {/* Upload Zone - Top Header Style */}
      <div style={{ width: '100%', marginBottom: '2rem' }}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            padding: '2.5rem 1.5rem', 
            border: '2px dashed #6366f1', 
            borderRadius: '0.75rem', 
            backgroundColor: '#f5f3ff', 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#6366f1'}
        >
          <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📂</div>
          <p style={{ color: '#4338ca', fontWeight: '700', fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Drop PDF files here or Click to Browse</p>
          <span style={{ fontSize: '0.8rem', color: '#6366f1', opacity: 0.8 }}>Add as many documents as you need</span>
        </div>
      </div>

      {/* Grid Workspace Area */}
      {files.length > 0 && (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Queue Workspace ({files.length} Files)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: '600' }}>
              ↔️ Drag & Drop cards to reorder
            </span>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="pdf-visual-grid" direction="horizontal">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '1.25rem',
                    width: '100%',
                    minHeight: '200px'
                  }}
                >
                  {files.map((fileObj, index) => (
                    <Draggable key={fileObj.id} draggableId={fileObj.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            width: '200px', // Exact fixed width for grid stability
                            height: '260px', // Exact fixed height
                            backgroundColor: '#ffffff',
                            border: snapshot.isDragging ? '2px solid #6366f1' : '1px solid #cbd5e1',
                            borderRadius: '0.75rem',
                            boxShadow: snapshot.isDragging ? '0 15px 25px rgba(99, 102, 241, 0.2)' : '0 4px 6px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                            transition: snapshot.isDragging ? 'none' : 'transform 0.1s, box-shadow 0.1s'
                          }}
                          onMouseOver={(e) => { if(!snapshot.isDragging) e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)' }}
                          onMouseOut={(e) => { if(!snapshot.isDragging) e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)' }}
                        >
                          
                          {/* Top Action Buttons Overlay */}
                          <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20, display: 'flex', gap: '6px' }}>
                            <button 
                              onMouseDown={(e) => e.stopPropagation()} 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewModalUrl(fileObj.previewUrl || null); }}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                              title="Zoom/Preview"
                            >
                              🔍
                            </button>
                            <button 
                              onMouseDown={(e) => e.stopPropagation()} 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(fileObj.id); }}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                              title="Remove"
                            >
                              ❌
                            </button>
                          </div>

                          {/* Badge Number indicator */}
                          <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 20, backgroundColor: '#4f46e5', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {index + 1}
                          </div>

                          {/* Visual PDF Thumbnail (Iframe rendering the first page) */}
                          <div style={{ flex: 1, backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                            {/* Glass overlay to protect drag and drop from iframe interference */}
                            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}></div>
                            
                            {fileObj.previewUrl && (
                              <iframe 
                                src={`${fileObj.previewUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`} 
                                style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                                title="thumbnail"
                                loading="lazy"
                              />
                            )}
                          </div>

                          {/* Footer Details */}
                          <div style={{ padding: '0.75rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={fileObj.name}>
                              {fileObj.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{fileObj.size}</div>
                          </div>

                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Merge Action Row Trigger */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <button 
              onClick={mergePdfsNow}
              disabled={isMerging || files.length < 2}
              style={{ 
                padding: '0.9rem 3rem', 
                backgroundColor: files.length < 2 ? '#cbd5e1' : '#4f46e5', 
                color: files.length < 2 ? '#94a3b8' : '#ffffff', 
                border: 'none', 
                borderRadius: '0.5rem', 
                fontWeight: '700', 
                fontSize: '1rem',
                cursor: files.length < 2 ? 'not-allowed' : 'pointer',
                boxShadow: files.length < 2 ? 'none' : '0 4px 14px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {isMerging ? 'Merging Documents...' : `Merge ${files.length} PDFs Now`}
            </button>
          </div>

        </div>
      )}

      {/* FULL-SCREEN POPUP MODAL PREVIEW */}
      {previewModalUrl && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.85)', 
          zIndex: 9999, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          padding: '2rem'
        }}>
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Document Preview</h3>
            <button 
              onClick={() => setPreviewModalUrl(null)} 
              style={{ 
                backgroundColor: '#ef4444', color: '#ffffff', border: 'none', 
                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: 'bold', 
                cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              ❌ Close Preview
            </button>
          </div>
          
          <div style={{ width: '100%', maxWidth: '900px', height: '80vh', backgroundColor: '#ffffff', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <iframe 
              src={`${previewModalUrl}#toolbar=0`} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Full Screen Document Preview"
            />
          </div>
        </div>
      )}

    </div>
  );
}