'use client';
import React, { useState, useRef } from 'react';

export default function SignatureOnPhoto() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verticalPosition, setVerticalPosition] = useState(90); 
  const [sigSize, setSigSize] = useState(40); 
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    
    const imgPhoto = await loadImage(photo);
    const imgSig = await loadImage(signature);

    // High Quality ke liye original dimensions lock kar rahe hain
    canvas.width = imgPhoto.width;
    canvas.height = imgPhoto.height;

    if (ctx) {
      // 1. Main Photo ko draw karein
      ctx.drawImage(imgPhoto, 0, 0, canvas.width, canvas.height);
      
      // 2. Signature ki size calculate karein
      const targetSigWidth = canvas.width * (sigSize / 100);
      const sigScale = targetSigWidth / imgSig.width;
      const sigW = targetSigWidth;
      const sigH = imgSig.height * sigScale;
      
      // 3. Position calculate karein
      const sigX = (canvas.width - sigW) / 2;
      const maxAvailableY = canvas.height - sigH;
      const sigY = maxAvailableY * (verticalPosition / 100);
      
      // 🌟 MAGIC FIX: Signature ka grey background hata kar pure white karne ke liye filter lagaya
      ctx.filter = 'grayscale(100%) contrast(300%) brightness(150%)';
      ctx.globalCompositeOperation = 'multiply';
      
      ctx.drawImage(imgSig, sigX, sigY, sigW, sigH);
      
      // 🌟 Reset mode (taaki dusri cheezon par asar na pade)
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
    }
    
    setIsProcessing(false);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    // Quality down na ho isliye lossless PNG format me export kar rahe hain
    link.download = `Self_Attested_Photo.png`;
    link.href = canvasRef.current!.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Signature on Photo</h2>
        <p className="text-slate-500 mt-2">Photo ke upar signature automatically transparent hokar lagega.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center relative hover:border-blue-500">
          <p className="font-bold mb-2">1. Main Photo</p>
          {photo ? <img src={photo} className="max-h-32 rounded shadow" alt="Photo" /> : <div className="text-4xl">🧑</div>}
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>

        <div className="border-4 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center relative hover:border-blue-500">
          <p className="font-bold mb-2">2. Signature Image</p>
          {signature ? <img src={signature} className="max-h-32 rounded shadow bg-white" alt="Signature" /> : <div className="text-4xl">✍️</div>}
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'signature')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
      </div>

      {photo && signature && (
        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-700 block mb-2">Signature Size: {sigSize}%</label>
              <input type="range" min="10" max="100" value={sigSize} onChange={(e) => setSigSize(Number(e.target.value))} className="w-full cursor-pointer" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-2">Up/Down Position</label>
              <input type="range" min="0" max="100" value={verticalPosition} onChange={(e) => setVerticalPosition(Number(e.target.value))} className="w-full cursor-pointer" />
            </div>
          </div>

          <button onClick={drawToCanvas} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-xl shadow-lg transition-transform hover:scale-[1.02]">
            Overlay Signature ✨
          </button>
          
          <canvas ref={canvasRef} className="hidden" />
          
          {canvasRef.current && !isProcessing && (
            <div className="pt-6 border-t border-slate-200 text-center">
              <button onClick={downloadImage} className="w-full md:w-1/2 mx-auto bg-emerald-600 text-white py-4 rounded-xl font-black text-lg shadow-xl">
                Download High-Quality Result 📥
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}