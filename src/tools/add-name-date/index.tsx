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
      const stripHeight = 100;
      canvas.width = img.width;
      canvas.height = img.height + stripHeight;

      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, img.height, canvas.width, stripHeight);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.font = 'bold 45px Arial';
        ctx.fillText(name.toUpperCase(), canvas.width / 2, img.height + 40);
        ctx.font = 'bold 35px Arial';
        ctx.fillText(date, canvas.width / 2, img.height + 85);
      }
      setIsProcessing(false);
    };
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `Photo_${name || 'Edited'}.jpg`;
    link.href = canvasRef.current!.toDataURL('image/jpeg', 0.9);
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
          <label htmlFor="fileInput" className="cursor-pointer text-blue-600 font-bold">📁 Click to Upload Photo</label>
        </div>
      ) : (
        <div className="space-y-6">
          <img src={image} alt="Preview" className="max-h-60 mx-auto rounded-xl border" />
          <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} className="w-full p-4 border rounded-xl" />
          <input type="text" placeholder="Date" onChange={(e) => setDate(e.target.value)} className="w-full p-4 border rounded-xl" />
          <button onClick={drawToCanvas} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black">Generate</button>
          <canvas ref={canvasRef} className="hidden" />
          {canvasRef.current && !isProcessing && (
            <button onClick={downloadImage} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black">Download Result</button>
          )}
        </div>
      )}
    </div>
  );
}