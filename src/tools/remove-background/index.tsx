'use client';
import React, { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';

export default function RemoveBackground() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('transparent');
  const [progress, setProgress] = useState<string>('');

  const colorPalette = [
    'transparent', 'custom', '#ffffff', '#ff3b30', 
    '#e81e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b',
    '#ffc107', '#ff9800', '#ff5722', '#795548',
    '#9e9e9e', '#607d8b', '#000000'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalImage(url);
      setProcessedImage(null); 
    }
  };

  // 🌟 NAYA SMART PRE-PROCESSOR: Ye image ko AI mein bhejney se pehle optimize karega taaki 10x fast chale
  const optimizeImageForAI = (dataUrl: string, maxSize = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        
        // Agar photo bahut badi hai, toh usko limit mein layein
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = w * ratio;
          h = h * ratio;
        } else {
          resolve(dataUrl); // Agar choti hai toh waise hi bhej do
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        
        // JPEG format mein bhejo taaki process fast ho
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = dataUrl;
    });
  };

  const removeBg = async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setProgress('Optimizing Image...');

    try {
      // 1. Pehle image ko fast processing ke liye chhota karein
      const fastImageUrl = await optimizeImageForAI(originalImage);

      setProgress('Waking up AI...');

      const config = {
        publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.5.5/dist/",
        model: 'small', // Small model for ultra-fast processing
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          setProgress(`Removing BG: ${percent}%`);
        }
      };

      // 2. Optimized image ko AI mein dalein
      const imageBlob = await (removeBackground as any)(fastImageUrl, config);
      const url = URL.createObjectURL(imageBlob);
      setProcessedImage(url);
    } catch (error) {
      console.error(error);
      alert("Background removal failed. Please check internet connection.");
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        if (selectedColor !== 'transparent') {
          ctx.fillStyle = selectedColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const link = document.createElement('a');
          link.download = `HD_Bg_Colored.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 1.0);
          link.click();
        } else {
          ctx.drawImage(img, 0, 0);

          const link = document.createElement('a');
          link.download = `HD_Transparent.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      }
    };
    img.src = processedImage;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        <div className="flex-1 bg-slate-100 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 relative min-h-[400px]">
          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Image Preview
          </div>

          {!originalImage ? (
            <div className="text-center w-full max-w-sm">
              <label className="border-4 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all bg-white shadow-sm">
                <span className="text-6xl mb-4">📤</span>
                <span className="font-bold text-slate-700 text-lg">Upload Image</span>
                <span className="text-sm text-slate-400 mt-2">JPG, PNG supported</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="w-full max-w-md relative flex flex-col items-center">
              <div 
                className="relative rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: selectedColor === 'transparent' ? 'transparent' : selectedColor,
                  backgroundImage: selectedColor === 'transparent' 
                    ? 'conic-gradient(#ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), conic-gradient(#ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' 
                    : 'none',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px'
                }}
              >
                <img 
                  src={processedImage || originalImage} 
                  alt="Preview" 
                  className="max-h-[400px] object-contain relative z-10"
                />
              </div>

              {!processedImage && (
                <button 
                  onClick={removeBg} 
                  disabled={isProcessing}
                  className="mt-6 bg-blue-600 text-white font-black py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-70 flex flex-col items-center"
                >
                  {isProcessing ? 'Removing...' : '🪄 Remove Background'}
                  {progress && <span className="text-xs font-medium mt-1 text-blue-200 block text-center max-w-[200px] leading-tight">{progress}</span>}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="w-full md:w-[400px] p-8 flex flex-col bg-white">
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Remove Image Background</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">100% Automatically and Free</p>

          <div className="flex-1">
            <h3 className="font-bold text-slate-700 mb-3 text-sm">Background color</h3>
            
            <div className="grid grid-cols-5 gap-3">
              {colorPalette.map((color, index) => {
                if (color === 'transparent') {
                  return (
                    <button 
                      key={index} 
                      onClick={() => setSelectedColor('transparent')}
                      className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center bg-white ${selectedColor === 'transparent' ? 'border-blue-600 shadow-md scale-110' : 'border-slate-200 hover:border-slate-400'}`}
                    >
                      <span className="text-slate-300 text-xl block transform -rotate-45">⊘</span>
                    </button>
                  );
                }
                
                if (color === 'custom') {
                  return (
                    <div key={index} className={`h-12 w-12 rounded-lg border-2 relative overflow-hidden ${selectedColor !== 'transparent' && !colorPalette.includes(selectedColor) ? 'border-blue-600 shadow-md scale-110' : 'border-slate-200 hover:border-slate-400'}`}>
                       <input 
                         type="color" 
                         onChange={(e) => setSelectedColor(e.target.value)}
                         className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
                       />
                       <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)' }}></div>
                    </div>
                  );
                }

                return (
                  <button 
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`h-12 w-12 rounded-lg border-2 shadow-sm transition-transform ${selectedColor === color ? 'border-blue-600 scale-110 shadow-md ring-2 ring-blue-200' : 'border-transparent hover:scale-105'}`}
                  />
                );
              })}
            </div>
            
            <p className="text-xs text-slate-400 mt-4 font-medium text-center">
              * Transparent will download as HD PNG.<br/>
              * Colored will download as HD JPG.
            </p>
          </div>

          <button 
            onClick={downloadImage}
            disabled={!processedImage}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${!processedImage ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#0f172a] text-white hover:bg-blue-600 shadow-xl hover:-translate-y-1'}`}
          >
            Download HD Image 📥
          </button>

        </div>
      </div>
    </div>
  );
}