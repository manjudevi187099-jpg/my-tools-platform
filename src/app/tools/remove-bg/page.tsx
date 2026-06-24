'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';
import { UploadCloud, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';

type BgType = 'transparent' | 'color' | 'image';

export default function BackgroundChanger() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  const [bgType, setBgType] = useState<BgType>('transparent');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  
  const [scale, setScale] = useState(100);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);

  // WASM Fix for Next.js
  useEffect(() => {
    env.allowLocalModels = false;
    (env as any).backends.onnx.wasm.numThreads = 1;
    (env as any).backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/';
  }, []);

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

  const handleRemoveBackground = async () => {
    if (!originalUrl) return;
    setIsProcessing(true);
    setProgress(10);
    setStatusText("Loading AI Model...");

    try {
      const processor = await AutoProcessor.from_pretrained('Xenova/modnet');
      const model = await AutoModel.from_pretrained('Xenova/modnet');
      
      setProgress(40);
      setStatusText("Analyzing Image...");

      const image = await RawImage.fromURL(originalUrl);
      const { pixel_values } = await processor(image);
      const { output } = await model({ input: pixel_values });

      setProgress(80);
      setStatusText("Applying Transparency...");

      const maskData = (await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(image.width, image.height)).data;
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Canvas context not found");
      
      ctx.drawImage(image.toCanvas(), 0, 0);
      const pixelData = ctx.getImageData(0, 0, image.width, image.height);
      
      for (let i = 0; i < maskData.length; ++i) {
        pixelData.data[4 * i + 3] = maskData[i]; 
      }
      ctx.putImageData(pixelData, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error("Blob failed")), "image/png");
      });

      setProcessedUrl(URL.createObjectURL(blob));
      setProgress(100);
      setStatusText("Done!");

    } catch (error) {
      console.error('Hugging Face Error:', error);
      alert('Failed to process image. Check console for details.');
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
    <div className="w-full">
      {/* 🌟 OMR WALA GRID LAYOUT 🌟 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SETTINGS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-blue-600" /> Image Setup
            </h3>
            
            {!originalUrl ? (
              <div 
                {...getRootProps()} 
                className={`border-4 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="w-12 h-12 text-blue-600 mb-3" />
                <p className="font-bold text-slate-700 text-center">Drag & Drop Image Here</p>
                <p className="text-sm text-slate-500 mt-1">or click to browse</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!processedUrl && !isProcessing && (
                  <button 
                    onClick={handleRemoveBackground}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-black text-lg shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" /> Remove Background
                  </button>
                )}
                {isProcessing && (
                  <div className="w-full bg-slate-100 py-4 rounded-xl border border-slate-200 flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                    <p className="font-bold text-blue-600">{statusText} ({progress}%)</p>
                  </div>
                )}
                <button 
                  onClick={() => { setOriginalUrl(null); setOriginalFile(null); setProcessedUrl(null); }} 
                  className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Upload New Image
                </button>
              </div>
            )}
          </div>

          <div className={`bg-white rounded-3xl shadow-xl border border-slate-200 p-6 transition-opacity duration-300 ${!processedUrl ? 'opacity-40 pointer-events-none' : ''}`}>
            <h3 className="font-bold text-lg text-slate-800 mb-4">New Background</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <button onClick={() => setBgType('transparent')} className={`h-12 rounded-xl border-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==')] ${bgType === 'transparent' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="Transparent"></button>
              <button onClick={() => { setBgType('color'); setBgColor('#ffffff'); }} className={`h-12 rounded-xl border-2 bg-white ${bgType === 'color' && bgColor === '#ffffff' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="White"></button>
              <button onClick={() => { setBgType('color'); setBgColor('#ef4444'); }} className={`h-12 rounded-xl border-2 bg-red-500 ${bgType === 'color' && bgColor === '#ef4444' ? 'border-blue-600 shadow-md' : 'border-slate-200'}`} title="Red"></button>
              <div className={`relative h-12 rounded-xl border-2 overflow-hidden ${bgType === 'color' && !['#ffffff','#ef4444'].includes(bgColor) ? 'border-blue-600 shadow-md' : 'border-slate-200'}`}>
                <input type="color" value={bgColor} onChange={(e) => { setBgType('color'); setBgColor(e.target.value); }} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <input type="file" id="bg-upload" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
              <label htmlFor="bg-upload" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors">
                <UploadCloud className="w-5 h-5" /> Upload Custom Image
              </label>
            </div>
          </div>

          <div className={`transition-opacity duration-300 ${!processedUrl ? 'opacity-40 pointer-events-none' : ''}`}>
             <button 
                onClick={() => handleDownload('png')} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-xl shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 mb-3"
             >
                <Download className="w-6 h-6" /> Download PNG 📥
             </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-7 bg-slate-100 rounded-3xl border border-slate-200 p-6 flex flex-col items-center relative min-h-[500px]">
          
          <div className="flex justify-between items-center w-full mb-4 sticky top-0 bg-slate-100 py-2 z-10">
            <h3 className="font-bold text-xl text-slate-800">Live View</h3>
            {processedUrl ? (
               <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">AI Processed</span>
            ) : originalUrl ? (
               <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200">Ready to Process</span>
            ) : null}
          </div>

          <div className="w-full flex-grow flex items-center justify-center relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-white shadow-inner">
            {!originalUrl ? (
               <div className="text-slate-400 flex flex-col items-center">
                  <ImageIcon className="w-16 h-16 mb-2 opacity-30" />
                  <p className="font-medium">Upload image from left panel</p>
               </div>
            ) : !processedUrl ? (
               <img src={originalUrl} alt="Original" className="max-w-full max-h-[600px] object-contain drop-shadow-md p-4" />
            ) : (
               <div className="absolute inset-0 w-full h-full flex items-center justify-center" 
                    style={{
                      backgroundColor: bgType === 'color' ? bgColor : bgType === 'transparent' ? '#e2e8f0' : 'transparent',
                      backgroundImage: bgType === 'transparent' ? 'repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), repeating-linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1)' : bgType === 'image' && bgImageUrl ? `url(${bgImageUrl})` : 'none',
                      backgroundPosition: bgType === 'transparent' ? '0 0, 10px 10px' : 'center',
                      backgroundSize: bgType === 'transparent' ? '20px 20px' : 'cover',
                    }}>
                 <img src={processedUrl} alt="Subject" 
                   style={{
                     transform: `scale(${scale / 100}) translate(${(posX - 50)}%, ${(posY - 50)}%)`,
                     transformOrigin: 'center', transition: 'transform 0.1s ease-out'
                   }}
                   className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
                 />
               </div>
            )}
          </div>

          {processedUrl && (
             <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 mt-4 flex gap-4">
                <div className="flex-1">
                   <p className="text-xs font-bold text-slate-500 mb-2">ZOOM / SIZE</p>
                   <input type="range" min="10" max="200" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}