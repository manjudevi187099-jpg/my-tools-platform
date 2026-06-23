'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { removeBackground } from '@imgly/background-removal';
import { UploadCloud, Image as ImageIcon, Download, Settings, RefreshCw, ZoomIn, Move } from 'lucide-react';

type BgType = 'transparent' | 'color' | 'image';

export default function BackgroundChanger() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [bgType, setBgType] = useState<BgType>('transparent');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  
  const [scale, setScale] = useState(100);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
      setProcessedUrl(null);
      resetEditor();
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1
  });

  const resetEditor = () => {
    setBgType('transparent');
    setScale(100);
    setPosX(50);
    setPosY(50);
    setBgImageUrl(null);
  };

  // 🔥 AI Background Removal Function (Added back properly!)
  const handleRemoveBackground = async () => {
    if (!originalFile) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      // 100% LOCAL PATH: Vercel cloud build automatically gives files here
      const fullPublicPath = window.location.origin + "/imgly/";

      const blob = await removeBackground(originalFile, {
        publicPath: fullPublicPath,
        progress: (key, current, total) => {
          setProgress(Math.round((current / total) * 100));
        }
      });
      setProcessedUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error removing background:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgType('image');
      setBgImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDownload = async (format: 'png' | 'jpeg') => {
    if (!processedUrl) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fgImg = new Image();
    fgImg.crossOrigin = 'anonymous';
    fgImg.src = processedUrl;
    
    await new Promise((resolve) => { fgImg.onload = resolve; });

    canvas.width = fgImg.width;
    canvas.height = fgImg.height;

    if (bgType === 'color') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'image' && bgImageUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = bgImageUrl;
      await new Promise((resolve) => { bgImg.onload = resolve; });
      
      const scaleBg = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
      const x = (canvas.width / 2) - (bgImg.width / 2) * scaleBg;
      const y = (canvas.height / 2) - (bgImg.height / 2) * scaleBg;
      ctx.drawImage(bgImg, x, y, bgImg.width * scaleBg, bgImg.height * scaleBg);
    }

    const scaleMultiplier = scale / 100;
    const drawWidth = fgImg.width * scaleMultiplier;
    const drawHeight = fgImg.height * scaleMultiplier;
    
    const xPos = (canvas.width - drawWidth) * (posX / 100);
    const yPos = (canvas.height - drawHeight) * (posY / 100);

    ctx.drawImage(fgImg, xPos, yPos, drawWidth, drawHeight);

    const link = document.createElement('a');
    const ext = bgType === 'transparent' ? 'png' : format;
    const mime = bgType === 'transparent' ? 'image/png' : `image/${format}`;
    
    link.download = `dhamaka-bg-${Date.now()}.${ext}`;
    link.href = canvas.toDataURL(mime, 1.0);
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 py-6 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <ImageIcon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Background Changer</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 px-6">
        {!originalUrl ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-4 text-slate-800">Change Background Automatically</h2>
              <p className="text-lg text-slate-500">100% Free, Browser-based, and Secure. No data leaves your device.</p>
            </div>

            <div 
              {...getRootProps()} 
              className={`border-4 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="bg-blue-100 p-6 rounded-full mb-6">
                <UploadCloud className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-2xl font-bold mb-2">Drag & Drop your photo here</p>
              <p className="text-slate-500 mb-8">Supports JPG, PNG, WEBP</p>
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg transition-all">
                Select from Computer
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-grow flex items-center justify-center relative overflow-hidden min-h-[500px]">
                
                {!processedUrl && !isProcessing && (
                  <div className="text-center w-full max-w-md">
                    <img src={originalUrl} alt="Original" className="max-h-80 mx-auto rounded-xl shadow-md mb-8 object-contain" />
                    <button 
                      onClick={handleRemoveBackground}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                      <RefreshCw className="w-6 h-6" />
                      Remove Background Now
                    </button>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-2xl font-bold mb-2">AI is working its magic...</h3>
                    <p className="text-blue-600 font-medium text-lg">{progress}% Complete</p>
                  </div>
                )}

                {processedUrl && (
                  <div className="w-full h-full flex flex-col relative rounded-2xl overflow-hidden shadow-inner" style={{ minHeight: '500px' }}>
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center" 
                         style={{
                           backgroundColor: bgType === 'color' ? bgColor : bgType === 'transparent' ? '#e2e8f0' : 'transparent',
                           backgroundImage: bgType === 'transparent' ? 'repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1)' : bgType === 'image' && bgImageUrl ? `url(${bgImageUrl})` : 'none',
                           backgroundPosition: bgType === 'transparent' ? '0 0, 10px 10px' : 'center',
                           backgroundSize: bgType === 'transparent' ? '20px 20px' : 'cover',
                         }}
                    >
                      <img 
                        src={processedUrl} 
                        alt="Subject" 
                        style={{
                          transform: `scale(${scale / 100}) translate(${(posX - 50)}%, ${(posY - 50)}%)`,
                          transformOrigin: 'center',
                          transition: 'transform 0.1s ease-out'
                        }}
                        className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Background</h3>
                
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <button onClick={() => setBgType('transparent')} className={`h-12 rounded-xl border-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==')] ${bgType === 'transparent' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="Transparent"></button>
                  <button onClick={() => { setBgType('color'); setBgColor('#ffffff'); }} className={`h-12 rounded-xl border-2 bg-white ${bgType === 'color' && bgColor === '#ffffff' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="White"></button>
                  <button onClick={() => { setBgType('color'); setBgColor('#ef4444'); }} className={`h-12 rounded-xl border-2 bg-red-500 ${bgType === 'color' && bgColor === '#ef4444' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="Red"></button>
                  <button onClick={() => { setBgType('color'); setBgColor('#22c55e'); }} className={`h-12 rounded-xl border-2 bg-green-500 ${bgType === 'color' && bgColor === '#22c55e' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="Green"></button>
                  <button onClick={() => { setBgType('color'); setBgColor('#3b82f6'); }} className={`h-12 rounded-xl border-2 bg-blue-500 ${bgType === 'color' && bgColor === '#3b82f6' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="Blue"></button>
                  <button onClick={() => { setBgType('color'); setBgColor('#000000'); }} className={`h-12 rounded-xl border-2 bg-black ${bgType === 'color' && bgColor === '#000000' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="Black"></button>
                  
                  <div className={`relative h-12 rounded-xl border-2 overflow-hidden ${bgType === 'color' && !['#ffffff','#ef4444','#22c55e','#3b82f6','#000000'].includes(bgColor) ? 'border-blue-600 shadow-md' : 'border-slate-200'}`}>
                    <input type="color" value={bgColor} onChange={(e) => { setBgType('color'); setBgColor(e.target.value); }} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <input type="file" id="bg-upload" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
                  <label htmlFor="bg-upload" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors">
                    <UploadCloud className="w-5 h-5" />
                    Upload Background Image
                  </label>
                </div>
              </div>

              <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-200 transition-opacity ${!processedUrl ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Settings className="w-5 h-5" /> Adjustments</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                      <span className="flex items-center gap-1"><ZoomIn className="w-4 h-4"/> Size</span>
                      <span>{scale}%</span>
                    </div>
                    <input type="range" min="10" max="200" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                      <span className="flex items-center gap-1"><Move className="w-4 h-4"/> Horizontal Position</span>
                    </div>
                    <input type="range" min="0" max="100" value={posX} onChange={(e) => setPosX(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                      <span className="flex items-center gap-1"><Move className="w-4 h-4 rotate-90"/> Vertical Position</span>
                    </div>
                    <input type="range" min="0" max="100" value={posY} onChange={(e) => setPosY(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                </div>
              </div>

              <div className={`flex flex-col gap-3 transition-opacity ${!processedUrl ? 'opacity-50 pointer-events-none' : ''}`}>
                <button onClick={() => handleDownload('png')} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download High-Res PNG
                </button>
                <button onClick={() => handleDownload('jpeg')} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-900 shadow-md flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download High-Res JPG
                </button>
                <button onClick={() => { setOriginalUrl(null); setOriginalFile(null); setProcessedUrl(null); }} className="w-full mt-2 text-slate-500 font-medium hover:text-slate-800 py-2">
                  Start Over
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}