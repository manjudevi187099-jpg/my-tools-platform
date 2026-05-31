'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ToolType = 'select' | 'text' | 'smart-edit' | 'whiteout' | 'highlight' | 'strikethrough' | 'image' | 'signature' | 'link' | 'checkbox' | 'pen' | 'arrow' | 'circle' | 'none';

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

  // 🌟 ULTRA PRO STATES
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [globalWatermark, setGlobalWatermark] = useState('');
  const [addedBlankPages, setAddedBlankPages] = useState(0);

  // 🌟 NEW BOSS STATES
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [exportRange, setExportRange] = useState(''); // e.g. "1-5"

  const [selectedAnnoId, setSelectedAnnoId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  const [fontSize, setFontSize] = useState(14); 
  const [textColor, setTextColor] = useState('#ef4444'); // Default red for pro shapes

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
    setAnnotations([]); setDeletedPages([]); setPageRotations({});
    setGlobalWatermark(''); setAddedBlankPages(0); setExportRange('');
    setActiveInput(null); setSelectedAnnoId(null); setZoom(1); 
    
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(pdf);
    setNumPages(pdf.numPages);
    setCurrentPage(1);
    renderPage(pdf, 1, 0);
  };

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, rotation: number = 0) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5, rotation }); 
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
      renderPage(pdfDoc, newPage, pageRotations[newPage] || 0);
      setActiveInput(null); setSelectedAnnoId(null);
      window.speechSynthesis.cancel(); setIsSpeaking(false);
    }
  };

  const rotateCurrentPage = () => {
    if (!pdfDoc) return;
    const newRot = ((pageRotations[currentPage] || 0) + 90) % 360;
    setPageRotations(prev => ({ ...prev, [currentPage]: newRot }));
    renderPage(pdfDoc, currentPage, newRot);
  };

  const extractPageText = async () => {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      return text;
    } catch (e) {
      return '';
    }
  };

  const copyTextToClipboard = async () => {
    const text = await extractPageText();
    if (text) {
      navigator.clipboard.writeText(text);
      alert('✅ Text copied to clipboard!');
    }
  };

  // 🌟 NAYA: READ ALOUD (Text to Speech)
  const toggleReadAloud = async () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = await extractPageText();
      if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      } else {
        alert('No text found on this page to read.');
      }
    }
  };

  const togglePageDelete = () => {
    setDeletedPages(prev => prev.includes(currentPage) ? prev.filter(p => p !== currentPage) : [...prev, currentPage]);
  };

  const undoLastAction = () => setAnnotations((prev) => prev.slice(0, -1));
  const clearCurrentPage = () => setAnnotations((prev) => prev.filter((a) => a.page !== currentPage));

  const getMouseCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none' || activeTool === 'select') {
      if (activeTool === 'select' && !draggingAnnoId) setSelectedAnnoId(null); 
      return; 
    }
    const { x, y } = getMouseCoords(e);
    if (activeTool === 'pen') {
      setCurrentPath([{ x, y }]); setIsDragging(true); return;
    }
    setDragStart({ x, y }); setDragCurrent({ x, y }); setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = getMouseCoords(e);
    if (draggingAnnoId && annoDragOffset) {
      setAnnotations(prev => prev.map(a => a.id === draggingAnnoId ? { ...a, x: x - annoDragOffset.x, y: y - annoDragOffset.y } : a));
      return;
    }
    if (!isDragging) return;
    if (activeTool === 'pen') { setCurrentPath((prev) => [...prev, { x, y }]); return; }
    setDragCurrent({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingAnnoId) { setDraggingAnnoId(null); setAnnoDragOffset(null); return; }
    if (!isDragging || !pdfDimensions) return;
    setIsDragging(false);

    if (activeTool === 'pen') {
      if (currentPath.length > 1) {
        setAnnotations([...annotations, {
          id: Date.now().toString(), page: currentPage, type: 'pen',
          x: 0, y: 0, width: 0, height: 0, cWidth: pdfDimensions.w, cHeight: pdfDimensions.h,
          paths: currentPath, color: textColor, fontSize: fontSize 
        }]);
      }
      setCurrentPath([]); return;
    }

    if (!dragStart || !dragCurrent) return;
    const startX = Math.min(dragStart.x, dragCurrent.x);
    const startY = Math.min(dragStart.y, dragCurrent.y);
    let boxWidth = Math.abs(dragCurrent.x - dragStart.x);
    let boxHeight = Math.abs(dragCurrent.y - dragStart.y);

    if (boxWidth < 10 && activeTool !== 'arrow') boxWidth = activeTool === 'checkbox' ? 20 : 150;
    if (boxHeight < 10 && activeTool !== 'arrow') boxHeight = activeTool === 'checkbox' ? 20 : 25;

    const baseAnno = {
      id: Date.now().toString(), page: currentPage, x: startX, y: startY, width: boxWidth, height: boxHeight,
      cWidth: pdfDimensions.w, cHeight: pdfDimensions.h, color: textColor, fontSize: fontSize
    };

    if (activeTool === 'smart-edit' || activeTool === 'text' || activeTool === 'link') {
      setActiveInput({ x: startX, y: startY, width: boxWidth, height: boxHeight, text: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (activeTool === 'image' || activeTool === 'signature') {
      if (imageInput) setAnnotations([...annotations, { ...baseAnno, type: activeTool, imageUrl: URL.createObjectURL(imageInput), imageFile: imageInput }]);
    } else if (activeTool === 'arrow') {
      // For arrow, we save actual start/end coordinates in paths
      setAnnotations([...annotations, { ...baseAnno, type: 'arrow', x: 0, y: 0, width: 0, height: 0, paths: [dragStart, dragCurrent] }]);
    } else {
      setAnnotations([...annotations, { ...baseAnno, type: activeTool }]);
    }
    setDragStart(null); setDragCurrent(null);
  };

  const saveActiveInput = () => {
    if (activeInput && activeInput.text.trim() !== '' && pdfDimensions) {
      setAnnotations([...annotations, { 
        id: Date.now().toString(), page: currentPage, type: activeTool, 
        x: activeInput.x, y: activeInput.y, width: activeInput.width, height: activeInput.height,
        cWidth: pdfDimensions.w, cHeight: pdfDimensions.h, text: activeInput.text, color: textColor, fontSize: fontSize
      }]);
    }
    setActiveInput(null); setActiveTool('select'); 
  };

  const modifyAnnotation = (id: string, action: 'delete' | 'grow' | 'shrink') => {
    if (action === 'delete') {
      setAnnotations(prev => prev.filter(a => a.id !== id)); setSelectedAnnoId(null);
    } else {
      const scale = action === 'grow' ? 1.1 : 0.9;
      setAnnotations(prev => prev.map(a => a.id === id ? { ...a, width: a.width * scale, height: a.height * scale, fontSize: a.fontSize ? a.fontSize * scale : undefined } : a));
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
        if (deletedPages.includes(anno.page)) continue; 
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
            const p1 = anno.paths[i]; const p2 = anno.paths[i+1];
            page.drawLine({
              start: { x: ((p1.x + anno.x) / anno.cWidth) * width, y: height - (((p1.y + anno.y) / anno.cHeight) * height) },
              end: { x: ((p2.x + anno.x) / anno.cWidth) * width, y: height - (((p2.y + anno.y) / anno.cHeight) * height) },
              thickness: annoSize / 3, color: annoColor
            });
          }
        } else if (anno.type === 'arrow' && anno.paths) {
            const p1 = anno.paths[0]; const p2 = anno.paths[1];
            const startX = ((p1.x + anno.x) / anno.cWidth) * width; const startY = height - (((p1.y + anno.y) / anno.cHeight) * height);
            const endX = ((p2.x + anno.x) / anno.cWidth) * width; const endY = height - (((p2.y + anno.y) / anno.cHeight) * height);
            page.drawLine({ start: { x: startX, y: startY }, end: { x: endX, y: endY }, thickness: annoSize / 3, color: annoColor });
            // Arrowhead math for PDF export
            const angle = Math.atan2(endY - startY, endX - startX);
            const headlen = 15;
            page.drawLine({ start: { x: endX, y: endY }, end: { x: endX - headlen * Math.cos(angle - Math.PI / 6), y: endY - headlen * Math.sin(angle - Math.PI / 6) }, thickness: annoSize / 3, color: annoColor });
            page.drawLine({ start: { x: endX, y: endY }, end: { x: endX - headlen * Math.cos(angle + Math.PI / 6), y: endY - headlen * Math.sin(angle + Math.PI / 6) }, thickness: annoSize / 3, color: annoColor });
        } else if (anno.type === 'circle') {
          page.drawEllipse({ x: pdfX + pdfWidth/2, y: pdfY - pdfHeight/2, xScale: pdfWidth/2, yScale: pdfHeight/2, borderColor: annoColor, borderWidth: annoSize/4, color: undefined });
        } else if (anno.type === 'text') { page.drawText(anno.text || '', { x: pdfX, y: pdfY - annoSize, size: annoSize, font, color: annoColor });
        } else if (anno.type === 'link') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - annoSize, size: annoSize, font, color: annoColor });
          const textWidth = font.widthOfTextAtSize(anno.text || '', annoSize);
          page.drawLine({ start: { x: pdfX, y: pdfY - annoSize - 2 }, end: { x: pdfX + textWidth, y: pdfY - annoSize - 2 }, thickness: 1, color: annoColor });
        } else if (anno.type === 'whiteout') { page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: rgb(1, 1, 1) });
        } else if (anno.type === 'highlight') { page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: rgb(1, 1, 0), opacity: 0.4 });
        } else if (anno.type === 'strikethrough') { page.drawLine({ start: { x: pdfX, y: pdfY - (pdfHeight/2) }, end: { x: pdfX + pdfWidth, y: pdfY - (pdfHeight/2) }, thickness: 1.5, color: rgb(1, 0, 0) });
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

      for (const [pageNum, rot] of Object.entries(pageRotations)) {
        if (rot !== 0 && !deletedPages.includes(Number(pageNum))) {
          const p = pdf.getPages()[Number(pageNum) - 1];
          if (p) p.setRotation(degrees(p.getRotation().angle + rot));
        }
      }

      if (globalWatermark.trim() !== '') {
        const watermarkFont = await pdf.embedFont(StandardFonts.HelveticaBold);
        for (let i = 0; i < pdf.getPageCount(); i++) {
          if (deletedPages.includes(i + 1)) continue;
          const p = pdf.getPages()[i];
          const { width, height } = p.getSize();
          p.drawText(globalWatermark, { x: width / 4, y: height / 3, size: 60, font: watermarkFont, color: rgb(0.5, 0.5, 0.5), opacity: 0.3, rotate: degrees(45) });
        }
      }

      for (let i = 0; i < addedBlankPages; i++) pdf.addPage([595.28, 841.89]); 

      const sortedDeletedPages = [...deletedPages].sort((a, b) => b - a);
      for (const pageNum of sortedDeletedPages) pdf.removePage(pageNum - 1);

      // 🌟 NAYA: PDF SPLIT (Export Range)
      let finalPdf = pdf;
      if (exportRange.trim() !== '') {
         const newPdf = await PDFDocument.create();
         const ranges = exportRange.split('-').map(Number);
         if (ranges.length === 2 && ranges[0] > 0 && ranges[1] <= pdf.getPageCount()) {
            const indices = Array.from({length: ranges[1] - ranges[0] + 1}, (_, i) => ranges[0] - 1 + i);
            const copiedPages = await newPdf.copyPages(pdf, indices);
            copiedPages.forEach(p => newPdf.addPage(p));
            finalPdf = newPdf;
         } else {
            alert('Invalid range. Exporting entire document instead.');
         }
      }

      const pdfBytes = await finalPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportRange ? `Split_Pages_${exportRange}.pdf` : 'God-Tier-Edited.pdf';
      a.click();
    } catch (err) {
      console.error(err); alert("Error saving PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPageAnnotations = annotations.filter(a => a.page === currentPage);
  const isPageDeleted = deletedPages.includes(currentPage);

  return (
    // 🌙 NAYA: DARK MODE SUPPORT
    <div className={`max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row gap-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      
      {/* SIDEBAR TOOLBAR */}
      <div className={`w-full md:w-[340px] p-5 rounded-2xl shadow-xl border h-[90vh] overflow-y-auto custom-scrollbar flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex justify-between items-center sticky top-0 z-10 pb-2 border-b mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">ULTIMATE EDITOR</h2>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-2xl hover:scale-110 transition-transform">{isDarkMode ? '☀️' : '🌙'}</button>
        </div>
        
        <input type="file" accept="application/pdf" onChange={handleFileChange} className={`mb-4 w-full text-sm border p-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50'}`} />

        <div className="flex gap-2 mb-4">
          <button onClick={undoLastAction} disabled={annotations.length === 0} className="flex-1 py-2 bg-gray-500 bg-opacity-20 hover:bg-opacity-30 rounded font-bold text-sm transition">↩️ Undo</button>
          <button onClick={clearCurrentPage} disabled={currentPageAnnotations.length === 0} className="flex-1 py-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-500 rounded font-bold text-sm transition">🗑️ Clear</button>
        </div>

        <div className="mb-4">
           <button onClick={() => setActiveTool('select')} className={`w-full p-3 rounded-lg text-center font-bold text-sm transition border-2 ${activeTool === 'select' ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105' : 'bg-transparent text-indigo-500 border-indigo-500 hover:bg-indigo-500 hover:bg-opacity-10'}`}>
             🖱️ Select & Move Elements
           </button>
        </div>

        {/* 🌟 ULTRA PRO FEATURES */}
        <div className={`mb-5 p-4 rounded-xl shadow-inner border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'}`}>
          <h3 className="text-xs font-black text-purple-500 uppercase mb-3">✨ Ultra Pro Features</h3>
          <div className="mb-3">
            <label className="text-xs text-purple-400 font-bold block mb-1">©️ Global Watermark:</label>
            <input type="text" value={globalWatermark} onChange={(e) => setGlobalWatermark(e.target.value)} placeholder="CONFIDENTIAL" className={`w-full p-2 border rounded text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-purple-200'}`} />
          </div>
          <div>
            <label className="text-xs text-purple-400 font-bold block mb-1">📄 Add Blank Pages:</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setAddedBlankPages(Math.max(0, addedBlankPages - 1))} className="px-3 py-1 border rounded font-bold">-</button>
              <span className="font-bold text-sm w-8 text-center">{addedBlankPages}</span>
              <button onClick={() => setAddedBlankPages(addedBlankPages + 1)} className="px-3 py-1 border rounded font-bold">+</button>
            </div>
          </div>
        </div>

        {/* STYLING & TOOLS */}
        {(activeTool === 'text' || activeTool === 'smart-edit' || activeTool === 'link' || activeTool === 'pen' || activeTool === 'arrow' || activeTool === 'circle') && (
          <div className={`mb-4 p-3 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
            <h3 className="text-xs font-bold text-blue-500 uppercase mb-2">Styling</h3>
            <div className="flex gap-3 items-center">
              <div><label className="text-xs text-gray-400 block mb-1">Size/Thick:</label><input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className={`w-16 p-1 border rounded text-sm ${isDarkMode?'bg-gray-800':''}`} min="2" max="72" /></div>
              <div className="flex-1"><label className="text-xs text-gray-400 block mb-1">Color:</label><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 cursor-pointer rounded border-none" /></div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Draw & Annotate</h3>
            <div className="space-y-2">
              {/* 🌟 NAYA: PRO SHAPES */}
              <button onClick={() => setActiveTool('arrow')} className={`w-full p-2.5 rounded text-left font-bold text-sm transition ${activeTool === 'arrow' ? 'bg-red-500 text-white' : 'bg-gray-500 bg-opacity-10'}`}>➡️ Draw Arrow</button>
              <button onClick={() => setActiveTool('circle')} className={`w-full p-2.5 rounded text-left font-bold text-sm transition ${activeTool === 'circle' ? 'bg-green-500 text-white' : 'bg-gray-500 bg-opacity-10'}`}>⭕ Hollow Circle</button>
              <button onClick={() => setActiveTool('pen')} className={`w-full p-2.5 rounded text-left font-bold text-sm transition ${activeTool === 'pen' ? 'bg-pink-600 text-white' : 'bg-gray-500 bg-opacity-10'}`}>✍️ Freehand Draw</button>
              <button onClick={() => setActiveTool('highlight')} className={`w-full p-2.5 rounded text-left font-bold text-sm transition ${activeTool === 'highlight' ? 'bg-yellow-500 text-white' : 'bg-gray-500 bg-opacity-10'}`}>🖍️ Highlight Box</button>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Text & Mask</h3>
            <div className="space-y-2">
              <button onClick={() => setActiveTool('smart-edit')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'smart-edit' ? 'bg-indigo-600 text-white' : 'bg-gray-500 bg-opacity-10'}`}>✏️ Replace Word</button>
              <button onClick={() => setActiveTool('text')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-500 bg-opacity-10'}`}>📝 Add Text</button>
              <button onClick={() => setActiveTool('whiteout')} className={`w-full p-2.5 rounded text-left font-medium text-sm transition ${activeTool === 'whiteout' ? 'bg-red-500 text-white' : 'bg-gray-500 bg-opacity-10'}`}>🧼 Whiteout Erase</button>
            </div>
          </div>
        </div>

        <div className="flex-1"></div>

        {/* 🌟 NAYA: EXPORT RANGE (SPLIT) */}
        <div className={`mt-4 p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
           <label className="text-xs font-bold text-gray-500 block mb-1">✂️ Export Pages Range (e.g. 1-3)</label>
           <input type="text" value={exportRange} onChange={(e) => setExportRange(e.target.value)} placeholder="All Pages" className={`w-full p-2 border rounded text-sm mb-2 ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : ''}`} />
           <button onClick={saveAndDownload} disabled={isProcessing || !file} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-black shadow-lg text-lg">
             {isProcessing ? 'Applying Magic...' : '✨ Export PDF'}
           </button>
        </div>
      </div>

      {/* MAIN PREVIEW AREA */}
      <div className={`w-full md:flex-1 p-4 rounded-2xl shadow-xl border flex flex-col h-[90vh] transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        
        {file && (
          <div className={`flex flex-wrap justify-between items-center p-3 rounded-lg mb-4 shadow-sm border gap-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="font-bold px-2 text-blue-500">➖</button>
                <span className="font-bold text-xs min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="font-bold px-2 text-blue-500">➕</button>
              </div>
              <button onClick={copyTextToClipboard} className={`text-xs px-3 py-1.5 rounded font-bold shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-blue-400' : 'bg-white border-gray-300 text-blue-700'}`}>📋 Copy Text</button>
              {/* 🌟 NAYA: READ ALOUD BUTTON */}
              <button onClick={toggleReadAloud} className={`text-xs px-3 py-1.5 rounded font-bold shadow-sm border transition ${isSpeaking ? 'bg-blue-500 text-white border-blue-600 animate-pulse' : (isDarkMode ? 'bg-gray-800 border-gray-600 text-green-400' : 'bg-white border-gray-300 text-green-600')}`}>
                {isSpeaking ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => changePage(-1)} disabled={currentPage === 1} className={`px-3 py-1 border rounded font-bold text-xs disabled:opacity-40 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>◀ Prev</button>
              <span className="font-bold text-sm px-2">Pg {currentPage} / {numPages}</span>
              <button onClick={() => changePage(1)} disabled={currentPage === numPages} className={`px-3 py-1 border rounded font-bold text-xs disabled:opacity-40 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>Next ▶</button>
              
              <button onClick={rotateCurrentPage} className="ml-2 px-3 py-1.5 rounded font-bold text-xs border shadow-sm bg-blue-500 bg-opacity-20 text-blue-500 border-blue-500 hover:bg-opacity-30">🔄 Rotate</button>
              <button onClick={togglePageDelete} className={`ml-1 px-3 py-1.5 rounded font-bold text-xs border shadow-sm transition ${isPageDeleted ? 'bg-green-500 bg-opacity-20 text-green-500 border-green-500' : 'bg-red-500 bg-opacity-20 text-red-500 border-red-500'}`}>
                {isPageDeleted ? '↩️ Restore' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        )}

        {/* CANVAS EDITOR AREA */}
        <div className={`overflow-auto flex flex-1 relative select-none rounded custom-scrollbar justify-center items-start ${isDarkMode ? 'bg-gray-950' : 'bg-gray-300'}`}>
          {!file ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 font-medium w-full gap-4">
               <span className="text-6xl">🚀</span>
               <p className="text-xl font-bold">Upload a PDF to Unleash God-Tier Editing</p>
            </div>
          ) : (
            <div 
              className={`relative inline-block m-8 shadow-2xl origin-top-left transition-transform duration-200 
                ${activeTool === 'select' ? 'cursor-default' : activeTool === 'none' ? '' : 'cursor-crosshair'}
                ${isDarkMode ? 'filter invert hue-rotate-180 brightness-90' : 'bg-white'}
              `}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            >
              {isPageDeleted && (
                <div className="absolute inset-0 bg-red-900 bg-opacity-70 z-50 flex items-center justify-center pointer-events-none">
                  <h1 className="text-white text-4xl font-black tracking-widest transform rotate-[-30deg] border-4 border-white p-4">DELETED</h1>
                </div>
              )}

              {globalWatermark && !isPageDeleted && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden opacity-20">
                    <h1 className="text-gray-500 font-black tracking-widest transform -rotate-45 whitespace-nowrap" style={{ fontSize: '100px' }}>{globalWatermark}</h1>
                 </div>
              )}

              <canvas ref={canvasRef} className="pointer-events-none" />
              
              {currentPath.length > 0 && (
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-40">
                  <polyline points={currentPath.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={textColor} strokeWidth={fontSize} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}

              {/* 🌟 NAYA: LIVE PREVIEW FOR ARROW AND CIRCLE DURING DRAG */}
              {isDragging && dragStart && dragCurrent && activeTool !== 'pen' && activeTool !== 'select' && (
                <div className="absolute pointer-events-none z-40"
                  style={{ left: Math.min(dragStart.x, dragCurrent.x), top: Math.min(dragStart.y, dragCurrent.y), width: Math.abs(dragCurrent.x - dragStart.x), height: Math.abs(dragCurrent.y - dragStart.y) }}>
                  {activeTool === 'circle' && <div className="w-full h-full rounded-full" style={{ border: `${fontSize/2}px solid ${textColor}` }}></div>}
                  {activeTool === 'arrow' && (
                     <svg className="absolute overflow-visible" style={{ left: dragStart.x < dragCurrent.x ? 0 : dragCurrent.x - dragStart.x, top: dragStart.y < dragCurrent.y ? 0 : dragCurrent.y - dragStart.y, width: Math.abs(dragCurrent.x - dragStart.x), height: Math.abs(dragCurrent.y - dragStart.y) }}>
                        <line x1={0} y1={0} x2={dragCurrent.x - dragStart.x} y2={dragCurrent.y - dragStart.y} stroke={textColor} strokeWidth={fontSize/2} />
                     </svg>
                  )}
                  {(activeTool === 'whiteout' || activeTool === 'highlight' || activeTool === 'smart-edit' || activeTool === 'text') && (
                     <div className="w-full h-full border-2 border-blue-500 border-dashed bg-blue-400 bg-opacity-20" />
                  )}
                </div>
              )}

              {currentPageAnnotations.map((anno) => (
                <div 
                  key={anno.id} 
                  className={`absolute z-30 ${activeTool === 'select' ? 'pointer-events-auto cursor-move hover:ring-2 hover:ring-indigo-400' : 'pointer-events-none'}`} 
                  style={{ left: anno.x, top: anno.y, width: anno.width, height: anno.height }}
                  onMouseDown={(e) => {
                    if (activeTool !== 'select') return;
                    e.stopPropagation(); 
                    const { x, y } = getMouseCoords(e as any);
                    setSelectedAnnoId(anno.id); setDraggingAnnoId(anno.id); setAnnoDragOffset({ x: x - anno.x, y: y - anno.y });
                  }}
                >
                  {selectedAnnoId === anno.id && activeTool === 'select' && (
                    <div className="absolute -top-10 left-0 flex items-center gap-1 bg-gray-800 p-1.5 rounded shadow-xl z-50" onMouseDown={e => e.stopPropagation()}>
                      <button onClick={() => modifyAnnotation(anno.id, 'grow')} className="px-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold">➕ Size</button>
                      <button onClick={() => modifyAnnotation(anno.id, 'shrink')} className="px-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold">➖ Size</button>
                      <button onClick={() => modifyAnnotation(anno.id, 'delete')} className="px-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold">🗑️</button>
                    </div>
                  )}

                  {anno.type === 'pen' && anno.paths && (
                    <svg className="absolute top-0 left-0 overflow-visible" style={{ width: anno.cWidth, height: anno.cHeight }}>
                       <polyline points={anno.paths.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={anno.color} strokeWidth={anno.fontSize} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  
                  {/* 🌟 NAYA: RENDER SHAPES */}
                  {anno.type === 'circle' && <div className="w-full h-full rounded-full absolute top-0 left-0" style={{ border: `${(anno.fontSize||14)/2}px solid ${anno.color}` }}></div>}
                  {anno.type === 'arrow' && anno.paths && (
                    <svg className="absolute overflow-visible" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                        <line x1={0} y1={0} x2={anno.paths[1].x - anno.paths[0].x} y2={anno.paths[1].y - anno.paths[0].y} stroke={anno.color} strokeWidth={(anno.fontSize||14)/2} />
                    </svg>
                  )}

                  {anno.type === 'text' && <span className="absolute top-0 leading-none whitespace-nowrap" style={{ color: anno.color, fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                  {anno.type === 'link' && <span className="underline absolute top-0 leading-none whitespace-nowrap" style={{ color: anno.color || 'blue', fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                  {anno.type === 'whiteout' && <div className={`opacity-100 w-full h-full ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}></div>}
                  {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50 mix-blend-multiply w-full h-full"></div>}
                  {anno.type === 'strikethrough' && <div className="w-full absolute top-1/2" style={{ height: '2px', backgroundColor: '#ef4444' }}></div>}
                  {(anno.type === 'image' || anno.type === 'signature') && anno.imageUrl && <img src={anno.imageUrl} alt="preview" className={`w-full h-full object-fill pointer-events-none ${isDarkMode?'filter invert hue-rotate-180':''}`} />}
                  {anno.type === 'smart-edit' && <span className={`px-1 w-full h-full inline-block overflow-hidden ${isDarkMode ? 'bg-black' : 'bg-white'}`} style={{ color: anno.color, fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                </div>
              ))}

              {activeInput && (
                <div className="absolute z-50 flex items-start shadow-xl" style={{ left: activeInput.x, top: activeInput.y, width: activeInput.width, height: activeInput.height }}>
                  <textarea
                    ref={inputRef} value={activeInput.text}
                    onChange={(e) => setActiveInput({ ...activeInput, text: e.target.value })}
                    onBlur={saveActiveInput}
                    className={`border-2 border-indigo-500 bg-opacity-95 p-1 m-0 outline-none w-full h-full resize-none ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
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