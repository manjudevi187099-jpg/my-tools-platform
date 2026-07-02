'use client';

import React from 'react';

// 🔥 FIX: formData = {} lagaya hai taaki Vercel build time par crash na ho
export default function DeedPreview({ formData = {} }: { formData?: any }) {
  
  // A4 Page Styling (Tailwind CSS)
  const pageStyle = "w-[21cm] min-h-[29.7cm] bg-white shadow-2xl mx-auto my-8 p-16 border border-gray-200 text-gray-900 text-justify leading-relaxed font-serif relative print:shadow-none print:border-none print:m-0 print:p-0";
  const watermark = "absolute inset-0 flex items-center justify-center opacity-10 text-8xl font-black text-red-500 pointer-events-none rotate-45 select-none print:hidden"; 

  // 🖨️ Function 1: Print or Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // 📝 Function 2: Export to MS Word (.doc)
  const exportToWord = () => {
    if (typeof document === 'undefined') return; // Server side render safety
    
    const documentHTML = document.getElementById("deed-document")?.innerHTML;
    if (!documentHTML) return;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Sale Deed Draft</title>
        <style>
          body { font-family: 'Mangal', 'Arial Unicode MS', serif; }
          .page-break { page-break-after: always; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .underline { text-decoration: underline; }
        </style>
      </head><body>
    `;
    const footer = "</body></html>";
    const fullHTML = header + documentHTML + footer;

    const blob = new Blob(['\ufeff', fullHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sale_Deed_${formData?.sellerName || 'Draft'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-200 py-10 overflow-x-auto relative">
      
      {/* 🔴 CONTROL PANEL (Export Buttons) */}
      <div className="sticky top-4 z-50 flex justify-center gap-4 mb-8 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all"
        >
          🖨️ Print / Save PDF
        </button>
        <button 
          onClick={exportToWord}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all"
        >
          📝 Download MS Word
        </button>
      </div>

      {/* 📄 DEED DOCUMENT CONTAINER */}
      <div id="deed-document">
        
        {/* ================= PAGE 1 : STAMP & HEADER ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          <div className="h-48 border-b-2 border-dashed border-gray-400 mb-8 flex items-center justify-center">
            <p className="text-gray-400 font-bold">[ Space Left for e-Stamp / Non-Judicial Stamp of ₹{formData?.stampValue || '_____'} ]</p>
          </div>
          <h1 className="text-center text-3xl font-black underline mb-8" style={{textAlign: 'center'}}>बिक्री पत्र (SALE DEED)</h1>
          
          <p className="text-lg">
            यह बिक्री पत्र (Sale Deed) आज दिनांक <strong>{formData?.registrationDate || '__________'}</strong> को 
            सब-रजिस्ट्रार कार्यालय, <strong>{formData?.registrationOffice || '__________'}</strong> में निष्पादित (executed) किया जा रहा है।
          </p>
          <br/>
          <p className="text-lg">
            यह दस्तावेज़ राज्य <strong>{formData?.state || '__________'}</strong> के नियमों के अंतर्गत मान्य है।
          </p>
          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 2 : PARTIES DETAILS ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          <h2 className="text-2xl font-bold underline mb-6">प्रथम पक्ष / विक्रेता (SELLER)</h2>
          <p className="text-lg mb-8 leading-loose">
            नाम: <strong>{formData?.sellerName || '__________'}</strong><br/>
            पिता/पति का नाम: <strong>{formData?.sellerFather || '__________'}</strong><br/>
            उम्र: <strong>{formData?.sellerAge || '___'} वर्ष</strong><br/>
            निवासी: <strong>{formData?.sellerAddress || '_________________________________'}</strong><br/>
            पैन कार्ड नं: {formData?.sellerPan || '__________'} | आधार नं: {formData?.sellerAadhaar ? 'उपलब्ध' : '__________'}<br/>
            (जिन्हें आगे इस विलेख में "विक्रेता" कहा गया है, जिसमें उनके कानूनी वारिस भी शामिल हैं।)
          </p>

          <h2 className="text-2xl font-bold underline mb-6 mt-12">द्वितीय पक्ष / क्रेता (BUYER)</h2>
          <p className="text-lg leading-loose">
            नाम: <strong>{formData?.buyerName || '__________'}</strong><br/>
            पिता/पति का नाम: <strong>{formData?.buyerFather || '__________'}</strong><br/>
            उम्र: <strong>{formData?.buyerAge || '___'} वर्ष</strong><br/>
            निवासी: <strong>{formData?.buyerAddress || '_________________________________'}</strong><br/>
            पैन कार्ड नं: {formData?.buyerPan || '__________'} | आधार नं: {formData?.buyerAadhaar ? 'उपलब्ध' : '__________'}<br/>
            (जिन्हें आगे इस विलेख में "क्रेता" कहा गया है, जिसमें उनके कानूनी वारिस भी शामिल हैं।)
          </p>
          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 3 : PAYMENT DETAILS ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          <h2 className="text-2xl font-bold underline mb-6">बिक्री का कारण और भुगतान (PAYMENT DETAILS)</h2>
          <p className="text-lg leading-loose">
            चूंकि विक्रेता को अपनी पारिवारिक और व्यक्तिगत जरूरतों के लिए धन की सख्त आवश्यकता है, इसलिए विक्रेता ने अपनी संपत्ति को बेचने का प्रस्ताव रखा जिसे क्रेता ने स्वीकार कर लिया।
          </p>
          <p className="text-lg leading-loose mt-4">
            यह सौदा कुल <strong>₹{formData?.saleAmount || '__________'}</strong> (रुपये) में तय हुआ है। 
            क्रेता ने विक्रेता को अग्रिम (Advance) के रूप में <strong>₹{formData?.advanceAmount || '__________'}</strong> का भुगतान कर दिया है। 
            शेष राशि <strong>₹{formData?.remainingAmount || '__________'}</strong> का भुगतान <strong>{formData?.paymentMode || '__________'}</strong> के माध्यम से आज किया जा रहा है।
          </p>
          <p className="text-lg mt-4 font-bold">
            अब विक्रेता के पास क्रेता से कोई भी राशि लेनी शेष नहीं है।
          </p>
          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 4 : DECLARATION & TERMS ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          <h2 className="text-2xl font-bold underline mb-6">शर्तें और घोषणा (TERMS & DECLARATION)</h2>
          <ol className="list-decimal pl-6 text-lg leading-loose space-y-4">
            <li>आज दिनांक <strong>{formData?.possessionDate || '__________'}</strong> से उक्त संपत्ति पर क्रेता का पूर्ण रूप से भौतिक और कानूनी कब्ज़ा (Possession) हो गया है।</li>
            <li>इस संपत्ति पर पहले से कोई बैंक लोन, केस, या विवाद लंबित नहीं है। यह संपत्ति हर प्रकार के भार से मुक्त है।</li>
            <li>क्रेता आज से इस संपत्ति का उपयोग अपने अनुसार कर सकता है और अपने नाम से दाखिल-खारिज (Mutation) करवा सकता है।</li>
            {formData?.specialConditions && (
              <li>विशेष शर्त: <strong>{formData?.specialConditions}</strong></li>
            )}
          </ol>
          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 5 : PROPERTY SCHEDULE ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          <h2 className="text-2xl font-bold underline mb-6">संपत्ति का विवरण (SCHEDULE OF PROPERTY)</h2>
          <p className="text-lg leading-loose bg-gray-50 p-6 border rounded-lg">
            जिला: <strong>{formData?.district || '__________'}</strong>, अंचल/सर्किल: <strong>{formData?.circle || '__________'}</strong>, थाना: <strong>{formData?.policeStation || '__________'}</strong><br/>
            मौजा: <strong>{formData?.mauza || '__________'}</strong>, वार्ड नं: <strong>{formData?.wardNo || '__________'}</strong><br/>
            खाता नं (Khata No): <strong>{formData?.khataNo || '__________'}</strong><br/>
            खेसरा/प्लॉट नं (Plot No): <strong>{formData?.plotNo || '__________'}</strong><br/>
            रकबा (Area): <strong>{formData?.area || '__________'}</strong><br/>
            ज़मीन का प्रकार: <strong>{formData?.landType || '__________'}</strong>
          </p>

          <h3 className="text-xl font-bold underline mb-4 mt-8">चौहद्दी (BOUNDARY)</h3>
          <ul className="text-lg leading-loose pl-4">
            <li><strong>उत्तर (North):</strong> {formData?.boundaryNorth || '__________________'}</li>
            <li><strong>दक्षिण (South):</strong> {formData?.boundarySouth || '__________________'}</li>
            <li><strong>पूरब (East):</strong> {formData?.boundaryEast || '__________________'}</li>
            <li><strong>पश्चिम (West):</strong> {formData?.boundaryWest || '__________________'}</li>
          </ul>
          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 6 : SIGNATURES & WITNESSES ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          <h2 className="text-2xl font-bold underline mb-8">गवाह और हस्ताक्षर (WITNESSES & SIGNATURES)</h2>
          <p className="text-lg mb-16">
            हम गवाहों की उपस्थिति में, विक्रेता और क्रेता ने बिना किसी दबाव के इस बिक्री पत्र पर अपने हस्ताक्षर किए हैं।
          </p>

          <div className="flex justify-between items-end mb-24 mt-12">
            <div className="text-center">
              <div className="w-48 border-b border-black mb-2"></div>
              <p className="font-bold">हस्ताक्षर विक्रेता (Seller)</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-black mb-2"></div>
              <p className="font-bold">हस्ताक्षर क्रेता (Buyer)</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-6 border-b pb-2">गवाह (Witnesses):</h3>
          <div className="grid grid-cols-2 gap-12 text-lg">
            <div>
              <p>1. हस्ताक्षर: ____________________</p>
              <p className="mt-2">नाम: {formData?.witness1Name || '____________________'}</p>
              <p>पता: {formData?.witness1Address || '____________________'}</p>
            </div>
            <div>
              <p>2. हस्ताक्षर: ____________________</p>
              <p className="mt-2">नाम: {formData?.witness2Name || '____________________'}</p>
              <p>पता: {formData?.witness2Address || '____________________'}</p>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-gray-300 text-center">
            <p className="text-md text-gray-600">
              दस्तावेज़ लेखक (Deed Writer): <strong>{formData?.deedWriterName || '____________________'}</strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}