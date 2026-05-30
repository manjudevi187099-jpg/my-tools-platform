'use client';
import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ToolType = 'text' | 'smart-edit' | 'whiteout' | 'highlight' | 'strikethrough' | 'image' | 'signature' | 'link' | 'checkbox' | 'none';
type Annotation = { type: ToolType; x: number; y: number; text?: string; width?: number; height?: number; imageUrl?: string; imageFile?: File };

export default function AdvancedPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;
    
    const canvas = canvasRef.current;
    if (!canvas || !pdfDimensions) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'smart-edit' || activeTool === 'text' || activeTool === 'link') {
      setActiveInput({ x, y, text: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (activeTool === 'whiteout') {
      setAnnotations([...annotations, { type: 'whiteout', x, y, width: 120, height: 20 }]);
    } else if (activeTool === 'highlight') {
      setAnnotations([...annotations, { type: 'highlight', x, y, width: 120, height: 20 }]);
    } else if (activeTool === 'strikethrough') {
      setAnnotations([...annotations, { type: 'strikethrough', x, y, width: 120, height: 2 }]);
    } else if (activeTool === 'checkbox') {
      setAnnotations([...annotations, { type: 'checkbox', x, y, width: 20, height: 20 }]);
    } else if ((activeTool === 'image' || activeTool === 'signature') && imageInput) {
      const imageUrl = URL.createObjectURL(imageInput);
      setAnnotations([...annotations, { type: activeTool, x, y, width: 100, height: activeTool === 'signature' ? 50 : 100, imageFile: imageInput, imageUrl }]);
    }
  };

  const saveActiveInput = () => {
    if (activeInput && activeInput.text.trim() !== '') {
      setAnnotations([...annotations, { 
        type: activeTool, 
        x: activeInput.x, 
        y: activeInput.y, 
        text: activeInput.text,
        width: activeInput.text.length * 8 
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

        if (anno.type === 'text') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY, size: 14, font, color: rgb(0, 0, 0) });
        } else if (anno.type === 'link') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY, size: 14, font, color: rgb(0, 0, 1) });
          page.drawLine({ start: { x: pdfX, y: pdfY - 2 }, end: { x: pdfX + (anno.width || 50), y: pdfY - 2 }, thickness: 1, color: rgb(0, 0, 1) });
        } else if (anno.type === 'whiteout') {
          page.drawRectangle({ x: pdfX, y: pdfY - 15, width: anno.width, height: anno.height, color: rgb(1, 1, 1) });
        } else if (anno.type === 'highlight') {
          page.drawRectangle({ x: pdfX, y: pdfY - 15, width: anno.width, height: anno.height, color: rgb(1, 1, 0), opacity: 0.4 });
        } else if (anno.type === 'strikethrough') {
          page.drawLine({ start: { x: pdfX, y: pdfY + 5 }, end: { x: pdfX + (anno.width || 50), y: pdfY + 5 }, thickness: 1.5, color: rgb(1, 0, 0) });
        } else if (anno.type === 'checkbox') {
          page.drawRectangle({ x: pdfX, y: pdfY - 15, width: 15, height: 15, borderColor: rgb(0, 0, 0), borderWidth: 1 });
          page.drawLine({ start: { x: pdfX + 3, y: pdfY - 10 }, end: { x: pdfX + 7, y: pdfY - 14 }, thickness: 2, color: rgb(0, 0, 0) });
          page.drawLine({ start: { x: pdfX + 7, y: pdfY - 14 }, end: { x: pdfX + 14, y: pdfY - 5 }, thickness: 2, color: rgb(0, 0, 0) });
        } else if ((anno.type === 'image' || anno.type === 'signature') && anno.imageFile) {
          const imgBuffer = await anno.imageFile.arrayBuffer();
          let pdfImage = anno.imageFile.type === 'image/png' ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);
          page.drawImage(pdfImage, { x: pdfX, y: pdfY - (anno.type === 'signature' ? 50 : 100), width: anno.width, height: anno.height });
        } else if (anno.type === 'smart-edit') {
          page.drawRectangle({ x: pdfX - 2, y: pdfY - 16, width: (anno.text?.length || 10) * 8.5 + 10, height: 20, color: rgb(1, 1, 1) });
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - 2, size: 14, font, color: rgb(0, 0, 0) });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mega-edited-document.pdf';
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
        <h2 className="text-2xl font-bold mb-4 text-blue-700 sticky top-0 bg-white z-10 pb-2 border-b">Mega PDF Editor</h2>
        
        <label className="block text-sm font-medium text-gray-700 mb-1">1. Upload Document</label>
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-6 w-full text-sm border p-2 rounded" />

        {/* CATEGORY 1: TEXT TOOLS */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Text Tools</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('smart-edit')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'smart-edit' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              ✏️ Click & Edit Word
            </button>
            <button onClick={() => setActiveTool('text')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'text' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              📝 Add New Text
            </button>
          </div>
        </div>

        {/* CATEGORY 2: MASK & ANNOTATE */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Mask & Annotate</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('whiteout')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'whiteout' ? 'bg-red-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              🧼 Whiteout (Erase)
            </button>
            <button onClick={() => setActiveTool('highlight')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'highlight' ? 'bg-yellow-400 text-black shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              🖍️ Highlight Box
            </button>
            <button onClick={() => setActiveTool('strikethrough')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'strikethrough' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <s>S</s> Strikethrough Text
            </button>
          </div>
        </div>

        {/* CATEGORY 3: INSERT MEDIA */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Insert Media & Links</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('image')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'image' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              🖼️ Add Image
            </button>
            <button onClick={() => setActiveTool('signature')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'signature' ? 'bg-teal-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              ✒️ Upload Signature
            </button>
            {(activeTool === 'image' || activeTool === 'signature') && (
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => setImageInput(e.target.files?.[0] || null)} className="w-full p-2 border rounded text-xs" />
            )}
            <button onClick={() => setActiveTool('link')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'link' ? 'bg-blue-400 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              🔗 Add Blue Link Text
            </button>
          </div>
        </div>

        {/* CATEGORY 4: FORMS */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Forms</h3>
          <div className="space-y-2">
            <button onClick={() => setActiveTool('checkbox')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'checkbox' ? 'bg-purple-500 text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}>
              ☑️ Add Checkmark
            </button>
          </div>
        </div>

        <button onClick={saveAndDownload} disabled={isProcessing || !file} className="w-full mt-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md sticky bottom-0 z-10">
          {isProcessing ? 'Saving...' : '💾 Save & Download'}
        </button>
      </div>

      {/* CANVAS PREVIEW AREA */}
      <div className="w-full md:flex-1 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 overflow-auto relative flex justify-center h-[90vh]">
        {!file ? (
          <div className="flex items-center justify-center h-full text-gray-400">Upload a PDF to start editing...</div>
        ) : (
          <div className="relative inline-block">
            <canvas ref={canvasRef} onClick={handleCanvasClick} className={`shadow-md border border-gray-300 ${activeTool !== 'none' ? 'cursor-crosshair' : ''}`} />
            
            {annotations.map((anno, idx) => (
              <div key={idx} className="absolute pointer-events-none transform -translate-y-full" style={{ left: anno.x, top: anno.y }}>
                {anno.type === 'text' && <span className="text-black font-medium text-[14px]">{anno.text}</span>}
                {anno.type === 'link' && <span className="text-blue-600 font-medium text-[14px] underline">{anno.text}</span>}
                {anno.type === 'whiteout' && <div className="bg-white border border-gray-100 shadow-sm opacity-90" style={{ width: anno.width, height: anno.height }}></div>}
                {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50 mix-blend-multiply" style={{ width: anno.width, height: anno.height }}></div>}
                {anno.type === 'strikethrough' && <div className="bg-red-500 mt-2" style={{ width: anno.width, height: anno.height }}></div>}
                {anno.type === 'checkbox' && <span className="text-black text-xl leading-none">☑</span>}
                {(anno.type === 'image' || anno.type === 'signature') && anno.imageUrl && <img src={anno.imageUrl} alt="preview" style={{ width: anno.width, height: anno.height, objectFit: 'contain' }} />}
                {anno.type === 'smart-edit' && <span className="bg-white text-black font-medium text-[14px] px-1">{anno.text}</span>}
              </div>
            ))}

            {activeInput && (
              <div className="absolute transform -translate-y-full z-50 flex items-center shadow-lg" style={{ left: activeInput.x, top: activeInput.y + 15 }}>
                <input
                  ref={inputRef} type="text" value={activeInput.text}
                  onChange={(e) => setActiveInput({ ...activeInput, text: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && saveActiveInput()} onBlur={saveActiveInput}
                  className="border-2 border-indigo-500 bg-white px-1 py-0 m-0 outline-none text-[14px]"
                  style={{ minWidth: '80px', height: '22px' }} placeholder="Type & Press Enter"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}