'use client';
import React, { useState, useRef } from 'react';
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

export default function ProfessionalPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfPassword, setPdfPassword] = useState<string>(''); // 🌟 NAYA: Password State
  
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [zoom, setZoom] = useState(1);

  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [globalWatermark, setGlobalWatermark] = useState('');
  const [exportRange, setExportRange] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [selectedAnnoId, setSelectedAnnoId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  const [fontSize, setFontSize] = useState(14); 
  const [textColor, setTextColor] = useState('#ef4444');

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
    await loadNewFile(selectedFile);
  };

  // 🌟 FIX: SMART LOADING WITH PASSWORD PROTECTION SUPPORT
  const loadNewFile = async (newFile: File, pwd = '') => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await newFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, password: pwd });
      const pdf = await loadingTask.promise;

      setFile(newFile);
      if (pwd) setPdfPassword(pwd);
      setAnnotations([]); setDeletedPages([]); setPageRotations({});
      setGlobalWatermark(''); setExportRange('');
      setActiveInput(null); setSelectedAnnoId(null); setZoom(1); 

      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      await renderPage(pdf, 1, 0);
    } catch (err: any) {
      if (err.name === 'PasswordException') {
        const userPwd = prompt("🔒 This PDF is Password Protected (e.g. Aadhaar). Enter password to open:");
        if (userPwd) loadNewFile(newFile, userPwd);
      } else {
        alert("Error loading PDF: " + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 🌟 FIX: DYNAMIC SCALING FOR WEIRD PDF SIZES
  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, rotation: number = 0) => {
    try {
      const page = await pdf.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1, rotation });
      
      // Auto-scale huge PDFs to fit standard view (prevents Aadhaar explosion bug)
      const targetBaseWidth = 850;
      let baseScale = unscaledViewport.width > 0 ? targetBaseWidth / unscaledViewport.width : 1.5;
      baseScale = Math.max(0.5, Math.min(baseScale, 2.5)); // Keep it reasonable
      
      const viewport = page.getViewport({ scale: baseScale, rotation }); 
      setPdfDimensions({ w: viewport.width, h: viewport.height });

      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
      }
    } catch (error: any) {
      console.error("Render Error:", error);
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

  // 🌟 FIX: ROBUST BLANK PAGE INJECTION
  const addBlankPageLive = async () => {
    if (!file || !pdfDoc) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer, { password: pdfPassword || undefined });
      doc.addPage([595.28, 841.89]); 
      const pdfBytes = await doc.save();
      
      const newBlob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const newFile = new File([newBlob], file.name, { type: 'application/pdf' });
      
      setFile(newFile);
      setPdfPassword(''); // Once saved, pdf-lib strips the password
      
      const newPdfjs = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      setPdfDoc(newPdfjs);
      setNumPages(newPdfjs.numPages);
      setCurrentPage(newPdfjs.numPages);
      await renderPage(newPdfjs, newPdfjs.numPages, 0);
    } catch (err: any) {
      alert("Could not add blank page: " + err.message);
    }
    setIsProcessing(false);
  };

  const rotateCurrentPage = () => {
    if (!pdfDoc) return;
    const newRot = ((pageRotations[currentPage] || 0) + 90) % 360;
    setPageRotations(prev => ({ ...prev, [currentPage]: newRot }));
    renderPage(pdfDoc, currentPage, newRot);
  };

  const extractPageText = async () => {
    if (!pdfDoc) return '';
    try {
      const page = await pdfDoc.getPage(currentPage);
      const textContent = await page.getTextContent();
      return textContent.items.map((item: any) => item.str).join(' ');
    } catch (e) { return ''; }
  };

  const copyTextToClipboard = async () => {
    const text = await extractPageText();
    if (text) { navigator.clipboard.writeText(text); alert('✅ Text copied!'); }
  };

  const toggleReadAloud = async () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel(); setIsSpeaking(false);
    } else {
      const text = await extractPageText();
      if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      } else { alert('No text found to read.'); }
    }
  };

  const togglePageDelete = () => {
    setDeletedPages(prev => prev.includes(currentPage) ? prev.filter(p => p !== currentPage) : [...prev, currentPage]);
  };

  const undoLastAction = () => setAnnotations((prev) => prev.slice(0, -1));

  // 🌟 FIX: FLAWLESS COORDINATE MATH
  const getMouseCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none' || activeTool === 'select') {
      if (activeTool === 'select' && !draggingAnnoId) setSelectedAnnoId(null); 
      return; 
    }
    const { x, y } = getMouseCoords(e);
    if (activeTool === 'pen') { setCurrentPath([{ x, y }]); setIsDragging(true); return; }
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
        setAnnotations([...annotations, { id: Date.now().toString(), page: currentPage, type: 'pen', x: 0, y: 0, width: 0, height: 0, cWidth: pdfDimensions.w, cHeight: pdfDimensions.h, paths: currentPath, color: textColor, fontSize: fontSize }]);
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

    const baseAnno = { id: Date.now().toString(), page: currentPage, x: startX, y: startY, width: boxWidth, height: boxHeight, cWidth: pdfDimensions.w, cHeight: pdfDimensions.h, color: textColor, fontSize: fontSize };

    if (activeTool === 'smart-edit' || activeTool === 'text' || activeTool === 'link') {
      setActiveInput({ x: startX, y: startY, width: boxWidth, height: boxHeight, text: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (activeTool === 'image' || activeTool === 'signature') {
      if (imageInput) setAnnotations([...annotations, { ...baseAnno, type: activeTool, imageUrl: URL.createObjectURL(imageInput), imageFile: imageInput }]);
    } else if (activeTool === 'arrow') {
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
      // Ensure password is provided to pdf-lib as well
      const pdf = await PDFDocument.load(arrayBuffer, { password: pdfPassword || undefined });
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
            page.drawLine({
              start: { x: ((anno.paths[i].x + anno.x) / anno.cWidth) * width, y: height - (((anno.paths[i].y + anno.y) / anno.cHeight) * height) },
              end: { x: ((anno.paths[i+1].x + anno.x) / anno.cWidth) * width, y: height - (((anno.paths[i+1].y + anno.y) / anno.cHeight) * height) },
              thickness: annoSize / 3, color: annoColor
            });
          }
        } else if (anno.type === 'arrow' && anno.paths) {
            const startX = ((anno.paths[0].x + anno.x) / anno.cWidth) * width; const startY = height - (((anno.paths[0].y + anno.y) / anno.cHeight) * height);
            const endX = ((anno.paths[1].x + anno.x) / anno.cWidth) * width; const endY = height - (((anno.paths[1].y + anno.y) / anno.cHeight) * height);
            page.drawLine({ start: { x: startX, y: startY }, end: { x: endX, y: endY }, thickness: annoSize / 3, color: annoColor });
            const angle = Math.atan2(endY - startY, endX - startX);
            page.drawLine({ start: { x: endX, y: endY }, end: { x: endX - 15 * Math.cos(angle - Math.PI / 6), y: endY - 15 * Math.sin(angle - Math.PI / 6) }, thickness: annoSize / 3, color: annoColor });
            page.drawLine({ start: { x: endX, y: endY }, end: { x: endX - 15 * Math.cos(angle + Math.PI / 6), y: endY - 15 * Math.sin(angle + Math.PI / 6) }, thickness: annoSize / 3, color: annoColor });
        } else if (anno.type === 'circle') {
          page.drawEllipse({ x: pdfX + pdfWidth/2, y: pdfY - pdfHeight/2, xScale: pdfWidth/2, yScale: pdfHeight/2, borderColor: annoColor, borderWidth: annoSize/4, color: undefined });
        } else if (anno.type === 'text') { page.drawText(anno.text || '', { x: pdfX, y: pdfY - annoSize, size: annoSize, font, color: annoColor });
        } else if (anno.type === 'link') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - annoSize, size: annoSize, font, color: annoColor });
          page.drawLine({ start: { x: pdfX, y: pdfY - annoSize - 2 }, end: { x: pdfX + font.widthOfTextAtSize(anno.text || '', annoSize), y: pdfY - annoSize - 2 }, thickness: 1, color: annoColor });
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

      const sortedDeletedPages = [...deletedPages].sort((a, b) => b - a);
      for (const pageNum of sortedDeletedPages) pdf.removePage(pageNum - 1);

      let finalPdf = pdf;
      if (exportRange.trim() !== '') {
         const newPdf = await PDFDocument.create();
         const ranges = exportRange.split('-').map(Number);
         if (ranges.length === 2 && ranges[0] > 0 && ranges[1] <= pdf.getPageCount()) {
            const indices = Array.from({length: ranges[1] - ranges[0] + 1}, (_, i) => ranges[0] - 1 + i);
            const copiedPages = await newPdf.copyPages(pdf, indices);
            copiedPages.forEach(p => newPdf.addPage(p));
            finalPdf = newPdf;
         } else { alert('Invalid range. Exporting entire document instead.'); }
      }

      const pdfBytes = await finalPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportRange ? `Split_Pages_${exportRange}.pdf` : 'Final-Pro-Document.pdf';
      a.click();
    } catch (err) {
      console.error(err); alert("Error saving PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPageAnnotations = annotations.filter(a => a.page === currentPage);
  const isPageDeleted = deletedPages.includes(currentPage);

  // 🌟 THEME CLASSES
  const themeBg = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const themeText = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const panelBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const canvasBg = isDarkMode ? 'bg-slate-950' : 'bg-slate-200';

  return (
    <div className={`flex flex-col min-h-[85vh] h-full w-full font-sans overflow-hidden transition-colors duration-300 rounded-lg shadow-sm border ${themeBg} ${themeText}`}>
      
      {/* 🌟 TOP NAVBAR */}
      <header className={`h-16 border-b flex items-center justify-between px-6 z-20 ${panelBg}`}>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-tight text-blue-600">PRO PDF</h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-xl p-2 hover:bg-slate-500 hover:bg-opacity-20 rounded-full transition-colors">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        {file && (
          <div className="flex items-center gap-4">
             <div className="flex gap-2">
               <button onClick={copyTextToClipboard} className={`px-3 py-1.5 text-xs font-bold rounded-md border ${isDarkMode ? 'border-slate-600 bg-slate-700 hover:bg-slate-600' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>📋 Copy Text</button>
               <button onClick={toggleReadAloud} className={`px-3 py-1.5 text-xs font-bold rounded-md border transition ${isSpeaking ? 'bg-blue-500 text-white border-blue-600 animate-pulse' : (isDarkMode ? 'border-slate-600 bg-slate-700 text-green-400' : 'border-slate-300 bg-white text-green-600')}`}>
                 {isSpeaking ? '⏹️ Stop' : '🔊 Read'}
               </button>
             </div>

             <div className="w-px h-8 bg-slate-300 mx-2"></div>

             <div className="flex items-center gap-2">
                <button onClick={() => changePage(-1)} disabled={currentPage === 1} className={`px-3 py-1.5 border rounded-md font-bold text-sm disabled:opacity-40 transition ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'bg-white hover:bg-blue-50 border-slate-300'}`}>◀ Prev</button>
                <span className="font-bold text-sm px-2">Pg {currentPage} / {numPages}</span>
                <button onClick={() => changePage(1)} disabled={currentPage === numPages} className={`px-3 py-1.5 border rounded-md font-bold text-sm disabled:opacity-40 transition ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'bg-white hover:bg-blue-50 border-slate-300'}`}>Next ▶</button>
             </div>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* 🌟 LEFT SIDEBAR */}
        <aside className={`w-[280px] md:w-[320px] flex flex-col border-r h-full overflow-y-auto custom-scrollbar z-10 ${panelBg}`}>
          <div className="p-5">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Document</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} className={`w-full text-xs border p-2 rounded-md mb-4 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />

            <div className="flex gap-2 mb-6">
              <button onClick={undoLastAction} disabled={annotations.length === 0} className={`flex-1 py-1.5 border rounded-md font-bold text-xs transition disabled:opacity-30 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'hover:bg-slate-100'}`}>↩️ Undo</button>
              <button onClick={addBlankPageLive} disabled={!file} className={`flex-1 py-1.5 border rounded-md font-bold text-xs transition disabled:opacity-30 text-blue-600 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'hover:bg-blue-50'}`}>➕ Page</button>
            </div>

            <div className="space-y-1 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Actions</label>
              <button onClick={() => setActiveTool('select')} className={`w-full p-2.5 rounded-md text-left font-bold text-sm transition flex items-center gap-2 ${activeTool === 'select' ? 'bg-blue-600 text-white shadow' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🖱️ Select & Move</button>
              <button onClick={rotateCurrentPage} disabled={!file} className={`w-full p-2.5 rounded-md text-left font-bold text-sm transition flex items-center gap-2 disabled:opacity-40 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>🔄 Rotate Page</button>
              <button onClick={togglePageDelete} disabled={!file} className={`w-full p-2.5 rounded-md text-left font-bold text-sm transition flex items-center gap-2 disabled:opacity-40 ${isPageDeleted ? 'bg-green-100 text-green-700' : (isDarkMode ? 'hover:bg-red-900 text-red-400' : 'hover:bg-red-50 text-red-600')}`}>{isPageDeleted ? '↩️ Restore Page' : '🗑️ Delete Page'}</button>
            </div>

            {(activeTool === 'text' || activeTool === 'smart-edit' || activeTool === 'link' || activeTool === 'pen' || activeTool === 'arrow' || activeTool === 'circle' || activeTool === 'strikethrough') && (
              <div className={`mb-6 p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Size/Thick</label>
                    <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className={`w-14 p-1 border rounded text-xs ${isDarkMode?'bg-slate-800 border-slate-600':''}`} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Color</label>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-6 cursor-pointer rounded border-none" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Draw & Pro Shapes</label>
              <button onClick={() => setActiveTool('arrow')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'arrow' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>➡️ Draw Arrow</button>
              <button onClick={() => setActiveTool('circle')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'circle' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>⭕ Circle</button>
              <button onClick={() => setActiveTool('pen')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'pen' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>✍️ Freehand Draw</button>
              <button onClick={() => setActiveTool('highlight')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'highlight' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🖍️ Highlight</button>
            </div>

            <div className="space-y-1 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Edit Text & Mask</label>
              <button onClick={() => setActiveTool('text')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'text' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>📝 Add Text</button>
              <button onClick={() => setActiveTool('smart-edit')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'smart-edit' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>✏️ Replace Word</button>
              <button onClick={() => setActiveTool('whiteout')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'whiteout' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🧼 Whiteout</button>
              <button onClick={() => setActiveTool('strikethrough')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'strikethrough' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}><s>S</s> Strikethrough</button>
              <button onClick={() => setActiveTool('link')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'link' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🔗 Add Link</button>
            </div>

            <div className="space-y-1 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Media & Forms</label>
              <button onClick={() => setActiveTool('checkbox')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'checkbox' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>☑️ Add Checkmark</button>
              <button onClick={() => setActiveTool('image')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'image' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🖼️ Insert Image</button>
              <button onClick={() => setActiveTool('signature')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'signature' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>✒️ Signature</button>
              {(activeTool === 'image' || activeTool === 'signature') && (
                <input type="file" accept="image/png, image/jpeg" onChange={(e) => setImageInput(e.target.files?.[0] || null)} className="w-full mt-1 p-1 border rounded text-[10px]" />
              )}
            </div>

            <div className="space-y-1 mb-8">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Advanced Config</label>
              <input type="text" value={globalWatermark} onChange={(e) => setGlobalWatermark(e.target.value)} placeholder="Global Watermark..." className={`w-full mb-2 p-2 text-xs border rounded-md ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />
            </div>

            <div className={`mt-auto p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
               <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">✂️ Export Range (e.g. 1-3)</label>
               <input type="text" value={exportRange} onChange={(e) => setExportRange(e.target.value)} placeholder="All Pages" className={`w-full p-2 border rounded text-xs mb-3 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white'}`} />
               <button onClick={saveAndDownload} disabled={isProcessing || !file} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-md transition-all text-sm">
                 {isProcessing ? 'Applying Magic...' : '✨ Export PDF'}
               </button>
            </div>

          </div>
        </aside>

        {/* 🌟 WORKSPACE (CANVAS AREA) FIX: Strict Dimension Bound Wrapper */}
        <main className={`flex-1 overflow-auto relative ${canvasBg} flex justify-center items-start pt-8 pb-20 custom-scrollbar`}>
          
          {/* Zoom Overlay Control */}
          {file && (
             <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-1 px-3 py-2 rounded-full border shadow-2xl ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
                <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="font-bold text-xl px-2 hover:text-blue-500">➖</button>
                <span className="font-bold text-sm min-w-[50px] text-center select-none">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="font-bold text-xl px-2 hover:text-blue-500">➕</button>
             </div>
          )}

          {!file ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 mt-20">
               <span className="text-5xl">📄</span>
               <p className="text-lg font-bold">Upload a Document to start editing</p>
            </div>
          ) : (
            // 🌟 THE FIX: This wrapper scales dynamically and pushes scrollbars perfectly
            <div 
              className="relative transition-all duration-200"
              style={{
                width: pdfDimensions ? `${pdfDimensions.w * zoom}px` : '100%',
                height: pdfDimensions ? `${pdfDimensions.h * zoom}px` : '100%',
              }}
            >
              <div 
                className={`absolute top-0 left-0 shadow-2xl origin-top-left bg-white
                  ${activeTool === 'select' ? 'cursor-default' : activeTool === 'none' ? '' : 'cursor-crosshair'}
                `}
                style={{ 
                  transform: `scale(${zoom})`, 
                  width: pdfDimensions ? `${pdfDimensions.w}px` : '100%',
                  height: pdfDimensions ? `${pdfDimensions.h}px` : '100%',
                }}
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              >
                {isPageDeleted && (
                  <div className="absolute inset-0 bg-red-900 bg-opacity-80 z-50 flex items-center justify-center pointer-events-none backdrop-blur-sm">
                    <h1 className="text-white text-5xl font-black tracking-widest transform rotate-[-20deg] border-4 border-white p-6">PAGE DELETED</h1>
                  </div>
                )}

                {globalWatermark && !isPageDeleted && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden opacity-10">
                      <h1 className="text-slate-900 font-black tracking-widest transform -rotate-45 whitespace-nowrap" style={{ fontSize: '120px' }}>{globalWatermark}</h1>
                   </div>
                )}

                {/* PDF CANVAS */}
                <canvas ref={canvasRef} className="pointer-events-none block" style={{ width: '100%', height: '100%' }} />
                
                {currentPath.length > 0 && (
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-40">
                    <polyline points={currentPath.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={textColor} strokeWidth={fontSize} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}

                {/* 🌟 ARROW AND CIRCLE LIVE PREVIEW */}
                {isDragging && dragStart && dragCurrent && activeTool !== 'pen' && activeTool !== 'select' && (
                  <div className="absolute pointer-events-none z-40 top-0 left-0 w-full h-full">
                    {activeTool === 'arrow' && (
                      <svg className="w-full h-full overflow-visible">
                        <line x1={dragStart.x} y1={dragStart.y} x2={dragCurrent.x} y2={dragCurrent.y} stroke={textColor} strokeWidth={fontSize/2} />
                      </svg>
                    )}
                    {activeTool === 'circle' && (
                      <div className="absolute rounded-full" style={{ left: Math.min(dragStart.x, dragCurrent.x), top: Math.min(dragStart.y, dragCurrent.y), width: Math.abs(dragCurrent.x - dragStart.x), height: Math.abs(dragCurrent.y - dragStart.y), border: `${fontSize/2}px solid ${textColor}` }}></div>
                    )}
                    {(activeTool === 'whiteout' || activeTool === 'highlight' || activeTool === 'smart-edit' || activeTool === 'text') && (
                      <div className="absolute border-2 border-blue-500 border-dashed bg-blue-500 bg-opacity-20" style={{ left: Math.min(dragStart.x, dragCurrent.x), top: Math.min(dragStart.y, dragCurrent.y), width: Math.abs(dragCurrent.x - dragStart.x), height: Math.abs(dragCurrent.y - dragStart.y) }} />
                    )}
                  </div>
                )}

                {currentPageAnnotations.map((anno) => (
                  <div 
                    key={anno.id} 
                    className={`absolute z-30 ${activeTool === 'select' ? 'pointer-events-auto cursor-move hover:ring-2 hover:ring-blue-500 hover:shadow-lg' : 'pointer-events-none'}`} 
                    style={{ left: anno.x, top: anno.y, width: anno.width, height: anno.height }}
                    onMouseDown={(e) => {
                      if (activeTool !== 'select') return;
                      e.stopPropagation(); 
                      const { x, y } = getMouseCoords(e as any);
                      setSelectedAnnoId(anno.id); setDraggingAnnoId(anno.id); setAnnoDragOffset({ x: x - anno.x, y: y - anno.y });
                    }}
                  >
                    {selectedAnnoId === anno.id && activeTool === 'select' && (
                      <div className="absolute -top-12 left-0 flex items-center gap-1 bg-slate-800 p-1.5 rounded-lg shadow-xl z-50" onMouseDown={e => e.stopPropagation()}>
                        <button onClick={() => modifyAnnotation(anno.id, 'grow')} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold">➕</button>
                        <button onClick={() => modifyAnnotation(anno.id, 'shrink')} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold">➖</button>
                        <button onClick={() => modifyAnnotation(anno.id, 'delete')} className="px-2 py-1 bg-red-500 hover:bg-red-400 text-white rounded text-xs font-bold">🗑️</button>
                      </div>
                    )}

                    {anno.type === 'pen' && anno.paths && (
                      <svg className="absolute top-0 left-0 overflow-visible" style={{ width: anno.cWidth, height: anno.cHeight }}>
                         <polyline points={anno.paths.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={anno.color} strokeWidth={anno.fontSize} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {anno.type === 'circle' && <div className="w-full h-full rounded-full absolute top-0 left-0" style={{ border: `${(anno.fontSize||14)/2}px solid ${anno.color}` }}></div>}
                    {anno.type === 'arrow' && anno.paths && (
                      <svg className="absolute overflow-visible" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                          <line x1={0} y1={0} x2={anno.paths[1].x - anno.paths[0].x} y2={anno.paths[1].y - anno.paths[0].y} stroke={anno.color} strokeWidth={(anno.fontSize||14)/2} />
                      </svg>
                    )}
                    {anno.type === 'text' && <span className="absolute top-0 leading-none whitespace-nowrap" style={{ color: anno.color, fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                    {anno.type === 'link' && <span className="underline absolute top-0 leading-none whitespace-nowrap" style={{ color: anno.color || 'blue', fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                    {anno.type === 'whiteout' && <div className={`opacity-100 w-full h-full bg-white ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} border`}></div>}
                    {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50 mix-blend-multiply w-full h-full"></div>}
                    {anno.type === 'strikethrough' && <div className="w-full absolute top-1/2" style={{ height: '2px', backgroundColor: '#ef4444' }}></div>}
                    {anno.type === 'checkbox' && <span className="text-black text-xl leading-none absolute -top-1">☑</span>}
                    {(anno.type === 'image' || anno.type === 'signature') && anno.imageUrl && <img src={anno.imageUrl} alt="preview" className={`w-full h-full object-fill pointer-events-none`} />}
                    {anno.type === 'smart-edit' && <span className="px-1 w-full h-full inline-block overflow-hidden bg-white text-black" style={{ color: anno.color, fontSize: `${anno.fontSize}px` }}>{anno.text}</span>}
                  </div>
                ))}

                {activeInput && (
                  <div className="absolute z-50 flex items-start shadow-2xl" style={{ left: activeInput.x, top: activeInput.y, width: activeInput.width, height: activeInput.height }}>
                    <textarea
                      ref={inputRef} value={activeInput.text}
                      onChange={(e) => setActiveInput({ ...activeInput, text: e.target.value })}
                      onBlur={saveActiveInput}
                      className="border-2 border-blue-500 p-1 m-0 outline-none w-full h-full resize-none shadow-inner bg-white text-slate-900"
                      style={{ fontSize: `${fontSize}px`, color: textColor }}
                      placeholder="Type..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}