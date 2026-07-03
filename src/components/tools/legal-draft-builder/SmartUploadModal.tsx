'use client';

import React, { useState } from 'react';

export default function SmartUploadModal({ 
  isOpen, 
  onClose, 
  onDataExtracted 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onDataExtracted: (data: any) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleScan = () => {
    if (!file) {
      alert("Bhai, pehle koi file toh select karo!");
      return;
    }

    setIsScanning(true);
    setProgress(10);

    // AI Scanning Animation Simulation (Fake progress for UI)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 500);

    // 🚀 MOCK AI OCR RESPONSE (Yahan hum baad mein real API lagayenge)
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Yeh wahi data hai jo aapki bheji hui PDF se nikla tha!
      const extractedData = {
        sellerName: "अजय कुमार गुप्ता",
        sellerFather: "स्व० रामजी साह",
        sellerAge: "48",
        sellerAddress: "मधुबन, पूर्वी चम्पारण, बिहार",
        buyerName: "मनोज कुमार",
        buyerFather: "श्री भोला प्रसाद",
        buyerAge: "30",
        buyerAddress: "मधुबन, पूर्वी चम्पारण, बिहार",
        state: "बिहार",
        district: "पूर्वी चम्पारण",
        circle: "मधुबन",
        policeStation: "मधुबन",
        mauza: "मधुबन टोला भवरुआ",
        khataNo: "134",
        plotNo: "26",
        area: "0-1-0 (एक कट्ठा) यानी 4.70 डिसमिल",
        landType: "सड़क किनारे आवासीय रिक्त",
        boundaryNorth: "पक्की रोड़",
        boundarySouth: "नागेन्द्र साह",
        boundaryEast: "अजय कुमार गुप्ता",
        boundaryWest: "दिनेश प्रसाद सिंह वो महेश प्रसाद सिंह",
        saleAmount: "1000000",
        stampValue: "1000",
        registrationOffice: "चकिया"
      };

      setTimeout(() => {
        setIsScanning(false);
        onDataExtracted(extractedData); // Data wapas main form ko bhej diya
        onClose(); // Modal band kar diya
      }, 500);

    }, 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold">✕</button>
          <span className="text-4xl mb-2 block">🤖</span>
          <h2 className="text-2xl font-black">AI Smart Scanner</h2>
          <p className="text-indigo-200 text-sm mt-1">Upload Old Deed (PDF/Image) to Auto-Fill Data</p>
        </div>

        {/* Body */}
        <div className="p-8">
          {!isScanning ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-full border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center hover:bg-indigo-50 transition-colors">
                <input type="file" id="upload-deed" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
                <label htmlFor="upload-deed" className="cursor-pointer flex flex-col items-center gap-3">
                  <span className="text-5xl">📄</span>
                  <span className="font-bold text-gray-700">
                    {file ? file.name : "Click to Upload Old Deed"}
                  </span>
                  <span className="text-xs text-gray-400">Supports PDF, JPG, PNG</span>
                </label>
              </div>

              <button 
                onClick={handleScan}
                disabled={!file}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg ${file ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Scan & Extract Data ✨
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 gap-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-gray-800 animate-pulse">Reading Document...</h3>
                <p className="text-gray-500 text-sm mt-2">Extracting Names, Boundaries & Property Details</p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}