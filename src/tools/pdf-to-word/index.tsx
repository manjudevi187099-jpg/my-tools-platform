'use client';
import React, { useState } from 'react';

export default function PdfToWordConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const convertPdfToWord = async () => {
    if (!file) return alert("File select karo!");
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Backend API Route ko call karna
        const res = await fetch('/api/pdf-to-word', {
          method: 'POST',
          body: JSON.stringify({ fileName: file.name, fileData: base64Data })
        });

        const result = await res.json();
        if (result.success) {
          const link = document.createElement('a');
          link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${result.docxData}`;
          link.download = file.name.replace('.pdf', '.docx');
          link.click();
        } else {
          alert("Conversion failed: " + result.error);
        }
        setIsProcessing(false);
      };
    } catch (err) {
      alert("Error: " + err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-10 bg-white rounded-xl shadow-lg border">
      <h2 className="text-2xl font-black mb-6">Pro PDF to Word (Layout Preserved)</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4" />
      <button 
        onClick={convertPdfToWord} 
        disabled={isProcessing || !file}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isProcessing ? "Converting with Layout..." : "Convert to Word (.docx)"}
      </button>
    </div>
  );
}