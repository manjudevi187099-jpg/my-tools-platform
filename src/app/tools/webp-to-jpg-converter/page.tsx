'use client';

import { useState, useRef } from 'react';
import Head from 'next/head';

export default function WebPConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/webp') {
      alert('Bhai, please sirf WebP image hi upload karein! 🖼️');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const convertAndDownload = () => {
    if (!selectedFile || !previewUrl) return;
    setIsConverting(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions matching the image
      canvas.width = img.width;
      canvas.height = img.height;

      // White background for JPEG to prevent black transparent areas
      if (format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      // Convert to selected format
      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType, 0.9); // 0.9 is quality for JPEG

      // Trigger Download
      const link = document.createElement('a');
      link.download = `converted-image.${format === 'jpeg' ? 'jpg' : 'png'}`;
      link.href = dataUrl;
      link.click();

      setIsConverting(false);
    };
    
    img.src = previewUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Free WebP to JPG/PNG Converter | DhamakaTools</title>
        <meta name="description" content="Convert WebP images to high-quality JPG or PNG instantly in your browser. 100% Free and Secure." />
      </Head>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            WebP to JPG / PNG Converter
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Apni WebP images ko 1-Click mein universally supported formats mein convert karein. (Fast, Free & 100% Secure)
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
          {/* Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              1. Upload WebP Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Click to browse</span>
                    <input id="file-upload" name="file-upload" type="file" accept="image/webp" className="sr-only" onChange={handleFileUpload} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">Only .webp images allowed</p>
              </div>
            </div>
          </div>

          {/* Preview & Convert Section */}
          {previewUrl && (
            <div className="animate-fade-in-up">
              <div className="border-t border-gray-200 pt-6 mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-4">
                  2. Choose Format & Download
                </label>
                
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setFormat('jpeg')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all border-2 ${
                      format === 'jpeg' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Convert to JPG
                  </button>
                  <button
                    onClick={() => setFormat('png')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all border-2 ${
                      format === 'png' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Convert to PNG
                  </button>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl flex justify-center mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded shadow-sm" />
                </div>

                <button
                  onClick={convertAndDownload}
                  disabled={isConverting}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white transition-all ${
                    isConverting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                  }`}
                >
                  {isConverting ? 'Processing... ⏳' : `Download as ${format === 'jpeg' ? 'JPG' : 'PNG'} 📥`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden Canvas used for conversion */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}