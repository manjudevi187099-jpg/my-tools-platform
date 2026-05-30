'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ToolType = 'text' | 'whiteout' | 'highlight' | 'image' | 'smart-edit' | 'none';
type Annotation = { type: ToolType; x: number; y: number; text?: string; width?: number; height?: number; imageUrl?: string; imageFile?: File };

export default function AdvancedPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  // Smart Edit (Click & Type) States
  const [activeInput, setActiveInput] = useState<{ x: number, y: number, text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const viewport = page.getViewport({ scale: 1.3 }); // Zoomed in for better click accuracy
    setPdfDimensions({ w: viewport.width, h: viewport.height });

    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;
    
    const canvas = canvasRef.current;
    if (!canvas || !pdfDimensions) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'smart-edit' || activeTool === 'text') {
      // Jahan click kiya, wahan ek text input box khol do
      setActiveInput({ x, y, text: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (activeTool === 'whiteout') {
      setAnnotations([...annotations, { type: 'whiteout', x, y, width: 120, height: 25 }]);
    } else if (activeTool === 'highlight') {
      setAnnotations([...annotations, { type: 'highlight', x, y, width: 120, height: 25 }]);
    } else if (activeTool === 'image' && imageInput) {
      const imageUrl = URL.createObjectURL(imageInput);
      setAnnotations([...annotations, { type: 'image', x, y, width: 100, height: 100, imageFile: imageInput, imageUrl }]);
    }
  };

  const saveActiveInput = () => {
    if (activeInput && activeInput.text.trim() !== '') {
      // Smart edit mein hum background mein white box lagayenge taaki purana text chup jaye
      setAnnotations([...annotations, { 
        type: activeTool === 'smart-edit' ? 'smart-edit' : 'text', 
        x: activeInput.x, 
        y: activeInput.y, 
        text: activeInput.text,
        width: activeInput.text.length * 10 // Dynamic width estimation
      }]);
    }
    setActiveInput(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveActiveInput();
    }
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

        if (anno.type === 'text') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY, size: 14, font: font, color: rgb(0, 0, 0) });
        } else if (anno.type === 'whiteout') {
          page.drawRectangle({ x: pdfX, y: pdfY - 15, width: anno.width, height: anno.height, color: rgb(1, 1, 1) });
        } else if (anno.type === 'highlight') {
          page.drawRectangle({ x: pdfX, y: pdfY - 15, width: anno.width, height: anno.height, color: rgb(1, 1, 0), opacity: 0.4 });
        } else if (anno.type === 'image' && anno.imageFile) {
          const imgBuffer = await anno.imageFile.arrayBuffer();
          let pdfImage = anno.imageFile.type === 'image/png' ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);
          page.drawImage(pdfImage, { x: pdfX, y: pdfY - 100, width: 100, height: 100 });
        } else if (anno.type === 'smart-edit') {
          // 1. Draw white rectangle to hide OLD text exactly where clicked
          page.drawRectangle({ x: pdfX - 2, y: pdfY - 16, width: (anno.text?.length || 10) * 8.5 + 10, height: 20, color: rgb(1, 1, 1) });
          // 2. Draw NEW text on top of the white rectangle
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - 2, size: 14, font: font, color: rgb(0, 0, 0) });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited-document-final.pdf';
      a.click();
    } catch (err) {
      console.error(err);
      alert("Error saving PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 bg-gray-50 min-h-screen">
      {/* SIDEBAR TOOLBAR */}
      <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-xl border border-gray-200 h-fit">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Pro PDF Editor</h2>
        
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-6 w-full text-sm" />

        <div className="space-y-3">
          
          <button 
            onClick={() => setActiveTool('smart-edit')} 
            className={`w-full p-4 rounded-lg text-left font-bold border-2 transition-all ${activeTool === 'smart-edit' ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg scale-105' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}
          >
            ✏️ Click & Edit Word
          </button>
          {activeTool === 'smart-edit' && (
            <p className="text-xs text-indigo-600 mt-1 mb-4 font-medium px-1">
              Instructions: Click directly on any word in the PDF preview to replace it.
            </p>
          )}

          <hr className="my-4 border-gray-200"/>

          <button onClick={() => setActiveTool('text')} className={`w-full p-3 rounded text-left font-semibold ${activeTool === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            📝 Add New Text
          </button>

          <button onClick={() => setActiveTool('whiteout')} className={`w-full p-3 rounded text-left font-semibold ${activeTool === 'whiteout' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            🧼 Whiteout (Erase)
          </button>

          <button onClick={() => setActiveTool('highlight')} className={`w-full p-3 rounded text-left font-semibold ${activeTool === 'highlight' ? 'bg-yellow-400 text-black' : 'bg-gray-100 hover:bg-gray-200'}`}>
            🖍️ Highlight Box
          </button>
        </div>

        <button onClick={saveAndDownload} disabled={isProcessing || !file} className="w-full mt-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md text-lg">
          {isProcessing ? 'Saving PDF...' : '💾 Save & Download'}
        </button>
      </div>

      {/* CANVAS PREVIEW AREA */}
      <div className="w-full md:w-3/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 overflow-auto relative flex justify-center h-[85vh]">
        {!file ? (
          <div className="flex items-center justify-center h-full text-gray-400">Upload a PDF to start editing...</div>
        ) : (
          <div className="relative inline-block">
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasClick} 
              className={`shadow-md border border-gray-300 ${activeTool !== 'none' ? 'cursor-crosshair' : ''}`} 
            />
            
            {/* RENDER SAVED ANNOTATIONS */}
            {annotations.map((anno, idx) => (
              <div key={idx} className="absolute pointer-events-none transform -translate-y-full" style={{ left: anno.x, top: anno.y }}>
                {anno.type === 'text' && <span className="text-black font-medium text-[14px]" style={{ fontFamily: 'Helvetica' }}>{anno.text}</span>}
                {anno.type === 'whiteout' && <div className="bg-white border border-gray-100 shadow-sm opacity-90" style={{ width: anno.width, height: anno.height }}></div>}
                {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50 mix-blend-multiply" style={{ width: anno.width, height: anno.height }}></div>}
                {anno.type === 'smart-edit' && (
                  <span className="bg-white text-black font-medium text-[14px] px-1" style={{ fontFamily: 'Helvetica' }}>
                    {anno.text}
                  </span>
                )}
              </div>
            ))}

            {/* INTERACTIVE INPUT BOX (When user clicks) */}
            {activeInput && (
              <div 
                className="absolute transform -translate-y-full z-50 flex items-center shadow-lg" 
                style={{ left: activeInput.x, top: activeInput.y + 15 }} // Adjusted for font baseline
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={activeInput.text}
                  onChange={(e) => setActiveInput({ ...activeInput, text: e.target.value })}
                  onKeyDown={handleInputKeyDown}
                  onBlur={saveActiveInput}
                  className={`border-2 ${activeTool === 'smart-edit' ? 'border-indigo-500 bg-white' : 'border-blue-500 bg-transparent'} px-1 py-0 m-0 outline-none text-[14px]`}
                  style={{ minWidth: '80px', height: '22px', fontFamily: 'Helvetica' }}
                  placeholder="Type & Press Enter"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}