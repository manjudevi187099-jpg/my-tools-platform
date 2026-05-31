'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ToolType = 'select' | 'text' | 'smart-edit' | 'whiteout' | 'redact' | 'highlight' | 'strikethrough' | 'image' | 'signature' | 'link' | 'checkbox' | 'pen' | 'arrow' | 'circle' | 'none';

type Annotation = { 
  id: string; page: number; type: ToolType; 
  x: number; y: number; width: number; height: number; 
  cWidth: number; cHeight: number; 
  text?: string; imageUrl?: string; imageFile?: File;
  color?: string; fontSize?: number;
  fontFamily?: string; bgColor?: string; checkboxStyle?: string; // 🌟 PRO ADDITIONS
  paths?: {x: number, y: number}[]; 
};

const hexToRgbPdf = (hex: string) => {
  if (!hex) return rgb(0,0,0);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

export default function ProfessionalPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfPassword, setPdfPassword] = useState<string>('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [zoom, setZoom] = useState(1);

  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  
  const [globalWatermark, setGlobalWatermark] = useState('');
  const [exportRange, setExportRange] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [addPageNumbers, setAddPageNumbers] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [selectedAnnoId, setSelectedAnnoId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  // 🌟 NAYA: PROFESSIONAL STYLING STATES
  const [fontSize, setFontSize] = useState(14); 
  const [textColor, setTextColor] = useState('#ef4444');
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [smartBgColor, setSmartBgColor] = useState('#ffffff');
  const [checkboxStyle, setCheckboxStyle] = useState('check');

  const [pdfDimensions, setPdfDimensions] = useState<Record<number, {w: number, h: number}>>({});
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  
  const [actionPage, setActionPage] = useState<number | null>(null); 
  const [activeInput, setActiveInput] = useState<{ page: number, x: number, y: number, width: number, height: number, text: string } | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);

  const [draggingAnnoId, setDraggingAnnoId] = useState<string | null>(null);
  const [annoDragOffset, setAnnoDragOffset] = useState<{x: number, y: number} | null>(null);

  const [imageInput, setImageInput] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnoId && activeTool === 'select' && !activeInput) {
        setAnnotations(prev => prev.filter(a => a.id !== selectedAnnoId));
        setSelectedAnnoId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !activeInput) {
        e.preventDefault();
        setAnnotations(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnoId, activeTool, activeInput]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await loadNewFile(selectedFile);
  };

  const loadNewFile = async (newFile: File, pwd = '') => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await newFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, password: pwd });
      const pdf = await loadingTask.promise;

      setFile(newFile);
      if (pwd) setPdfPassword(pwd);
      
      setAnnotations([]); setDeletedPages([]); setPageRotations({});
      setGlobalWatermark(''); setExportRange(''); setMetaTitle(''); setMetaAuthor(''); setAddPageNumbers(false);
      setActiveInput(null); setSelectedAnnoId(null); setZoom(1); 

      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      await renderAllPages(pdf, {});
    } catch (err: any) {
      if (err.name === 'PasswordException') {
        const userPwd = prompt("🔒 This PDF is Password Protected. Enter password to open:");
        if (userPwd) loadNewFile(newFile, userPwd);
      } else {
        alert("Error loading PDF: " + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMergeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const mergeFile = e.target.files?.[0];
    if (!mergeFile || !file) return;
    setIsProcessing(true);
    try {
       const currentBuffer = await file.arrayBuffer();
       const newBuffer = await mergeFile.arrayBuffer();
       const doc1 = await PDFDocument.load(currentBuffer, { password: pdfPassword || undefined });
       const doc2 = await PDFDocument.load(newBuffer);
       
       const copiedPages = await doc1.copyPages(doc2, doc2.getPageIndices());
       copiedPages.forEach((p) => doc1.addPage(p));
       
       const mergedBytes = await doc1.save();
       const mergedBlob = new Blob([new Uint8Array(mergedBytes as any)], { type: 'application/pdf' });
       const mergedFileObj = new File([mergedBlob], file.name.replace('.pdf', '_Merged.pdf'), { type: 'application/pdf' });
       
       const newPdfjs = await pdfjsLib.getDocument({ data: mergedBytes.slice(0) }).promise;
       setFile(mergedFileObj);
       setPdfDoc(newPdfjs);
       setNumPages(newPdfjs.numPages);
       await renderAllPages(newPdfjs, pageRotations);
       alert("✅ PDF Merged Successfully!");
       if (mergeInputRef.current) mergeInputRef.current.value = '';
    } catch (err: any) {
       alert("Error merging PDF: " + err.message);
    }
    setIsProcessing(false);
  };

  const renderAllPages = async (pdf: pdfjsLib.PDFDocumentProxy, rotations: Record<number, number>) => {
    const dims: Record<number, {w: number, h: number, pageObj: any, renderVp: any}> = {};
    const RESOLUTION_MULTIPLIER = 3; 
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const rot = rotations[i] || 0;
        const unscaled = page.getViewport({ scale: 1, rotation: rot });
        const isLandscape = unscaled.width > unscaled.height;
        const targetW = isLandscape ? 850 : 700; 
        
        let baseScale = targetW / unscaled.width;
        baseScale = Math.max(0.4, Math.min(baseScale, 2.5)); 
        
        const cssVp = page.getViewport({ scale: baseScale, rotation: rot }); 
        const renderVp = page.getViewport({ scale: baseScale * RESOLUTION_MULTIPLIER, rotation: rot }); 
        
        dims[i] = { w: cssVp.width, h: cssVp.height, pageObj: page, renderVp };
    }
    setPdfDimensions(dims);

    setTimeout(async () => {
        for (let i = 1; i <= pdf.numPages; i++) {
            const canvas = canvasRefs.current[i];
            const data = dims[i];
            if (canvas && data) {
                canvas.width = data.renderVp.width;
                canvas.height = data.renderVp.height;
                const ctx = canvas.getContext('2d');
                if (ctx) await data.pageObj.render({ canvasContext: ctx, viewport: data.renderVp }).promise;
            }
        }
    }, 150);
  };

  const changePage = (offset: number) => {
    const newPage = currentPage + offset;
    if (newPage >= 1 && newPage <= numPages) {
       document.getElementById(`pdf-page-${newPage}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
     let closestPage = 1;
     let minDistance = Infinity;
     for (let i = 1; i <= numPages; i++) {
        if (deletedPages.includes(i)) continue;
        const el = document.getElementById(`pdf-page-${i}`);
        if (el) {
           const rect = el.getBoundingClientRect();
           const distance = Math.abs(rect.top - 100); 
           if (distance < minDistance) {
              minDistance = distance;
              closestPage = i;
           }
        }
     }
     if (currentPage !== closestPage) setCurrentPage(closestPage);
  };

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
      setPdfPassword('');
      const newPdfjs = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      setPdfDoc(newPdfjs);
      setNumPages(newPdfjs.numPages);
      await renderAllPages(newPdfjs, pageRotations);
      setTimeout(() => document.getElementById(`pdf-page-${newPdfjs.numPages}`)?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err: any) {
      alert("Could not add blank page.");
    }
    setIsProcessing(false);
  };

  const rotateCurrentPage = () => {
    if (!pdfDoc) return;
    const newRot = ((pageRotations[currentPage] || 0) + 90) % 360;
    const newRotations = { ...pageRotations, [currentPage]: newRot };
    setPageRotations(newRotations);
    renderAllPages(pdfDoc, newRotations);
  };

  const togglePageDelete = () => {
    setDeletedPages(prev => prev.includes(currentPage) ? prev.filter(p => p !== currentPage) : [...prev, currentPage]);
  };

  const undoLastAction = () => setAnnotations((prev) => prev.slice(0, -1));

  const clearCurrentPageEdits = () => {
    setAnnotations(prev => prev.filter(a => a.page !== currentPage));
  };

  const getMouseCoords = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {
    const canvas = canvasRefs.current[pageNum];
    if (!canvas || !pdfDimensions[pageNum]) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.clientWidth / rect.width; 
    const scaleY = canvas.clientHeight / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {
    if (activeTool === 'none' || activeTool === 'select') {
      if (activeTool === 'select' && !draggingAnnoId) setSelectedAnnoId(null); 
      return; 
    }
    setActionPage(pageNum);
    const { x, y } = getMouseCoords(e, pageNum);
    if (activeTool === 'pen') { setCurrentPath([{ x, y }]); setIsDragging(true); return; }
    setDragStart({ x, y }); setDragCurrent({ x, y }); setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {
    const { x, y } = getMouseCoords(e, pageNum);
    if (draggingAnnoId && annoDragOffset) {
      setAnnotations(prev => prev.map(a => a.id === draggingAnnoId ? { ...a, x: x - annoDragOffset.x, y: y - annoDragOffset.y } : a));
      return;
    }
    if (!isDragging || actionPage !== pageNum) return;
    if (activeTool === 'pen') { setCurrentPath((prev) => [...prev, { x, y }]); return; }
    setDragCurrent({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {
    if (draggingAnnoId) { setDraggingAnnoId(null); setAnnoDragOffset(null); return; }
    if (!isDragging || !pdfDimensions[pageNum] || actionPage !== pageNum) return;
    setIsDragging(false);

    const dims = pdfDimensions[pageNum];

    if (activeTool === 'pen') {
      if (currentPath.length > 1) {
        setAnnotations([...annotations, { id: Date.now().toString(), page: pageNum, type: 'pen', x: 0, y: 0, width: 0, height: 0, cWidth: dims.w, cHeight: dims.h, paths: currentPath, color: textColor, fontSize: fontSize }]);
      }
      setCurrentPath([]); setActionPage(null); return;
    }

    if (!dragStart || !dragCurrent) return;
    const startX = Math.min(dragStart.x, dragCurrent.x);
    const startY = Math.min(dragStart.y, dragCurrent.y);
    let boxWidth = Math.abs(dragCurrent.x - dragStart.x);
    let boxHeight = Math.abs(dragCurrent.y - dragStart.y);

    if (boxWidth < 10 && activeTool !== 'arrow') boxWidth = activeTool === 'checkbox' ? 20 : 150;
    if (boxHeight < 10 && activeTool !== 'arrow') boxHeight = activeTool === 'checkbox' ? 20 : 25;

    const baseAnno: Annotation = { 
      id: Date.now().toString(), page: pageNum, type: activeTool, x: startX, y: startY, width: boxWidth, height: boxHeight, 
      cWidth: dims.w, cHeight: dims.h, color: textColor, fontSize: fontSize, fontFamily: fontFamily, bgColor: smartBgColor, checkboxStyle: checkboxStyle 
    };

    if (activeTool === 'smart-edit' || activeTool === 'text' || activeTool === 'link') {
      setActiveInput({ page: pageNum, x: startX, y: startY, width: boxWidth, height: boxHeight, text: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (activeTool === 'image' || activeTool === 'signature') {
      if (imageInput) setAnnotations([...annotations, { ...baseAnno, type: activeTool, imageUrl: URL.createObjectURL(imageInput), imageFile: imageInput }]);
    } else if (activeTool === 'arrow') {
      setAnnotations([...annotations, { ...baseAnno, type: 'arrow', x: 0, y: 0, width: 0, height: 0, paths: [dragStart, dragCurrent] }]);
    } else {
      setAnnotations([...annotations, baseAnno]);
    }
    setDragStart(null); setDragCurrent(null); setActionPage(null);
  };

  const saveActiveInput = () => {
    if (activeInput && activeInput.text.trim() !== '' && pdfDimensions[activeInput.page]) {
      const dims = pdfDimensions[activeInput.page];
      setAnnotations([...annotations, { 
        id: Date.now().toString(), page: activeInput.page, type: activeTool, 
        x: activeInput.x, y: activeInput.y, width: activeInput.width, height: activeInput.height,
        cWidth: dims.w, cHeight: dims.h, text: activeInput.text, color: textColor, fontSize: fontSize, fontFamily: fontFamily, bgColor: smartBgColor
      }]);
    }
    setActiveInput(null); setActiveTool('select'); 
  };

  // 🌟 NAYA: LIVE UPDATE ANY SELECTED ELEMENT
  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const modifyAnnotation = (id: string, action: 'delete' | 'grow' | 'shrink') => {
    if (action === 'delete') {
      setAnnotations(prev => prev.filter(a => a.id !== id)); setSelectedAnnoId(null);
    } else {
      const scale = action === 'grow' ? 1.1 : 0.9;
      setAnnotations(prev => prev.map(a => a.id === id ? { ...a, width: a.width * scale, height: a.height * scale, fontSize: a.fontSize ? a.fontSize * scale : undefined } : a));
    }
  };

  const saveAndDownload = async (rangeOverride?: string) => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { password: pdfPassword || undefined });
      
      const helveticaFont = await pdf.embedFont(StandardFonts.Helvetica);
      const timesFont = await pdf.embedFont(StandardFonts.TimesRoman);
      const courierFont = await pdf.embedFont(StandardFonts.Courier);

      const getFont = (family?: string) => {
         if (family === 'TimesRoman') return timesFont;
         if (family === 'Courier') return courierFont;
         return helveticaFont;
      };
      
      if (metaTitle) pdf.setTitle(metaTitle);
      if (metaAuthor) pdf.setAuthor(metaAuthor);

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
        const textFont = getFont(anno.fontFamily);

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
        } else if (anno.type === 'text') { page.drawText(anno.text || '', { x: pdfX, y: pdfY - annoSize, size: annoSize, font: textFont, color: annoColor });
        } else if (anno.type === 'link') {
          page.drawText(anno.text || '', { x: pdfX, y: pdfY - annoSize, size: annoSize, font: textFont, color: annoColor });
          page.drawLine({ start: { x: pdfX, y: pdfY - annoSize - 2 }, end: { x: pdfX + textFont.widthOfTextAtSize(anno.text || '', annoSize), y: pdfY - annoSize - 2 }, thickness: 1, color: annoColor });
        } else if (anno.type === 'whiteout') { 
          page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: hexToRgbPdf(anno.bgColor || '#ffffff') });
        } else if (anno.type === 'redact') { page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: rgb(0, 0, 0) });
        } else if (anno.type === 'highlight') { page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: rgb(1, 1, 0), opacity: 0.4 });
        } else if (anno.type === 'strikethrough') { page.drawLine({ start: { x: pdfX, y: pdfY - (pdfHeight/2) }, end: { x: pdfX + pdfWidth, y: pdfY - (pdfHeight/2) }, thickness: 1.5, color: rgb(1, 0, 0) });
        } else if (anno.type === 'checkbox') {
          // 🌟 NAYA: EXPORTING CHECKBOX STYLES
          if (anno.checkboxStyle === 'fill') {
             page.drawRectangle({ x: pdfX, y: pdfY - 15, width: 15 * (pdfWidth/20), height: 15 * (pdfHeight/20), color: annoColor });
          } else {
             page.drawRectangle({ x: pdfX, y: pdfY - 15, width: 15 * (pdfWidth/20), height: 15 * (pdfHeight/20), borderColor: annoColor, borderWidth: 1.5 });
             if (anno.checkboxStyle === 'check') {
                page.drawLine({ start: { x: pdfX + 3, y: pdfY - 10 }, end: { x: pdfX + 7, y: pdfY - 14 }, thickness: 2, color: annoColor });
                page.drawLine({ start: { x: pdfX + 7, y: pdfY - 14 }, end: { x: pdfX + 14, y: pdfY - 5 }, thickness: 2, color: annoColor });
             } else if (anno.checkboxStyle === 'cross') {
                page.drawLine({ start: { x: pdfX + 2, y: pdfY - 13 }, end: { x: pdfX + 13, y: pdfY - 2 }, thickness: 2, color: annoColor });
                page.drawLine({ start: { x: pdfX + 2, y: pdfY - 2 }, end: { x: pdfX + 13, y: pdfY - 13 }, thickness: 2, color: annoColor });
             }
          }
        } else if ((anno.type === 'image' || anno.type === 'signature') && anno.imageFile) {
          const imgBuffer = await anno.imageFile.arrayBuffer();
          let pdfImage = anno.imageFile.type === 'image/png' ? await pdf.embedPng(imgBuffer) : await pdf.embedJpg(imgBuffer);
          page.drawImage(pdfImage, { x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight });
        } else if (anno.type === 'smart-edit') {
          // 🌟 NAYA: EXPORTING SMART-EDIT WITH BG COLOR
          const bgRgb = anno.bgColor ? hexToRgbPdf(anno.bgColor) : rgb(1,1,1);
          page.drawRectangle({ x: pdfX, y: pdfY - pdfHeight, width: pdfWidth, height: pdfHeight, color: bgRgb });
          page.drawText(anno.text || '', { x: pdfX + 2, y: pdfY - annoSize, size: annoSize, font: textFont, color: annoColor });
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
      const finalRange = rangeOverride || exportRange; 
      if (finalRange.trim() !== '') {
         const newPdf = await PDFDocument.create();
         const ranges = finalRange.split('-').map(Number);
         if (ranges.length === 2 && ranges[0] > 0 && ranges[1] <= pdf.getPageCount()) {
            const indices = Array.from({length: ranges[1] - ranges[0] + 1}, (_, i) => ranges[0] - 1 + i);
            const copiedPages = await newPdf.copyPages(pdf, indices);
            copiedPages.forEach(p => newPdf.addPage(p));
            finalPdf = newPdf;
         } else { alert('Invalid range. Exporting entire document instead.'); }
      }

      if (addPageNumbers) {
         const pages = finalPdf.getPages();
         for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            const { width } = p.getSize();
            const text = `Page ${i + 1} of ${pages.length}`;
            const textWidth = helveticaFont.widthOfTextAtSize(text, 10);
            p.drawText(text, { x: (width / 2) - (textWidth / 2), y: 15, size: 10, font: helveticaFont, color: rgb(0,0,0) });
         }
      }

      const pdfBytes = await finalPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const originalName = file.name.replace('.pdf', '');
      a.download = finalRange ? `${originalName}_Pages_${finalRange}.pdf` : `${originalName}_Pro_Edited.pdf`;
      a.click();
    } catch (err) {
      console.error(err); alert("Error saving PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const themeText = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const panelBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  
  const visiblePages = Array.from({length: numPages}, (_, i) => i + 1).filter(p => !deletedPages.includes(p));

  return (
    <div className={`max-w-[1350px] mx-auto my-6 flex flex-col h-[88vh] font-sans overflow-hidden transition-colors duration-300 rounded-2xl shadow-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'} ${themeText}`}>
      
      {/* 🌟 TOP NAVBAR */}
      <header className={`h-16 border-b flex items-center justify-between px-6 z-20 shrink-0 ${panelBg}`}>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight text-blue-600">PRO PDF</h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-xl p-2 hover:bg-slate-500 hover:bg-opacity-20 rounded-full transition-colors">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        {file && (
          <div className="flex items-center gap-4">
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
        <aside className={`w-[280px] md:w-[320px] flex flex-col border-r h-full overflow-y-auto custom-scrollbar z-10 shrink-0 ${panelBg}`}>
          <div className="p-5">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Document</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} className={`w-full text-xs border p-2 rounded-md mb-4 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} />

            <div className="flex gap-2 mb-6">
              <label className={`flex-1 py-1.5 border rounded-md font-bold text-xs text-center cursor-pointer transition ${isDarkMode ? 'border-indigo-600 text-indigo-400 hover:bg-slate-700' : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'}`}>
                📑 Merge PDF
                <input type="file" accept="application/pdf" ref={mergeInputRef} onChange={handleMergeFile} className="hidden" />
              </label>
              <button onClick={addBlankPageLive} disabled={!file} className={`flex-1 py-1.5 border rounded-md font-bold text-xs transition disabled:opacity-30 text-blue-600 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'hover:bg-blue-50'}`}>➕ Blank Page</button>
            </div>

            <div className="space-y-1 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Page Actions</label>
              <button onClick={() => setActiveTool('select')} className={`w-full p-2.5 rounded-md text-left font-bold text-sm transition flex items-center gap-2 ${activeTool === 'select' ? 'bg-blue-600 text-white shadow' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🖱️ Select & Move</button>
              <button onClick={rotateCurrentPage} disabled={!file} className={`w-full p-2.5 rounded-md text-left font-bold text-sm transition flex items-center gap-2 disabled:opacity-40 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>🔄 Rotate Curr Page</button>
              <button onClick={togglePageDelete} disabled={!file} className={`w-full p-2.5 rounded-md text-left font-bold text-sm transition flex items-center gap-2 disabled:opacity-40 hover:bg-red-50 text-red-600`}>🗑️ Delete Curr Page</button>
              
              <button onClick={() => saveAndDownload(`${currentPage}-${currentPage}`)} disabled={!file} className={`w-full p-2.5 rounded-md text-left font-bold text-sm transition flex items-center gap-2 disabled:opacity-40 hover:bg-green-50 text-green-700`}>📥 Export Curr Page</button>
              <button onClick={clearCurrentPageEdits} disabled={!file} className={`w-full p-2.5 rounded-md text-left font-bold text-sm transition flex items-center gap-2 disabled:opacity-40 hover:bg-orange-50 text-orange-600`}>🧹 Clear Page Edits</button>
            </div>

            {/* 🌟 NAYA: ENHANCED PRO STYLING CONTROLS */}
            {(activeTool === 'text' || activeTool === 'smart-edit' || activeTool === 'link' || activeTool === 'pen' || activeTool === 'arrow' || activeTool === 'circle' || activeTool === 'strikethrough') && (
              <div className={`mb-6 p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-blue-50 border-blue-200'}`}>
                <label className="text-[10px] font-black text-blue-500 uppercase mb-3 block">🎨 PRO Styling</label>
                <div className="flex gap-3 mb-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Size/Thick</label>
                    <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className={`w-14 p-1 border rounded text-xs ${isDarkMode?'bg-slate-800 border-slate-600':''}`} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Main Color</label>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-6 cursor-pointer rounded border-none" />
                  </div>
                </div>

                {/* Font Family Selection */}
                {(activeTool === 'text' || activeTool === 'smart-edit' || activeTool === 'link') && (
                  <div className="mb-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Font Style</label>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={`w-full p-1 text-xs border rounded ${isDarkMode?'bg-slate-800 border-slate-600':''}`}>
                       <option value="Helvetica">Modern (Helvetica)</option>
                       <option value="TimesRoman">Formal (Times Roman)</option>
                       <option value="Courier">Typewriter (Courier)</option>
                    </select>
                  </div>
                )}

                {/* Smart Edit Background Matching */}
                {(activeTool === 'smart-edit' || activeTool === 'whiteout') && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Match Paper Background</label>
                    <input type="color" value={smartBgColor} onChange={(e) => setSmartBgColor(e.target.value)} className="w-full h-6 cursor-pointer rounded border-none" />
                  </div>
                )}
              </div>
            )}

            {/* 🌟 NAYA: ENHANCED CHECKBOX CONTROLS */}
            {activeTool === 'checkbox' && (
               <div className={`mb-6 p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-blue-50 border-blue-200'}`}>
                 <label className="text-[10px] font-black text-blue-500 uppercase mb-3 block">☑️ Checkbox Style</label>
                 <select value={checkboxStyle} onChange={e => setCheckboxStyle(e.target.value)} className={`w-full p-2 text-xs border rounded ${isDarkMode?'bg-slate-800 border-slate-600':''}`}>
                   <option value="check">✔ Checkmark (Tick)</option>
                   <option value="cross">✖ Cross Mark</option>
                   <option value="fill">■ Filled Square</option>
                   <option value="empty">□ Empty Square</option>
                 </select>
                 <label className="text-[10px] font-bold text-slate-500 block mt-2 mb-1">Color</label>
                 <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-6 cursor-pointer rounded border-none" />
               </div>
            )}

            <div className="space-y-1 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Edit Text & Mask</label>
              <button onClick={() => setActiveTool('text')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'text' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>📝 Add Text</button>
              <button onClick={() => setActiveTool('smart-edit')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'smart-edit' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>✏️ Replace Word</button>
              <button onClick={() => setActiveTool('whiteout')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'whiteout' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🧼 Whiteout</button>
              <button onClick={() => setActiveTool('redact')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'redact' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>⬛ Blackout (Redact)</button>
              <button onClick={() => setActiveTool('strikethrough')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'strikethrough' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}><s>S</s> Strikethrough</button>
              <button onClick={() => setActiveTool('link')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'link' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🔗 Add Link</button>
            </div>

            <div className="space-y-1 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Draw & Pro Shapes</label>
              <button onClick={() => setActiveTool('arrow')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'arrow' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>➡️ Draw Arrow</button>
              <button onClick={() => setActiveTool('circle')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'circle' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>⭕ Circle</button>
              <button onClick={() => setActiveTool('pen')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'pen' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>✍️ Freehand Draw</button>
              <button onClick={() => setActiveTool('highlight')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'highlight' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🖍️ Highlight</button>
            </div>

            <div className="space-y-1 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Media & Forms</label>
              <button onClick={() => setActiveTool('checkbox')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'checkbox' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>☑️ Add Checkbox</button>
              <button onClick={() => setActiveTool('image')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'image' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>🖼️ Insert Image</button>
              <button onClick={() => setActiveTool('signature')} className={`w-full p-2 rounded-md text-left font-medium text-sm transition ${activeTool === 'signature' ? 'bg-blue-100 text-blue-700' : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}`}>✒️ Signature</button>
              {(activeTool === 'image' || activeTool === 'signature') && (
                <input type="file" accept="image/png, image/jpeg" onChange={(e) => setImageInput(e.target.files?.[0] || null)} className="w-full mt-1 p-1 border rounded text-[10px]" />
              )}
            </div>

            <div className={`mb-6 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <label className="block text-[10px] font-black text-indigo-500 uppercase mb-3">🛠️ Document Properties</label>
              <input type="text" value={globalWatermark} onChange={(e) => setGlobalWatermark(e.target.value)} placeholder="Watermark Text" className={`w-full mb-2 p-2 text-xs border rounded-md ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white'}`} />
              <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="PDF Title (Metadata)" className={`w-full mb-2 p-2 text-xs border rounded-md ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white'}`} />
              <input type="text" value={metaAuthor} onChange={(e) => setMetaAuthor(e.target.value)} placeholder="Author Name" className={`w-full mb-3 p-2 text-xs border rounded-md ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white'}`} />
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                 <input type="checkbox" checked={addPageNumbers} onChange={(e) => setAddPageNumbers(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                 Auto Page Numbers
              </label>
            </div>

            <div className={`mt-auto p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
               <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">✂️ Export Range (e.g. 1-3)</label>
               <input type="text" value={exportRange} onChange={(e) => setExportRange(e.target.value)} placeholder="All Pages" className={`w-full p-2 border rounded text-xs mb-3 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white'}`} />
               <button onClick={() => saveAndDownload()} disabled={isProcessing || !file} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-md transition-all text-sm">
                 {isProcessing ? 'Applying Magic...' : '✨ Export Final PDF'}
               </button>
            </div>

          </div>
        </aside>

        {/* 🌟 WORKSPACE */}
        <main 
          className={`flex-1 overflow-auto custom-scrollbar`} 
          style={{
             textAlign: 'center', 
             backgroundColor: isDarkMode ? '#020617' : '#f8fafc',
             backgroundImage: isDarkMode ? 'radial-gradient(#334155 1.5px, transparent 1px)' : 'radial-gradient(#cbd5e1 1.5px, transparent 1px)',
             backgroundSize: '24px 24px'
          }}
          onScroll={handleScroll}
        >
          {file && (
             <div className={`fixed bottom-10 right-10 z-50 flex items-center gap-1 px-3 py-2 rounded-full border shadow-2xl ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
                <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="font-bold text-xl px-2 hover:text-blue-500">➖</button>
                <span className="font-bold text-sm min-w-[50px] text-center select-none">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(5, z + 0.2))} className="font-bold text-xl px-2 hover:text-blue-500">➕</button>
             </div>
          )}

          {!file ? (
            <div className="inline-flex w-full h-full items-center justify-center p-8">
              <div className="flex flex-col items-center justify-center w-full max-w-[650px] aspect-[1/1.414] bg-white shadow-2xl rounded-sm border border-slate-200">
                 <span className="text-6xl mb-4 opacity-70">📄</span>
                 <p className="text-2xl font-black text-slate-300 tracking-wider">A4 WORKSPACE</p>
                 <p className="text-sm font-bold text-slate-400 mt-2">Upload a Document to start editing</p>
              </div>
            </div>
          ) : (
            <div className="inline-flex flex-col items-center gap-12 pt-10 pb-32 px-10 min-w-max mx-auto text-left">
              {visiblePages.map((pageNum) => {
                const dims = pdfDimensions[pageNum];
                if (!dims) return null;

                return (
                  <div 
                    key={pageNum} 
                    id={`pdf-page-${pageNum}`}
                    className="relative transition-all duration-200 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.3)] bg-white shrink-0 ring-1 ring-slate-200 mx-auto"
                    style={{ width: `${dims.w * zoom}px`, height: `${dims.h * zoom}px` }}
                  >
                    <div 
                      className={`absolute top-0 left-0 origin-top-left ${activeTool === 'select' ? 'cursor-default' : activeTool === 'none' ? '' : 'cursor-crosshair'}`}
                      style={{ transform: `scale(${zoom})`, width: `${dims.w}px`, height: `${dims.h}px` }}
                      onMouseDown={(e) => handleMouseDown(e, pageNum)} 
                      onMouseMove={(e) => handleMouseMove(e, pageNum)} 
                      onMouseUp={(e) => handleMouseUp(e, pageNum)} 
                      onMouseLeave={(e) => handleMouseUp(e, pageNum)}
                    >
                      <canvas ref={(el) => { canvasRefs.current[pageNum] = el; }} className="pointer-events-none block" style={{ width: '100%', height: '100%' }} />
                      
                      {currentPath.length > 0 && actionPage === pageNum && (
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-40">
                          <polyline points={currentPath.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={textColor} strokeWidth={fontSize} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}

                      {isDragging && dragStart && dragCurrent && actionPage === pageNum && activeTool !== 'pen' && activeTool !== 'select' && (
                        <div className="absolute pointer-events-none z-40 top-0 left-0 w-full h-full">
                          {activeTool === 'arrow' && (
                            <svg className="w-full h-full overflow-visible">
                              <line x1={dragStart.x} y1={dragStart.y} x2={dragCurrent.x} y2={dragCurrent.y} stroke={textColor} strokeWidth={fontSize/2} />
                            </svg>
                          )}
                          {activeTool === 'circle' && (
                            <div className="absolute rounded-full" style={{ left: Math.min(dragStart.x, dragCurrent.x), top: Math.min(dragStart.y, dragCurrent.y), width: Math.abs(dragCurrent.x - dragStart.x), height: Math.abs(dragCurrent.y - dragStart.y), border: `${fontSize/2}px solid ${textColor}` }}></div>
                          )}
                          {(activeTool === 'whiteout' || activeTool === 'highlight' || activeTool === 'smart-edit' || activeTool === 'text' || activeTool === 'redact') && (
                            <div className={`absolute border-2 border-dashed ${activeTool === 'redact' ? 'bg-black opacity-50 border-black' : 'border-blue-500 bg-blue-500 bg-opacity-20'}`} style={{ left: Math.min(dragStart.x, dragCurrent.x), top: Math.min(dragStart.y, dragCurrent.y), width: Math.abs(dragCurrent.x - dragStart.x), height: Math.abs(dragCurrent.y - dragStart.y) }} />
                          )}
                        </div>
                      )}

                      {annotations.filter(a => a.page === pageNum).map((anno) => (
                        <div 
                          key={anno.id} 
                          className={`absolute z-30 ${activeTool === 'select' ? 'pointer-events-auto cursor-move hover:ring-2 hover:ring-blue-500 hover:shadow-lg' : 'pointer-events-none'}`} 
                          style={{ left: anno.x, top: anno.y, width: anno.width, height: anno.height }}
                          onMouseDown={(e) => {
                            if (activeTool !== 'select') return;
                            e.stopPropagation(); 
                            const { x, y } = getMouseCoords(e as any, pageNum);
                            setSelectedAnnoId(anno.id); setDraggingAnnoId(anno.id); setAnnoDragOffset({ x: x - anno.x, y: y - anno.y });
                          }}
                        >
                          {/* 🌟 NAYA: LIVE COLOR CHANGER IN FLOATING POPUP MENU */}
                          {selectedAnnoId === anno.id && activeTool === 'select' && (
                            <div className="absolute -top-12 left-0 flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg shadow-xl z-50" onMouseDown={e => e.stopPropagation()}>
                              {(anno.type === 'text' || anno.type === 'smart-edit' || anno.type === 'pen' || anno.type === 'arrow' || anno.type === 'circle' || anno.type === 'link' || anno.type === 'checkbox') && (
                                 <input type="color" value={anno.color || '#000000'} onChange={(e) => updateAnnotation(anno.id, { color: e.target.value })} title="Change Color" className="w-6 h-6 rounded cursor-pointer border-none p-0" />
                              )}
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
                          {anno.type === 'text' && <span className="absolute top-0 leading-none whitespace-nowrap" style={{ color: anno.color, fontSize: `${anno.fontSize}px`, fontFamily: anno.fontFamily === 'TimesRoman' ? 'Times New Roman, serif' : anno.fontFamily === 'Courier' ? 'Courier New, monospace' : 'Arial, sans-serif' }}>{anno.text}</span>}
                          {anno.type === 'link' && <span className="underline absolute top-0 leading-none whitespace-nowrap" style={{ color: anno.color || 'blue', fontSize: `${anno.fontSize}px`, fontFamily: anno.fontFamily === 'TimesRoman' ? 'Times New Roman, serif' : anno.fontFamily === 'Courier' ? 'Courier New, monospace' : 'Arial, sans-serif' }}>{anno.text}</span>}
                          {anno.type === 'whiteout' && <div className={`opacity-100 w-full h-full border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`} style={{ backgroundColor: anno.bgColor || '#ffffff' }}></div>}
                          {anno.type === 'redact' && <div className="opacity-100 w-full h-full bg-black border border-black"></div>}
                          {anno.type === 'highlight' && <div className="bg-yellow-300 opacity-50 mix-blend-multiply w-full h-full"></div>}
                          {anno.type === 'strikethrough' && <div className="w-full absolute top-1/2" style={{ height: '2px', backgroundColor: '#ef4444' }}></div>}
                          
                          {/* 🌟 NAYA: DYNAMIC CHECKBOX PREVIEW */}
                          {anno.type === 'checkbox' && (
                            <div className="w-full h-full flex items-center justify-center">
                              {anno.checkboxStyle === 'fill' && <div className="w-[75%] h-[75%] mt-[-5px]" style={{ backgroundColor: anno.color || '#000000' }}></div>}
                              {anno.checkboxStyle === 'empty' && <div className="w-[75%] h-[75%] mt-[-5px] border-2" style={{ borderColor: anno.color || '#000000' }}></div>}
                              {anno.checkboxStyle === 'check' && (
                                <div className="w-[75%] h-[75%] mt-[-5px] border-2 flex items-center justify-center" style={{ borderColor: anno.color || '#000000', color: anno.color || '#000000' }}>
                                   <span style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '-2px' }}>✓</span>
                                </div>
                              )}
                              {anno.checkboxStyle === 'cross' && (
                                <div className="w-[75%] h-[75%] mt-[-5px] border-2 flex items-center justify-center" style={{ borderColor: anno.color || '#000000', color: anno.color || '#000000' }}>
                                   <span style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '-2px' }}>✕</span>
                                </div>
                              )}
                            </div>
                          )}

                          {(anno.type === 'image' || anno.type === 'signature') && anno.imageUrl && <img src={anno.imageUrl} alt="preview" className={`w-full h-full object-fill pointer-events-none ${isDarkMode?'filter invert hue-rotate-180':''}`} />}
                          {anno.type === 'smart-edit' && (
                             <span className={`px-1 w-full h-full inline-block overflow-hidden`} style={{ color: anno.color, backgroundColor: anno.bgColor || '#ffffff', fontSize: `${anno.fontSize}px`, fontFamily: anno.fontFamily === 'TimesRoman' ? 'Times New Roman, serif' : anno.fontFamily === 'Courier' ? 'Courier New, monospace' : 'Arial, sans-serif' }}>{anno.text}</span>
                          )}
                        </div>
                      ))}

                      {activeInput && activeInput.page === pageNum && (
                        <div className="absolute z-50 flex items-start shadow-2xl" style={{ left: activeInput.x, top: activeInput.y, width: activeInput.width, height: activeInput.height }}>
                          <textarea
                            ref={inputRef} value={activeInput.text}
                            onChange={(e) => setActiveInput({ ...activeInput, text: e.target.value })}
                            onBlur={saveActiveInput}
                            className={`border-2 border-blue-500 p-1 m-0 outline-none w-full h-full resize-none shadow-inner`}
                            style={{ fontSize: `${fontSize}px`, color: textColor, backgroundColor: activeTool === 'smart-edit' ? smartBgColor : 'transparent', fontFamily: fontFamily === 'TimesRoman' ? 'Times New Roman, serif' : fontFamily === 'Courier' ? 'Courier New, monospace' : 'Arial, sans-serif' }}
                            placeholder="Type..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}