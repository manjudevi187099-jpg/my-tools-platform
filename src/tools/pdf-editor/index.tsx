'use client';
import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ToolType = 'text' | 'smart-edit' | 'whiteout' | 'highlight' | 'strikethrough' | 'image' | 'signature' | 'link' | 'checkbox' | 'none';
type Annotation = { type: ToolType; x: number; y: number; text?: string; width?: number; height?: number; imageUrl?: string; imageFile?: File };

export default function AdvancedPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  const [activeInput, setActiveInput] = useState<{ x: number, y: number, width: number, height: number, text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag & Draw States
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
    renderPdfPreview(selectedFile);
  };

  const renderPdfPreview = async (selectedFile: File) => {
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
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

  // 1. MOUSE DOWN (Start drawing box)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setDragCurrent({ x, y });
    setIsDragging(true);
  };

  // 2. MOUSE MOVE (Dragging box)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragCurrent({ x, y });
  };

  // 3. MOUSE UP (Finish box and place element)
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !dragCurrent) return;
    setIsDragging(false);

    // Calculate exact drawn box dimensions
    const startX = Math.min(dragStart.x, dragCurrent.x);
    const startY = Math.min(dragStart.y, dragCurrent.y);
    let boxWidth = Math.abs(dragCurrent.x - dragStart.x);
    let boxHeight = Math.abs(dragCurrent.y - dragStart.y);

    // Default sizes agar user ne galti se sirf normal click kar diya (bina drag kiye)
    if (boxWidth < 10) boxWidth = activeTool === 'checkbox' ? 20 : 150;
    if (boxHeight < 10) boxHeight = activeTool === 'checkbox' ? 20 : 25;

    if (activeTool === 'smart-edit' || activeTool === 'text' || activeTool === 'link') {
      setActiveInput({ x: startX, y: startY, width: boxWidth, height: boxHeight, text: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (activeTool === 'whiteout') {
      setAnnotations([...annotations, { type: 'whiteout', x: startX, y: startY, width: boxWidth, height: boxHeight }]);
    } else if (activeTool === 'highlight') {
      setAnnotations([...annotations, { type: 'highlight', x: startX, y: startY, width: boxWidth, height: boxHeight }]);
    } else if (activeTool === 'strikethrough') {
      setAnnotations([...annotations, { type: 'strikethrough', x: startX, y: startY, width: boxWidth, height: 2 }]);
    } else if (activeTool === 'checkbox') {
      setAnnotations([...annotations, { type: 'checkbox', x: startX, y: startY, width: 20, height: 20 }]);
    } else if ((activeTool === 'image' || activeTool === 'signature') && imageInput) {
      const imageUrl = URL.createObjectURL(imageInput);
      setAnnotations([...annotations, { type: activeTool, x: startX, y: startY, width: boxWidth, height: boxHeight, imageFile: imageInput, imageUrl }]);
    }

    setDragStart(null);
    setDragCurrent(null);
  };

  const saveActiveInput = () => {
    if (activeInput && activeInput.text.trim() !== '') {
      setAnnotations([...annotations, { 
        type: activeTool, 
        x: activeInput.x, 
        y: activeInput.y, 
        text: activeInput.text,
        width: activeInput.width,
        height: activeInput.height
      }]);
    }
    setActiveInput(null);
  };

  const saveAndDownload = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.getPages()[0]; 
      const { width, height } = page.getSize();

      for (const anno of annotations) {
        const pdfX = (anno.x / pdfDimensions!.w) * width;
        const pdfY = height - ((anno.y / pdfDimensions!.h) * height);
        // Map box dimensions to PDF scale
        const pdfWidth = (anno.width! / pdfDimensions!.w) * width;
        const pdfHeight = (anno.height! / pdfDimensions!.h) * height;

        if (anno.type === 'text') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - 14, size: 14, font, color: rgb(0, 0, 0) });
        } else if (anno.type === 'link') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - 14, size: 14, font, color: rgb(0, 0, 1) });
          // Link underline based on user text length
          const textWidth = font.widthOfTextAtSize(anno.text || '', 14);
          page.drawLine({ start: { x: pdfX, y: pdfY - 16 }, end: { x: pdfX + textWidth, y: pdfY - 16 }, thickness: 1, color: rgb(0, 0, 1) });
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
          let pdfImage = anno.imageFile.type === 'image/png' ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);
          page.drawImage(pdfImage, { x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight });
        } else if (anno.type === 'smart-edit') {
          page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: rgb(1, 1, 1) });
          page.drawText(anno.text || '', { x: pdfX + 2, y: pdfY - 14, size: 14, font, color: rgb(0, 0, 0) });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'perfect-edited-document.pdf';
      a.click();
    } catch (err) {
      console.error(err);
      alert("Error saving PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row gap-6 bg-gray-50 min-h-screen">
      
      {/* SIDEBAR TOOLBAR (MEGA MENU) */}
      <div className="w-full md:w-80 bg-white p-5 rounded-2xl shadow-xl border border-gray-200 h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 sticky top-0 bg-white z-10 pb-2 border-b">Pro PDF Editor</h2>
        
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-6 w-full text-sm border p-2 rounded" />

        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Text Tools (Drag Box to type)</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('smart-edit')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'smart-edit' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              ✏️ Replace Word (Draw Box)
            </button>
            <button onClick={() => setActiveTool('text')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'text' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              📝 Add Text (Draw Box)
            </button>
            <button onClick={() => setActiveTool('link')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'link' ? 'bg-blue-400 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              🔗 Add Blue Link Text
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Mask & Annotate</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('whiteout')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'whiteout' ? 'bg-red-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              🧼 Whiteout (Draw to Erase)
            </button>
            <button onClick={() => setActiveTool('highlight')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'highlight' ? 'bg-yellow-400 text-black shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              🖍️ Highlight (Draw Box)
            </button>
            <button onClick={() => setActiveTool('strikethrough')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'strikethrough' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <s>S</s> Strikethrough Text
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Insert Media</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('image')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'image' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              🖼️ Add Image (Draw Area)
            </button>
            <button onClick={() => setActiveTool('signature')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'signature' ? 'bg-teal-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              ✒️ Upload Signature
            </button>
            {(activeTool === 'image' || activeTool === 'signature') && (
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => setImageInput(e.target.files?.[0] || null)} className="w-full p-2 border rounded text-xs" />
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Forms</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('checkbox')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'checkbox' ? 'bg-purple-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              ☑️ Add Checkmark (Click)
            </button>
          </div>
        </div>

        <button onClick={saveAndDownload} disabled={isProcessing || !file} className="w-full mt-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md sticky bottom-0 z-10">
          {isProcessing ? 'Saving...' : '💾 Save & Download'}
        </button>
      </div>

      {/* CANVAS PREVIEW AREA WITH DRAG FUNCTIONALITY */}
      <div className="w-full md:flex-1 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 overflow-auto flex justify-center h-[90vh] relative select-none">
        {!file ? (
          <div className="flex items-center justify-center h-full text-gray-400">Upload a PDF to start editing...</div>
        ) : (
          <div 
            className={`relative inline-block ${activeTool !== 'none' ? 'cursor-crosshair' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Auto-cancel if cursor leaves canvas
          >
            <canvas ref={canvasRef} className="shadow-md border border-gray-300 pointer-events-none" />
            
            {/* LIVE DRAGGING PREVIEW BOX */}
            {isDragging && dragStart && dragCurrent && (
              <div 
                className="absolute border-2 border-blue-500 border-dashed bg-blue-400 bg-opacity-20 z-40 pointer-events-none"
                style={{
                  left: Math.min(dragStart.x, dragCurrent.x),
                  top: Math.min(dragStart.y, dragCurrent.y),
                  width: Math.abs(dragCurrent.x - dragStart.x),
                  height: Math.abs(dragCurrent.y - dragStart.y),
                }}
              />
            )}

            {/* RENDERED ANNOTATIONS */}
            {annotations.map((anno, idx) => (
              <div key={idx} className="absolute pointer-events-none" style={{ left: anno.x, top: anno.y, width: anno.width, height: anno.height }}>
                {anno.type === 'text' && <span className="text-black font-medium text-[14px] leading-none absolute top-0">{anno.text}</span>}
                {anno.type === 'link' && <span className="text-blue-600 font-medium text-[14px] underline leading-none absolute top-0">{anno.text}</span>}
                {anno.type === 'whiteout' && <div className="bg-white border border-gray-100 shadow-sm opacity-100 w-full h-full"></div>}
                {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50 mix-blend-multiply w-full h-full"></div>}
                {anno.type === 'strikethrough' && <div className="bg-red-500 w-full absolute top-1/2" style={{ height: '2px' }}></div>}
                {anno.type === 'checkbox' && <span className="text-black text-xl leading-none absolute -top-1">☑</span>}
                {(anno.type === 'image' || anno.type === 'signature') && anno.imageUrl && <img src={anno.imageUrl} alt="preview" className="w-full h-full object-fill" />}
                {anno.type === 'smart-edit' && <span className="bg-white text-black font-medium text-[14px] px-1 w-full h-full inline-block overflow-hidden">{anno.text}</span>}
              </div>
            ))}

            {/* INTERACTIVE INPUT BOX (Appears inside the drawn box) */}
            {activeInput && (
              <div className="absolute z-50 flex items-start shadow-lg" style={{ left: activeInput.x, top: activeInput.y, width: activeInput.width, height: activeInput.height }}>
                <textarea
                  ref={inputRef as any} 
                  value={activeInput.text}
                  onChange={(e) => setActiveInput({ ...activeInput, text: e.target.value })}
                  onBlur={saveActiveInput}
                  className="border-2 border-indigo-500 bg-white bg-opacity-90 p-1 m-0 outline-none text-[14px] w-full h-full resize-none"
                  placeholder="Type here..."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}