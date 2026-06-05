'use client';

import React, { useState } from 'react';

export default function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Bhai, pehle ek PDF file toh select karo!');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/pdf-to-word', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server mein kuch issue aa gaya.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_converted.docx'); 
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
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-center">
          <span className="text-5xl mb-4 block">📄</span>
          <h1 className="text-3xl font-black text-white">PDF to Word Converter</h1>
          <p className="text-blue-100 mt-2 font-medium">Extract text and paragraphs into an editable Word document instantly.</p>
        </div>
        
        <div className="p-10 text-center space-y-8">
          
          <div className="border-2 border-dashed border-blue-300 rounded-3xl p-12 bg-blue-50 hover:bg-blue-100 transition-colors">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-slate-500 mx-auto
                file:mr-4 file:py-3 file:px-8
                file:rounded-full file:border-0
                file:text-sm file:font-black
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700 file:cursor-pointer cursor-pointer transition-colors"
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
                : 'bg-slate-900 hover:bg-black text-white shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1'
            }`}
          >
            {loading ? '⚙️ Processing... (Magic happens here)' : '🚀 Convert to Word Now'}
          </button>
          
        </div>
      </div>
    </div>
  );
}