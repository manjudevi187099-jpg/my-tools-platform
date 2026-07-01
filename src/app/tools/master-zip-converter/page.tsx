'use client';

import React, { useState, useRef } from 'react';
import { FileArchive, Upload, Download, FileText, ArrowRightLeft, Sparkles, Archive } from 'lucide-react';
import JSZip from 'jszip';

export default function MasterZipConverter() {
  const [mode, setMode] = useState<'compress' | 'extract'>('compress');
  
  // States for Compress Mode
  const [filesToZip, setFilesToZip] = useState<File[]>([]);
  
  // States for Extract Mode
  const [extractedFiles, setExtractedFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- MODE 1: COMPRESS (PDF/Images to ZIP) ---
  const handleSelectFilesToZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFilesToZip((prev) => [...prev, ...newFiles]);
    }
  };

  const createZipFile = async () => {
    if (filesToZip.length === 0) return alert("Please select files first!");
    
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      filesToZip.forEach((file) => {
        zip.file(file.name, file);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'dhamaka-compressed.zip';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Zip creation failed:", error);
      alert("Failed to create ZIP.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- MODE 2: EXTRACT (ZIP to JPEGs/Files) ---
  const handleExtractZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.zip')) {
      return alert("Please upload a valid .zip file!");
    }

    setIsProcessing(true);
    setExtractedFiles([]); // Clear previous

    try {
      const zip = await JSZip.loadAsync(file);
      const extracted: { name: string; url: string; type: string }[] = [];

      // Loop through each file inside the ZIP
      const promises = Object.keys(zip.files).map(async (filename) => {
        const zipEntry = zip.files[filename];
        if (!zipEntry.dir) {
          const blob = await zipEntry.async('blob');
          const url = URL.createObjectURL(blob);
          extracted.push({
            name: filename,
            url: url,
            type: blob.type || (filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 'other')
          });
        }
      });

      await Promise.all(promises);
      setExtractedFiles(extracted);
    } catch (error) {
      console.error("Extraction failed:", error);
      alert("Failed to extract ZIP. File might be corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadExtractedFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white font-sans selection:bg-indigo-500">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3 flex items-center justify-center gap-3">
            <Archive className="text-indigo-400" size={40} /> Master ZIP Converter
          </h1>
          <p className="text-slate-400 font-medium">Convert PDF to ZIP, or Extract ZIP to JPEGs instantly on your browser.</p>
        </div>

        {/* --- MODE SWITCHER --- */}
        <div className="flex bg-slate-800 p-2 rounded-2xl mb-8 max-w-md mx-auto border border-slate-700">
          <button 
            onClick={() => { setMode('compress'); setExtractedFiles([]); }}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${mode === 'compress' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <FileArchive size={18}/> Pack (to ZIP)
          </button>
          <button 
            onClick={() => { setMode('extract'); setFilesToZip([]); }}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${mode === 'extract' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <ArrowRightLeft size={18}/> Extract (from ZIP)
          </button>
        </div>

        <div className="bg-slate-800 p-8 rounded-3xl border-2 border-slate-700 shadow-2xl">
          
          {/* ================= COMPRESS MODE UI ================= */}
          {mode === 'compress' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="border-2 border-dashed border-slate-600 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-800/50 hover:bg-slate-700/30 transition-colors">
                <FileText size={48} className="text-indigo-400 mb-4" />
                <h3 className="font-black text-xl mb-2">Upload Files (PDF, JPEG, etc.)</h3>
                <p className="text-slate-400 text-sm mb-6">Select multiple files to compress them into a single ZIP file.</p>
                
                <input type="file" multiple onChange={handleSelectFilesToZip} ref={fileInputRef} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg">
                  <Upload size={18} /> SELECT FILES
                </button>
              </div>

              {filesToZip.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Sparkles className="text-yellow-400" size={18}/> Selected Files ({filesToZip.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {filesToZip.map((file, idx) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex items-center gap-3 truncate">
                        <FileText size={16} className="text-slate-400 shrink-0"/>
                        <span className="text-xs font-medium truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={createZipFile} disabled={isProcessing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black text-lg flex justify-center items-center gap-2 transition-all shadow-lg disabled:opacity-50">
                    {isProcessing ? "PACKING..." : <><Archive size={20}/> DOWNLOAD AS .ZIP</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= EXTRACT MODE UI ================= */}
          {mode === 'extract' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="border-2 border-dashed border-slate-600 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-800/50 hover:bg-slate-700/30 transition-colors">
                <Archive size={48} className="text-emerald-400 mb-4" />
                <h3 className="font-black text-xl mb-2">Extract ZIP to JPEGs</h3>
                <p className="text-slate-400 text-sm mb-6">Upload a ZIP file to extract and view all JPEGs or files inside it.</p>
                
                <input type="file" accept=".zip" onChange={handleExtractZip} ref={fileInputRef} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg">
                  <Upload size={18} /> UPLOAD .ZIP FILE
                </button>
              </div>

              {isProcessing && <p className="text-center mt-6 font-bold text-emerald-400 animate-pulse">Extracting files...</p>}

              {extractedFiles.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Sparkles className="text-yellow-400" size={18}/> Extracted Files ({extractedFiles.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {extractedFiles.map((file, idx) => (
                      <div key={idx} className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col group">
                        
                        {/* Show Image Preview if it's an image, else show file icon */}
                        {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <div className="h-32 bg-black flex items-center justify-center p-2 relative">
                            <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <div className="h-32 bg-slate-800 flex items-center justify-center">
                            <FileText size={32} className="text-slate-500" />
                          </div>
                        )}
                        
                        <div className="p-3 bg-slate-900 border-t border-slate-700">
                          <p className="text-xs font-medium truncate mb-2" title={file.name}>{file.name}</p>
                          <button 
                            onClick={() => downloadExtractedFile(file.url, file.name)}
                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Download size={14}/> GET FILE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}