'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, FileSignature, Building, User, BookOpen, Briefcase } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

const TC_CATEGORIES = [
  {
    category: "शैक्षणिक (Educational - School & College)",
    options: ["CBSE Board School TC", "State Board School TC", "College Transfer Certificate", "University Migration Certificate", "Mid-Session Drop-out TC"]
  },
  {
    category: "नौकरी / रोजगार (Corporate & Employment)",
    options: ["Employee Transfer Letter", "Branch Transfer Certificate", "Employee Relieving Certificate", "Experience & Relieving Letter"]
  }
];

export default function TCGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Unified Form State
  const [formData, setFormData] = useState({
    // Header
    orgName: 'DHAMAKA INTERNATIONAL SCHOOL',
    orgAddress: 'Sector-62, Knowledge Park, New Delhi - 110001',
    affiliation: 'Affiliated to CBSE, New Delhi (Affiliation No: 123456)',
    
    // Core Data
    tcType: 'CBSE Board School TC',
    tcNumber: 'TC-2026/089',
    admissionNo: 'ADM-4092',
    dateOfIssue: new Date().toLocaleDateString('en-GB'),
    
    // Personal Details
    applicantName: 'Rahul Sharma',
    fatherName: 'Mr. Rajesh Sharma',
    motherName: 'Mrs. Sunita Sharma',
    dob: '15-Aug-2008',
    nationality: 'Indian',
    
    // Academic / Employment Data
    joiningDate: '10-Apr-2015',
    leavingDate: '25-Jun-2026',
    leavingClass: 'Class XII (Twelfth)', // Or Designation
    subjectsStudied: 'English, Physics, Chemistry, Mathematics, Computer Science',
    promotionStatus: 'Yes, Promoted to Higher Education',
    duesPaid: 'March 2026',
    
    // Conduct & Reason
    conduct: 'Good',
    reasonForLeaving: 'Higher Studies / Relocating',
    
    // Signatures
    preparedBy: 'Clerk / HR Executive',
    checkedBy: 'Class Teacher / Manager',
    authName: 'Dr. A.K. Verma',
    authDesignation: 'Principal / Director'
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
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
      pdf.save(`${formData.tcType.replace(/\s+/g, '_')}_${formData.applicantName.replace(/\s+/g, '_')}.pdf`);
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
      link.download = `${formData.tcType.replace(/\s+/g, '_')}_${formData.applicantName.replace(/\s+/g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  // 🔥 SMART TC ENGINE: Switches format based on School vs Corporate
  const renderTCContent = () => {
    const isCorporate = formData.tcType.includes('Employee') || formData.tcType.includes('Relieving') || formData.tcType.includes('Branch Transfer');

    if (isCorporate) {
      return (
        <div className="text-lg text-justify leading-loose font-medium mb-10 px-4">
          This is to certify that <strong>Mr./Ms. {formData.applicantName}</strong>, 
          Employee ID: <strong>{formData.admissionNo}</strong>, has been working with <strong>{formData.orgName}</strong> 
          in the capacity of <strong>{formData.leavingClass}</strong>.
          <br/><br/>
          {formData.tcType.includes('Relieving') ? (
            <>
              He/She has tendered his/her resignation, and the same has been accepted. He/She is being relieved from his/her duties and responsibilities at the close of working hours on <strong>{formData.leavingDate}</strong>. 
              During his/her tenure from <strong>{formData.joiningDate}</strong> to <strong>{formData.leavingDate}</strong>, we found his/her conduct and performance to be <strong>{formData.conduct}</strong>.
              <br/><br/>
              We wish him/her success in all future endeavors.
            </>
          ) : (
            <>
              As per the management's decision, he/she is being officially transferred to our new branch/office effective from <strong>{formData.leavingDate}</strong>. 
              His/her reason for transfer is recorded as: <em>{formData.reasonForLeaving}</em>. All salary dues and clearances up to <strong>{formData.duesPaid}</strong> have been settled by the current branch.
            </>
          )}
        </div>
      );
    } else {
      // SCHOOL / COLLEGE STANDARD NUMBERED LIST FORMAT (CBSE/State Board Style)
      return (
        <div className="w-full text-[17px] font-medium px-4">
          <table className="w-full border-collapse">
            <tbody>
              {[
                { label: "Name of the Pupil", value: formData.applicantName },
                { label: "Father's / Guardian's Name", value: formData.fatherName },
                { label: "Mother's Name", value: formData.motherName },
                { label: "Nationality", value: formData.nationality },
                { label: "Date of Birth (as per Admission Register)", value: formData.dob },
                { label: "Date of first admission in the school/college", value: formData.joiningDate },
                { label: "Class/Course in which the pupil last studied", value: formData.leavingClass },
                { label: "Subjects Studied", value: formData.subjectsStudied },
                { label: "Whether qualified for promotion to higher class", value: formData.promotionStatus },
                { label: "Month up to which school/college dues paid", value: formData.duesPaid },
                { label: "General Conduct & Character", value: formData.conduct },
                { label: "Date of leaving the institution", value: formData.leavingDate },
                { label: "Reason for leaving the institution", value: formData.reasonForLeaving },
              ].map((item, index) => (
                <tr key={index} className="border-b border-slate-200 border-dashed">
                  <td className="py-3 w-12 font-bold text-slate-700">{index + 1}.</td>
                  <td className="py-3 w-[45%] text-slate-700">{item.label}</td>
                  <td className="py-3 w-[5%] text-center font-bold">:</td>
                  <td className="py-3 font-bold text-slate-900 uppercase">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-8 text-justify leading-relaxed">
            Certified that the above information is in accordance with the institution registers. This certificate is issued without any alteration or erasure.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <FileSignature className="w-10 h-10 text-rose-600" />
            Universal TC Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Standard Formats for CBSE, State Boards, Colleges & Corporate IT</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* TYPE SELECTOR */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <label className="block text-xs font-bold text-rose-800 uppercase mb-2">Select Certificate Type</label>
              <select 
                name="tcType" 
                value={formData.tcType} 
                onChange={handleInputChange} 
                className="w-full text-sm border-2 border-rose-300 rounded-lg px-3 py-2 focus:border-rose-600 font-bold text-slate-800 bg-white"
              >
                {TC_CATEGORIES.map((cat, idx) => (
                  <optgroup key={idx} label={cat.category} className="bg-slate-100 font-bold text-rose-700">
                    {cat.options.map((opt, i) => (
                      <option key={i} value={opt} className="bg-white text-slate-800 font-medium">{opt}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* ORGANIZATION DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Building className="w-3 h-3"/> Organization / School Info</h3>
              <div className="space-y-3">
                <input type="text" name="orgName" placeholder="Institution / Company Name" value={formData.orgName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                <input type="text" name="orgAddress" placeholder="Address" value={formData.orgAddress} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                <input type="text" name="affiliation" placeholder="Affiliation (e.g. Affiliated to CBSE) / Tagline" value={formData.affiliation} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Seal/Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-rose-50 file:text-rose-700 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* APPLICANT DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Personal Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="applicantName" placeholder="Full Name" value={formData.applicantName} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                </div>
              </div>
            </div>

            {/* ACADEMIC / EMPLOYMENT DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Academic / Service Records</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="tcNumber" placeholder="TC / Ref Number" value={formData.tcNumber} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="admissionNo" placeholder="Admission / Emp No" value={formData.admissionNo} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="joiningDate" placeholder="Date of Joining" value={formData.joiningDate} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="leavingDate" placeholder="Date of Leaving" value={formData.leavingDate} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="leavingClass" placeholder="Last Class / Designation" value={formData.leavingClass} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="subjectsStudied" placeholder="Subjects Studied (School only)" value={formData.subjectsStudied} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="promotionStatus" placeholder="Promotion Status" value={formData.promotionStatus} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="duesPaid" placeholder="Dues Paid Upto" value={formData.duesPaid} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="conduct" placeholder="Character & Conduct" value={formData.conduct} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                  <input type="text" name="reasonForLeaving" placeholder="Reason for Leaving" value={formData.reasonForLeaving} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                </div>
              </div>
            </div>

            {/* SIGNATURE DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3">Signatures</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="preparedBy" placeholder="Prepared By (Title)" value={formData.preparedBy} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                <input type="text" name="checkedBy" placeholder="Checked By (Title)" value={formData.checkedBy} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                <input type="text" name="authName" placeholder="Authorized Name" value={formData.authName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
                <input type="text" name="authDesignation" placeholder="Auth Designation" value={formData.authDesignation} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-rose-500" />
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-slate-200 mt-auto">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              
              <div ref={previewRef} className="bg-white w-[794px] h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-serif border-[12px] border-double border-slate-800 p-8">
                
                {logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none z-0">
                    <img src={logoUrl} alt="Watermark" className="w-[500px] h-[500px] object-contain grayscale" />
                  </div>
                )}

                {/* --- HEADER --- */}
                <div className="w-full pb-6 border-b-4 border-slate-800 z-10">
                  <div className="flex items-center gap-6">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-28 h-28 object-contain" />
                    ) : (
                      <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300">
                        <Building className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 text-center pr-10">
                      <h1 className="font-black text-3xl uppercase tracking-wider text-rose-900">{formData.orgName}</h1>
                      <p className="text-slate-800 font-bold text-sm mt-2">{formData.affiliation}</p>
                      <p className="text-slate-700 font-medium text-xs mt-1">{formData.orgAddress}</p>
                    </div>
                  </div>
                </div>

                {/* --- BODY --- */}
                <div className="flex-1 py-8 z-10 flex flex-col text-slate-900">
                  
                  {/* Meta Info */}
                  <div className="flex justify-between items-center text-sm font-bold mb-8">
                    <p>TC / Ref No: <span className="text-red-700 font-black">{formData.tcNumber}</span></p>
                    <p>Admission/Emp No: <span className="font-medium">{formData.admissionNo}</span></p>
                    <p>Date: <span className="font-medium">{formData.dateOfIssue}</span></p>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-widest border-b-[3px] border-slate-800 inline-block pb-2">
                      {formData.tcType.toUpperCase()}
                    </h2>
                  </div>

                  {/* 🔥 DYNAMIC CONTENT RENDERER */}
                  {renderTCContent()}

                  {/* --- FOOTER / SIGNATURES --- */}
                  <div className="mt-auto pt-16 flex justify-between items-end">
                    
                    <div className="text-center w-40">
                      <div className="border-b-2 border-slate-800 mb-2"></div>
                      <p className="font-bold text-slate-800 text-sm">Signature</p>
                      <p className="text-slate-600 text-xs mt-1">{formData.preparedBy}</p>
                    </div>

                    <div className="text-center w-40">
                      <div className="border-b-2 border-slate-800 mb-2"></div>
                      <p className="font-bold text-slate-800 text-sm">Checked By</p>
                      <p className="text-slate-600 text-xs mt-1">{formData.checkedBy}</p>
                    </div>

                    <div className="text-center w-48 relative">
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-24 h-24 border-2 border-dashed border-rose-300 rounded-full flex items-center justify-center text-[10px] text-rose-400 font-sans opacity-60 rotate-[-15deg]">
                        Round Seal
                      </div>
                      <div className="border-b-2 border-slate-800 mb-2"></div>
                      <p className="font-bold text-slate-900 text-sm">{formData.authName}</p>
                      <p className="text-slate-700 text-xs font-bold mt-1 uppercase">{formData.authDesignation}</p>
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