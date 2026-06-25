'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, Award, Building, User } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function BonafideCertificateGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [formData, setFormData] = useState({
    collegeName: 'DHAMAKA UNIVERSITY OF TECHNOLOGY',
    refNo: 'DUT/REG/2026/1024',
    studentName: 'Rahul Sharma',
    fatherName: 'Mr. Rajesh Sharma',
    course: 'B.Tech Computer Science',
    year: '3rd Year',
    session: '2025-2026',
    date: new Date().toLocaleDateString(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 3 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bonafide_${formData.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-slate-800 text-center mb-8 flex items-center justify-center gap-2">
          <Award className="text-emerald-600" /> Bonafide Certificate Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORM */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-800 border-b pb-2">Certificate Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <input name="collegeName" placeholder="College Name" onChange={handleInputChange} className="col-span-2 border rounded-lg p-2" />
              <input name="studentName" placeholder="Student Name" onChange={handleInputChange} className="border rounded-lg p-2" />
              <input name="fatherName" placeholder="Father's Name" onChange={handleInputChange} className="border rounded-lg p-2" />
              <input name="course" placeholder="Course" onChange={handleInputChange} className="border rounded-lg p-2" />
              <input name="year" placeholder="Year" onChange={handleInputChange} className="border rounded-lg p-2" />
              <input name="refNo" placeholder="Reference No" onChange={handleInputChange} className="border rounded-lg p-2" />
            </div>
            <button 
              onClick={downloadPDF} 
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {isDownloading ? <Loader2 className="animate-spin" /> : <Download />} Download Official PDF
            </button>
          </div>

          {/* PREVIEW (Official Format) */}
          <div className="bg-white p-10 border shadow-2xl min-h-[800px] flex flex-col font-serif" ref={previewRef}>
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
              <h2 className="text-3xl font-black uppercase">{formData.collegeName}</h2>
              <p className="text-lg font-bold underline">BONAFIDE CERTIFICATE</p>
            </div>
            
            <div className="flex justify-between text-sm font-bold mb-10">
              <p>Ref No: {formData.refNo}</p>
              <p>Date: {formData.date}</p>
            </div>

            <p className="text-lg leading-relaxed">
              This is to certify that <b>{formData.studentName}</b>, S/o <b>{formData.fatherName}</b>, 
              is a bonafide student of this institution, studying in <b>{formData.course}</b>, 
              <b>{formData.year}</b> for the academic session <b>{formData.session}</b>.
            </p>

            <div className="mt-auto flex justify-between pt-20">
              <p>Seal/Stamp</p>
              <p className="text-center">Authorized Signatory<br/>Registrar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}