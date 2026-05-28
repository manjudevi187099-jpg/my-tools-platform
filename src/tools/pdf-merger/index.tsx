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
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const fileToRemove = files.find(f => f.id !== id);
    if (fileToRemove?.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl);
    if (activePreviewId === id) setActivePreviewId(null);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

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
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '0 1.5rem 2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      
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

      {/* Main Container Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        
        {/* Upload Box Card */}
        <div style={{ width: '100%' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                padding: '2.5rem 1.5rem', 
                border: '2px dashed #6366f1', 
                borderRadius: '0.75rem', 
                backgroundColor: '#f5f3ff', 
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📂</div>
              <p style={{ color: '#4338ca', fontWeight: '700', fontSize: '0.95rem', margin: '0 0 0.25rem 0' }}>Drop files or click here</p>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', opacity: 0.8 }}>Add more PDF documents</span>
            </div>
          </div>
        </div>

        {/* Workspace Management List Area */}
        {files.length > 0 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Queue Workspace ({files.length} Files Loaded)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '600' }}>
                ↕️ Hold the number box and drag vertically to reorder sequence
              </span>
            </div>

            {/* Drag & Drop Vertical Engine Context */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pdf-vertical-list" direction="vertical">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.75rem',
                      width: '100%'
                    }}
                  >
                    {files.map((fileObj, index) => (
                      <Draggable key={fileObj.id} draggableId={fileObj.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: '#ffffff',
                              border: snapshot.isDragging ? '2px solid #6366f1' : '1px solid #e2e8f0',
                              borderRadius: '0.75rem',
                              boxShadow: snapshot.isDragging ? '0 8px 20px rgba(99, 102, 241, 0.12)' : '0 1px 3px rgba(0,0,0,0.01)',
                              display: 'flex',
                              flexDirection: 'column',
                              overflow: 'hidden'
                            }}
                          >
                            {/* Linear Full Width Card Content */}
                            <div style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px', overflow: 'hidden' }}>
                                {/* Safe isolated Numerical Drag Trigger */}
                                <div 
                                  {...provided.dragHandleProps}
                                  style={{ 
                                    color: '#ffffff', 
                                    fontSize: '0.85rem', 
                                    fontWeight: 'bold', 
                                    userSelect: 'none', 
                                    backgroundColor: '#4f46e5', 
                                    minWidth: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '6px',
                                    cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
                                  }}
                                  title="Hold and drag up/down"
                                >
                                  {index + 1}
                                </div>

                                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', textOverflow: 'ellipsis', overflow: 'hidden' }} title={fileObj.name}>
                                    {fileObj.name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px' }}>{fileObj.size}</div>
                                </div>
                              </div>

                              {/* Action Triggers */}
                              <div 
                                style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleInlinePreview(fileObj.id); }}
                                  style={{ backgroundColor: 'transparent', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
                                >
                                  {activePreviewId === fileObj.id ? '❌ Close Box' : '👁️ Preview'}
                                </button>
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(fileObj.id); }}
                                  style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            {/* Collapsible Accordion Preview Area */}
                            {activePreviewId === fileObj.id && fileObj.previewUrl && (
                              <div style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0.75rem' }}>
                                <iframe 
                                  src={`${fileObj.previewUrl}#toolbar=0&navpanes=0`} 
                                  style={{ width: '100%', height: '400px', border: 'none', borderRadius: '0.5rem', backgroundColor: '#ffffff' }}
                                  title="Workspace Linear Document View Preview"
                                />
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

            {/* Compiled System Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <button 
                onClick={mergePdfsNow}
                disabled={isMerging || files.length < 2}
                style={{ 
                  padding: '0.85rem 2.5rem', 
                  backgroundColor: files.length < 2 ? '#cbd5e1' : '#4f46e5', 
                  color: files.length < 2 ? '#94a3b8' : '#ffffff', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  fontWeight: '700', 
                  fontSize: '0.9rem',
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

      </div>
    </div>
  );
}