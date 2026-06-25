'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, Building, Target, Zap, Globe, MessageSquare } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function BusinessProfileGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Business Profile State
  const [formData, setFormData] = useState({
    companyName: 'DHAMAKA DIGITAL SOLUTIONS',
    tagline: 'Empowering Ideas Through Technology',
    industry: 'IT Services & Digital Marketing',
    founded: '2024',
    mission: 'To deliver high-quality, scalable, and innovative digital solutions that empower businesses to grow in a competitive market.',
    vision: 'To become a global leader in digital transformation by bridging the gap between complex technology and simple user experiences.',
    services: 'Web Development, Mobile App Design, SEO Optimization, Cloud Consulting',
    about: 'We are a team of passionate developers and creative designers dedicated to turning your vision into a reality. With a client-first approach, we ensure every project we touch reaches its full potential.'
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
      pdf.save(`Business_Profile_${formData.companyName.replace(/\s+/g, '_')}.pdf`);
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
      link.download = `Business_Profile_${formData.companyName.replace(/\s+/g, '_')}.jpg`;
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
            <Building className="w-10 h-10 text-indigo-600" />
            Business Profile Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create an impressive corporate profile for your clients in minutes.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="xl:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-slate-800 border-b pb-4 mb-4 flex items-center gap-2"><Globe className="w-5 h-5"/> Business Details</h3>
            
            <div className="space-y-4">
              <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} className="w-full border p-3 rounded-xl font-bold" />
              <input type="text" name="tagline" placeholder="Tagline" value={formData.tagline} onChange={handleInputChange} className="w-full border p-3 rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="industry" placeholder="Industry" value={formData.industry} onChange={handleInputChange} className="border p-3 rounded-xl" />
                <input type="text" name="founded" placeholder="Founded Year" value={formData.founded} onChange={handleInputChange} className="border p-3 rounded-xl" />
              </div>
              <textarea name="mission" placeholder="Mission Statement" value={formData.mission} onChange={handleInputChange} className="w-full border p-3 rounded-xl h-20 resize-none" />
              <textarea name="vision" placeholder="Vision Statement" value={formData.vision} onChange={handleInputChange} className="w-full border p-3 rounded-xl h-20 resize-none" />
              <input type="text" name="services" placeholder="Services (Comma Separated)" value={formData.services} onChange={handleInputChange} className="w-full border p-3 rounded-xl" />
              <textarea name="about" placeholder="About Us Description" value={formData.about} onChange={handleInputChange} className="w-full border p-3 rounded-xl h-24 resize-none" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={downloadImage} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="animate-spin"/> : <FileText />} Save JPG
              </button>
              <button onClick={downloadPDF} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="animate-spin"/> : <Download />} Download PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PREVIEW ================= */}
          <div className="xl:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px' }}>
              <div ref={previewRef} className="w-[794px] min-h-[1123px] bg-white p-12 border border-slate-300 shadow-2xl space-y-8">
                
                <div className="text-center pb-8 border-b-2 border-indigo-600">
                  <h1 className="text-5xl font-black uppercase text-indigo-950 tracking-tighter">{formData.companyName}</h1>
                  <p className="text-xl font-medium text-indigo-600 mt-2 italic">"{formData.tagline}"</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-indigo-900 uppercase flex items-center gap-2"><Target className="w-5 h-5"/> Our Mission</h3>
                    <p className="text-sm leading-relaxed text-slate-700">{formData.mission}</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-indigo-900 uppercase flex items-center gap-2"><Zap className="w-5 h-5"/> Our Vision</h3>
                    <p className="text-sm leading-relaxed text-slate-700">{formData.vision}</p>
                  </div>
                </div>

                <div className="bg-slate-100 p-6 rounded-lg">
                  <h3 className="font-bold text-indigo-900 uppercase mb-3">Our Core Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.split(',').map((s, i) => (
                      <span key={i} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">{s.trim()}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-indigo-900 uppercase mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5"/> About Us</h3>
                  <p className="text-sm leading-relaxed text-slate-700 text-justify">{formData.about}</p>
                </div>

                <div className="pt-10 border-t mt-auto text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
                  {formData.industry} | Established: {formData.founded}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}