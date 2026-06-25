'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Image as ImageIcon, School, User, BookOpen } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AssignmentCoverPageMaker() {
  const previewRef = useRef<HTMLDivElement>(null);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  // Download PDF Function
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Assignment-Cover-${formData.studentName}.pdf`);
  };

  // Download Image Function
  const downloadImage = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2 });
    const link = document.createElement('a');
    link.download = `Assignment-Cover-${formData.studentName}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Assignment Cover Page Maker
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create professional cover pages for your college/school assignments in seconds.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6">
            <h3 className="font-bold text-xl text-slate-800 border-b pb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Enter Details
            </h3>

            {/* University Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">College/University Name</label>
                <input type="text" name="collegeName" value={formData.collegeName} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">College Address</label>
                <input type="text" name="collegeAddress" value={formData.collegeAddress} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload College Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            </div>

            {/* Assignment Details */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assignment Title / Topic</label>
                <input type="text" name="assignmentTitle" value={formData.assignmentTitle} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Name</label>
                  <input type="text" name="subjectName" value={formData.subjectName} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Code</label>
                  <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Student & Teacher Details */}
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1"><User className="w-3 h-3"/> Submitted To</h4>
                  <input type="text" name="submittedToName" placeholder="Teacher Name" value={formData.submittedToName} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-2 py-1 mb-2 focus:border-blue-600 focus:outline-none" />
                  <input type="text" name="submittedToDesignation" placeholder="Designation" value={formData.submittedToDesignation} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-2 py-1 focus:border-blue-600 focus:outline-none" />
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1"><User className="w-3 h-3"/> Submitted By</h4>
                  <input type="text" name="studentName" placeholder="Your Name" value={formData.studentName} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-2 py-1 mb-2 focus:border-blue-600 focus:outline-none" />
                  <input type="text" name="rollNo" placeholder="Roll No" value={formData.rollNo} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-2 py-1 mb-2 focus:border-blue-600 focus:outline-none" />
                  <input type="text" name="course" placeholder="Course/Class" value={formData.course} onChange={handleInputChange} className="w-full text-sm border-2 border-slate-200 rounded-lg px-2 py-1 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="pt-6 grid grid-cols-2 gap-4">
              <button onClick={downloadImage} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2">
                <ImageIcon className="w-5 h-5" /> Save as JPG
              </button>
              <button onClick={downloadPDF} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2">
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-hidden shadow-inner">
            
            {/* A4 Size Canvas Container */}
            <div className="w-full max-w-[700px] overflow-auto flex justify-center">
              <div 
                ref={previewRef} 
                className="bg-white w-[210mm] min-h-[297mm] p-10 relative flex flex-col items-center justify-between shadow-2xl"
                style={{ aspectRatio: '1 / 1.414' }} // Standard A4 Aspect Ratio
              >
                {/* Border Layout */}
                <div className="absolute top-4 bottom-4 left-4 right-4 border-4 border-slate-800 p-2">
                  <div className="w-full h-full border-2 border-slate-800 p-8 flex flex-col items-center justify-between text-center">
                    
                    {/* Header */}
                    <div className="w-full flex flex-col items-center space-y-4">
                      <h1 className="text-3xl font-black font-serif text-slate-900 uppercase tracking-widest leading-tight">
                        {formData.collegeName || 'COLLEGE NAME'}
                      </h1>
                      <p className="text-md font-semibold text-slate-700 uppercase">{formData.collegeAddress}</p>
                      
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-32 h-32 object-contain mt-6" />
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-slate-300 flex items-center justify-center rounded-full mt-6 opacity-50">
                          <School className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="w-full my-10 space-y-4">
                      <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 inline-block pb-2">
                        Assignment On
                      </h2>
                      <h3 className="text-2xl font-black text-slate-900 uppercase mt-4">
                        "{formData.assignmentTitle || 'ASSIGNMENT TITLE'}"
                      </h3>
                      <div className="text-lg font-bold text-slate-700 mt-6">
                        Subject: {formData.subjectName} ({formData.subjectCode})
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div className="w-full grid grid-cols-2 gap-10 mt-10 text-left">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800 uppercase border-b border-slate-400 inline-block mb-3">Submitted To:</h4>
                        <p className="text-xl font-bold text-slate-900">{formData.submittedToName}</p>
                        <p className="text-md font-medium text-slate-700">{formData.submittedToDesignation}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-lg font-bold text-slate-800 uppercase border-b border-slate-400 inline-block mb-3">Submitted By:</h4>
                        <p className="text-xl font-bold text-slate-900">{formData.studentName}</p>
                        <p className="text-md font-medium text-slate-700">Roll No: {formData.rollNo}</p>
                        <p className="text-md font-medium text-slate-700">{formData.course}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="w-full mt-auto pt-10 flex justify-between items-end border-t-2 border-slate-800">
                      <div className="text-left">
                        <p className="text-md font-bold text-slate-800">Date of Submission:</p>
                        <p className="text-lg font-semibold text-slate-900">{formData.date}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-md font-bold text-slate-800 mb-6">Signature</p>
                        <div className="w-40 border-b-2 border-slate-800"></div>
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