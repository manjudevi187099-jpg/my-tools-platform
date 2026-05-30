'use client';
import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ToolType = 'text' | 'whiteout' | 'highlight' | 'image' | 'none';
type Annotation = { type: ToolType; x: number; y: number; text?: string; width?: number; height?: number; imageFile?: File, imageUrl?: string };

export default function AdvancedPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [textInput, setTextInput] = useState('New Text');
  const [imageInput, setImageInput] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{w: number, h: number} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setAnnotations([]); 
    renderPdfPreview(selectedFile);
  };

  const renderPdfPreview = async (selectedFile: File) => {
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.2 });
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

    if (activeTool === 'text') {
      setAnnotations([...annotations, { type: 'text', x, y, text: textInput }]);
    } else if (activeTool === 'whiteout') {
      setAnnotations([...annotations, { type: 'whiteout', x, y, width: 150, height: 30 }]);
    } else if (activeTool === 'highlight') {
      setAnnotations([...annotations, { type: 'highlight', x, y, width: 150, height: 30 }]);
    } else if (activeTool === 'image' && imageInput) {
      const imageUrl = URL.createObjectURL(imageInput);
      setAnnotations([...annotations, { type: 'image', x, y, width: 100, height: 100, imageFile: imageInput, imageUrl }]);
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
          page.drawText(anno.text || '', { x: pdfX, y: pdfY, size: 16, font: font, color: rgb(0, 0, 0) });
        } else if (anno.type === 'whiteout') {
          page.drawRectangle({ x: pdfX, y: pdfY - 20, width: 150, height: 30, color: rgb(1, 1, 1) });
        } else if (anno.type === 'highlight') {
          page.drawRectangle({ x: pdfX, y: pdfY - 20, width: 150, height: 30, color: rgb(1, 1, 0), opacity: 0.4 });
        } else if (anno.type === 'image' && anno.imageFile) {
          const imgBuffer = await anno.imageFile.arrayBuffer();
          let pdfImage;
          if (anno.imageFile.type === 'image/png') {
            pdfImage = await pdfDoc.embedPng(imgBuffer);
          } else {
            pdfImage = await pdfDoc.embedJpg(imgBuffer);
          }
          // Default size scale, can be improved later
          page.drawImage(pdfImage, { x: pdfX, y: pdfY - 100, width: 100, height: 100 });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pro-edited-document.pdf';
      a.click();
    } catch (err) {
      console.error(err);
      alert("Error saving PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-6 bg-gray-50 min-h-screen">
      {/* SIDEBAR TOOLBAR */}
      <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-xl border border-gray-200 h-fit">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Pro PDF Editor</h2>
        
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-6 w-full text-sm" />

        <div className="space-y-4">
          <button onClick={() => setActiveTool('text')} className={`w-full p-3 rounded text-left font-semibold ${activeTool === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            📝 1. Add Text
          </button>
          {activeTool === 'text' && (
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Type text here..." />
          )}

          <button onClick={() => setActiveTool('whiteout')} className={`w-full p-3 rounded text-left font-semibold ${activeTool === 'whiteout' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>
            🧼 2. Whiteout (Erase)
          </button>

          <button onClick={() => setActiveTool('highlight')} className={`w-full p-3 rounded text-left font-semibold ${activeTool === 'highlight' ? 'bg-yellow-400 text-black' : 'bg-gray-100'}`}>
            🖍️ 3. Highlight Shape
          </button>

          <button onClick={() => setActiveTool('image')} className={`w-full p-3 rounded text-left font-semibold ${activeTool === 'image' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
            🖼️ 4. Add Image / Signature
          </button>
          {activeTool === 'image' && (
            <input type="file" accept="image/png, image/jpeg" onChange={(e) => setImageInput(e.target.files?.[0] || null)} className="w-full p-2 border rounded text-sm" />
          )}
        </div>

        <button onClick={saveAndDownload} disabled={isProcessing || !file} className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md">
          {isProcessing ? 'Saving...' : '💾 Save & Download'}
        </button>
      </div>

      {/* CANVAS PREVIEW AREA */}
      <div className="w-full md:w-3/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 overflow-auto relative flex justify-center">
        {!file ? (
          <div className="flex items-center justify-center h-96 text-gray-400">Upload a PDF to start editing...</div>
        ) : (
          <div className="relative">
            <canvas ref={canvasRef} onClick={handleCanvasClick} className={`border border-gray-300 shadow-sm ${activeTool !== 'none' ? 'cursor-crosshair' : ''}`} />
            
            {annotations.map((anno, idx) => (
              <div key={idx} className="absolute pointer-events-none transform -translate-y-full" style={{ left: anno.x, top: anno.y }}>
                {anno.type === 'text' && <span className="text-black font-bold whitespace-nowrap text-lg">{anno.text}</span>}
                {anno.type === 'whiteout' && <div className="bg-white border border-gray-200 opacity-80" style={{ width: anno.width, height: anno.height }}></div>}
                {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50" style={{ width: anno.width, height: anno.height }}></div>}
                {anno.type === 'image' && anno.imageUrl && <img src={anno.imageUrl} alt="stamp" style={{ width: 100, height: 100, objectFit: 'contain' }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}