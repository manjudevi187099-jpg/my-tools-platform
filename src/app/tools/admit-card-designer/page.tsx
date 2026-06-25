'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, CreditCard, Camera, Building, Calendar } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function AdmitCardDesigner() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    orgName: 'DHAMAKA UNIVERSITY OF TECHNOLOGY',
    examName: 'SEMESTER EXAMINATION - 2026',
    candidateName: 'Rahul Sharma',
    rollNo: '2023CS105',
    regNo: 'DUT2023001',
    course: 'B.Tech Computer Science',
    examDate: '15-Jul-2026',
    examTime: '10:00 AM - 01:00 PM',
    examCenter: 'Block A, Hall No. 05, Main Campus',
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
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
      pdf.save(`Admit_Card_${formData.candidateName.replace(/\s+/g, '_')}.pdf`);
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
      link.download = `Admit_Card_${formData.candidateName.replace(/\s+/g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <CreditCard className="w-10 h-10 text-indigo-600" />
            Admit Card Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Generate Official Exam Hall Tickets in seconds.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORM */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">Exam & Candidate Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="orgName" placeholder="Organization/University" onChange={handleInputChange} className="col-span-2 border rounded-lg p-2 text-sm" />
              <input type="text" name="examName" placeholder="Exam Name" onChange={handleInputChange} className="col-span-2 border rounded-lg p-2 text-sm" />
              <input type="text" name="candidateName" placeholder="Candidate Name" onChange={handleInputChange} className="col-span-2 border rounded-lg p-2 text-sm" />
              <input type="text" name="rollNo" placeholder="Roll No" onChange={handleInputChange} className="border rounded-lg p-2 text-sm" />
              <input type="text" name="regNo" placeholder="Registration No" onChange={handleInputChange} className="border rounded-lg p-2 text-sm" />
              <input type="text" name="course" placeholder="Course Name" onChange={handleInputChange} className="col-span-2 border rounded-lg p-2 text-sm" />
              <input type="text" name="examDate" placeholder="Exam Date" onChange={handleInputChange} className="border rounded-lg p-2 text-sm" />
              <input type="text" name="examTime" placeholder="Exam Time" onChange={handleInputChange} className="border rounded-lg p-2 text-sm" />
              <input type="text" name="examCenter" placeholder="Exam Center" onChange={handleInputChange} className="col-span-2 border rounded-lg p-2 text-sm" />
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Upload Photo</label>
                <input type="file" onChange={handlePhotoUpload} className="w-full text-sm border p-1 rounded-lg" />
              </div>
            </div>
            <button onClick={downloadPDF} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              {isDownloadingPdf ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
            </button>
          </div>

          {/* PREVIEW */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8">
            <div ref={previewRef} className="w-[600px] h-[800px] bg-white shadow-2xl p-8 border-4 border-slate-900 flex flex-col font-sans">
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-2xl font-black uppercase">{formData.orgName}</h1>
                <h2 className="text-xl font-bold bg-slate-900 text-white py-1 mt-2 uppercase">{formData.examName}</h2>
              </div>
              
              <div className="flex gap-6">
                <div className="w-32 h-40 border-2 border-slate-400 bg-slate-100 flex items-center justify-center">
                  {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <Camera className="text-slate-400" />}
                </div>
                <div className="flex-1 space-y-2 text-sm font-bold">
                  <p>Name: <span className="uppercase">{formData.candidateName}</span></p>
                  <p>Roll No: <span>{formData.rollNo}</span></p>
                  <p>Reg No: <span>{formData.regNo}</span></p>
                  <p>Course: <span>{formData.course}</span></p>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-900 pt-6 space-y-3 font-medium">
                <p><Calendar className="inline w-4 h-4 mr-2"/> Date: {formData.examDate}</p>
                <p>Time: {formData.examTime}</p>
                <p>Center: {formData.examCenter}</p>
              </div>

              <div className="mt-auto border-t-2 border-dashed border-slate-400 pt-6 flex justify-between items-center text-[10px] font-bold">
                <p>QR Code Placeholder</p>
                <div className="w-16 h-16 border border-slate-900"></div>
                <p>Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}