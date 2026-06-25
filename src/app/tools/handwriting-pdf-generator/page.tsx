'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Loader2, PenTool, Type, Palette, AlignLeft, UploadCloud, FileUp } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function HandwritingPDFGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);

 // Load Google Fonts & PDF.js Library dynamically
  useEffect(() => {
    // Load Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Dancing+Script:wght@500;700&family=Indie+Flower&family=Shadows+Into+Light&family=Kalam:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    // Load PDF.js for text extraction
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      // 🔥 FIX: Added (window as any) to bypass TypeScript strict checking
      if ((window as any)['pdfjs-dist/build/pdf']) {
        (window as any)['pdfjs-dist/build/pdf'].GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      }
    };
    document.head.appendChild(script);

    setTimeout(() => setFontsLoaded(true), 500);
    return () => { document.head.removeChild(fontLink); }
  }, []);

  // Form States
  const [text, setText] = useState('Artificial Intelligence (AI) is intelligence demonstrated by machines...\n\nUpload a TXT or PDF file to extract text automatically!');
  const [fontFamily, setFontFamily] = useState("'Caveat', cursive");
  const [customFontName, setCustomFontName] = useState<string | null>(null);
  const [inkColor, setInkColor] = useState('#0000b3'); // Standard Pen Blue
  const [paperType, setPaperType] = useState('ruled'); // 'plain', 'ruled', 'grid'
  const [fontSize, setFontSize] = useState(26);
  const [lineHeight, setLineHeight] = useState(32); // Matches ruled line height
  const [paddingTop, setPaddingTop] = useState(80);

  // 🔥 PDF OR TXT TEXT EXTRACTION
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
      } else {
        alert("Please upload a .txt or .pdf file.");
      }
    } catch (error) {
      console.error(error);
      alert("Error extracting text from file.");
    } finally {
      setIsExtractingText(false);
    }
  };

  // 🔥 CUSTOM HANDWRITING FONT UPLOAD (.ttf, .otf)
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
      alert("Custom Handwriting Font Uploaded Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to load custom font. Make sure it is a valid .ttf or .otf file.");
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Handwritten_Document.pdf');
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadImage = async () => {
    if (!previewRef.current) return;
    setIsDownloadingJpg(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
      const link = document.createElement('a');
      link.download = 'Handwritten_Document.jpg';
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
        backgroundImage: `repeating-linear-gradient(transparent, transparent ${lineHeight - 1}px, #94a3b8 ${lineHeight - 1}px, #94a3b8 ${lineHeight}px)`,
        backgroundSize: `100% ${lineHeight}px`,
        backgroundPositionY: `${paddingTop}px`
      };
    } else if (paperType === 'grid') {
      return {
        backgroundColor: '#ffffff',
        backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
        backgroundSize: `${lineHeight}px ${lineHeight}px`
      };
    }
    return { backgroundColor: '#ffffff' }; 
  };

  if (!fontsLoaded) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <PenTool className="w-10 h-10 text-indigo-600" />
            Handwriting PDF Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Extract Text from PDF or upload your Custom Handwriting Font!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: CONTROLS ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* TEXT INPUT OR FILE UPLOAD */}
            <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <AlignLeft className="w-3 h-3"/> Enter Text
                </label>
                <div className="relative">
                  <input type="file" accept=".txt,.pdf" onChange={handleTextFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <button className="flex items-center gap-1 text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700">
                    {isExtractingText ? <Loader2 className="w-3 h-3 animate-spin"/> : <FileUp className="w-3 h-3" />} 
                    Upload TXT/PDF
                  </button>
                </div>
              </div>
              <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                className="w-full h-40 text-sm border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="Paste text here or upload a file..."
              />
            </div>

            {/* FONT SELECTOR & CUSTOM UPLOAD */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Type className="w-3 h-3"/> Choose Handwriting Style
              </label>
              <div className="flex gap-2">
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)} 
                  className="flex-1 text-sm border-2 border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500"
                >
                  <option value="'Caveat', cursive">Caveat (Neat & Cursive)</option>
                  <option value="'Kalam', cursive">Kalam (Casual Script)</option>
                  <option value="'Indie Flower', cursive">Indie Flower (Playful)</option>
                  <option value="'Dancing Script', cursive">Dancing Script (Elegant)</option>
                  <option value="'Shadows Into Light', cursive">Shadows Into Light (Thin)</option>
                  {customFontName && <option value={`'${customFontName}', sans-serif`}>✨ My Uploaded Handwriting</option>}
                </select>
              </div>
              {/* Custom Font Uploader */}
              <div className="relative bg-slate-100 border border-slate-200 rounded-lg p-3 text-center hover:bg-slate-200 transition-colors cursor-pointer">
                <input type="file" accept=".ttf,.otf" onChange={handleCustomFontUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                  <UploadCloud className="w-4 h-4" /> Upload Your Handwriting Font (.ttf)
                </div>
              </div>
            </div>

            {/* INK COLOR & PAPER TYPE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Palette className="w-3 h-3"/> Ink Color</label>
                <div className="flex gap-3">
                  <button onClick={() => setInkColor('#0000b3')} className={`w-8 h-8 rounded-full bg-[#0000b3] shadow-md border-2 transition-transform ${inkColor === '#0000b3' ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`} title="Blue Pen"></button>
                  <button onClick={() => setInkColor('#1a1a1a')} className={`w-8 h-8 rounded-full bg-[#1a1a1a] shadow-md border-2 transition-transform ${inkColor === '#1a1a1a' ? 'border-slate-400 scale-110' : 'border-transparent hover:scale-105'}`} title="Black Pen"></button>
                  <button onClick={() => setInkColor('#cc0000')} className={`w-8 h-8 rounded-full bg-[#cc0000] shadow-md border-2 transition-transform ${inkColor === '#cc0000' ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`} title="Red Pen"></button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><FileText className="w-3 h-3"/> Paper Type</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setPaperType('ruled')} className={`flex-1 py-1 text-[10px] font-bold rounded-md ${paperType === 'ruled' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Ruled</button>
                  <button onClick={() => setPaperType('plain')} className={`flex-1 py-1 text-[10px] font-bold rounded-md ${paperType === 'plain' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Plain</button>
                  <button onClick={() => setPaperType('grid')} className={`flex-1 py-1 text-[10px] font-bold rounded-md ${paperType === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Grid</button>
                </div>
              </div>
            </div>

            {/* ADJUSTMENTS */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-500 flex justify-between"><span>Font Size ({fontSize}px)</span></label>
                <input type="range" min="16" max="40" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full mt-1 accent-indigo-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 flex justify-between"><span>Line Spacing ({lineHeight}px)</span></label>
                <input type="range" min="20" max="60" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full mt-1 accent-indigo-600" />
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="pt-4 grid grid-cols-2 gap-3 mt-auto">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              
              <div ref={previewRef} className="w-[794px] h-[1123px] relative shadow-2xl mx-auto overflow-hidden" style={getPaperStyle()}>
                {paperType === 'ruled' && (
                  <div className="absolute left-[100px] top-0 bottom-0 border-l-2 border-red-300 z-0"></div>
                )}
                <div 
                  className="absolute top-0 bottom-0 right-0 z-10 w-full"
                  style={{ paddingLeft: paperType === 'ruled' ? '120px' : '60px', paddingRight: '40px', paddingTop: `${paddingTop}px` }}
                >
                  <pre
                    style={{
                      fontFamily: fontFamily, color: inkColor, fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`,
                      whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0, transform: 'rotate(-0.5deg)', opacity: 0.9
                    }}
                  >
                    {text}
                  </pre>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}