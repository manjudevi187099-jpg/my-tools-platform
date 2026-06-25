'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Download, FileText, Loader2, PenTool, Type, Palette, AlignLeft, UploadCloud, FileUp, Layers } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

// 🔥 10 ULTRA-REALISTIC HUMAN HANDWRITING FONTS
const HANDWRITING_FONTS = [
  { id: 1, name: "Caveat (Neat Cursive)", value: "'Caveat', cursive" },
  { id: 2, name: "Kalam (Standard Ballpen)", value: "'Kalam', cursive" },
  { id: 3, name: "Indie Flower (Natural Print)", value: "'Indie Flower', cursive" },
  { id: 4, name: "Dancing Script (Fluent Flow)", value: "'Dancing Script', cursive" },
  { id: 5, name: "Shadows Into Light (Sharp & Thin)", value: "'Shadows Into Light', cursive" },
  { id: 6, name: "Architects Daughter (Blocky Print)", value: "'Architects Daughter', cursive" },
  { id: 7, name: "Gochi Hand (Casual School Writing)", value: "'Gochi Hand', cursive" },
  { id: 8, name: "Patrick Hand (Clean Teacher Script)", value: "'Patrick Hand', cursive" },
  { id: 9, name: "Reenie Beanie (Messy Quick Pen)", value: "'Reenie Beanie', cursive" },
  { id: 10, name: "Just Me Again Down Here (Organic)", value: "'Just Me Again Down Here', cursive" }
];

