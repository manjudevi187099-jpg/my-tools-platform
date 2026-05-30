'use client';
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Worker setup jaisa invert-pdf mein kiya tha
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function RemoveWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractToImages = async () => {
    if (!file) return alert("Pehle PDF file upload karo bhai!");
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Har page ko high-quality image mein convert karke download karenge
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for High Quality
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page into canvas
        await page.render({ canvasContext: context, viewport }).promise;
        
        // Convert canvas to JPG
        const imageUrl = canvas.toDataURL('image/jpeg', 1.0);
        
        // Auto Download Trigger
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `watermark-ready-page-${i}.jpg`;
        a.click();
      }
    } catch (error) {
      console.error(error);
      alert("Error processing file!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-2 text-blue-600">Advanced Watermark Remover</h2>
      <p className="text-sm text-gray-500 mb-6">
        Note: Ye tool PDF ko High-Quality Images mein badal dega. Image download hone ke baad aap Paint/Gallery se watermark easily erase kar sakte hain.
      </p>
      
      <input 
        type="file" 
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        className="mb-6 w-full p-2 border border-gray-300 rounded" 
      />
      
      <button 
        onClick={extractToImages} 
        disabled={isProcessing} 
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl font-bold text-lg shadow-md"
      >
        {isProcessing ? 'Extracting Pages...' : 'Prepare PDF for Cleaning'}
      </button>
    </div>
  );
}