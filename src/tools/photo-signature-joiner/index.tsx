'use client';
import React, { useState, useRef } from 'react';

export default function PhotoSignatureJoiner() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to load images
  const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'photo') setPhoto(event.target?.result as string);
        else setSignature(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawToCanvas = async () => {
    if (!photo || !signature || !canvasRef.current) return;
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Images load karo
    const imgPhoto = await loadImage(photo);
    const imgSig = await loadImage(signature);

    // Canvas ki setting (Photo ki width ke hisab se)
    const canvasWidth = imgPhoto.width;
    const sigStripHeight = imgPhoto.width * 0.35; // Niche signature ka area (35% of width)
    const canvasHeight = imgPhoto.height + sigStripHeight;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (ctx) {
      // 1. Pura background ekdum White fill karein
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // 2. Photo ko upar draw karein
      ctx.drawImage(imgPhoto, 0, 0, canvasWidth, imgPhoto.height);
      
      // 3. Signature ki size calculate karein (Padding ke sath fit karne ke liye)
      const sigScale = Math.min((canvasWidth * 0.8) / imgSig.width, (sigStripHeight * 0.8) / imgSig.height);
      const sigW = imgSig.width * sigScale;
      const sigH = imgSig.height * sigScale;
      
      const sigX = (canvasWidth - sigW) / 2; // Center horizontal
      const sigY = imgPhoto.height + (sigStripHeight - sigH) / 2; // Center vertical in strip
      
      // 🌟 MAGIC TRICK: 'multiply' mode se signature ka white background gayab ho jayega
      // aur wo PNG transparent ban kar white paper par chipkega!
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(imgSig, sigX, sigY, sigW, sigH);
      
      // Mode wapas normal karein
      ctx.globalCompositeOperation = 'source-over';

      // 4. Final Image ke charo taraf ek patla border (Passport format)
      ctx.strokeStyle = '#d1d5db'; 
      ctx.lineWidth = Math.max(4, canvasWidth * 0.01);
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    }
    
    setIsProcessing(false);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `Photo_With_Signature.jpg`;
    link.href = canvasRef.current!.toDataURL('image/jpeg', 1.0); // High Quality Download
    link.click();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Photo + Signature Joiner</h2>
        <p className="text-slate-500 mt-2">Apni photo aur signature ko ek format me jodein. Signature automatic transparent hoke merge hoga.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Box 1: Photo Upload */}
        <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] relative hover:border-blue-500 transition">
          {photo ? (
            <img src={photo} alt="Photo" className="max-h-48 rounded shadow-md" />
          ) : (
            <div className="text-center">
              <span className="text-5xl">🧑</span>
              <p className="font-bold text-slate-600 mt-2">Upload Photo</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>

        {/* Box 2: Signature Upload */}
        <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] relative hover:border-blue-500 transition">
          {signature ? (
            <img src={signature} alt="Signature" className="max-h-24 rounded shadow-md bg-white p-2" />
          ) : (
            <div className="text-center">
              <span className="text-5xl">✍️</span>
              <p className="font-bold text-slate-600 mt-2">Upload Signature</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'signature')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
      </div>

      {photo && signature && (
        <div className="space-y-6">
          <button onClick={drawToCanvas} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-xl shadow-lg transition-transform hover:scale-[1.02]">
            Generate Merged Photo ✨
          </button>
          
          <canvas ref={canvasRef} className="hidden" />
          
          {canvasRef.current && !isProcessing && (
            <div className="pt-8 border-t border-slate-200 text-center bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
              <p className="font-bold text-emerald-600 text-lg mb-4">✅ Success! Your photo is ready.</p>
              <button onClick={downloadImage} className="w-full md:w-1/2 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black text-lg shadow-xl flex items-center justify-center gap-2">
                Download Image 📥
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}