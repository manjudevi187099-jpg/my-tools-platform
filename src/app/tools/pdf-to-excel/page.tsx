'use client';

import React, { useState } from 'react';

export default function PdfToExcelTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Jab user file select karega
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  // Jab user 'Convert' button dabayega
  const handleConvert = async () => {
    if (!file) {
      setError('Bhai, pehle ek PDF file toh select karo!');
      return;
    }

    setLoading(true);
    setError('');

    // File ko ek 'Parcel' mein pack kar rahe hain
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 🚀 Hamare Python Engine (Port 8000) ko parcel bhej rahe hain
      const response = await fetch('/api/pdf-to-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server mein kuch issue aa gaya.');
      }

      // 🎉 Python ne Excel file bana kar bheji, ab hum usey download karwayenge
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Nayi file ka naam set kar rahe hain
      a.download = file.name.replace('.pdf', '_converted.xlsx'); 
      document.body.appendChild(a);
      a.click();
      a.remove();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-10 text-center">
          <span className="text-5xl mb-4 block">📊</span>
          <h1 className="text-3xl font-black text-white">PDF to Excel Converter</h1>
          <p className="text-green-100 mt-2 font-medium">Extract tables and data from your PDF into a clean Excel spreadsheet instantly.</p>
        </div>
        
        {/* Upload Section */}
        <div className="p-10 text-center space-y-8">
          
          <div className="border-2 border-dashed border-green-300 rounded-3xl p-12 bg-green-50 hover:bg-green-100 transition-colors">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-slate-500 mx-auto
                file:mr-4 file:py-3 file:px-8
                file:rounded-full file:border-0
                file:text-sm file:font-black
                file:bg-green-600 file:text-white
                hover:file:bg-green-700 file:cursor-pointer cursor-pointer transition-colors"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200">
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all duration-300 ${
              !file || loading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 hover:bg-black text-white shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1'
            }`}
          >
            {loading ? '⚙️ Processing... (Magic happens here)' : '🚀 Convert to Excel Now'}
          </button>
          
        </div>
      </div>
    </div>
  );
}