'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface FileObject {
  id: string;
  file: File;
  name: string;
  size: string;
  previewUrl?: string; // Stores local object URL for embedding
}

export default function PdfMerger() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null); // Tracks open preview box
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URLs to prevent memory leaks when files are removed or component unmounts
  useEffect(() => {
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
      
      const mappedFiles = selectedFiles.map(file => {
        return {
          id: Math.random().toString(36).substring(2, 9),
          file: file,
          name: file.name,
          size: formatSize(file.size),
          previewUrl: URL.createObjectURL(file) // Instant client-side blob generation
        };
      });
      setFiles(prev => [...prev, ...mappedFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    if (activePreviewId === id) setActivePreviewId(null);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Toggle open/close for the inline container box
  const toggleInlinePreview = (id: string) => {
    setActivePreviewId(prev => (prev === id ? null : id));
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

      // Clean up previous blob tokens
      files.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });

      setFiles([]);
      setActivePreviewId(null);
      setSuccessMessage("🎉 Success! Your PDFs have been safely merged and downloaded.");

    } catch (error) {
      console.error("PDF Merging failed:", error);
      alert("An error occurred while merging your PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
      
      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />

      {successMessage && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '0.5rem', fontWeight: '500', fontSize: '0.95rem', textAlign: 'center' }}>
          {successMessage}
        </div>
      )}

      <div 
        onClick={() => fileInputRef.current?.click()}
        style={{ 
          padding: '3rem 2rem', 
          border: '2px dashed #6366f1', 
          borderRadius: '0.75rem', 
          backgroundColor: '#f5f3ff', 
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
        <p style={{ color: '#4338ca', fontWeight: '700', fontSize: '1.1rem' }}>Click to upload or drag your PDFs here</p>
        <span style={{ fontSize: '0.85rem', color: '#6366f1', opacity: 0.8 }}>Supports high-quality standard PDF documents</span>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0 0.25rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
              Queue List ({files.length} Selected)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
              ↕️ Drag items up/down to change order
            </span>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="pdf-queue">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {files.map((fileObj, index) => (
                    <Draggable key={fileObj.id} draggableId={fileObj.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: snapshot.isDragging ? '#f8fafc' : '#ffffff',
                            border: snapshot.isDragging ? '2px solid #6366f1' : '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            boxShadow: snapshot.isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Main Row Information */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                              <span {...provided.dragHandleProps} style={{ color: '#94a3b8', cursor: 'grab', padding: '0 4px', fontSize: '1.1rem' }}>⣿</span>
                              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {index + 1}. {fileObj.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fileObj.size}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleInlinePreview(fileObj.id); }}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {activePreviewId === fileObj.id ? '❌ Close Box' : '👁️ Preview'}
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFile(fileObj.id); }}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Dynamic In-Line Embedded Grid Preview Box */}
                          {activePreviewId === fileObj.id && fileObj.previewUrl && (
                            <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px dashed #e2e8f0', backgroundColor: '#f8fafc' }}>
                              <div style={{ marginTop: '0.75rem', height: '280px', border: '1px solid #cbd5e1', borderRadius: '0.375rem', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                                <iframe 
                                  src={`${fileObj.previewUrl}#toolbar=0&navpanes=0`} 
                                  style={{ width: '100%', height: '100%', border: 'none' }}
                                  title="Inline Document Preview"
                                />
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={mergePdfsNow}
          disabled={isMerging || files.length < 2}
          style={{ 
            padding: '0.8rem 2rem', 
            backgroundColor: files.length < 2 ? '#cbd5e1' : '#4f46e5', 
            color: files.length < 2 ? '#94a3b8' : '#ffffff', 
            border: 'none', 
            borderRadius: '0.5rem', 
            fontWeight: '700', 
            cursor: files.length < 2 ? 'not-allowed' : 'pointer',
            boxShadow: files.length < 2 ? 'none' : '0 4px 14px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          {isMerging ? 'Merging Documents...' : 'Merge PDFs Now'}
        </button>
      </div>
    </div>
  );
}