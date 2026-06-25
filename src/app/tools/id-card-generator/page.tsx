'use client';

import React, { useState, useRef } from 'react';
import { Download, CreditCard, Image as ImageIcon, User, Building, Phone, Loader2, Palette } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

// 🔥 10 PREMIUM THEMES / FORMATS
const THEMES = [
  { id: 0, name: 'Corporate', bg: 'bg-blue-600', text: 'text-white', accent: 'text-blue-600', clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' },
  { id: 1, name: 'Academic', bg: 'bg-emerald-600', text: 'text-white', accent: 'text-emerald-600', clipPath: 'ellipse(100% 100% at 50% 0%)' },
  { id: 2, name: 'Tech Dark', bg: 'bg-slate-900', text: 'text-white', accent: 'text-slate-800', clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' },
  { id: 3, name: 'Medical', bg: 'bg-rose-600', text: 'text-white', accent: 'text-rose-600', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 90%)' },
  { id: 4, name: 'Creative', bg: 'bg-gradient-to-r from-orange-500 to-yellow-500', text: 'text-white', accent: 'text-orange-500', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' },
  { id: 5, name: 'Event VIP', bg: 'bg-gradient-to-r from-purple-700 to-fuchsia-600', text: 'text-white', accent: 'text-purple-600', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 85%)' },
  { id: 6, name: 'Classic Red', bg: 'bg-red-700', text: 'text-white', accent: 'text-red-700', clipPath: 'none' },
  { id: 7, name: 'Premium', bg: 'bg-gradient-to-r from-amber-200 to-yellow-400', text: 'text-slate-900', accent: 'text-amber-600', clipPath: 'ellipse(150% 100% at 50% 0%)' },
  { id: 8, name: 'Cyberpunk', bg: 'bg-cyan-500', text: 'text-slate-900', accent: 'text-cyan-600', clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' },
  { id: 9, name: 'Minimal', bg: 'bg-slate-200', text: 'text-slate-800', accent: 'text-slate-600', clipPath: 'none' },
];

export default function IDCardGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]); // Default to Corporate

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 🔥 STANDARD CR80 PDF DOWNLOADER (54mm x 86mm)
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 3 });
      
      // CR80 Standard Size
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
            Standard ID Card Maker
          </h1>
          <p className="text-slate-500 mt-2 font-medium">CR80 Size (54mm x 86mm) • 10 Premium Formats</p>
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
                className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex flex-col justify-center items-center gap-1"
              >
                {isDownloadingJpg ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                <span>Save HD JPG</span>
                <span className="text-[10px] opacity-70 font-normal">For Digital Sharing</span>
              </button>
              
              <button 
                onClick={downloadPDF} 
                disabled={isDownloadingJpg || isDownloadingPdf}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex flex-col justify-center items-center gap-1"
              >
                {isDownloadingPdf ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                <span>Print CR80 PDF</span>
                <span className="text-[10px] opacity-70 font-normal">Standard 54x86mm Size</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW & THEMES ================= */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* 🔥 THEME SELECTOR (10 FORMATS) */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" /> Choose ID Format (10 Styles)
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`relative h-12 w-full rounded-xl border-2 transition-all overflow-hidden ${selectedTheme.id === theme.id ? 'border-blue-600 scale-105 shadow-md' : 'border-slate-200 hover:scale-105'} ${theme.bg}`}
                    title={theme.name}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-[9px] font-black">{theme.name}</span>
                    </div>
                    {selectedTheme.id === theme.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-white text-[10px] font-black">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 🔥 LIVE PREVIEW (CR80 Strict Size) */}
            <div className="flex-grow flex justify-center items-center bg-slate-200 rounded-3xl p-4 md:p-8 shadow-inner min-h-[600px]">
              
              {/* Exact CR80 Aspect Ratio Container (Scale 320x504 for preview) */}
              <div 
                ref={previewRef} 
                className="bg-white w-[320px] h-[504px] relative rounded-xl shadow-2xl overflow-hidden flex flex-col items-center"
              >
                {/* Dynamic Header Background based on Theme */}
                <div 
                  className={`w-full h-36 absolute top-0 left-0 ${selectedTheme.bg}`} 
                  style={{ clipPath: selectedTheme.clipPath }}
                ></div>

                {/* Header Content */}
                <div className="z-10 w-full flex flex-col items-center pt-5 px-3">
                  {logoUrl && <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain bg-white rounded-md p-1 shadow-sm mb-2" />}
                  <h2 className={`${selectedTheme.text} font-black text-[15px] uppercase tracking-wide text-center drop-shadow-md leading-tight`}>{formData.orgName}</h2>
                  <p className={`${selectedTheme.text} opacity-80 text-[9px] uppercase tracking-widest font-semibold mt-1`}>{formData.tagline}</p>
                </div>

                {/* Profile Photo */}
                <div className="z-10 mt-3">
                  <div className="w-28 h-28 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                </div>

                {/* Personal Details */}
                <div className="w-full flex flex-col items-center px-5 mt-4">
                  <h1 className="text-xl font-black text-slate-800 uppercase text-center leading-tight">{formData.name}</h1>
                  <p className={`${selectedTheme.accent} font-bold text-sm mb-4`}>{formData.designation}</p>

                  <div className="w-full bg-slate-50/80 border border-slate-100 rounded-lg p-3 text-[11px] font-medium text-slate-700 space-y-1.5 shadow-sm">
                    <div className="flex justify-between"><span className="font-bold text-slate-900">ID NO:</span> <span>{formData.idNumber}</span></div>
                    <div className="flex justify-between"><span className="font-bold text-slate-900">DOB:</span> <span>{formData.dob}</span></div>
                    <div className="flex justify-between"><span className="font-bold text-slate-900">BLOOD:</span> <span className="text-red-600 font-bold">{formData.bloodGroup}</span></div>
                    <div className="flex justify-between"><span className="font-bold text-slate-900">PHONE:</span> <span>{formData.phone}</span></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="w-full mt-auto mb-5 px-4 flex justify-center text-center">
                  <p className="text-[9px] text-slate-500 leading-tight">
                    <span className="font-bold text-slate-700">Address:</span> {formData.address}
                  </p>
                </div>

                {/* Bottom Strip */}
                <div className={`w-full h-3 absolute bottom-0 left-0 ${selectedTheme.bg}`}></div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}