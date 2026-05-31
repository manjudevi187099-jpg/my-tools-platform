'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ToolType = 'select' | 'text' | 'smart-edit' | 'whiteout' | 'highlight' | 'strikethrough' | 'image' | 'signature' | 'link' | 'checkbox' | 'pen' | 'none';

type Annotation = { 
  id: string; page: number; type: ToolType; 
  x: number; y: number; width: number; height: number; 
  cWidth: number; cHeight: number; 
  text?: string; imageUrl?: string; imageFile?: File;
  color?: string; fontSize?: number;
  paths?: {x: number, y: number}[]; 
};

const hexToRgbPdf = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

export default function AdvancedPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [zoom, setZoom] = useState(1);

  // NAYA: Page Management & Element Selection States
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [selectedAnnoId, setSelectedAnnoId] = useState<string | null>(null);

  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  const [fontSize, setFontSize] = useState(14); 
  const [textColor, setTextColor] = useState('#000000');

  const [activeInput, setActiveInput] = useState<{ x: number, y: number, width: number, height: number, text: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);

  const [draggingAnnoId, setDraggingAnnoId] = useState<string | null>(null);
  const [annoDragOffset, setAnnoDragOffset] = useState<{x: number, y: number} | null>(null);

  const [imageInput, setImageInput] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{w: number, h: number} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setAnnotations([]); 
    setDeletedPages([]);
    setActiveInput(null);
    setSelectedAnnoId(null);
    setZoom(1); 
    
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(pdf);
    setNumPages(pdf.numPages);
    setCurrentPage(1);
    renderPage(pdf, 1);
  };

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 }); 
    setPdfDimensions({ w: viewport.width, h: viewport.height });

    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    }
  };

  const changePage = (offset: number) => {
    if (!pdfDoc) return;
    const newPage = currentPage + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
      renderPage(pdfDoc, newPage);
      setActiveInput(null);
      setSelectedAnnoId(null);
    }
  };

  // NAYA: Page Text Extraction
  const extractPageText = async () => {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      navigator.clipboard.writeText(text);
      alert('✅ Page text copied to clipboard successfully!');
    } catch (e) {
      alert('Error extracting text.');
    }
  };

  // NAYA: Toggle Page Deletion
  const togglePageDelete = () => {
    if (deletedPages.includes(currentPage)) {
      setDeletedPages(prev => prev.filter(p => p !== currentPage));
    } else {
      setDeletedPages(prev => [...prev, currentPage]);
    }
  };

  const undoLastAction = () => setAnnotations((prev) => prev.slice(0, -1));
  const clearCurrentPage = () => setAnnotations((prev) => prev.filter((a) => a.page !== currentPage));

  const getMouseCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none' || activeTool === 'select') {
      if (activeTool === 'select' && !draggingAnnoId) setSelectedAnnoId(null); // Clicked on empty canvas
      return; 
    }
    const { x, y } = getMouseCoords(e);
    
    if (activeTool === 'pen') {
      setCurrentPath([{ x, y }]);
      setIsDragging(true);
      return;
    }

    setDragStart({ x, y });
    setDragCurrent({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = getMouseCoords(e);

    if (draggingAnnoId && annoDragOffset) {
      setAnnotations(prev => prev.map(a => 
        a.id === draggingAnnoId ? { ...a, x: x - annoDragOffset.x, y: y - annoDragOffset.y } : a
      ));
      return;
    }

    if (!isDragging) return;

    if (activeTool === 'pen') {
      setCurrentPath((prev) => [...prev, { x, y }]);
      return;
    }
    setDragCurrent({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingAnnoId) {
      setDraggingAnnoId(null);
      setAnnoDragOffset(null);
      return;
    }

    if (!isDragging || !pdfDimensions) return;
    setIsDragging(false);

    if (activeTool === 'pen') {
      if (currentPath.length > 1) {
        setAnnotations([...annotations, {
          id: Date.now().toString(), page: currentPage, type: 'pen',
          x: 0, y: 0, width: 0, height: 0,
          cWidth: pdfDimensions.w, cHeight: pdfDimensions.h,
          paths: currentPath, color: textColor, fontSize: fontSize 
        }]);
      }
      setCurrentPath([]);
      return;
    }

    if (!dragStart || !dragCurrent) return;

    const startX = Math.min(dragStart.x, dragCurrent.x);
    const startY = Math.min(dragStart.y, dragCurrent.y);
    let boxWidth = Math.abs(dragCurrent.x - dragStart.x);
    let boxHeight = Math.abs(dragCurrent.y - dragStart.y);

    if (boxWidth < 10) boxWidth = activeTool === 'checkbox' ? 20 : 150;
    if (boxHeight < 10) boxHeight = activeTool === 'checkbox' ? 20 : 25;

    const baseAnno = {
      id: Date.now().toString(), page: currentPage,
      x: startX, y: startY, width: boxWidth, height: boxHeight,
      cWidth: pdfDimensions.w, cHeight: pdfDimensions.h
    };

    if (activeTool === 'smart-edit' || activeTool === 'text' || activeTool === 'link') {
      setActiveInput({ x: startX, y: startY, width: boxWidth, height: boxHeight, text: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (activeTool === 'image' || activeTool === 'signature') {
      if (imageInput) setAnnotations([...annotations, { ...baseAnno, type: activeTool, imageUrl: URL.createObjectURL(imageInput), imageFile: imageInput }]);
    } else {
      setAnnotations([...annotations, { ...baseAnno, type: activeTool }]);
    }

    setDragStart(null);
    setDragCurrent(null);
  };

  const saveActiveInput = () => {
    if (activeInput && activeInput.text.trim() !== '' && pdfDimensions) {
      setAnnotations([...annotations, { 
        id: Date.now().toString(), page: currentPage, type: activeTool, 
        x: activeInput.x, y: activeInput.y, width: activeInput.width, height: activeInput.height,
        cWidth: pdfDimensions.w, cHeight: pdfDimensions.h,
        text: activeInput.text, color: textColor, fontSize: fontSize
      }]);
    }
    setActiveInput(null);
    setActiveTool('select'); 
  };

  // NAYA: Resize & Delete Specific Annotations
  const modifyAnnotation = (id: string, action: 'delete' | 'grow' | 'shrink') => {
    if (action === 'delete') {
      setAnnotations(prev => prev.filter(a => a.id !== id));
      setSelectedAnnoId(null);
    } else {
      const scale = action === 'grow' ? 1.1 : 0.9;
      setAnnotations(prev => prev.map(a => 
        a.id === id ? { 
          ...a, 
          width: a.width * scale, 
          height: a.height * scale, 
          fontSize: a.fontSize ? a.fontSize * scale : undefined 
        } : a
      ));
    }
  };

  const saveAndDownload = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      
      for (const anno of annotations) {
        if (deletedPages.includes(anno.page)) continue; // Skip drawing on deleted pages

        const page = pdf.getPages()[anno.page - 1]; 
        const { width, height } = page.getSize();
        
        const pdfX = (anno.x / anno.cWidth) * width;
        const pdfY = height - ((anno.y / anno.cHeight) * height);
        const pdfWidth = (anno.width / anno.cWidth) * width;
        const pdfHeight = (anno.height / anno.cHeight) * height;

        const annoColor = anno.color ? hexToRgbPdf(anno.color) : rgb(0,0,0);
        const annoSize = anno.fontSize || 14;

        if (anno.type === 'pen' && anno.paths) {
          for (let i = 0; i < anno.paths.length - 1; i++) {
            const p1 = anno.paths[i];
            const p2 = anno.paths[i+1];
            page.drawLine({
              start: { x: ((p1.x + anno.x) / anno.cWidth) * width, y: height - (((p1.y + anno.y) / anno.cHeight) * height) },
              end: { x: ((p2.x + anno.x) / anno.cWidth) * width, y: height - (((p2.y + anno.y) / anno.cHeight) * height) },
              thickness: annoSize / 3, 
              color: annoColor
            });
          }
        } else if (anno.type === 'text') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - annoSize, size: annoSize, font, color: annoColor });
        } else if (anno.type === 'link') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - annoSize, size: annoSize, font, color: annoColor });
          const textWidth = font.widthOfTextAtSize(anno.text || '', annoSize);
          page.drawLine({ start: { x: pdfX, y: pdfY - annoSize - 2 }, end: { x: pdfX + textWidth, y: pdfY - annoSize - 2 }, thickness: 1, color: annoColor });
        } else if (anno.type === 'whiteout') {
          page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: rgb(1, 1, 1) });
        } else if (anno.type === 'highlight') {
          page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: rgb(1, 1, 0), opacity: 0.4 });
        } else if (anno.type === 'strikethrough') {
          page.drawLine({ start: { x: pdfX, y: pdfY - (pdfHeight/2) }, end: { x: pdfX + pdfWidth, y: pdfY - (pdfHeight/2) }, thickness: 1.5, color: rgb(1, 0, 0) });
        } else if (anno.type === 'checkbox') {
          page.drawRectangle({ x: pdfX, y: pdfY - 15, width: 15 * (pdfWidth/20), height: 15 * (pdfHeight/20), borderColor: rgb(0, 0, 0), borderWidth: 1 });
          page.drawLine({ start: { x: pdfX + 3, y: pdfY - 10 }, end: { x: pdfX + 7, y: pdfY - 14 }, thickness: 2, color: rgb(0, 0, 0) });
          page.drawLine({ start: { x: pdfX + 7, y: pdfY - 14 }, end: { x: pdfX + 14, y: pdfY - 5 }, thickness: 2, color: rgb(0, 0, 0) });
        } else if ((anno.type === 'image' || anno.type === 'signature') && anno.imageFile) {
          const imgBuffer = await anno.imageFile.arrayBuffer();
          let pdfImage = anno.imageFile.type === 'image/png' ? await pdf.embedPng(imgBuffer) : await pdf.embedJpg(imgBuffer);
          page.drawImage(pdfImage, { x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight });
        } else if (anno.type === 'smart-edit') {
          page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: rgb(1, 1, 1) });
          page.drawText(anno.text || '', { x: pdfX + 2, y: pdfY - annoSize, size: annoSize, font, color: annoColor });
        }
      }

      // NAYA: Remove deleted pages from the final PDF
      const sortedDeletedPages = [...deletedPages].sort((a, b) => b - a); // Reverse order to prevent index shifting issues
      for (const pageNum of sortedDeletedPages) {
        pdf.removePage(pageNum - 1);
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'God-Level-Edited-Document.pdf';
      a.click();
    } catch (err) {
      console.error(err);
      alert("Error saving PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPageAnnotations = annotations.filter(a => a.page === currentPage);
  const isPageDeleted = deletedPages.includes(currentPage);

  return (
    <div className="max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row gap-6 bg-gray-50 min-h-screen">
      
      {/* SIDEBAR TOOLBAR */}
      <div className="w-full md:w-80 bg-white p-5 rounded-2xl shadow-xl border border-gray-200 h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 sticky top-0 bg-white z-10 pb-2 border-b">Pro PDF Editor</h2>
        
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4 w-full text-sm border p-2 rounded" />

        <div className="flex gap-2 mb-4">
          <button onClick={undoLastAction} disabled={annotations.length === 0} className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium text-sm transition disabled:opacity-50">↩️ Undo</button>
          <button onClick={clearCurrentPage} disabled={currentPageAnnotations.length === 0} className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium text-sm transition disabled:opacity-50">🗑️ Clear</button>
        </div>

        <div className="mb-4">
           <button onClick={() => setActiveTool('select')} className={`w-full p-3 rounded-lg text-center font-bold text-sm transition border-2 ${activeTool === 'select' ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105' : 'bg-white text-indigo-700 hover:bg-indigo-50 border-indigo-200'}`}>
             🖱️ Select & Move Elements
           </button>
        </div>

        {(activeTool === 'text' || activeTool === 'smart-edit' || activeTool === 'link' || activeTool === 'pen') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
            <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">{activeTool === 'pen' ? 'Pen Styling' : 'Text Styling'}</h3>
            <div className="flex gap-3 items-center">
              <div>
                <label className="text-xs text-gray-600 block mb-1">{activeTool === 'pen' ? 'Thickness:' : 'Size:'}</label>
                <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-16 p-1 border rounded text-sm" min="2" max="72" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">Color:</label>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Draw & Edit</h3>
            <div className="space-y-2">
              <button onClick={() => setActiveTool('pen')} className={`w-full p-2.5 rounded text-left font-bold text-sm transition ${activeTool === 'pen' ? 'bg-pink-600 text-white shadow' : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'}`}>✍️ Freehand Draw</button>
              <button onClick={() => setActiveTool('smart-edit')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'smart-edit' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>✏️ Replace Word</button>
              <button onClick={() => setActiveTool('text')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'text' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>📝 Add Text</button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Mask & Annotate</h3>
            <div className="space-y-2">
              <button onClick={() => setActiveTool('whiteout')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'whiteout' ? 'bg-red-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>🧼 Whiteout</button>
              <button onClick={() => setActiveTool('highlight')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'highlight' ? 'bg-yellow-400 text-black shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>🖍️ Highlight</button>
              <button onClick={() => setActiveTool('strikethrough')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'strikethrough' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}><s>S</s> Strikethrough</button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Insert Media</h3>
            <div className="space-y-2">
              <button onClick={() => setActiveTool('link')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'link' ? 'bg-blue-400 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>🔗 Add Link</button>
              <button onClick={() => setActiveTool('image')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'image' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>🖼️ Add Image</button>
              <button onClick={() => setActiveTool('signature')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'signature' ? 'bg-teal-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>✒️ Upload Signature</button>
              {(activeTool === 'image' || activeTool === 'signature') && (
                <input type="file" accept="image/png, image/jpeg" onChange={(e) => setImageInput(e.target.files?.[0] || null)} className="w-full p-2 border rounded text-xs" />
              )}
            </div>
          </div>
        </div>

        <div className="flex-1"></div>

        <button onClick={saveAndDownload} disabled={isProcessing || !file} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md sticky bottom-0 z-10 mt-4">
          {isProcessing ? 'Saving PDF...' : '💾 Save & Download'}
        </button>
      </div>

      {/* MAIN PREVIEW AREA */}
      <div className="w-full md:flex-1 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 flex flex-col h-[90vh]">
        
        {/* NAYA: ADVANCED TOP TOOLBAR */}
        {file && (
          <div className="flex flex-wrap justify-between items-center bg-gray-100 p-3 rounded-lg mb-4 shadow-sm border border-gray-200 gap-4">
            {/* Zoom & Page Extract */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-300">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="font-bold px-2 hover:bg-gray-100 text-blue-600">➖</button>
                <span className="font-bold text-gray-700 text-xs min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="font-bold px-2 hover:bg-gray-100 text-blue-600">➕</button>
              </div>
              <button onClick={extractPageText} className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded font-bold hover:bg-blue-50 text-blue-700 shadow-sm">
                📋 Copy Text
              </button>
            </div>

            {/* Pagination & Delete Page */}
            <div className="flex items-center gap-2">
              <button onClick={() => changePage(-1)} disabled={currentPage === 1} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 font-bold text-xs">◀ Prev</button>
              <span className="font-bold text-gray-700 text-sm px-2">Pg {currentPage} / {numPages}</span>
              <button onClick={() => changePage(1)} disabled={currentPage === numPages} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 font-bold text-xs">Next ▶</button>
              
              {/* PAGE DELETE BUTTON */}
              <button onClick={togglePageDelete} className={`ml-2 px-3 py-1.5 rounded font-bold text-xs border shadow-sm transition ${isPageDeleted ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                {isPageDeleted ? '↩️ Restore Page' : '🗑️ Delete Page'}
              </button>
            </div>
          </div>
        )}

        {/* CANVAS EDITOR AREA */}
        <div className="overflow-auto flex flex-1 relative select-none bg-gray-300 rounded custom-scrollbar justify-center items-start">
          {!file ? (
            <div className="flex items-center justify-center h-full text-gray-500 font-medium w-full">Upload a PDF to start editing...</div>
          ) : (
            <div 
              className={`relative inline-block m-8 shadow-2xl bg-white origin-top-left transition-transform duration-200 
                ${activeTool === 'select' ? 'cursor-default' : activeTool === 'none' ? '' : 'cursor-crosshair'}
              `}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            >
              {/* DELETED PAGE OVERLAY */}
              {isPageDeleted && (
                <div className="absolute inset-0 bg-red-900 bg-opacity-70 z-50 flex items-center justify-center pointer-events-none">
                  <h1 className="text-white text-4xl font-black tracking-widest transform rotate-[-30deg] border-4 border-white p-4">PAGE DELETED</h1>
                </div>
              )}

              <canvas ref={canvasRef} className="pointer-events-none" />
              
              {currentPath.length > 0 && (
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-40">
                  <polyline points={currentPath.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={textColor} strokeWidth={fontSize} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}

              {isDragging && dragStart && dragCurrent && activeTool !== 'pen' && activeTool !== 'select' && (
                <div className="absolute border-2 border-blue-500 border-dashed bg-blue-400 bg-opacity-20 z-40 pointer-events-none"
                  style={{ left: Math.min(dragStart.x, dragCurrent.x), top: Math.min(dragStart.y, dragCurrent.y), width: Math.abs(dragCurrent.x - dragStart.x), height: Math.abs(dragCurrent.y - dragStart.y) }}
                />
              )}

              {currentPageAnnotations.map((anno) => (
                <div 
                  key={anno.id} 
                  className={`absolute z-30 ${activeTool === 'select' ? 'pointer-events-auto cursor-move' : 'pointer-events-none'}`} 
                  style={{ left: anno.x, top: anno.y, width: anno.width, height: anno.height }}
                  onMouseDown={(e) => {
                    if (activeTool !== 'select') return;
                    e.stopPropagation(); 
                    const { x, y } = getMouseCoords(e as any);
                    setSelectedAnnoId(anno.id); // Mark as selected
                    setDraggingAnnoId(anno.id);
                    setAnnoDragOffset({ x: x - anno.x, y: y - anno.y });
                  }}
                >
                  {/* NAYA: FLOATING TOOLBAR FOR SELECTED ELEMENT */}
                  {selectedAnnoId === anno.id && activeTool === 'select' && (
                    <div className="absolute -top-10 left-0 flex items-center gap-1 bg-gray-800 p-1.5 rounded shadow-xl z-50" onMouseDown={e => e.stopPropagation()}>
                      <button onClick={() => modifyAnnotation(anno.id, 'grow')} className="px-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold">➕ Size</button>
                      <button onClick={() => modifyAnnotation(anno.id, 'shrink')} className="px-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold">➖ Size</button>
                      <button onClick={() => modifyAnnotation(anno.id, 'delete')} className="px-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold">🗑️</button>
                    </div>
                  )}

                  {/* ELEMENT OUTLINE WHEN SELECTED */}
                  {selectedAnnoId === anno.id && activeTool === 'select' && (
                     <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none"></div>
                  )}

                  {anno.type === 'pen' && anno.paths && (
                    <svg className="absolute top-0 left-0 overflow-visible" style={{ width: anno.cWidth, height: anno.cHeight }}>
                       <polyline points={anno.paths.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={anno.color} strokeWidth={anno.fontSize} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {anno.type === 'text' && <span className="absolute top-0 leading-none whitespace-nowrap" style={{ color: anno.color, fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                  {anno.type === 'link' && <span className="underline absolute top-0 leading-none whitespace-nowrap" style={{ color: anno.color || 'blue', fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                  {anno.type === 'whiteout' && <div className="bg-white opacity-100 w-full h-full border border-gray-200"></div>}
                  {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50 mix-blend-multiply w-full h-full"></div>}
                  {anno.type === 'strikethrough' && <div className="w-full absolute top-1/2" style={{ height: '2px', backgroundColor: '#ef4444' }}></div>}
                  {anno.type === 'checkbox' && <span className="text-black text-xl leading-none absolute -top-1">☑</span>}
                  {(anno.type === 'image' || anno.type === 'signature') && anno.imageUrl && <img src={anno.imageUrl} alt="preview" className="w-full h-full object-fill pointer-events-none" />}
                  {anno.type === 'smart-edit' && <span className="bg-white px-1 w-full h-full inline-block overflow-hidden" style={{ color: anno.color, fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                </div>
              ))}

              {activeInput && (
                <div className="absolute z-50 flex items-start shadow-xl" style={{ left: activeInput.x, top: activeInput.y, width: activeInput.width, height: activeInput.height }}>
                  <textarea
                    ref={inputRef} value={activeInput.text}
                    onChange={(e) => setActiveInput({ ...activeInput, text: e.target.value })}
                    onBlur={saveActiveInput}
                    className="border-2 border-indigo-500 bg-white bg-opacity-95 p-1 m-0 outline-none w-full h-full resize-none"
                    style={{ fontSize: `${fontSize}px`, color: textColor }}
                    placeholder="Type..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}