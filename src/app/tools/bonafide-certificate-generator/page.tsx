'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, Award, Building, User, Briefcase, GraduationCap } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function BonafideCertificateGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  
  // Toggle between Student and Employee
  const [certType, setCertType] = useState<'student' | 'employee'>('student');

  // Unified Form State
  const [formData, setFormData] = useState({
    // Organization Details (Letterhead)
    orgName: 'DHAMAKA UNIVERSITY OF TECHNOLOGY',
    orgAddress: 'Sector-62, Knowledge Park, New Delhi - 110001',
    orgContact: 'Phone: +91-9876543210 | Email: info@dhamaka.edu',
    refNo: 'DUT/REG/2026/1024',
    date: new Date().toLocaleDateString('en-GB'),
    
    // Personal Details
    name: 'Rahul Sharma',
    fatherName: 'Mr. Rajesh Sharma',
    
    // Student Specific
    course: 'B.Tech (Computer Science)',
    rollNo: '2023CS105',
    year: '3rd Year (2025-2026)',
    
    // Employee Specific
    designation: 'Senior Software Engineer',
    empId: 'EMP-4092',
    doj: '15-Jan-2022',
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      pdf.save(`Bonafide_${certType}_${formData.name.replace(/\s+/g, '_')}.pdf`);
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
      link.download = `Bonafide_${certType}_${formData.name.replace(/\s+/g, '_')}.jpg`;
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
            Smart Bonafide Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create Official Letterhead Bonafide for Students & Employees.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6 flex flex-col">
            
            {/* TYPE SELECTOR */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setCertType('student')}
                className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${certType === 'student' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <GraduationCap className="w-4 h-4" /> Student
              </button>
              <button 
                onClick={() => setCertType('employee')}
                className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${certType === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Briefcase className="w-4 h-4" /> Employee
              </button>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
              
              {/* LETTERHEAD DETAILS */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Building className="w-3 h-3"/> Letterhead Info</h3>
                <div className="space-y-3">
                  <input type="text" name="orgName" placeholder="Organization/College Name" value={formData.orgName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                  <input type="text" name="orgAddress" placeholder="Address" value={formData.orgAddress} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                  <input type="text" name="orgContact" placeholder="Phone & Email" value={formData.orgContact} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-emerald-50 file:text-emerald-700 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* RECORD DETAILS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reference Number</label>
                  <input type="text" name="refNo" value={formData.refNo} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input type="text" name="date" value={formData.date} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>

              {/* PERSONAL DETAILS */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-3 h-3"/> {certType === 'student' ? 'Student' : 'Employee'} Details</h3>
                <div className="space-y-3">
                  <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                  <input type="text" name="fatherName" placeholder="Father's / Husband's Name" value={formData.fatherName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                  
                  {certType === 'student' ? (
                    <>
                      <input type="text" name="course" placeholder="Course / Class" value={formData.course} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="rollNo" placeholder="Roll No / Enroll No" value={formData.rollNo} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                        <input type="text" name="year" placeholder="Academic Year" value={formData.year} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </>
                  ) : (
                    <>
                      <input type="text" name="designation" placeholder="Designation (e.g. Manager)" value={formData.designation} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="empId" placeholder="Employee ID" value={formData.empId} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                        <input type="text" name="doj" placeholder="Date of Joining" value={formData.doj} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-slate-200 mt-auto">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-transform hover:-translate-y-1">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-transform hover:-translate-y-1">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            
            {/* A4 Size Canvas Container */}
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <div 
                ref={previewRef} 
                className="bg-white w-[794px] h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-serif"
              >
                
                {/* WATERMARK BACKGROUND */}
                {logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none z-0">
                    <img src={logoUrl} alt="Watermark" className="w-96 h-96 object-contain grayscale" />
                  </div>
                )}

                {/* --- LETTERHEAD HEADER --- */}
                <div className="w-full px-12 pt-12 pb-6 border-b-4 border-slate-800 z-10 bg-white/80">
                  <div className="flex items-center gap-6">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300">
                        <Building className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 text-center pr-12">
                      <h1 className={`font-black text-3xl uppercase tracking-wider ${certType === 'student' ? 'text-emerald-900' : 'text-blue-900'}`}>
                        {formData.orgName || 'ORGANIZATION NAME'}
                      </h1>
                      <p className="text-slate-700 font-medium text-sm mt-2">{formData.orgAddress}</p>
                      <p className="text-slate-600 font-medium text-xs mt-1">{formData.orgContact}</p>
                    </div>
                  </div>
                </div>

                {/* --- CERTIFICATE BODY --- */}
                <div className="flex-1 px-16 py-10 z-10 flex flex-col">
                  
                  {/* Ref & Date */}
                  <div className="flex justify-between items-center text-sm font-bold text-slate-800 mb-12">
                    <p>Ref. No: <span className="font-medium text-slate-700">{formData.refNo}</span></p>
                    <p>Date: <span className="font-medium text-slate-700">{formData.date}</span></p>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-16">
                    <h2 className="text-2xl font-black uppercase tracking-widest border-b-2 border-slate-800 inline-block pb-2">
                      TO WHOMSOEVER IT MAY CONCERN
                    </h2>
                  </div>

                  {/* Dynamic Content */}
                  <div className="text-lg text-justify leading-[2.5] font-medium text-slate-800">
                    {certType === 'student' ? (
                      <p>
                        This is to certify that <strong>Mr. / Ms. {formData.name}</strong>, Son/Daughter of <strong>{formData.fatherName}</strong>, 
                        is a bonafide student of this institution. He/She is presently studying in <strong>{formData.course}</strong>, 
                        bearing Roll/Enrollment Number <strong>{formData.rollNo}</strong> for the academic year <strong>{formData.year}</strong>.
                        <br/><br/>
                        During his/her tenure in this institution, we have found his/her character and conduct to be good. We wish him/her success in all future endeavors.
                      </p>
                    ) : (
                      <p>
                        This is to certify that <strong>Mr. / Ms. {formData.name}</strong>, Son/Daughter of <strong>{formData.fatherName}</strong>, 
                        is a bonafide employee of our organization, <strong>{formData.orgName}</strong>. 
                        He/She has been working with us in the capacity of <strong>{formData.designation}</strong> under Employee ID <strong>{formData.empId}</strong> since <strong>{formData.doj}</strong>.
                        <br/><br/>
                        During his/her employment, his/her performance and conduct have been highly satisfactory. This certificate is issued upon the employee's request for their personal requirements.
                      </p>
                    )}
                  </div>

                  {/* --- FOOTER / SIGNATURES --- */}
                  <div className="mt-auto pt-20 flex justify-between items-end">
                    <div className="text-center w-40">
                      <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full mx-auto mb-2 flex items-center justify-center text-xs text-slate-400 font-sans">
                        Official Seal
                      </div>
                    </div>
                    <div className="text-center w-48">
                      <div className="border-b-2 border-slate-800 mb-2"></div>
                      <p className="font-bold text-slate-800 text-sm">Authorized Signatory</p>
                      <p className="text-slate-600 text-xs mt-1">{certType === 'student' ? 'Principal / Registrar' : 'HR Manager / Director'}</p>
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