export default function HandwritingPDFGenerator() {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);

  // Dynamically load all 10 Premium Google Fonts & PDF.js
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@500;700&family=Dancing+Script:wght@500;700&family=Gochi+Hand&family=Indie+Flower&family=Just+Me+Again+Down+Here&family=Kalam:wght@400;700&family=Patrick+Hand&family=Reenie+Beanie&family=Shadows+Into+Light&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      if ((window as any)['pdfjs-dist/build/pdf']) {
        (window as any)['pdfjs-dist/build/pdf'].GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      }
    };
    document.head.appendChild(script);

    setTimeout(() => setFontsLoaded(true), 600);
    return () => { document.head.removeChild(fontLink); }
  }, []);

  // Default Large Text for Testing Multi-Page Flow
  const [text, setText] = useState('SECTION 1: INTRODUCTION TO PLATFORM SYSTEMS\n\nArtificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions. The term may also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving.\n\nAs technology advances, previous benchmarks that defined artificial intelligence become obsolete. For example, machines that calculate basic functions or recognize text through optical character recognition are no longer considered to embody artificial intelligence, since this function is now an inherent computer ability.\n\nSECTION 2: CORE DEVELOPMENT ARCHITECTURE\n\nWhen writing long reports or assignments, maintaining a uniform script is vital. This engine breaks down your heavy documents into multiple consecutive A4 sheets autonomously. You can test this by adding more text or paragraphs right here. Each paragraph seamlessly flows to the next page once the current page limits are exhausted. Adjust the font size and line height sliders on the left to perfectly align the font with the notebook rules.');
  
  const [fontFamily, setFontFamily] = useState("'Caveat', cursive");
  const [customFontName, setCustomFontName] = useState<string | null>(null);
  const [inkColor, setInkColor] = useState('#0000b3'); // Blue Pen
  const [paperType, setPaperType] = useState('ruled');
  const [fontSize, setFontSize] = useState(25);
  const [lineHeight, setLineHeight] = useState(34);
  const [paddingTop, setPaddingTop] = useState(80);

  // 🔥 ADVANCED MULTI-PAGE CHUNKING ENGINE (Strict A4 Bounds)
  const textPages = useMemo(() => {
    // Dynamic calculation based on size and lines spacing to avoid page overflows
    const approxLinesPerPage = Math.floor((1123 - paddingTop - 60) / lineHeight);
    const approxCharsPerLine = Math.floor(620 / (fontSize * 0.45));
    const maxCharsPerPage = approxLinesPerPage * approxCharsPerLine;
    
    const pages = [];
    let remainingText = text;
    
    while (remainingText.length > 0) {
      if (remainingText.length <= maxCharsPerPage) {
        pages.push(remainingText);
        break;
      }
      
      // Cut smoothly at the nearest word boundary
      let cutIndex = remainingText.lastIndexOf(' ', maxCharsPerPage);
      if (cutIndex === -1 || cutIndex < maxCharsPerPage * 0.8) {
        cutIndex = maxCharsPerPage;
      }
      
      pages.push(remainingText.slice(0, cutIndex));
      remainingText = remainingText.slice(cutIndex).trimStart();
    }
    return pages.length ? pages : [''];
  }, [text, fontSize, lineHeight, paddingTop]);

  // Handle PDF/TXT Data Extraction
  const handleTextFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingText(true);
    try {
      if (file.type === 'text/plain') {
        const textData = await file.text();
        setText(textData);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = (window as any)['pdfjs-dist/build/pdf'];
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        setText(extractedText);
      }
    } catch (error) {
      alert("Error extracting text.");
    } finally {
      setIsExtractingText(false);
    }
  };

  // Custom Font Upload File System
  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fontUrl = URL.createObjectURL(file);
      const newFontName = `CustomFont_${Date.now()}`;
      const fontFace = new FontFace(newFontName, `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      
      setCustomFontName(newFontName);
      setFontFamily(`'${newFontName}', sans-serif`);
      alert("Handwriting font loaded successfully!");
    } catch (error) {
      alert("Invalid font file. Please upload a correct .ttf or .otf file.");
    }
  };

  // 🔥 MULTI-PAGE COMPILER TO A4 PDF
  const downloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      for (let i = 0; i < textPages.length; i++) {
        const pageElement = document.getElementById(`pdf-page-${i}`);
        if (!pageElement) continue;
        
        const dataUrl = await toPng(pageElement, { cacheBust: true, pixelRatio: 2 });
        if (i > 0) pdf.addPage();
        
        const pdfHeight = (pageElement.offsetHeight * pdfWidth) / pageElement.offsetWidth;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save('Handwritten_Assignment_Dhamaka.pdf');
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadImage = async () => {
    setIsDownloadingJpg(true);
    try {
      const pageElement = document.getElementById(`pdf-page-0`);
      if (!pageElement) return;
      
      const dataUrl = await toJpeg(pageElement, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
      const link = document.createElement('a');
      link.download = 'Handwritten_Page_1.jpg';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  const getPaperStyle = () => {
    if (paperType === 'ruled') {
      return {
        backgroundColor: '#ffffff',
        backgroundImage: `repeating-linear-gradient(transparent, transparent ${lineHeight - 1}px, #cbd5e1 ${lineHeight - 1}px, #cbd5e1 ${lineHeight}px)`,
        backgroundSize: `100% ${lineHeight}px`,
        backgroundPositionY: `${paddingTop}px`
      };
    }
    return { backgroundColor: '#ffffff' }; 
  };

  if (!fontsLoaded) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <PenTool className="w-10 h-10 text-indigo-600" />
            Handwriting PDF Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">10 Realistic Human Fonts • Smart Auto-Pagination Mode</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: CONTROLS ================= */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-5 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* TEXT AND FILE EXTRACTION */}
            <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <AlignLeft className="w-3 h-3"/> Document Content
                </label>
                <div className="relative">
                  <input type="file" accept=".txt,.pdf" onChange={handleTextFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <button className="flex items-center gap-1 text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700">
                    {isExtractingText ? <Loader2 className="w-3 h-3 animate-spin"/> : <FileUp className="w-3 h-3" />} 
                    Import PDF/TXT
                  </button>
                </div>
              </div>
              <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                className="w-full h-44 text-sm border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:outline-none resize-none font-sans"
                placeholder="Type or paste text here..."
              />
              <div className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                <Layers className="w-3 h-3"/> Pages Detected: {textPages.length}
              </div>
            </div>

            {/* 🔥 10 PREMIUM HANDWRITING STYLES */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Type className="w-3 h-3"/> Select Handwriting Font
              </label>
              <select 
                value={fontFamily} 
                onChange={(e) => setFontFamily(e.target.value)} 
                className="w-full text-sm border-2 border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 font-medium bg-white"
              >
                {HANDWRITING_FONTS.map((font) => (
                  <option key={font.id} value={font.value}>{font.name}</option>
                ))}
                {customFontName && <option value={`'${customFontName}', sans-serif`}>✨ Custom Uploaded Font</option>}
              </select>
              
              <div className="relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-100 cursor-pointer transition-colors">
                <input type="file" accept=".ttf,.otf" onChange={handleCustomFontUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                  <UploadCloud className="w-4 h-4 text-indigo-500" /> Upload Custom Font (.TTF)
                </div>
              </div>
            </div>

            {/* INK & PAPER CONTROLS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Pen Ink</label>
                <div className="flex gap-2">
                  <button onClick={() => setInkColor('#0000b3')} className={`w-8 h-8 rounded-full bg-[#0000b3] shadow-md border-2 ${inkColor === '#0000b3' ? 'border-slate-800 scale-110' : 'border-transparent'}`}></button>
                  <button onClick={() => setInkColor('#1a1a1a')} className={`w-8 h-8 rounded-full bg-[#1a1a1a] shadow-md border-2 ${inkColor === '#1a1a1a' ? 'border-slate-400 scale-110' : 'border-transparent'}`}></button>
                  <button onClick={() => setInkColor('#cc0000')} className={`w-8 h-8 rounded-full bg-[#cc0000] shadow-md border-2 ${inkColor === '#cc0000' ? 'border-slate-800 scale-110' : 'border-transparent'}`}></button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Page Layout</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setPaperType('ruled')} className={`flex-1 py-1 text-[11px] font-bold rounded-md ${paperType === 'ruled' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Ruled</button>
                  <button onClick={() => setPaperType('plain')} className={`flex-1 py-1 text-[11px] font-bold rounded-md ${paperType === 'plain' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Plain</button>
                </div>
              </div>
            </div>

            {/* SLIDERS */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-500 flex justify-between"><span>Font Size ({fontSize}px)</span></label>
                <input type="range" min="18" max="36" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full mt-1 accent-indigo-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 flex justify-between"><span>Line Spacing ({lineHeight}px)</span></label>
                <input type="range" min="24" max="54" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full mt-1 accent-indigo-600" />
              </div>
            </div>

            {/* RUN BUTTONS */}
            <div className="pt-4 grid grid-cols-2 gap-3 mt-auto">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center text-xs">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Page 1 (JPG)'}
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center text-xs">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Download Full PDF'}
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE MULTI-PAGE PREVIEW ================= */}
          <div className="lg:col-span-8 flex flex-col items-center gap-10 bg-slate-200 rounded-3xl p-4 md:p-8 overflow-y-auto max-h-[85vh] custom-scrollbar shadow-inner">
            
            {textPages.map((pageContent, index) => (
              <div key={index} className="relative flex flex-col items-center w-full">
                <span className="bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-2 shadow-md z-20">Sheet {index + 1} of {textPages.length}</span>
                
                {/* Fixed A4 Wrapper Structure */}
                <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-140px' }}>
                  <div 
                    id={`pdf-page-${index}`} 
                    className="w-[794px] h-[1123px] relative shadow-2xl mx-auto overflow-hidden bg-white"
                    style={getPaperStyle()}
                  >
                    {/* Pink/Red Notebook Margin Line */}
                    {paperType === 'ruled' && (
                      <div className="absolute left-[100px] top-0 bottom-0 border-l-2 border-red-300 z-0"></div>
                    )}

                    {/* Text Rendering Canvas Area */}
                    <div 
                      className="absolute top-0 bottom-0 right-0 z-10 w-full"
                      style={{ paddingLeft: paperType === 'ruled' ? '125px' : '65px', paddingRight: '45px', paddingTop: `${paddingTop}px` }}
                    >
                      <pre
                        style={{
                          fontFamily: fontFamily, 
                          color: inkColor, 
                          fontSize: `${fontSize}px`, 
                          lineHeight: `${lineHeight}px`,
                          whiteSpace: 'pre-wrap', 
                          wordWrap: 'break-word', 
                          margin: 0, 
                          transform: 'rotate(-0.4deg)', 
                          opacity: 0.92
                        }}
                      >
                        {pageContent}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}