'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ToolType = 'text' | 'smart-edit' | 'whiteout' | 'highlight' | 'strikethrough' | 'image' | 'signature' | 'link' | 'checkbox' | 'none';

// Ab Annotation mein Page Number aur Canvas Size bhi save hoga perfect accuracy ke liye
type Annotation = { 
  id: string; page: number; type: ToolType; 
  x: number; y: number; width: number; height: number; 
  cWidth: number; cHeight: number; // Canvas dimensions at the time of drawing
  text?: string; imageUrl?: string; imageFile?: File;
  color?: string; fontSize?: number;
};

// Helper: Hex color ko PDF RGB mein badalne ke liye
const hexToRgbPdf = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

export default function AdvancedPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  
  // Multi-page states
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);

  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  // Font Styling States
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#000000');

  const [activeInput, setActiveInput] = useState<{ x: number, y: number, width: number, height: number, text: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);

  const [imageInput, setImageInput] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{w: number, h: number} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setAnnotations([]); 
    setActiveInput(null);
    
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(pdf);
    setNumPages(pdf.numPages);
    setCurrentPage(1);
    renderPage(pdf, 1);
  };

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.3 });
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
    }
  };

  const undoLastAction = () => {
    setAnnotations((prev) => prev.slice(0, -1));
  };

  const clearCurrentPage = () => {
    setAnnotations((prev) => prev.filter((a) => a.page !== currentPage));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !dragCurrent || !pdfDimensions) return;
    setIsDragging(false);

    const startX = Math.min(dragStart.x, dragCurrent.x);
    const startY = Math.min(dragStart.y, dragCurrent.y);
    let boxWidth = Math.abs(dragCurrent.x - dragStart.x);
    let boxHeight = Math.abs(dragCurrent.y - dragStart.y);

    if (boxWidth < 10) boxWidth = activeTool === 'checkbox' ? 20 : 150;
    if (boxHeight < 10) boxHeight = activeTool === 'checkbox' ? 20 : 25;

    const baseAnno = {
      id: Date.now().toString(),
      page: currentPage,
      x: startX, y: startY, width: boxWidth, height: boxHeight,
      cWidth: pdfDimensions.w, cHeight: pdfDimensions.h
    };

    if (activeTool === 'smart-edit' || activeTool === 'text' || activeTool === 'link') {
      setActiveInput({ x: startX, y: startY, width: boxWidth, height: boxHeight, text: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (activeTool === 'image' || activeTool === 'signature') {
      if (imageInput) {
        setAnnotations([...annotations, { ...baseAnno, type: activeTool, imageUrl: URL.createObjectURL(imageInput), imageFile: imageInput }]);
      }
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
  };

  const saveAndDownload = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      
      for (const anno of annotations) {
        const page = pdf.getPages()[anno.page - 1]; // Apply to SPECIFIC page
        const { width, height } = page.getSize();
        
        const pdfX = (anno.x / anno.cWidth) * width;
        const pdfY = height - ((anno.y / anno.cHeight) * height);
        const pdfWidth = (anno.width / anno.cWidth) * width;
        const pdfHeight = (anno.height / anno.cHeight) * height;

        const annoColor = anno.color ? hexToRgbPdf(anno.color) : rgb(0,0,0);
        const annoSize = anno.fontSize || 14;

        if (anno.type === 'text') {
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
          page.drawRectangle({ x: pdfX, y: pdfY - 15, width: 15, height: 15, borderColor: rgb(0, 0, 0), borderWidth: 1 });
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

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'advanced-edited-document.pdf';
      a.click();
    } catch (err) {
      console.error(err);
      alert("Error saving PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Only show annotations for the CURRENT page
  const currentPageAnnotations = annotations.filter(a => a.page === currentPage);

  return (
    <div className="max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row gap-6 bg-gray-50 min-h-screen">
      
      {/* SIDEBAR TOOLBAR */}
      <div className="w-full md:w-80 bg-white p-5 rounded-2xl shadow-xl border border-gray-200 h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 sticky top-0 bg-white z-10 pb-2 border-b">Pro PDF Editor</h2>
        
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4 w-full text-sm border p-2 rounded" />

        {/* UTILITY CONTROLS: UNDO & CLEAR */}
        <div className="flex gap-2 mb-6">
          <button onClick={undoLastAction} disabled={annotations.length === 0} className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium text-sm transition disabled:opacity-50">
            ↩️ Undo
          </button>
          <button onClick={clearCurrentPage} disabled={currentPageAnnotations.length === 0} className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium text-sm transition disabled:opacity-50">
            🗑️ Clear Page
          </button>
        </div>

        {/* FONT STYLING (Appears for text tools) */}
        {(activeTool === 'text' || activeTool === 'smart-edit' || activeTool === 'link') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
            <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">Text Styling</h3>
            <div className="flex gap-3 items-center">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Size:</label>
                <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-16 p-1 border rounded text-sm" min="8" max="72" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">Color:</label>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
            </div>
          </div>
        )}

        {/* TOOLS LIST */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Text Tools</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('smart-edit')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'smart-edit' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>✏️ Replace Word</button>
            <button onClick={() => setActiveTool('text')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'text' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>📝 Add Text</button>
            <button onClick={() => setActiveTool('link')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'link' ? 'bg-blue-400 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>🔗 Add Link</button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Mask & Annotate</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('whiteout')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'whiteout' ? 'bg-red-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>🧼 Whiteout</button>
            <button onClick={() => setActiveTool('highlight')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'highlight' ? 'bg-yellow-400 text-black shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>🖍️ Highlight</button>
            <button onClick={() => setActiveTool('strikethrough')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'strikethrough' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}><s>S</s> Strikethrough</button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Insert Media & Forms</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('image')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'image' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>🖼️ Add Image</button>
            <button onClick={() => setActiveTool('signature')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'signature' ? 'bg-teal-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>✒️ Upload Signature</button>
            {(activeTool === 'image' || activeTool === 'signature') && (
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => setImageInput(e.target.files?.[0] || null)} className="w-full p-2 border rounded text-xs" />
            )}
            <button onClick={() => setActiveTool('checkbox')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'checkbox' ? 'bg-purple-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>☑️ Add Checkmark</button>
          </div>
        </div>

        <div className="flex-1"></div>

        <button onClick={saveAndDownload} disabled={isProcessing || !file} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md sticky bottom-0 z-10 mt-4">
          {isProcessing ? 'Saving PDF...' : '💾 Save & Download'}
        </button>
      </div>

      {/* MAIN PREVIEW AREA */}
      <div className="w-full md:flex-1 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 flex flex-col h-[90vh]">
        
        {/* TOP PAGINATION BAR */}
        {file && (
          <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mb-4 shadow-sm border border-gray-200">
            <button onClick={() => changePage(-1)} disabled={currentPage === 1} className="px-4 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 font-medium">
              ◀ Previous
            </button>
            <span className="font-bold text-gray-700">Page {currentPage} of {numPages}</span>
            <button onClick={() => changePage(1)} disabled={currentPage === numPages} className="px-4 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 font-medium">
              Next ▶
            </button>
          </div>
        )}

        {/* CANVAS EDITOR */}
        <div className="overflow-auto flex justify-center flex-1 relative select-none bg-gray-200 rounded">
          {!file ? (
            <div className="flex items-center justify-center h-full text-gray-500 font-medium">Upload a PDF to start editing...</div>
          ) : (
            <div 
              className={`relative inline-block m-4 shadow-2xl bg-white ${activeTool !== 'none' ? 'cursor-crosshair' : ''}`}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            >
              <canvas ref={canvasRef} className="pointer-events-none" />
              
              {/* LIVE DRAGGING PREVIEW BOX */}
              {isDragging && dragStart && dragCurrent && (
                <div className="absolute border-2 border-blue-500 border-dashed bg-blue-400 bg-opacity-20 z-40 pointer-events-none"
                  style={{ left: Math.min(dragStart.x, dragCurrent.x), top: Math.min(dragStart.y, dragCurrent.y), width: Math.abs(dragCurrent.x - dragStart.x), height: Math.abs(dragCurrent.y - dragStart.y) }}
                />
              )}

              {/* RENDERED ANNOTATIONS (CURRENT PAGE ONLY) */}
              {currentPageAnnotations.map((anno) => (
                <div key={anno.id} className="absolute pointer-events-none" style={{ left: anno.x, top: anno.y, width: anno.width, height: anno.height }}>
                  {anno.type === 'text' && <span className="absolute top-0 leading-none" style={{ color: anno.color, fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                  {anno.type === 'link' && <span className="underline absolute top-0 leading-none" style={{ color: anno.color || 'blue', fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                  {anno.type === 'whiteout' && <div className="bg-white opacity-100 w-full h-full"></div>}
                  {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50 mix-blend-multiply w-full h-full"></div>}
                  {anno.type === 'strikethrough' && <div className="bg-red-500 w-full absolute top-1/2" style={{ height: '2px' }}></div>}
                  {anno.type === 'checkbox' && <span className="text-black text-xl leading-none absolute -top-1">☑</span>}
                  {(anno.type === 'image' || anno.type === 'signature') && anno.imageUrl && <img src={anno.imageUrl} alt="preview" className="w-full h-full object-fill" />}
                  {anno.type === 'smart-edit' && <span className="bg-white px-1 w-full h-full inline-block overflow-hidden" style={{ color: anno.color, fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                </div>
              ))}

              {/* INTERACTIVE INPUT BOX */}
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