'use client';

import React, { useState, useRef } from 'react';
import { Download, CreditCard, Image as ImageIcon, User, Building, Phone, Loader2 } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function IDCardGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    orgName: 'DHAMAKA TECH PVT LTD',
    tagline: 'Innovating the Future',
    name: 'Rahul Sharma',
    designation: 'Software Engineer',
    idNumber: 'EMP-2026-001',
    dob: '15-Aug-1998',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    address: 'Sector 62, Noida, UP - 201301',
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Base64 Uploader for Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Base64 Uploader for Profile Photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 🔥 MODERN PDF DOWNLOADER (CR80 ID Card Size: 54mm x 86mm)
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 3 });
      
      // Standard ID Card Size
      const pdf = new jsPDF('p', 'mm', [54, 86]);
      pdf.addImage(dataUrl, 'PNG', 0, 0, 54, 86);
      pdf.save(`ID_Card_${formData.name.replace(/\s+/g, '_')}.pdf`);
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
      const dataUrl = await toJpeg(previewRef.current, { cacheBust: true, pixelRatio: 3, quality: 1.0 });
      
      const link = document.createElement('a');
      link.download = `ID_Card_${formData.name.replace(/\s+/g, '_')}.jpg`;
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
            <CreditCard className="w-10 h-10 text-blue-600" />
            ID Card Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Design and download professional ID Cards for business or school.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-6 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6 flex flex-col">
            <h3 className="font-bold text-xl text-slate-800 border-b pb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" /> Organization Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Organization Name</label>
                  <input type="text" name="orgName" value={formData.orgName} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tagline / Subtitle</label>
                  <input type="text" name="tagline" value={formData.tagline} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div className="col-span-2 border-b pb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>

              <h3 className="font-bold text-xl text-slate-800 border-b pb-4 pt-2 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Employee / Student Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Profile Photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation / Class</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Number</label>
                  <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Group</label>
                  <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DOB</label>
                  <input type="text" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="pt-6 grid grid-cols-2 gap-4 border-t border-slate-200 mt-auto">
              <button 
                onClick={downloadImage} 
                disabled={isDownloadingJpg || isDownloadingPdf}
                className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2"
              >
                {isDownloadingJpg ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                Save JPG
              </button>
              
              <button 
                onClick={downloadPDF} 
                disabled={isDownloadingJpg || isDownloadingPdf}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2"
              >
                {isDownloadingPdf ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-5 h-5" />}
                Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-6 flex justify-center items-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-hidden shadow-inner min-h-[600px]">
            
            {/* Standard CR80 Size Card (Width: 320px, Height: 510px for aspect ratio) */}
            <div 
              ref={previewRef} 
              className="bg-white w-[320px] h-[510px] relative rounded-xl shadow-2xl overflow-hidden flex flex-col items-center"
            >
              {/* Top Banner / Header Background */}
              <div className="w-full bg-blue-600 h-28 absolute top-0 left-0 rounded-t-xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' }}></div>

              {/* Header Content */}
              <div className="z-10 w-full flex flex-col items-center pt-4 px-2">
                {logoUrl && <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain bg-white rounded-full p-1 shadow-sm mb-1" />}
                <h2 className="text-white font-black text-[15px] uppercase tracking-wide text-center drop-shadow-md leading-tight">{formData.orgName}</h2>
                <p className="text-blue-100 text-[9px] uppercase tracking-widest font-semibold">{formData.tagline}</p>
              </div>

              {/* Profile Photo */}
              <div className="z-10 mt-2">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-300" />
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="w-full flex flex-col items-center px-4 mt-3">
                <h1 className="text-xl font-black text-slate-800 uppercase">{formData.name}</h1>
                <p className="text-blue-600 font-bold text-sm mb-4">{formData.designation}</p>

                <div className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] font-medium text-slate-700 space-y-1.5 shadow-sm">
                  <div className="flex justify-between"><span className="font-bold text-slate-900">ID NO:</span> <span>{formData.idNumber}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-900">DOB:</span> <span>{formData.dob}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-900">BLOOD:</span> <span className="text-red-600 font-bold">{formData.bloodGroup}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-900">PHONE:</span> <span>{formData.phone}</span></div>
                </div>
              </div>

              {/* Footer */}
              <div className="w-full mt-auto mb-4 px-4 flex justify-center text-center">
                <p className="text-[9px] text-slate-500 leading-tight">
                  <span className="font-bold text-slate-700">Address:</span> {formData.address}
                </p>
              </div>

              {/* Bottom Strip */}
              <div className="w-full bg-blue-600 h-2 absolute bottom-0 left-0"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}