'use client';
import React, { useState, useRef } from 'react';

export default function AddNameDate() {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const drawToCanvas = () => {
    if (!image || !canvasRef.current) return;
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;

    img.onload = () => {
      // White strip ki height image ki width ke hisab se responsive banayi hai (25%)
      const stripHeight = img.width * 0.25; 
      
      canvas.width = img.width;
      canvas.height = img.height + stripHeight; // Original height + niche white space

      if (ctx) {
        // 1. Background ko pura white fill karein
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. Photo ko top par draw karein
        ctx.drawImage(img, 0, 0);
        
        // 3. Photo ke charo taraf ek halka sa border (Jaise passport photo me hota hai)
        ctx.strokeStyle = '#e2e8f0'; 
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // 4. Text ki styling
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        
        // Font sizes ko image ki size ke hisab se adjust kiya gaya hai
        const fontSizeName = img.width * 0.08; 
        const fontSizeDate = img.width * 0.06; 
        
        // 5. Name Print karein (Bada aur Bold)
        ctx.font = `900 ${fontSizeName}px Arial, sans-serif`;
        ctx.fillText(name.toUpperCase(), canvas.width / 2, img.height + (stripHeight * 0.45));
        
        // 6. Date Print karein (Thoda chota aur Bold)
        ctx.font = `bold ${fontSizeDate}px Arial, sans-serif`;
        ctx.fillText(date, canvas.width / 2, img.height + (stripHeight * 0.85));
      }
      setIsProcessing(false);
    };
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `Photo_${name || 'Edited'}.jpg`;
    link.href = canvasRef.current!.toDataURL('image/jpeg', 1.0); // 1.0 for Max Quality
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Add Name & Date</h2>
      </div>
      {!image ? (
        <div className="border-4 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer text-blue-600 font-bold text-lg">📁 Click to Upload Photo</label>
        </div>
      ) : (
        <div className="space-y-6">
          <img src={image} alt="Original Preview" className="max-h-60 mx-auto rounded-xl border shadow-sm" />
          <input type="text" placeholder="Enter Name (e.g. PAYAL YADAV)" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 border rounded-xl" />
          <input type="text" placeholder="Enter Date (e.g. 15/07/1999)" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 border rounded-xl" />
          <button onClick={drawToCanvas} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg transition-transform hover:scale-[1.02]">Generate Format ✨</button>
          
          {/* Hidden Canvas - Ye background me drawing karta hai */}
          <canvas ref={canvasRef} className="hidden" />
          
          {canvasRef.current && !isProcessing && (
            <div className="pt-4 border-t text-center space-y-4">
              <p className="font-bold text-slate-500">Your final photo is ready!</p>
              <button onClick={downloadImage} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg shadow-lg">Download Result 📥</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}