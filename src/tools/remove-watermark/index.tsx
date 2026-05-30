'use client';
import React, { useState } from 'react';

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendToPythonBackend = async () => {
    if (!file) return alert("Pehle file upload karein!");
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Python Backend ko call kar rahe hain
      const response = await fetch("http://localhost:8000/remove-watermark", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend failed");

      // Clean file download karna
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'perfect-clean-pdf.pdf';
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error! Kya aapne Python server (localhost:8000) chalu kiya hai?");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-2 text-green-600">AI OpenCV Watermark Remover</h2>
      <p className="text-sm text-gray-500 mb-6">
        Yeh tool Python aur OpenCV backend ka use karke sabse ziddi baked watermarks ko image processing se uda deta hai.
      </p>
      
      <input 
        type="file" 
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        className="mb-6 w-full p-2 border border-gray-300 rounded" 
      />
      
      <button 
        onClick={sendToPythonBackend} 
        disabled={isProcessing} 
        className="w-full py-4 bg-green-600 hover:bg-green-700 transition-colors text-white rounded-xl font-bold text-lg shadow-md"
      >
        {isProcessing ? 'OpenCV Processing...' : 'Remove Watermark (Python API)'}
      </button>
    </div>
  );
}