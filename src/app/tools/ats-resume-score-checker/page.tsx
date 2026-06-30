'use client';

import { useState } from 'react';
import Head from 'next/head';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Yeh line PDF worker ko CDN se load karti hai taaki Vercel par koi error na aaye
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ATSResumeChecker() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  } | null>(null);

  // Common stop words jo humein match nahi karne
  const stopWords = ['and', 'the', 'to', 'of', 'in', 'for', 'with', 'on', 'this', 'that', 'is', 'a', 'an', 'as', 'be', 'are'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Bhai, please sirf PDF file upload karein! 📄');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
      try {
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + ' ';
        }
        
        setResumeText(fullText);
      } catch (error) {
        console.error("PDF read error:", error);
        alert("PDF padhne mein error aaya. Kripya dusri file try karein.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const extractKeywords = (text: string) => {
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    // Unik (unique) words nikalna jo stop words nahi hain
    return Array.from(new Set(words.filter(word => word.length > 2 && !stopWords.includes(word))));
  };

  const analyzeResume = () => {
    if (!jobDescription.trim()) {
      alert("Pehle Job Description (JD) toh daaliye! 😅");
      return;
    }
    if (!resumeText.trim()) {
      alert("Pehle apna PDF Resume upload karein! 📄");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const jdKeywords = extractKeywords(jobDescription);
      const resumeKeywords = extractKeywords(resumeText);

      const matched = jdKeywords.filter(kw => resumeKeywords.includes(kw));
      const missing = jdKeywords.filter(kw => !resumeKeywords.includes(kw));

      // Score calculation
      const scorePercentage = Math.round((matched.length / jdKeywords.length) * 100) || 0;

      setResult({
        score: scorePercentage,
        matchedKeywords: matched,
        missingKeywords: missing,
      });

      setIsAnalyzing(false);
    }, 1500); // Thoda loading effect ke liye 1.5 second ka delay
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Free ATS Resume Score Checker Online | DhamakaTools</title>
        <meta name="description" content="Check your ATS resume score for free. Upload your PDF resume and compare it with the job description to get instant keyword matching results." />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Free ATS Resume Score Checker
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Apne resume ko Job Description ke sath compare karein aur interview ke chances badhayein! (100% Free & Secure)
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Side: Job Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                1. Paste Job Description (JD)
              </label>
              <textarea
                rows={10}
                className="w-full rounded-md border border-gray-300 p-4 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                placeholder="Yahan job ki requirements aur details paste karein..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Right Side: Resume Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                2. Upload Your Resume (PDF)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Only PDF files up to 5MB</p>
                </div>
              </div>
              {fileName && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm font-medium text-center">
                  ✅ Uploaded: {fileName}
                </div>
              )}
            </div>
          </div>

          {/* Analyze Button */}
          <div className="mt-8">
            <button
              onClick={analyzeResume}
              disabled={isAnalyzing}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white transition-colors ${
                isAnalyzing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isAnalyzing ? 'Scanning Resume... 🔍' : 'Check ATS Score 🚀'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Analysis Result</h2>
            
            <div className="flex justify-center mb-8">
              <div className={`text-5xl font-extrabold p-8 rounded-full border-8 ${
                result.score >= 80 ? 'border-green-500 text-green-600' : 
                result.score >= 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'
              }`}>
                {result.score}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-3">✅ Matched Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.length > 0 ? result.matchedKeywords.slice(0, 15).map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">{kw}</span>
                  )) : <p className="text-sm text-gray-500">Koi keyword match nahi hua.</p>}
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h3 className="text-lg font-bold text-red-800 mb-3">❌ Missing Keywords (Add These!)</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.length > 0 ? result.missingKeywords.slice(0, 15).map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm">{kw}</span>
                  )) : <p className="text-sm text-gray-500">Perfect! Saare important keywords match ho gaye.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}