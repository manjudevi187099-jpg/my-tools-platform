'use client';

import React from 'react';

export default function DeedPreview({ formData = {} }: { formData?: any }) {
  
  // 🏆 FINAL FIX: Left 3cm, Right 5.5cm margins applied for Seals/Stamps!
  const pageStyle = "w-[21cm] min-h-[29.7cm] bg-white shadow-2xl mx-auto my-8 pl-[3cm] pr-[5.5cm] py-12 border border-gray-300 text-black text-justify leading-[1.8] font-serif relative print:shadow-none print:border-none print:m-0 print:pl-[3cm] print:pr-[5.5cm]";
  const watermark = "absolute inset-0 flex items-center justify-center opacity-[0.04] text-8xl font-black text-black pointer-events-none rotate-45 select-none print:hidden"; 

  const handlePrint = () => window.print();

  const exportToWord = () => {
    if (typeof document === 'undefined') return;
    const documentHTML = document.getElementById("deed-document")?.innerHTML;
    if (!documentHTML) return;

    // 🏆 FINAL FIX: MS Word margin fix using Word-specific CSS (Right side kept blank)
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Sale Deed</title>
      <style>
        @page WordSection1 {
            size: 595.3pt 841.9pt; 
            margin: 72pt 144pt 72pt 85pt; /* Top:1in, Right:2in(Heavy Margin), Bottom:1in, Left:1.2in */
            mso-header-margin: 36pt;
            mso-footer-margin: 36pt;
            mso-paper-source: 0;
        }
        div.WordSection1 { page: WordSection1; }
        body{font-family:'Mangal','Arial Unicode MS',serif;font-size:14pt;line-height:1.5;text-align:justify;}
        .page-break{page-break-after:always;}
        .text-center{text-align:center;}
      </style>
      </head><body><div class="WordSection1">
    `;
    const footer = "</div></body></html>";
    const blob = new Blob(['\ufeff', header + documentHTML + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sale_Deed_Final_Draft.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-200 py-10 overflow-x-auto relative">
      <div className="sticky top-4 z-50 flex justify-center gap-4 mb-8 print:hidden">
        <button onClick={handlePrint} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">🖨️ Print / Save PDF</button>
        <button onClick={exportToWord} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">📝 Download MS Word</button>
      </div>

      <div id="deed-document" className="text-[15px]">
        
        {/* ================= PAGE 1 ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          <div className="h-[9cm] flex flex-col items-center justify-end pb-4 border-b border-gray-300 mb-6">
             <p className="text-gray-400 font-bold text-sm">[ इस भाग को ई-स्टाम्प (₹{formData?.stampValue || '1000'}) के लिए रिक्त रखा गया है ]</p>
          </div>

          <h1 className="text-center text-3xl font-black underline mb-6" style={{textAlign: 'center', fontWeight: 'bold'}}>{formData?.documentType || 'विक्रय-पत्र (SALE DEED)'}</h1>
          
          <p className="font-bold underline mb-2 mt-6" style={{fontWeight: 'bold'}}>1. लेख्यकारी (विक्रेता) का नाम एवं पता:-</p>
          <div style={{paddingLeft: '20px'}}>
            {formData?.sellers?.map((seller: any, idx: number) => (
              <p key={idx} style={{marginBottom: '10px', textAlign: 'justify'}}>
                ({idx + 1}) श्री/श्रीमती <strong>{seller.name || '....................'}</strong>, उम्र: <strong>{seller.age || '....'}</strong> वर्ष, 
                पिता/पति का नाम: <strong>{seller.father || '....................'}</strong>, निवासी: <strong>{seller.address || '....................'}</strong>। 
                आधार नं०: {seller.aadhaar || '....................'}
              </p>
            ))}
            <p>(जिन्हें आगे इस विलेख में "प्रथम पक्ष" या "विक्रेता" कहा गया है।)</p>
          </div>

          <p className="font-bold underline mb-2 mt-6" style={{fontWeight: 'bold'}}>2. लेख्यधारी (क्रेता) का नाम एवं पता:-</p>
          <div style={{paddingLeft: '20px'}}>
            {formData?.buyers?.map((buyer: any, idx: number) => (
              <p key={idx} style={{marginBottom: '10px', textAlign: 'justify'}}>
                ({idx + 1}) श्री/श्रीमती <strong>{buyer.name || '....................'}</strong>, उम्र: <strong>{buyer.age || '....'}</strong> वर्ष, 
                पिता/पति का नाम: <strong>{buyer.father || '....................'}</strong>, निवासी: <strong>{buyer.address || '....................'}</strong>। 
                आधार नं०: {buyer.aadhaar || '....................'}
              </p>
            ))}
            <p>(जिन्हें आगे इस विलेख में "द्वितीय पक्ष" या "क्रेता" कहा गया है।)</p>
          </div>
          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 2 ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>
          
          <p className="font-bold underline mb-2 mt-4" style={{fontWeight: 'bold'}}>3. विलेख का प्रकार :-</p>
          <p style={{paddingLeft: '20px', marginBottom: '20px'}}><strong>{formData?.documentType || 'विक्रय-पत्र (SALE DEED)'}</strong></p>

          <p className="font-bold underline mb-2" style={{fontWeight: 'bold'}}>4. कुल बिक्री मूल्य :-</p>
          <p style={{paddingLeft: '20px', marginBottom: '20px'}}><strong>₹{formData?.saleAmount || '....................'}/-</strong> (रुपये मात्र)।</p>

          <p className="font-bold underline mb-2" style={{fontWeight: 'bold'}}>5. संपत्ति का विवरण एवं पुराना इतिहास (कंडिका 5):-</p>
          <p style={{textAlign: 'justify', paddingLeft: '20px', lineHeight: '2'}}>
            जिला: <strong>{formData?.district || '..........'}</strong>, अंचल/सर्किल: <strong>{formData?.circle || '..........'}</strong>, 
            थाना: <strong>{formData?.policeStation || '..........'}</strong>, <strong>थाना नं०: {formData?.thanaNo || '..........'}</strong>, 
            मौजा: <strong>{formData?.mauza || '..........'}</strong><br/>
            खाता नं०: <strong>{formData?.khataNo || '..........'}</strong>, खेसरा/प्लॉट नं०: <strong>{formData?.plotNo || '..........'}</strong>, 
            जमाबन्दी नं०: <strong>{formData?.jamabandiNo || '..........'}</strong><br/>
            रकबा: <strong>{formData?.area || '..........'}</strong><br/>
            <strong>सम्पत्ति का पुराना इतिहास:</strong> यह कि उक्त वर्णित भूमि विक्रेता को {formData?.ownershipHistory || '........................................'} के माध्यम से प्राप्त हुई है और विक्रेता इसके पूर्ण स्वामी हैं।
          </p>

          <p className="font-bold underline mb-2 mt-6" style={{fontWeight: 'bold'}}>6. भूमि की चौहद्दी (Boundary):-</p>
          <div style={{paddingLeft: '20px', marginBottom: '20px', lineHeight: '2'}}>
            <p><strong>उत्तर:</strong> {formData?.boundaryNorth || '....................'} &nbsp; | &nbsp; <strong>दक्षिण:</strong> {formData?.boundarySouth || '....................'}</p>
            <p><strong>पूरब:</strong> {formData?.boundaryEast || '....................'} &nbsp; | &nbsp; <strong>पश्चिम:</strong> {formData?.boundaryWest || '....................'}</p>
          </div>

          <p className="font-bold underline mb-2 mt-4" style={{fontWeight: 'bold'}}>7. बिक्री का कारण (कंडिका 4) एवं भुगतान:-</p>
          <p style={{textAlign: 'justify', textIndent: '40px'}}>
            यह कि विक्रेता को <strong>{formData?.sellingReason || '........................................'}</strong> की सख्त आवश्यकता है। इस कारण विक्रेता ने कंडिका 5 में वर्णित संपत्ति को बेचने का निर्णय लिया।
            विक्रेता को कुल मूल्य ₹{formData?.saleAmount || '..........'} क्रेता से पूर्ण रूप से प्राप्त हो गया है।
          </p>
          <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
        </div>

        {/* ================= PAGE 3 : SIGNATURES & MAP ================= */}
        <div className={pageStyle}>
          <div className={watermark}>DRAFT ONLY</div>

          {/* Signatures */}
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '60px', padding: '0 10px'}}>
            <div style={{textAlign: 'center'}}><div style={{width: '150px', borderBottom: '1px solid black'}}></div><p style={{fontWeight: 'bold', marginTop: '5px'}}>हस्ताक्षर विक्रेता (Seller)</p></div>
            <div style={{textAlign: 'center'}}><div style={{width: '150px', borderBottom: '1px solid black'}}></div><p style={{fontWeight: 'bold', marginTop: '5px'}}>हस्ताक्षर क्रेता (Buyer)</p></div>
          </div>

          {/* Pahchan & Gawah */}
          <p className="font-bold underline mb-4 mt-16" style={{fontWeight: 'bold'}}>पहचान का नाम एवं पता:-</p>
          <p>नाम: {formData?.identifierName || '....................'}<br/>पता: {formData?.identifierAddress || '....................'}<br/>हस्ताक्षर: ________________</p>

          <p className="font-bold underline mb-4 mt-8" style={{fontWeight: 'bold'}}>गवाह का नाम एवं पता:-</p>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div><p>1. नाम: {formData?.witness1Name || '................'}<br/>पता: {formData?.witness1Address || '................'}<br/>हस्ताक्षर: ___________</p></div>
            <div><p>2. नाम: {formData?.witness2Name || '................'}<br/>पता: {formData?.witness2Address || '................'}<br/>हस्ताक्षर: ___________</p></div>
          </div>

          {/* NAKSHA SECTION */}
          <h2 className="text-center font-bold text-xl underline mt-16 mb-6" style={{textAlign: 'center', fontWeight: 'bold'}}>अन्तरित की जाने वाली भूमि का नक्सा त्रिज्या निम्नानुसार है-</h2>
          <div className="w-full border-2 border-black relative flex items-center justify-center" style={{border: '2px solid black', height: '220px', position: 'relative'}}>
            <div className="absolute top-2 text-center w-full font-bold">उत्तर (North)</div>
            <div className="absolute bottom-2 text-center w-full font-bold">दक्षिण (South)</div>
            <div className="absolute left-2 top-1/2 font-bold" style={{position: 'absolute', left: '10px', top: '45%'}}>पश्चिम (West)</div>
            <div className="absolute right-2 top-1/2 font-bold" style={{position: 'absolute', right: '10px', top: '45%'}}>पूरब (East)</div>
            <div className="text-gray-400 text-center">(नक्शा यहाँ ड्रा करें) <br/> खेसरा: {formData?.plotNo || '.....'}</div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '60px', padding: '0 10px'}}>
            <div style={{textAlign: 'center'}}><div style={{width: '150px', borderBottom: '1px solid black'}}></div><p style={{fontWeight: 'bold', marginTop: '5px'}}>लेख्यकारी का हस्ताक्षर</p></div>
            <div style={{textAlign: 'center'}}><div style={{width: '150px', borderBottom: '1px solid black'}}></div><p style={{fontWeight: 'bold', marginTop: '5px'}}>लेख्यधारी का हस्ताक्षर</p></div>
          </div>

        </div>

      </div>
    </div>
  );
}