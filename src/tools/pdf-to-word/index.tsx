'use client';
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Setting up the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToWordConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file only!");
      }
    }
  };

  const startConversion = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgressStatus('Reading PDF File...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let extractedTextHTML = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgressStatus(`Extracting Text from Page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Joining words and creating paragraphs
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedTextHTML += `
          <div style="page-break-after: always; font-family: Arial, sans-serif; padding: 20px;">
             <h3 style="color: #666; font-size: 10pt; border-bottom: 1px solid #ccc;">--- Page ${i} ---</h3>
             <p style="font-size: 12pt; line-height: 1.6; text-align: justify;">${pageText}</p>
          </div>
        `;
      }

      setProgressStatus('Formatting Word Document...');

      // Wrapping inside MS Word compatible HTML
      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export to Word</title></head><body>`;
      const footer = "</body></html>";
      const sourceHTML = header + extractedTextHTML + footer;

      // Create Blob for Word
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.pdf', '_Converted.doc');
      
      setProgressStatus('Downloading...');
      
      // Delay to show downloading status before completing
      setTimeout(() => {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
        setProgressStatus('');
      }, 1000);

    } catch (err) {
      console.error(err);
      alert("Error occurred during conversion. Is the PDF password protected?");
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const themeBg = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const themeText = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-[85vh] w-full max-w-[1200px] mx-auto my-8 rounded-2xl shadow-xl flex flex-col overflow-hidden transition-colors duration-300 ${themeBg} ${themeText} border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
      
      {/* HEADER */}
      <header className={`h-16 border-b flex items-center justify-between px-8 z-20 shrink-0 ${cardBg}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📄➡️📝</span>
          <h1 className="text-xl font-black tracking-tight text-blue-600">PDF to Word</h1>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-xl p-2 hover:bg-slate-500 hover:bg-opacity-20 rounded-full transition-colors">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative" style={{ backgroundImage: isDarkMode ? 'radial-gradient(#334155 1.5px, transparent 1px)' : 'radial-gradient(#cbd5e1 1.5px, transparent 1px)', backgroundSize: '30px 30px' }}>
        
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-4">Convert PDF to Word</h2>
            <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Extract text and paragraphs into an editable DOC file. 100% Free & Secure.</p>
          </div>

          {/* UPLOAD / DRAG & DROP BOX */}
          {!file && !isProcessing && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center w-full p-16 border-4 border-dashed rounded-3xl transition-all duration-300 cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50' : (isDarkMode ? 'border-slate-600 hover:border-slate-500 bg-slate-800' : 'border-slate-300 hover:border-blue-400 bg-white shadow-sm')}
              `}
            >
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                📄
              </div>
              <h3 className="text-2xl font-bold mb-2">Click or Drag & Drop PDF here</h3>
              <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Max file size: Unlimited (Client-side processing)</p>
            </div>
          )}

          {/* FILE READY / PROCESSING BOX */}
          {(file || isProcessing) && (
            <div className={`w-full p-8 rounded-3xl shadow-xl flex flex-col items-center border transition-all ${cardBg}`}>
              
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm">
                📝
              </div>
              <h3 className="text-xl font-bold mb-1 truncate max-w-md" title={file?.name}>{file?.name}</h3>
              <p className={`text-sm font-medium mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>

              {isProcessing ? (
                <div className="w-full flex flex-col items-center">
                  {/* Custom animated loader */}
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                  <p className="text-lg font-bold text-blue-600 animate-pulse">{progressStatus}</p>
                </div>
              ) : (
                <div className="w-full flex gap-4">
                  <button onClick={() => setFile(null)} className={`flex-1 py-4 font-bold rounded-xl border transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-600' : 'bg-slate-100 hover:bg-slate-200 border-slate-200'}`}>
                    Cancel
                  </button>
                  <button onClick={startConversion} className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
                    Convert to Word ✨
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FEATURES SECTION */}
          {!file && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}`}>
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-bold mb-1">100% Secure</h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Files never leave your browser. No server uploads.</p>
              </div>
              <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}`}>
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-bold mb-1">Ultra Fast</h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Client-side extraction makes it lightning fast.</p>
              </div>
              <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}`}>
                <div className="text-2xl mb-2">🆓</div>
                <h4 className="font-bold mb-1">Completely Free</h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No daily limits, no hidden watermarks.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}