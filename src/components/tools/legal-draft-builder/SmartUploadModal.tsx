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

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 500);

    // 🚀 FINAL AI MOCK DATA WITH ARRAYS & THANA NO.
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const extractedData = {
        sellers: [{ name: "अजय कुमार गुप्ता", father: "स्व० रामजी साह", age: "48", mobile: "", aadhaar: "584586136768", pan: "", address: "मधुबन, पूर्वी चम्पारण" }],
        buyers: [{ name: "मनोज कुमार", father: "श्री भोला प्रसाद", age: "30", mobile: "7779918941", aadhaar: "244628716369", pan: "CRMPK9849J", address: "मधुबन, पूर्वी चम्पारण" }],
        documentType: 'विक्रय-पत्र (SALE DEED)',
        state: "बिहार", district: "पूर्वी चम्पारण", circle: "मधुबन", policeStation: "मधुबन", thanaNo: "82",
        mauza: "मधुबन टोला भवरुआ", khataNo: "134", plotNo: "26", area: "0-1-0 (एक कट्ठा) यानी 4.70 डिसमिल", landType: "सड़क किनारे आवासीय रिक्त",
        jamabandiNo: "261", ownershipHistory: "बजरिये खरीदगी केवाला मरकुमा ता०:- 18-05-1984ई० वो दास्तावेज नं०:-3757 (रामरती कुँबर बनाम विक्रेता)",
        sellingReason: "परिवार के भरण-पोषण, आवश्यक कानूनी खर्चों एवं अन्य व्यक्तिगत कार्यों की पूर्ति हेतु",
        boundaryNorth: "पक्की रोड़", boundarySouth: "नागेन्द्र साह", boundaryEast: "अजय कुमार गुप्ता", boundaryWest: "दिनेश प्रसाद सिंह वो महेश प्रसाद सिंह",
        saleAmount: "1000000", advanceAmount: "", remainingAmount: "1000000", paymentMode: "Cash",
        stampValue: "1000", registrationOffice: "चकिया",
        identifierName: "प्रकाश चंद", identifierAddress: "मधुबन",
        witness1Name: "तनवीर", witness1Address: "मधुबन", witness2Name: "", witness2Address: "",
        possessionDate: "", registrationDate: "", deedWriterName: ""
      };

      setTimeout(() => {
        setIsScanning(false);
        onDataExtracted(extractedData);
        onClose();
      }, 500);

    }, 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all">
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold">✕</button>
          <span className="text-4xl mb-2 block">🤖</span>
          <h2 className="text-2xl font-black">AI Smart Scanner Pro</h2>
          <p className="text-indigo-200 text-sm mt-1">Extracting Multiple Parties & Thana No.</p>
        </div>
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
              </div>
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