'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, Scale, User, MapPin, FileSignature, AlertCircle } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function AffidavitGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  
  const [affidavitType, setAffidavitType] = useState('gap_year');

  // Unified Form State
  const [formData, setFormData] = useState({
    // Deponent (Applicant) Details
    deponentName: 'Rahul Sharma',
    fatherName: 'Mr. Rajesh Sharma',
    age: '22',
    address: 'House No. 45, Sector 62, Noida, Uttar Pradesh - 201301',
    oathDate: new Date().toLocaleDateString('en-GB'),
    place: 'Noida',
    
    // Gap Year Specific
    lastCourse: 'Class 12th (CBSE)',
    passingYear: '2025',
    gapReason: 'preparing for JEE / NEET Engineering and Medical Entrance Exams',
    
    // Name Change Specific
    oldName: 'Rahul Kumar',
    newName: 'Rahul Sharma',
    
    // Loss of Document Specific
    lostDocName: 'Original 10th Marksheet',
    lostDocNo: 'Roll No: 1029384',
    lostDate: '10-May-2026',
    lostPlace: 'Rajiv Chowk Metro Station',
    
    // General
    generalStatement: 'I am a bona fide citizen of India and all the documents submitted by me are authentic and true to the best of my knowledge.'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Affidavit_${affidavitType}_${formData.deponentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadImage = async () => {
    if (!previewRef.current) return;
    setIsDownloadingJpg(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `Affidavit_${affidavitType}_${formData.deponentName.replace(/\s+/g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  // 🔥 DYNAMIC LEGAL CONTENT GENERATOR
  const renderAffidavitContent = () => {
    const dName = <span className="font-bold border-b border-dashed border-slate-500 px-1">{formData.deponentName}</span>;
    const fName = <span className="font-bold border-b border-dashed border-slate-500 px-1">{formData.fatherName}</span>;
    const fAge = <span className="font-bold border-b border-dashed border-slate-500 px-1">{formData.age}</span>;
    const fAddress = <span className="font-bold border-b border-dashed border-slate-500 px-1">{formData.address}</span>;

    const intro = (
      <p className="mb-6 leading-loose">
        I, {dName}, Son/Daughter/Wife of {fName}, aged about {fAge} years, currently residing at {fAddress}, do hereby solemnly affirm and declare on oath as under:
      </p>
    );

    if (affidavitType === 'gap_year') {
      return (
        <div className="text-lg text-justify font-medium text-slate-800">
          {intro}
          <ol className="list-decimal pl-8 space-y-4 leading-loose">
            <li>That I am a resident of the above-mentioned address.</li>
            <li>That I passed my <strong>{formData.lastCourse}</strong> examination in the year <strong>{formData.passingYear}</strong>.</li>
            <li>That after passing the aforesaid examination, I did not join any regular academic institution or college to pursue further studies.</li>
            <li>That the gap period between my last passing year and the current year was taken because I was <strong>{formData.gapReason}</strong>.</li>
            <li>That during this gap period, I was neither involved in any illegal activities nor facing any criminal charges in any court of law.</li>
            <li>That I now wish to continue my further studies and take admission in the current academic session.</li>
          </ol>
        </div>
      );
    } 
    
    else if (affidavitType === 'name_change') {
      return (
        <div className="text-lg text-justify font-medium text-slate-800">
          {intro}
          <ol className="list-decimal pl-8 space-y-4 leading-loose">
            <li>That my old/former name was <strong>{formData.oldName}</strong>, which is recorded in some of my educational and personal documents.</li>
            <li>That I have consciously and willingly changed my name from <strong>{formData.oldName}</strong> to my new name <strong>{formData.newName}</strong>.</li>
            <li>That from now onwards, I shall be known, identified, and addressed as <strong>{formData.newName}</strong> for all intents and purposes.</li>
            <li>That both the names, i.e., <em>{formData.oldName}</em> and <em>{formData.newName}</em>, pertain to one and the same person, which is me.</li>
            <li>That I am executing this affidavit to be produced before the concerned authorities to update my name in all future official records.</li>
          </ol>
        </div>
      );
    }

    else if (affidavitType === 'lost_document') {
      return (
        <div className="text-lg text-justify font-medium text-slate-800">
          {intro}
          <ol className="list-decimal pl-8 space-y-4 leading-loose">
            <li>That I am the rightful owner and holder of the document namely <strong>{formData.lostDocName}</strong> bearing ID/Details: <strong>{formData.lostDocNo}</strong>.</li>
            <li>That the aforementioned original document was lost/misplaced by me on or around <strong>{formData.lostDate}</strong> at/near <strong>{formData.lostPlace}</strong>.</li>
            <li>That I have made rigorous efforts to trace and recover the said document but all my efforts have been in vain.</li>
            <li>That the said document has not been pledged, sold, or handed over to any unauthorized person or entity.</li>
            <li>That I am swearing this affidavit to report the loss and to apply for a duplicate copy of the said document from the concerned issuing authority.</li>
          </ol>
        </div>
      );
    }

    else {
      // General Affidavit
      return (
        <div className="text-lg text-justify font-medium text-slate-800">
          {intro}
          <ol className="list-decimal pl-8 space-y-4 leading-loose">
            <li>That I am a bona fide citizen of India.</li>
            <li>That {formData.generalStatement}</li>
            <li>That this affidavit is executed by me to state the true facts for official purposes and record.</li>
          </ol>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-stone-800 flex items-center justify-center gap-3">
            <Scale className="w-10 h-10 text-stone-700" />
            Smart Affidavit Generator
          </h1>
          <p className="text-stone-500 mt-2 font-medium">Generate standard legal affidavits (Name Change, Gap Year, Lost Documents)</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="xl:col-span-5 bg-white rounded-3xl shadow-xl border border-stone-200 p-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* AFFIDAVIT TYPE */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
              <label className="block text-xs font-bold text-stone-800 uppercase mb-2">Select Affidavit Purpose</label>
              <select 
                value={affidavitType} 
                onChange={(e) => setAffidavitType(e.target.value)} 
                className="w-full text-sm border-2 border-stone-300 rounded-lg px-3 py-2 focus:border-stone-600 font-bold text-stone-800 bg-white"
              >
                <option value="gap_year">Education Gap Year Affidavit</option>
                <option value="name_change">Name Change Affidavit</option>
                <option value="lost_document">Loss of Document Affidavit</option>
                <option value="general">General / Address Proof Affidavit</option>
              </select>
            </div>

            {/* DEPONENT DETAILS (Always visible) */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-stone-800 border-b pb-2 flex items-center gap-2"><User className="w-4 h-4"/> Deponent (Applicant) Details</h3>
              <input type="text" name="deponentName" placeholder="Full Name" value={formData.deponentName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-stone-600" />
              <div className="grid grid-cols-3 gap-3">
                <input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg focus:border-stone-600" />
                <input type="text" name="age" placeholder="Age" value={formData.age} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-stone-600" />
              </div>
              <textarea name="address" placeholder="Complete Address" value={formData.address} onChange={handleInputChange} className="w-full h-20 text-sm border p-2.5 rounded-lg focus:border-stone-600 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="place" placeholder="Place (City)" value={formData.place} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-stone-600" />
                <input type="text" name="oathDate" placeholder="Date" value={formData.oathDate} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-stone-600" />
              </div>
            </div>

            {/* DYNAMIC FIELDS BASED ON TYPE */}
            <div className="space-y-4 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Specific Details</h3>
              
              {affidavitType === 'gap_year' && (
                <div className="space-y-3 animate-in fade-in">
                  <input type="text" name="lastCourse" placeholder="Last Passed Course (e.g. 12th Board)" value={formData.lastCourse} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                  <input type="text" name="passingYear" placeholder="Passing Year" value={formData.passingYear} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                  <textarea name="gapReason" placeholder="Reason for Gap (e.g. preparing for exams, health issues)" value={formData.gapReason} onChange={handleInputChange} className="w-full h-20 text-sm border p-2.5 rounded-lg resize-none" />
                </div>
              )}

              {affidavitType === 'name_change' && (
                <div className="space-y-3 animate-in fade-in">
                  <input type="text" name="oldName" placeholder="Old / Former Name" value={formData.oldName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg border-red-200 bg-red-50" />
                  <input type="text" name="newName" placeholder="New / Changed Name" value={formData.newName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg border-green-200 bg-green-50 font-bold" />
                </div>
              )}

              {affidavitType === 'lost_document' && (
                <div className="space-y-3 animate-in fade-in">
                  <input type="text" name="lostDocName" placeholder="Name of Lost Document (e.g. 10th Marksheet)" value={formData.lostDocName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                  <input type="text" name="lostDocNo" placeholder="Document ID / Roll No" value={formData.lostDocNo} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                  <input type="text" name="lostDate" placeholder="Approximate Date of Loss" value={formData.lostDate} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                  <input type="text" name="lostPlace" placeholder="Place where it was lost" value={formData.lostPlace} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                </div>
              )}

              {affidavitType === 'general' && (
                <div className="space-y-3 animate-in fade-in">
                  <textarea name="generalStatement" placeholder="State your declaration here..." value={formData.generalStatement} onChange={handleInputChange} className="w-full h-32 text-sm border p-2.5 rounded-lg resize-none" />
                </div>
              )}
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-stone-200">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-stone-600 hover:bg-stone-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="xl:col-span-7 flex justify-center bg-stone-300 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              
              {/* LEGAL PAPER FORMAT (STAMP PAPER FEEL) */}
              <div ref={previewRef} className="bg-[#fcfaf5] w-[794px] min-h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-serif border-[1px] border-stone-300 px-16 py-12">
                
                {/* Stamp Paper Top Space Placeholder */}
                <div className="w-full h-24 mb-6 border-b-2 border-stone-800 flex flex-col items-center justify-end pb-4">
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-sans">[ To be printed on appropriate Non-Judicial Stamp Paper ]</p>
                </div>

                {/* --- TITLE --- */}
                <div className="text-center mb-10 mt-6">
                  <h1 className="text-3xl font-black uppercase tracking-[0.2em] underline underline-offset-8 decoration-2 text-stone-900">
                    AFFIDAVIT
                  </h1>
                </div>

                {/* --- BODY --- */}
                <div className="flex-1 text-stone-900">
                  {renderAffidavitContent()}
                </div>

                {/* --- VERIFICATION & SIGNATURES --- */}
                <div className="mt-12 pt-8 border-t-2 border-stone-800 flex flex-col">
                  
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-48 text-left">
                      <p className="font-bold text-lg">Place: <span className="font-normal border-b border-dashed border-stone-400 px-2">{formData.place}</span></p>
                      <p className="font-bold text-lg mt-2">Date: <span className="font-normal border-b border-dashed border-stone-400 px-2">{formData.oathDate}</span></p>
                    </div>
                    <div className="w-56 text-center">
                      <div className="h-16 border-b-2 border-stone-800 mb-2"></div>
                      <p className="font-black text-lg uppercase tracking-wide text-stone-900">DEPONENT</p>
                      <p className="text-sm font-bold text-stone-600">({formData.deponentName})</p>
                    </div>
                  </div>

                  {/* Verification Clause */}
                  <h2 className="text-xl font-black uppercase tracking-widest underline underline-offset-4 text-center mb-4 text-stone-900">VERIFICATION</h2>
                  <p className="text-lg text-justify font-medium leading-loose text-stone-800 mb-16">
                    Verified at <strong>{formData.place}</strong> on this <strong>{formData.oathDate}</strong>, that the contents of this affidavit are true and correct to the best of my knowledge and belief, and nothing material has been concealed therein.
                  </p>

                  <div className="flex justify-between items-end mt-auto">
                    <div className="w-40 text-center">
                      <div className="w-24 h-24 border-4 border-double border-red-700/60 rounded-full mx-auto flex items-center justify-center text-xs text-red-800/60 font-black font-sans -rotate-12 mb-2">
                        NOTARY<br/>SEAL
                      </div>
                    </div>
                    <div className="w-56 text-center">
                      <div className="h-12 border-b-2 border-stone-800 mb-2"></div>
                      <p className="font-black text-lg uppercase tracking-wide text-stone-900">DEPONENT</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}