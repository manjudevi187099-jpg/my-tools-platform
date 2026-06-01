'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// --- DATA TYPES ---
type Template = 'corporate' | 'modern' | 'minimal' | 'executive';

interface LetterData {
  template: Template;
  logo: string | null;
  company: {
    name: string;
    address: string;
    website: string;
    dateOfIssue: string;
  };
  employee: {
    name: string;
    empId: string;
    designation: string;
  };
  tenure: {
    joinDate: string;
    leaveDate: string;
  };
  content: {
    description: string;
    signatoryName: string;
    signatoryTitle: string;
  };
}

const FLOW_STEPS = [
  'Template', 'Company Info', 'Employee Details', 'Tenure', 'Work Description', 'Download'
];

export default function ExperienceLetterMaker() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs for Preview and Hidden Print
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Initial Dummy Data
  const [data, setData] = useState<LetterData>({
    template: 'corporate',
    logo: null,
    company: {
      name: 'TechNova Solutions Pvt. Ltd.',
      address: 'Plot 45, Sector 62, Noida, UP - 201309',
      website: 'www.technovasolutions.com | +91-9876543210',
      dateOfIssue: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    employee: {
      name: 'Rohan Sharma',
      empId: 'TN-2022-405',
      designation: 'Senior Frontend Developer',
    },
    tenure: {
      joinDate: '15th March 2021',
      leaveDate: '30th May 2024',
    },
    content: {
      description: 'During his tenure, we found him to be a dedicated, hardworking, and highly skilled professional. He contributed significantly to our core projects and demonstrated excellent teamwork and leadership qualities. He is leaving the company on his own accord. We wish him all the best in his future endeavors.',
      signatoryName: 'Vikram Mehta',
      signatoryTitle: 'Head of Human Resources',
    }
  });

  const handleCompany = (field: string, value: string) => setData({ ...data, company: { ...data.company, [field]: value } });
  const handleEmployee = (field: string, value: string) => setData({ ...data, employee: { ...data.employee, [field]: value } });
  const handleTenure = (field: string, value: string) => setData({ ...data, tenure: { ...data.tenure, [field]: value } });
  const handleContent = (field: string, value: string) => setData({ ...data, content: { ...data.content, [field]: value } });

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setData({ ...data, logo: URL.createObjectURL(file) });
  };

  // 🌟 OFF-SCREEN PERFECT PDF ENGINE 🌟
  const generatePDF = async () => {
    if (!printRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const safeName = data.employee.name ? data.employee.name.replace(/\s+/g, '_') : 'Employee';
      pdf.save(`Experience_Letter_${safeName}.pdf`);
    } catch (error: any) {
      console.error("PDF Engine Crash:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- TEMPLATES RENDERER ---
  const renderTemplate = () => {
    const { template, logo, company, employee, tenure, content } = data;

    switch(template) {
      case 'corporate':
        return (
          <div className="w-[794px] h-[1123px] bg-white text-slate-900 font-serif shadow-2xl p-16 box-border flex flex-col relative border-t-[16px] border-blue-900">
            {/* Header / Letterhead */}
            <div className="flex justify-between items-center border-b-2 border-slate-300 pb-6 mb-10">
              <div className="flex-1 pr-4">
                <h1 className="text-3xl font-black text-blue-900 uppercase tracking-wider">{company.name}</h1>
                <p className="text-sm text-slate-600 mt-2">{company.address}</p>
                <p className="text-sm text-slate-600">{company.website}</p>
              </div>
              <div className="w-32 h-24 flex items-center justify-end">
                {logo ? <img src={logo} className="max-w-full max-h-full object-contain" /> : <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 border border-dashed border-slate-300">LOGO</div>}
              </div>
            </div>

            {/* Date & Ref */}
            <div className="flex justify-between items-center mb-12 font-medium">
              <p>Ref: EXP/{new Date().getFullYear()}/{Math.floor(Math.random() * 9000) + 1000}</p>
              <p>Date: {company.dateOfIssue}</p>
            </div>

            {/* Subject */}
            <div className="text-center mb-10">
              <h2 className="text-xl font-black underline underline-offset-4 tracking-widest">TO WHOMSOEVER IT MAY CONCERN</h2>
            </div>

            {/* Body */}
            <div className="flex-1 text-[17px] leading-loose text-justify text-slate-800">
              <p className="mb-6">
                This is to certify that <strong>Mr./Ms. {employee.name}</strong> (Employee ID: <strong>{employee.empId}</strong>) was employed with <strong>{company.name}</strong> as a <strong>{employee.designation}</strong>.
              </p>
              <p className="mb-6">
                Their tenure with the company was from <strong>{tenure.joinDate}</strong> to <strong>{tenure.leaveDate}</strong>.
              </p>
              <p className="mb-6">{content.description}</p>
            </div>

            {/* Footer / Signatory */}
            <div className="mt-16">
              <p className="mb-12 font-medium">For <strong>{company.name}</strong>,</p>
              <h3 className="text-lg font-bold">{content.signatoryName}</h3>
              <p className="text-slate-600 italic">{content.signatoryTitle}</p>
            </div>
          </div>
        );

      case 'modern':
        return (
          <div className="w-[794px] h-[1123px] bg-white text-slate-800 font-sans shadow-2xl p-0 box-border flex flex-col relative border-l-[16px] border-emerald-600">
            <div className="p-16 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-6 mb-12">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  {logo ? <img src={logo} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">LOGO</div>}
                </div>
                <div>
                  <h1 className="text-4xl font-black text-emerald-900 tracking-tight">{company.name}</h1>
                  <p className="text-slate-500 font-medium mt-1">{company.address}</p>
                </div>
              </div>

              {/* Date */}
              <div className="mb-10 text-slate-600 font-bold">
                Date: {company.dateOfIssue}
              </div>

              <div className="mb-8 bg-emerald-50 py-3 px-6 rounded-r-lg border-l-4 border-emerald-600">
                <h2 className="text-xl font-black text-emerald-900 uppercase tracking-widest">Experience Certificate</h2>
              </div>

              {/* Body */}
              <div className="flex-1 text-[16px] leading-relaxed text-slate-700">
                <p className="mb-6">
                  This letter serves to confirm that <strong>{employee.name}</strong> (Emp ID: {employee.empId}) has worked at <strong>{company.name}</strong>.
                </p>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mb-6 space-y-2">
                  <p><span className="font-bold w-32 inline-block">Designation:</span> {employee.designation}</p>
                  <p><span className="font-bold w-32 inline-block">Date of Joining:</span> {tenure.joinDate}</p>
                  <p><span className="font-bold w-32 inline-block">Date of Relieving:</span> {tenure.leaveDate}</p>
                </div>
                <p className="mb-6 text-justify">{content.description}</p>
              </div>

              {/* Signatory */}
              <div className="mt-10">
                <div className="w-48 h-px bg-slate-300 mb-4"></div>
                <h3 className="text-lg font-black text-slate-900">{content.signatoryName}</h3>
                <p className="text-emerald-700 font-bold">{content.signatoryTitle}</p>
                <p className="text-slate-500 text-sm mt-1">{company.name}</p>
              </div>
            </div>
            {/* Footer */}
            <div className="bg-slate-100 py-4 px-16 text-center text-sm font-bold text-slate-500">
              {company.website}
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="w-[794px] h-[1123px] bg-white text-gray-900 font-serif shadow-2xl p-16 box-border flex flex-col relative border border-gray-200">
            {/* Header */}
            <div className="text-center border-b border-gray-300 pb-8 mb-12">
               {logo && <img src={logo} className="h-16 mx-auto mb-4 object-contain" />}
               <h1 className="text-2xl font-black tracking-widest uppercase mb-2">{company.name}</h1>
               <p className="text-xs text-gray-500 uppercase tracking-widest">{company.address}</p>
               <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{company.website}</p>
            </div>

            <p className="mb-10 font-bold">{company.dateOfIssue}</p>

            <h2 className="text-center text-xl font-bold tracking-widest uppercase mb-10">Experience Letter</h2>

            <div className="flex-1 text-[16px] leading-loose text-justify text-gray-800">
               <p className="mb-6">
                 To Whom It May Concern,
               </p>
               <p className="mb-6">
                 We are writing to confirm that <strong>{employee.name}</strong> was employed full-time at <strong>{company.name}</strong> holding the title of <strong>{employee.designation}</strong>. 
               </p>
               <p className="mb-6">
                 Their employment commenced on <strong>{tenure.joinDate}</strong> and concluded on <strong>{tenure.leaveDate}</strong>.
               </p>
               <p className="mb-6">{content.description}</p>
            </div>

            <div className="mt-16">
               <p className="mb-16">Sincerely,</p>
               <h3 className="font-bold text-lg">{content.signatoryName}</h3>
               <p className="text-gray-600">{content.signatoryTitle}</p>
               <p className="text-gray-600">{company.name}</p>
            </div>
          </div>
        );

      case 'executive':
        return (
          <div className="w-[794px] h-[1123px] bg-[#fafafa] text-slate-900 font-sans shadow-2xl p-0 box-border flex flex-col relative border-[12px] border-double border-slate-300">
             <div className="bg-slate-900 text-white p-12 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-black tracking-wider uppercase mb-2">{company.name}</h1>
                  <p className="text-sm opacity-80">{company.website}</p>
                </div>
                {logo && <div className="w-20 h-20 bg-white p-2 rounded"><img src={logo} className="w-full h-full object-contain" /></div>}
             </div>

             <div className="p-12 flex-1 flex flex-col">
                <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-10">
                   <h2 className="text-2xl font-black uppercase">Relieving & Experience Letter</h2>
                   <p className="font-bold text-slate-600">Date: {company.dateOfIssue}</p>
                </div>

                <div className="flex-1 text-[17px] leading-relaxed text-justify text-slate-800 space-y-6">
                   <p><strong>TO WHOM IT MAY CONCERN</strong></p>
                   <p>
                     This is to certify that <strong>{employee.name}</strong> (ID: {employee.empId}) was associated with <strong>{company.name}</strong> in the capacity of <strong>{employee.designation}</strong>.
                   </p>
                   <p>
                     They served the organization from <strong>{tenure.joinDate}</strong> to <strong>{tenure.leaveDate}</strong>. 
                   </p>
                   <p className="p-4 bg-slate-100 border-l-4 border-slate-900 text-slate-700 italic">
                     "{content.description}"
                   </p>
                   <p>
                     We relieve them of their duties and responsibilities effective {tenure.leaveDate}, closing business hours. We wish them success in all their future endeavors.
                   </p>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-300">
                   <h3 className="text-xl font-black">{content.signatoryName}</h3>
                   <p className="text-slate-600 font-bold">{content.signatoryTitle}</p>
                   <p className="text-slate-500 mt-2 text-sm">{company.address}</p>
                </div>
             </div>
          </div>
        );
      
      default: return <div></div>;
    }
  };

  // --- FORM RENDERER ---
  const renderFormStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 mb-2">1. Choose Letterhead Template</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {id:'corporate', name:'🏢 Standard Corporate', desc:'Classic Serif'}, 
                {id:'modern', name:'🔷 Modern Tech', desc:'Clean Blue Border'}, 
                {id:'minimal', name:'✨ Elegant Minimal', desc:'Spacious & Clean'}, 
                {id:'executive', name:'👔 Executive Bold', desc:'Dark Header'}
              ].map(t => (
                <button 
                  key={t.id} onClick={() => setData({...data, template: t.id as Template})}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${data.template === t.id ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]' : 'border-slate-200 hover:border-blue-300'}`}
                >
                  <div className="font-black text-lg text-slate-800">{t.name}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Company Information</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center relative hover:border-blue-400 bg-slate-50 transition-colors mb-4">
              {data.logo ? <img src={data.logo} className="h-16 object-contain mb-2" /> : <span className="text-3xl mb-2">🏢</span>}
              <p className="font-bold text-slate-600 text-sm">{data.logo ? 'Change Company Logo' : 'Upload Company Logo (Optional)'}</p>
              <input type="file" accept="image/*" onChange={handleLogo} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Company Name</label><input type="text" value={data.company.name} onChange={e => handleCompany('name', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Full Address</label><textarea value={data.company.address} onChange={e => handleCompany('address', e.target.value)} rows={2} className="w-full p-3 border rounded-xl font-medium bg-slate-50 mt-1 focus:border-blue-500 outline-none resize-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Website / Contact Details</label><input type="text" value={data.company.website} onChange={e => handleCompany('website', e.target.value)} className="w-full p-3 border rounded-xl font-medium bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Date of Issue</label><input type="text" value={data.company.dateOfIssue} onChange={e => handleCompany('dateOfIssue', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Employee Details</h3>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Employee Full Name</label><input type="text" value={data.employee.name} onChange={e => handleEmployee('name', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Employee ID</label><input type="text" value={data.employee.empId} onChange={e => handleEmployee('empId', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Last Designation / Job Title</label><input type="text" value={data.employee.designation} onChange={e => handleEmployee('designation', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Employment Tenure</h3>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Date of Joining</label><input type="text" value={data.tenure.joinDate} onChange={e => handleTenure('joinDate', e.target.value)} placeholder="e.g. 1st Jan 2020" className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Date of Leaving (Relieving Date)</label><input type="text" value={data.tenure.leaveDate} onChange={e => handleTenure('leaveDate', e.target.value)} placeholder="e.g. 31st May 2024" className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Work Description & Signatory</h3>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Conduct & Work Description</label><textarea value={data.content.description} onChange={e => handleContent('description', e.target.value)} rows={6} className="w-full p-3 border rounded-xl font-medium bg-slate-50 mt-1 focus:border-blue-500 outline-none resize-none" /></div>
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Signatory Name (HR/Founder)</label><input type="text" value={data.content.signatoryName} onChange={e => handleContent('signatoryName', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
               <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Signatory Designation</label><input type="text" value={data.content.signatoryTitle} onChange={e => handleContent('signatoryTitle', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <span className="text-6xl block mb-4">📝</span>
            <h3 className="text-3xl font-black text-slate-800">Ready to Print!</h3>
            <p className="text-slate-500 font-medium">Your Experience & Relieving Letter is complete. Download it as a high-quality PDF on Company Letterhead.</p>
            <button onClick={generatePDF} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 mt-4">
              {isProcessing ? 'Generating PDF...' : '📥 Download HD PDF'}
            </button>
            <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3 rounded-xl mt-2 cursor-not-allowed">
              Download DOCX (Coming Soon)
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Experience Letter Generator</h2>
        <p className="text-slate-500 mt-2 text-lg">Create professional Experience & Relieving letters on company letterheads instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col min-h-[650px]">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Step {step + 1} of {FLOW_STEPS.length}</span>
              <span className="text-xs font-bold text-slate-400">{FLOW_STEPS[step]}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((step + 1) / FLOW_STEPS.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
            {renderFormStep()}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between gap-4 mt-auto">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={`px-6 py-3 rounded-xl font-bold transition-colors ${step === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Back</button>
            <button onClick={() => setStep(Math.min(FLOW_STEPS.length - 1, step + 1))} disabled={step === FLOW_STEPS.length - 1} className={`px-8 py-3 rounded-xl font-bold shadow-md transition-transform ${step === FLOW_STEPS.length - 1 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1'}`}>Next Step</button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE A4 PREVIEW */}
        <div className="lg:col-span-7 bg-slate-100 rounded-3xl border border-slate-200 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[650px] relative">
           <span className="absolute top-4 left-6 bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200 z-10 shadow-sm">
              Live Preview
           </span>
           <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
              <div className="origin-top scale-[0.45] sm:scale-[0.5] md:scale-[0.55] lg:scale-[0.55] xl:scale-[0.65] transition-all duration-300 flex-shrink-0" style={{ width: '794px', height: '1123px' }}>
                 <div ref={previewRef} className="w-full h-full shadow-2xl overflow-hidden">
                    {renderTemplate()}
                 </div>
              </div>
           </div>
        </div>

        {/* 🌟 HIDDEN OFF-SCREEN RENDERER FOR HD PDF DOWNLOAD 🌟 */}
        <div className="absolute top-[-9999px] left-[-9999px]">
           <div ref={printRef} className="w-[794px] h-[1123px] bg-white">
              {renderTemplate()}
           </div>
        </div>

      </div>
    </div>
  );
}