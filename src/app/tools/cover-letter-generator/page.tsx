'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, Briefcase, User, Building, GraduationCap, LayoutTemplate, PenTool } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function CoverLetterGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  
  const [template, setTemplate] = useState('modern'); // classic, modern, minimal

  // Form State
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91-9876543210',
    location: 'New Delhi, India',
    portfolio: 'linkedin.com/in/rahulsharma',
    
    // Employer Info
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    hiringManager: 'Hiring Manager',
    companyName: 'Tech Innovations Pvt. Ltd.',
    companyAddress: 'Cyber City, Gurugram, Haryana',
    
    // Job Details & Content
    jobTitle: 'Frontend Developer',
    source: 'LinkedIn',
    experienceYears: '3',
    keySkills: 'React.js, Next.js, TypeScript, and Tailwind CSS',
    achievements: 'I have successfully built scalable web applications and improved UI/UX performance by 40% in my previous roles.',
    passion: 'building user-centric digital products and solving complex front-end challenges.',
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
      pdf.save(`Cover_Letter_${formData.fullName.replace(/\s+/g, '_')}.pdf`);
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
      link.download = `Cover_Letter_${formData.fullName.replace(/\s+/g, '_')}.jpg`;
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
            <Briefcase className="w-10 h-10 text-teal-600" />
            Smart Cover Letter Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create tailored, professional cover letters to land your dream job.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="xl:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* TEMPLATE SELECTOR */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
              <label className="block text-xs font-bold text-teal-800 uppercase mb-2 flex items-center gap-1"><LayoutTemplate className="w-4 h-4"/> Choose Template</label>
              <div className="flex gap-2">
                <button onClick={() => setTemplate('modern')} className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${template === 'modern' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>Modern</button>
                <button onClick={() => setTemplate('classic')} className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${template === 'classic' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>Classic</button>
                <button onClick={() => setTemplate('minimal')} className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${template === 'minimal' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>Minimal</button>
              </div>
            </div>

            {/* PERSONAL DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Your Contact Info</h3>
              <div className="space-y-3">
                <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500 font-bold" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
                  <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
                  <input type="text" name="location" placeholder="City, Country" value={formData.location} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
                  <input type="text" name="portfolio" placeholder="LinkedIn / Portfolio" value={formData.portfolio} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
                </div>
              </div>
            </div>

            {/* EMPLOYER DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Building className="w-3 h-3"/> Employer Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="hiringManager" placeholder="Hiring Manager Name" value={formData.hiringManager} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
                  <input type="text" name="date" placeholder="Date" value={formData.date} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
                </div>
                <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500 font-bold" />
                <input type="text" name="companyAddress" placeholder="Company Address" value={formData.companyAddress} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
              </div>
            </div>

            {/* JOB PITCH & CONTENT */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><PenTool className="w-3 h-3"/> The Pitch (Content)</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="jobTitle" placeholder="Target Job Title" value={formData.jobTitle} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500 font-bold text-teal-700" />
                  <input type="text" name="source" placeholder="Found on (e.g. LinkedIn)" value={formData.source} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Years of Experience</label>
                  <input type="text" name="experienceYears" placeholder="e.g. 3" value={formData.experienceYears} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Key Skills (Comma separated)</label>
                  <textarea name="keySkills" placeholder="React.js, Node.js, Project Management..." value={formData.keySkills} onChange={handleInputChange} className="w-full h-16 text-sm border p-2.5 rounded-lg focus:border-teal-500 resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Key Achievement / Value Proposition</label>
                  <textarea name="achievements" placeholder="I have successfully increased sales by 20%..." value={formData.achievements} onChange={handleInputChange} className="w-full h-20 text-sm border p-2.5 rounded-lg focus:border-teal-500 resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">I am passionate about...</label>
                  <textarea name="passion" placeholder="solving complex problems..." value={formData.passion} onChange={handleInputChange} className="w-full h-16 text-sm border p-2.5 rounded-lg focus:border-teal-500 resize-none" />
                </div>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="xl:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              
              <div 
                ref={previewRef} 
                className={`bg-white w-[794px] min-h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden 
                  ${template === 'classic' ? 'font-serif px-16 py-16' : 'font-sans'}`}
              >
                
                {/* 1. MODERN TEMPLATE */}
                {template === 'modern' && (
                  <>
                    {/* Header Strip */}
                    <div className="bg-slate-900 text-white p-12">
                      <h1 className="text-4xl font-black uppercase tracking-wider">{formData.fullName}</h1>
                      <h2 className="text-lg font-medium text-teal-400 mt-1 uppercase tracking-widest">{formData.jobTitle} Specialist</h2>
                      
                      <div className="flex flex-wrap gap-4 mt-6 text-xs font-semibold text-slate-300">
                        {formData.phone && <span>📞 {formData.phone}</span>}
                        {formData.email && <span>✉️ {formData.email}</span>}
                        {formData.location && <span>📍 {formData.location}</span>}
                        {formData.portfolio && <span>🔗 {formData.portfolio}</span>}
                      </div>
                    </div>

                    <div className="p-12 flex-1 text-slate-800">
                      <div className="mb-8">
                        <p className="font-bold">{formData.date}</p>
                      </div>
                      <div className="mb-8">
                        <p className="font-bold text-lg">{formData.hiringManager}</p>
                        <p className="font-bold">{formData.companyName}</p>
                        <p className="text-sm text-slate-600">{formData.companyAddress}</p>
                      </div>

                      <div className="mb-6 font-bold text-lg">
                        Dear {formData.hiringManager},
                      </div>

                      <div className="space-y-6 text-[15px] leading-relaxed text-justify">
                        <p>
                          I am writing to express my strong interest in the <strong>{formData.jobTitle}</strong> position at <strong>{formData.companyName}</strong>, as advertised on {formData.source}. With {formData.experienceYears} years of hands-on experience and a deep commitment to {formData.passion}, I am confident in my ability to make an immediate impact on your team.
                        </p>
                        <p>
                          Throughout my career, I have honed my expertise in <strong>{formData.keySkills}</strong>. {formData.achievements} I have always admired {formData.companyName}'s innovative approach and dedication to excellence, and I am eager to bring my background and proven track record to help achieve your upcoming goals.
                        </p>
                        <p>
                          What excites me most about this opportunity is the chance to blend my technical capabilities with my passion for continuous improvement. I am a highly collaborative team player who thrives in dynamic environments, and I am prepared to leverage my skills to contribute to your company's continued success.
                        </p>
                        <p>
                          I would welcome the opportunity to discuss how my experience and vision align with the needs of your team. Thank you for considering my application. I have attached my resume for your review and look forward to the possibility of an interview.
                        </p>
                      </div>

                      <div className="mt-12">
                        <p className="mb-8">Sincerely,</p>
                        <p className="font-black text-xl font-serif text-slate-900">{formData.fullName}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. CLASSIC TEMPLATE */}
                {template === 'classic' && (
                  <>
                    <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                      <h1 className="text-3xl font-black uppercase tracking-widest">{formData.fullName}</h1>
                      <div className="flex justify-center flex-wrap gap-4 mt-3 text-sm font-medium">
                        <span>{formData.location}</span>
                        <span>•</span>
                        <span>{formData.phone}</span>
                        <span>•</span>
                        <span>{formData.email}</span>
                        {formData.portfolio && <><span>•</span><span>{formData.portfolio}</span></>}
                      </div>
                    </div>

                    <div className="flex-1 text-slate-900">
                      <p className="mb-6">{formData.date}</p>
                      
                      <div className="mb-8">
                        <p className="font-bold">{formData.hiringManager}</p>
                        <p className="font-bold">{formData.companyName}</p>
                        <p>{formData.companyAddress}</p>
                      </div>

                      <p className="mb-6 font-bold">Subject: Application for {formData.jobTitle} Position</p>

                      <p className="mb-6">Dear {formData.hiringManager},</p>

                      <div className="space-y-6 text-[15px] leading-[1.8] text-justify">
                        <p>
                          Please accept this letter and the enclosed resume as an expression of my interest in the <strong>{formData.jobTitle}</strong> position at <strong>{formData.companyName}</strong>, which I recently found on {formData.source}. I bring {formData.experienceYears} years of professional experience, strongly supported by a passion for {formData.passion}.
                        </p>
                        <p>
                          In my professional journey, I have developed a robust skill set encompassing <strong>{formData.keySkills}</strong>. To highlight my capabilities: {formData.achievements} I believe that my technical proficiency and ability to execute strategic objectives make me a prime candidate for your esteemed organization.
                        </p>
                        <p>
                          I am drawn to {formData.companyName} because of your commitment to industry excellence. I am confident that my proactive mindset and dedication to producing high-quality work will allow me to seamlessly integrate into your team and contribute meaningfully from day one.
                        </p>
                        <p>
                          I appreciate your time and consideration in reviewing my application. I eagerly anticipate the opportunity to speak with you regarding this role and how I can add value to your team.
                        </p>
                      </div>

                      <div className="mt-12">
                        <p className="mb-10">Yours faithfully,</p>
                        <p className="font-bold text-lg">{formData.fullName}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* 3. MINIMAL TEMPLATE */}
                {template === 'minimal' && (
                  <div className="p-16 flex flex-col h-full">
                    <div className="flex justify-between items-end border-b border-slate-300 pb-8 mb-10">
                      <div>
                        <h1 className="text-4xl font-light text-slate-800 tracking-tight">{formData.fullName}</h1>
                        <p className="text-slate-500 font-medium mt-2">{formData.jobTitle}</p>
                      </div>
                      <div className="text-right text-xs text-slate-500 space-y-1">
                        <p>{formData.email}</p>
                        <p>{formData.phone}</p>
                        <p>{formData.location}</p>
                        {formData.portfolio && <p>{formData.portfolio}</p>}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-slate-600 mb-10">
                        <div>
                          <p className="font-bold text-slate-800">{formData.hiringManager}</p>
                          <p>{formData.companyName}</p>
                          <p>{formData.companyAddress}</p>
                        </div>
                        <p>{formData.date}</p>
                      </div>

                      <p className="mb-6 text-slate-800 font-medium">Hi {formData.hiringManager.split(' ')[0] || formData.hiringManager},</p>

                      <div className="space-y-6 text-[15px] leading-relaxed text-slate-700">
                        <p>
                          I am submitting my resume for the <strong>{formData.jobTitle}</strong> position at <strong>{formData.companyName}</strong>. With {formData.experienceYears} years of experience and a deep focus on {formData.passion}, I am excited about the prospect of joining your team.
                        </p>
                        <p>
                          My background consists of working extensively with <strong>{formData.keySkills}</strong>. Most notably, {formData.achievements} I am drawn to the culture and output of {formData.companyName}, and I am looking for a role where I can push boundaries and deliver exceptional results.
                        </p>
                        <p>
                          I would love the opportunity to discuss my qualifications further and explore how I can be an asset to {formData.companyName}. Thank you for your time and consideration.
                        </p>
                      </div>

                      <div className="mt-16">
                        <p className="mb-6 text-slate-600">Best regards,</p>
                        <p className="font-bold text-slate-800">{formData.fullName}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}