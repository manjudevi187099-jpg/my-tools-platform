'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Image as ImageIcon, School, User, BookOpen, Loader2 } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function AssignmentCoverPageMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    collegeName: 'DHAMAKA UNIVERSITY OF TECHNOLOGY',
    collegeAddress: 'New Delhi, India',
    assignmentTitle: 'ARTIFICIAL INTELLIGENCE & MACHINE LEARNING',
    subjectCode: 'CS-402',
    subjectName: 'Computer Science',
    submittedToName: 'Dr. Ramesh Kumar',
    submittedToDesignation: 'HOD, Computer Science',
    studentName: 'Rahul Sharma',
    rollNo: '2023CS105',
    course: 'B.Tech (3rd Year)',
    date: new Date().toISOString().split('T')[0],
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 FIX: Convert Image to Base64 directly so html-to-image never fails
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🔥 MODERN PDF DOWNLOADER
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Assignment_Cover_${formData.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Oops! Download failed. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // 🔥 MODERN JPG DOWNLOADER
  const downloadImage = async () => {
    if (!previewRef.current) return;
    setIsDownloadingJpg(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
      
      const link = document.createElement('a');
      link.download = `Assignment_Cover_${formData.studentName.replace(/\s+/g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("JPG Generation Error:", error);
      alert("Oops! Download failed. Please try again.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Assignment Cover Page Maker
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create professional A4 cover pages for college/school in seconds.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6 flex flex-col">
            <h3 className="font-bold text-xl text-slate-800 border-b pb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Enter Details
            </h3>

            <div className="space-y-4 flex-grow">
              {/* University Details */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">College/University Name</label>
                <input type="text" name="collegeName" value={formData.collegeName} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload College Logo (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>

              {/* Assignment Details */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assignment Topic / Title</label>
                <input type="text" name="assignmentTitle" value={formData.assignmentTitle} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 mb-4 focus:border-blue-600 focus:outline-none transition-colors" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Name</label>
                    <input type="text" name="subjectName" value={formData.subjectName} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Code</label>
                    <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              {/* Student & Teacher Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Submitted To</h4>
                  <input type="text" name="submittedToName" placeholder="Teacher Name" value={formData.submittedToName} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 mb-2 focus:border-blue-600 focus:outline-none" />
                  <input type="text" name="submittedToDesignation" placeholder="Designation" value={formData.submittedToDesignation} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Submitted By</h4>
                  <input type="text" name="studentName" placeholder="Your Name" value={formData.studentName} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 mb-2 focus:border-blue-600 focus:outline-none" />
                  <input type="text" name="rollNo" placeholder="Roll No" value={formData.rollNo} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 mb-2 focus:border-blue-600 focus:outline-none" />
                  <input type="text" name="course" placeholder="Course/Class" value={formData.course} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-3 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-200 mt-auto">
              <button 
                onClick={downloadImage} 
                disabled={isDownloadingJpg || isDownloadingPdf}
                className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex flex-col justify-center items-center gap-1"
              >
                {isDownloadingJpg ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                <span>A4 HD JPG</span>
                <span className="text-[10px] opacity-70 font-normal">Trending for WhatsApp</span>
              </button>
              
              <button 
                onClick={downloadPDF} 
                disabled={isDownloadingJpg || isDownloadingPdf}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex flex-col justify-center items-center gap-1"
              >
                {isDownloadingPdf ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                <span>A4 PDF</span>
                <span className="text-[10px] opacity-70 font-normal">Best for Print</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            
            {/* A4 Size Canvas Container */}
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <div 
                ref={previewRef} 
                className="bg-white w-[794px] h-[1123px] p-12 relative flex flex-col items-center justify-between shadow-2xl mx-auto"
              >
                {/* Border Layout */}
                <div className="absolute top-6 bottom-6 left-6 right-6 border-[3px] border-slate-900 p-2">
                  <div className="w-full h-full border border-slate-900 p-10 flex flex-col items-center justify-between text-center bg-white">
                    
                    {/* Header */}
                    <div className="w-full flex flex-col items-center space-y-4">
                      <h1 className="text-4xl font-black font-serif text-slate-900 uppercase tracking-widest leading-tight">
                        {formData.collegeName || 'COLLEGE NAME'}
                      </h1>
                      <p className="text-xl font-semibold text-slate-700 uppercase">{formData.collegeAddress}</p>
                      
                      {/* 🔥 FIX: crossOrigin hata diya kyunki ab image base64 format mein hai */}
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-40 h-40 object-contain mt-8" />
                      ) : (
                        <div className="w-40 h-40 border-2 border-dashed border-slate-300 flex items-center justify-center rounded-full mt-8 opacity-50 bg-white">
                          <School className="w-16 h-16 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="w-full my-12 space-y-6">
                      <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-[0.3em] border-b-2 border-slate-800 inline-block pb-3">
                        Assignment On
                      </h2>
                      <h3 className="text-3xl font-black text-slate-900 uppercase mt-6 leading-relaxed">
                        "{formData.assignmentTitle || 'ASSIGNMENT TITLE'}"
                      </h3>
                      <div className="text-xl font-bold text-slate-700 mt-8">
                        Subject: {formData.subjectName} ({formData.subjectCode})
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div className="w-full grid grid-cols-2 gap-12 mt-auto mb-16 text-left">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 uppercase border-b-2 border-slate-400 inline-block mb-4">Submitted To:</h4>
                        <p className="text-2xl font-black text-slate-900">{formData.submittedToName}</p>
                        <p className="text-lg font-medium text-slate-700 mt-1">{formData.submittedToDesignation}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-xl font-bold text-slate-800 uppercase border-b-2 border-slate-400 inline-block mb-4">Submitted By:</h4>
                        <p className="text-2xl font-black text-slate-900">{formData.studentName}</p>
                        <p className="text-lg font-medium text-slate-700 mt-1">Roll No: {formData.rollNo}</p>
                        <p className="text-lg font-medium text-slate-700">{formData.course}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="w-full pt-8 flex justify-between items-end border-t-2 border-slate-900">
                      <div className="text-left">
                        <p className="text-lg font-bold text-slate-800">Date of Submission:</p>
                        <p className="text-xl font-semibold text-slate-900 mt-1">{formData.date}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-800 mb-8">Signature</p>
                        <div className="w-48 border-b-2 border-slate-900"></div>
                      </div>
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