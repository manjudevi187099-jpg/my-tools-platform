'use client';

import React from 'react';

export default function DeedPreview({ formData = {} }: { formData?: any }) {
  
  // A4 Page Styling - Legal Document Style (Dense, Justified, Times New Roman/Mangal vibe)
  const pageStyle = "w-[21cm] min-h-[29.7cm] bg-white shadow-2xl mx-auto my-8 px-16 py-12 border border-gray-300 text-black text-justify leading-[1.8] font-serif relative print:shadow-none print:border-none print:m-0 print:p-0";
  const watermark = "absolute inset-0 flex items-center justify-center opacity-[0.04] text-8xl font-black text-black pointer-events-none rotate-45 select-none print:hidden"; 

  const handlePrint = () => {
    window.print();
  };

  const exportToWord = () => {
    if (typeof document === 'undefined') return;
    
    const documentHTML = document.getElementById("deed-document")?.innerHTML;
    if (!documentHTML) return;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Sale Deed</title>
        <style>
          body { font-family: 'Mangal', 'Arial Unicode MS', serif; font-size: 14pt; line-height: 1.5; text-align: justify; }
          .page-break { page-break-after: always; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .underline { text-decoration: underline; }
          h1, h2, h3 { text-align: center; }
        </style>
      </head><body>
    `;
    const footer = "</body></html>";
    const fullHTML = header + documentHTML + footer;

    const blob = new Blob(['\ufeff', fullHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sale_Deed_${formData?.sellerName?.replace(/\s+/g, '_') || 'Draft'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-200 py-10 overflow-x-auto relative">
      
      {/* 🔴 CONTROL PANEL */}
      <div className="sticky top-4 z-50 flex justify-center gap-4 mb-8 print:hidden">
        <button onClick={handlePrint} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all">
          🖨️ Print / Save PDF
        </button>
        <button onClick={exportToWord} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all">
          📝 Download MS Word
        </button>
      </div>

      {/* 📄 DEED DOCUMENT CONTAINER */}
      <div id="deed-document" className="text-[15px]">
        
        {/* ================= PAGE 1 : STAMP & HEADER ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          
          {/* Top space for 1000 Rs Stamp Paper printing */}
          <div className="h-[9cm] flex flex-col items-center justify-end pb-4 border-b border-gray-300 mb-6">
             <p className="text-gray-400 font-bold text-sm">[ इस भाग को ई-स्टाम्प / गैर-न्यायिक स्टाम्प (₹{formData?.stampValue || '1000'}) के लिए रिक्त रखा गया है ]</p>
          </div>

          <h1 className="text-center text-3xl font-black underline mb-6" style={{textAlign: 'center', fontWeight: 'bold', fontSize: '24px'}}>विक्रय-पत्र (SALE DEED)</h1>
          
          <p style={{textAlign: 'justify', marginBottom: '15px'}}>
            यह विक्रय-पत्र (Sale Deed) आज दिनांक <strong>{formData?.registrationDate || '....................'}</strong> को राज्य <strong>{formData?.state || '....................'}</strong> के अंतर्गत सब-रजिस्ट्रार कार्यालय, <strong>{formData?.registrationOffice || '....................'}</strong> में निष्पादित किया जा रहा है।
          </p>

          <p className="font-bold underline mb-2 mt-6" style={{fontWeight: 'bold'}}>1. लेख्यकारी (विक्रेता) का नाम एवं पता:-</p>
          <p style={{textAlign: 'justify', paddingLeft: '20px'}}>
            श्री/श्रीमती <strong>{formData?.sellerName || '....................'}</strong>, उम्र: <strong>{formData?.sellerAge || '....'}</strong> वर्ष, 
            पिता/पति का नाम: <strong>{formData?.sellerFather || '....................'}</strong>, 
            निवासी: <strong>{formData?.sellerAddress || '......................................................................'}</strong>। 
            पैन नं०: {formData?.sellerPan || '....................'} | आधार नं०: {formData?.sellerAadhaar || '....................'} | मोबाईल नं०: {formData?.sellerMobile || '....................'}। 
            <br/>(जिन्हें आगे इस विलेख में "प्रथम पक्ष" या "विक्रेता" कहा गया है, जिसमें उनके सभी कानूनी वारिस एवं उत्तराधिकारी भी सम्मिलित माने जायेंगे।)
          </p>

          <p className="font-bold underline mb-2 mt-6" style={{fontWeight: 'bold'}}>2. लेख्यधारी (क्रेता) का नाम एवं पता:-</p>
          <p style={{textAlign: 'justify', paddingLeft: '20px'}}>
            श्री/श्रीमती <strong>{formData?.buyerName || '....................'}</strong>, उम्र: <strong>{formData?.buyerAge || '....'}</strong> वर्ष, 
            पिता/पति का नाम: <strong>{formData?.buyerFather || '....................'}</strong>, 
            निवासी: <strong>{formData?.buyerAddress || '......................................................................'}</strong>। 
            पैन नं०: {formData?.buyerPan || '....................'} | आधार नं०: {formData?.buyerAadhaar || '....................'} | मोबाईल नं०: {formData?.buyerMobile || '....................'}। 
            <br/>(जिन्हें आगे इस विलेख में "द्वितीय पक्ष" या "क्रेता" कहा गया है, जिसमें उनके सभी कानूनी वारिस एवं उत्तराधिकारी भी सम्मिलित माने जायेंगे।)
          </p>

          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 2 : PROPERTY & SALE DETAILS ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          
          <p className="font-bold underline mb-2 mt-4" style={{fontWeight: 'bold'}}>3. विलेख का प्रकार एवं कुल प्रतिफल:-</p>
          <p style={{textAlign: 'justify', paddingLeft: '20px', marginBottom: '20px'}}>
            विलेख का प्रकार: <strong>विक्रय-पत्र (SALE DEED)</strong><br/>
            कुल बिक्री मूल्य (Sale Amount): <strong>₹{formData?.saleAmount || '....................'}/-</strong> (रुपये)।
          </p>

          <p className="font-bold underline mb-2" style={{fontWeight: 'bold'}}>4. संपत्ति का पूर्ण विवरण (Schedule of Property):-</p>
          <p style={{textAlign: 'justify', paddingLeft: '20px', backgroundColor: '#f9fafb', padding: '15px', border: '1px solid #e5e7eb'}}>
            जिला: <strong>{formData?.district || '................'}</strong>, अंचल/सर्किल: <strong>{formData?.circle || '................'}</strong>, 
            थाना: <strong>{formData?.policeStation || '................'}</strong>, मौजा: <strong>{formData?.mauza || '................'}</strong>, 
            वार्ड नं: <strong>{formData?.wardNo || '................'}</strong>।<br/>
            खाता नं० (Khata No): <strong>{formData?.khataNo || '................'}</strong>, खेसरा/प्लॉट नं० (Plot No): <strong>{formData?.plotNo || '................'}</strong>।<br/>
            रकबा (Area): <strong>{formData?.area || '................'}</strong>, भूमि का प्रकार: <strong>{formData?.landType || '................'}</strong>।
          </p>

          <p className="font-bold underline mb-2 mt-6" style={{fontWeight: 'bold'}}>5. चौहद्दी (Boundary of the Property):-</p>
          <div style={{paddingLeft: '20px', marginBottom: '20px'}}>
            <p><strong>उत्तर (North):</strong> {formData?.boundaryNorth || '........................................'}</p>
            <p><strong>दक्षिण (South):</strong> {formData?.boundarySouth || '........................................'}</p>
            <p><strong>पूरब (East):</strong> {formData?.boundaryEast || '........................................'}</p>
            <p><strong>पश्चिम (West):</strong> {formData?.boundaryWest || '........................................'}</p>
          </div>

          <p className="font-bold underline mb-2 mt-4" style={{fontWeight: 'bold'}}>6. बिक्री का कारण एवं भुगतान:-</p>
          <p style={{textAlign: 'justify', textIndent: '40px'}}>
            यह कि, विक्रेता को अपने परिवार के भरण-पोषण, आवश्यक कानूनी खर्चों एवं अन्य व्यक्तिगत कार्यों की पूर्ति हेतु धन की सख्त आवश्यकता है। विक्रेता को तत्काल दूसरी जगह जमीन खरीदने या अन्य विकल्प न होने के कारण, उन्होंने उपरोक्त संपत्ति (कंडिका-4 में वर्णित) को बेचने की घोषणा की। 
          </p>
          <p style={{textAlign: 'justify', textIndent: '40px', marginTop: '10px'}}>
            अन्य ग्राहकों के साथ बात होने पर, इस विलेख के क्रेता के बराबर या अधिक मूल्य देने के लिए कोई तैयार नहीं हुआ। फलतः बिना किसी दबाव, बहकावे के तथा पूर्ण मानसिक संतुलन की स्थिति में यह सौदा <strong>₹{formData?.saleAmount || '....................'}/-</strong> में तय हुआ।
          </p>
          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 3 : DECLARATION & TERMS ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          
          <p style={{textAlign: 'justify', textIndent: '40px'}}>
            क्रेता ने विक्रेता को अग्रिम (Advance) के रूप में <strong>₹{formData?.advanceAmount || '....................'}/-</strong> का भुगतान पूर्व में कर दिया है। शेष राशि <strong>₹{formData?.remainingAmount || '....................'}/-</strong> का भुगतान आज <strong>{formData?.paymentMode || '....................'}</strong> के माध्यम से विक्रेता को प्राप्त हो गया है। अब विक्रेता के पास क्रेता से कोई भी राशि लेनी शेष नहीं है।
          </p>

          <p className="font-bold underline mb-2 mt-6" style={{fontWeight: 'bold'}}>7. शर्तें एवं घोषणा (Terms & Declaration):-</p>
          <p style={{textAlign: 'justify', textIndent: '40px'}}>
            यह कि, उक्त संपत्ति पर आज दिनांक <strong>{formData?.possessionDate || '....................'}</strong> से क्रेता का पूर्ण रूप से भौतिक और कानूनी कब्ज़ा (Possession) हो गया है। विक्रेता ने उक्त संपत्ति से अपना स्वत्व एवं अधिकार हमेशा के लिए समाप्त कर लिया है और उसे क्रेता को सौंप दिया है।
          </p>
          <p style={{textAlign: 'justify', textIndent: '40px', marginTop: '10px'}}>
            यह कि, विक्रेता प्रमाणित करते हैं कि यह संपत्ति किसी भी प्रकार के ऋणभार, बैंक लोन, विवाद, स्वत्व दोष, सीलिंग, या सरकारी अर्जन से पूर्णतः मुक्त एवं स्वतंत्र है। यदि भविष्य में किसी प्रकार की त्रुटि पायी जाती है या विक्रेता के किसी वारिस द्वारा दावा किया जाता है, तो उसके लिए विक्रेता पूर्ण रूप से जिम्मेदार एवं जवाबदेह होंगे तथा क्रेता का नुकसान मय हर्जाना विक्रेता की अन्य संपत्तियों से वसूला जा सकेगा।
          </p>
          <p style={{textAlign: 'justify', textIndent: '40px', marginTop: '10px'}}>
            यह कि, क्रेता आज से इस संपत्ति का उपयोग अपने स्वामी के रूप में स्वेच्छानुसार कर सकते हैं और अपने नाम से सरकारी कार्यालयों में दाखिल-खारिज (Mutation) करवा सकते हैं, जिसमें विक्रेता या उनके वारिसों को कोई आपत्ति नहीं होगी।
          </p>
          
          {formData?.specialConditions && (
            <p style={{textAlign: 'justify', marginTop: '15px'}}>
              <strong>विशेष शर्त:</strong> {formData.specialConditions}
            </p>
          )}

          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 4 : SIGNATURES ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          
          <p style={{textAlign: 'justify', textIndent: '40px', marginTop: '40px'}}>
            इस प्रकार लेख्यकारी (विक्रेता) ने अपने तन-मन की पूर्ण स्वस्थता में, अपनी स्वेच्छा से बिना किसी दबाव के यह विक्रय-पत्र लिख दिया है ताकि सनद रहे और समय पर काम आये।
          </p>

          <div style={{marginTop: '100px', display: 'flex', justifyContent: 'space-between', padding: '0 40px'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{width: '200px', borderBottom: '1px solid black', marginBottom: '10px'}}></div>
              <p style={{fontWeight: 'bold'}}>हस्ताक्षर विक्रेता (Seller)</p>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{width: '200px', borderBottom: '1px solid black', marginBottom: '10px'}}></div>
              <p style={{fontWeight: 'bold'}}>हस्ताक्षर क्रेता (Buyer)</p>
            </div>
          </div>

          <p className="font-bold underline mb-6 mt-16" style={{fontWeight: 'bold'}}>गवाहों के विवरण एवं हस्ताक्षर (Witnesses):-</p>
          
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
            <div style={{width: '45%'}}>
              <p><strong>1. हस्ताक्षर:</strong> ........................................</p>
              <p style={{marginTop: '10px'}}><strong>नाम:</strong> {formData?.witness1Name || '........................................'}</p>
              <p style={{marginTop: '5px'}}><strong>पता:</strong> {formData?.witness1Address || '........................................'}</p>
            </div>
            
            <div style={{width: '45%'}}>
              <p><strong>2. हस्ताक्षर:</strong> ........................................</p>
              <p style={{marginTop: '10px'}}><strong>नाम:</strong> {formData?.witness2Name || '........................................'}</p>
              <p style={{marginTop: '5px'}}><strong>पता:</strong> {formData?.witness2Address || '........................................'}</p>
            </div>
          </div>

          <div style={{marginTop: '100px', paddingTop: '20px', borderTop: '1px solid #ccc', textAlign: 'center'}}>
            <p>
              दस्तावेज़ लेखक (Deed Writer): <strong>{formData?.deedWriterName || '........................................'}</strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}