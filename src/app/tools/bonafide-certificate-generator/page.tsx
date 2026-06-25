'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, Award, Building, User, GraduationCap } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function BonafideCertificateGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Unified Form State
  const [formData, setFormData] = useState({
    // Letterhead Details
    orgName: 'DHAMAKA UNIVERSITY OF TECHNOLOGY',
    orgAddress: 'Sector-62, Knowledge Park, New Delhi - 110001',
    orgContact: 'Phone: +91-9876543210 | Email: info@dhamaka.edu',
    
    // Certificate Core
    heading: 'BONAFIDE CERTIFICATE', // 🔥 NEW: Editable Heading
    date: new Date().toLocaleDateString('en-GB'),
    
    // Student Details
    studentName: 'Rahul Sharma',
    regNo: '2023CS105',
    semesterYear: '5th Semester',
    courseName: 'B.Tech Computer Science',
    academicYear: '2025-2026',
    
    // List Details
    dob: '15-Aug-2002',
    fatherName: 'Mr. Rajesh Sharma',
    motherName: 'Mrs. Sunita Sharma',
    admissionDate: '10-Jul-2023',
    completionYear: '2027',

    // Authorized Signatory Details
    authName: 'Dr. A.K. Verma',
    authDesignation: 'Registrar',
    authMobile: '+91-9876543210',
    authEmail: 'registrar@dhamaka.edu',
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

  // 🔥 A4 PDF DOWNLOADER
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.heading.replace(/\s+/g, '_')}_${formData.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // 🔥 JPG DOWNLOADER
  const downloadImage = async () => {
    if (!previewRef.current) return;
    setIsDownloadingJpg(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `${formData.heading.replace(/\s+/g, '_')}_${formData.studentName.replace(/\s+/g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <Award className="w-10 h-10 text-emerald-600" />
            Bonafide Certificate Maker
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Standard University/College Letterhead Format</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* MAIN HEADING SELECTOR */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Certificate Heading</label>
              <div className="flex gap-2">
                <select 
                  name="heading" 
                  value={formData.heading} 
                  onChange={handleInputChange} 
                  className="flex-1 text-sm border-2 border-emerald-300 rounded-lg px-3 py-2 focus:border-emerald-600 font-bold text-slate-800"
                >
                  <option value="BONAFIDE CERTIFICATE">BONAFIDE CERTIFICATE</option>
                  <option value="CHARACTER CERTIFICATE">CHARACTER CERTIFICATE</option>
                  <option value="PROVISIONAL CERTIFICATE">PROVISIONAL CERTIFICATE</option>
                  <option value="COURSE COMPLETION CERTIFICATE">COURSE COMPLETION</option>
                  <option value="NO OBJECTION CERTIFICATE (NOC)">NO OBJECTION (NOC)</option>
                </select>
              </div>
            </div>

            {/* LETTERHEAD DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Building className="w-3 h-3"/> Letterhead Info</h3>
              <div className="space-y-3">
                <input type="text" name="orgName" placeholder="College / Institute Name" value={formData.orgName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                <input type="text" name="orgAddress" placeholder="Address" value={formData.orgAddress} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                <input type="text" name="orgContact" placeholder="Phone & Email" value={formData.orgContact} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload College Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-emerald-50 file:text-emerald-700 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* STUDENT CORE DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><GraduationCap className="w-3 h-3"/> Student Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="studentName" placeholder="Student Name" value={formData.studentName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="regNo" placeholder="Registration No" value={formData.regNo} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="semesterYear" placeholder="Semester/Year (e.g. 5th Sem)" value={formData.semesterYear} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="courseName" placeholder="Course Name" value={formData.courseName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="academicYear" placeholder="Academic Year" value={formData.academicYear} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                </div>
              </div>
            </div>

            {/* RECORD LIST DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Institute Records</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="admissionDate" placeholder="Date of Admission" value={formData.admissionDate} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="completionYear" placeholder="Expected Completion Year" value={formData.completionYear} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                </div>
              </div>
            </div>

            {/* FOOTER / SIGNATURE DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3">Signatory Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="authName" placeholder="Signatory Name" value={formData.authName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                <input type="text" name="authDesignation" placeholder="Designation" value={formData.authDesignation} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                <input type="text" name="authMobile" placeholder="Mobile" value={formData.authMobile} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                <input type="text" name="authEmail" placeholder="Email" value={formData.authEmail} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                <input type="text" name="date" placeholder="Issue Date" value={formData.date} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-slate-200 mt-auto">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <div 
                ref={previewRef} 
                className="bg-white w-[794px] h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-serif"
              >
                
                {/* WATERMARK */}
                {logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                    <img src={logoUrl} alt="Watermark" className="w-96 h-96 object-contain grayscale" />
                  </div>
                )}

                {/* --- HEADER (Official Letter Pad) --- */}
                <div className="w-full px-12 pt-12 pb-6 border-b-4 border-slate-800 z-10 bg-white/90">
                  <div className="flex items-center gap-6">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300">
                        <Building className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 text-center pr-12">
                      <h1 className="font-black text-3xl uppercase tracking-wider text-emerald-900">
                        {formData.orgName}
                      </h1>
                      <p className="text-slate-800 font-semibold text-sm mt-2">{formData.orgAddress}</p>
                      <p className="text-slate-700 font-medium text-sm mt-1">{formData.orgContact}</p>
                    </div>
                  </div>
                </div>

                {/* --- BODY --- */}
                <div className="flex-1 px-16 py-10 z-10 flex flex-col text-slate-900">
                  
                  {/* Date */}
                  <div className="text-right text-base font-bold mb-10">
                    Date: <span className="underline underline-offset-4 decoration-slate-400 font-medium">{formData.date}</span>
                  </div>

                  {/* DYNAMIC HEADING */}
                  <div className="text-center mb-12">
                    <h2 className="text-2xl font-black uppercase tracking-widest border-b-[3px] border-slate-800 inline-block pb-2">
                      {formData.heading}
                    </h2>
                  </div>

                  {/* Main Paragraph */}
                  <div className="text-lg text-justify leading-loose font-medium mb-10">
                    This is to certify that Mr/Ms <span className="font-bold border-b border-dashed border-slate-500 px-2">{formData.studentName}</span>, 
                    bearing Registration No. <span className="font-bold border-b border-dashed border-slate-500 px-2">{formData.regNo}</span> is a 
                    Bonafide student of this institute, studying in the <span className="font-bold border-b border-dashed border-slate-500 px-2">{formData.semesterYear}</span> 
                    <span className="font-bold border-b border-dashed border-slate-500 px-2">{formData.courseName}</span> course during Academic Year 
                    <span className="font-bold border-b border-dashed border-slate-500 px-2">{formData.academicYear}</span>.
                  </div>

                  {/* Student Records List */}
                  <div className="text-lg font-medium mb-4">
                    The student details as entered in our institute record are:
                  </div>
                  
                  <div className="pl-8 space-y-4 text-lg font-medium">
                    <div className="grid grid-cols-[300px_auto]">
                      <span>Date of Birth</span>
                      <span className="font-bold">: {formData.dob}</span>
                    </div>
                    <div className="grid grid-cols-[300px_auto]">
                      <span>Father's Name</span>
                      <span className="font-bold">: {formData.fatherName}</span>
                    </div>
                    <div className="grid grid-cols-[300px_auto]">
                      <span>Mother's Name</span>
                      <span className="font-bold">: {formData.motherName}</span>
                    </div>
                    <div className="grid grid-cols-[300px_auto]">
                      <span>Date of Admission</span>
                      <span className="font-bold">: {formData.admissionDate}</span>
                    </div>
                    <div className="grid grid-cols-[300px_auto]">
                      <span>Expected Year of Course Completion</span>
                      <span className="font-bold">: {formData.completionYear}</span>
                    </div>
                  </div>

                  {/* --- FOOTER / SIGNATURES --- */}
                  <div className="mt-auto pt-16 flex justify-between items-end">
                    <div className="text-center w-40">
                      <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-full mx-auto flex items-center justify-center text-sm text-slate-400 font-sans mb-2">
                        Official Stamp
                      </div>
                    </div>
                    
                    <div className="text-left w-72">
                      <div className="border-b-2 border-slate-800 mb-3 w-48"></div>
                      <p className="font-bold text-slate-900 text-base mb-1">Authorized Signature with Stamp</p>
                      <p className="text-slate-800 font-medium">Name: <span className="font-bold">{formData.authName}</span></p>
                      <p className="text-slate-800 font-medium">Designation: <span className="font-bold">{formData.authDesignation}</span></p>
                      <p className="text-slate-800 font-medium">Mobile: {formData.authMobile}</p>
                      <p className="text-slate-800 font-medium">Email: {formData.authEmail}</p>
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