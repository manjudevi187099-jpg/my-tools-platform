'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// --- DATA TYPES ---
type Template = 'classic' | 'modern' | 'academic' | 'minimal';

interface CertificateData {
  template: Template;
  logo: string | null;
  signature: string | null;
  recipient: {
    name: string;
  };
  course: {
    title: string;
    description: string;
    date: string;
    certificateId: string;
  };
  issuer: {
    signatoryName: string;
    signatoryTitle: string;
    organizationName: string;
  };
}

const FLOW_STEPS = [
  'Template', 'Recipient Info', 'Course Details', 'Branding & Sign', 'Download'
];

export default function CertificateMaker() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs for Preview and Hidden Print
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Initial Dummy Data
  const [data, setData] = useState<CertificateData>({
    template: 'classic',
    logo: null,
    signature: null,
    recipient: {
      name: 'Rohan Sharma',
    },
    course: {
      title: 'Advanced Full-Stack Web Development',
      description: 'for successfully completing the rigorous 12-week bootcamp and demonstrating exceptional skills in React, Node.js, and System Design.',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      certificateId: `CERT-${Math.floor(Math.random() * 90000) + 10000}`,
    },
    issuer: {
      signatoryName: 'Vikram Mehta',
      signatoryTitle: 'Lead Instructor',
      organizationName: 'TechNova Academy',
    }
  });

  const handleObjChange = (section: 'recipient' | 'course' | 'issuer', field: string, value: string) => {
    setData({ ...data, [section]: { ...data[section], [field]: value } });
  };

  const handleImage = (field: 'logo' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setData({ ...data, [field]: URL.createObjectURL(file) });
  };

  // 🌟 OFF-SCREEN PERFECT HD PDF/PNG ENGINE 🌟
  const exportFile = async (format: 'pdf' | 'png') => {
    if (!printRef.current) return;
    setIsProcessing(true);
    try {
      // High-scale canvas for crisp text
      const canvas = await html2canvas(printRef.current, { 
        scale: 3, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const safeName = data.recipient.name ? data.recipient.name.replace(/\s+/g, '_') : 'Certificate';

      if (format === 'pdf') {
        // Landscape A4 orientation ('l')
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${safeName}_Certificate.pdf`);
      } else {
        // Direct PNG Download
        const link = document.createElement('a');
        link.download = `${safeName}_Certificate.png`;
        link.href = imgData;
        link.click();
      }
    } catch (error: any) {
      console.error("Export Engine Crash:", error);
      alert("Error generating file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- TEMPLATES RENDERER (Landscape A4: 1123px x 794px) ---
  const renderTemplate = () => {
    const { template, logo, signature, recipient, course, issuer } = data;

    switch(template) {
      case 'classic':
        return (
          <div className="w-[1123px] h-[794px] bg-[#fffdf5] text-slate-900 font-serif shadow-2xl p-8 box-border relative flex flex-col items-center justify-center border-[20px] border-double border-[#b99553]">
            <div className="absolute top-12 left-12">
              {logo ? <img src={logo} className="h-24 object-contain" /> : <div className="h-24 w-24 border-2 border-dashed border-[#b99553] flex items-center justify-center text-[#b99553] font-bold text-xs opacity-50">LOGO</div>}
            </div>
            <div className="absolute top-12 right-12 text-right">
              <p className="text-sm font-bold text-[#b99553] uppercase tracking-widest">{issuer.organizationName}</p>
              <p className="text-xs text-slate-500 mt-1">ID: {course.certificateId}</p>
            </div>

            <h1 className="text-6xl font-black uppercase tracking-[0.2em] text-[#1e3a5f] mt-10 mb-4">Certificate</h1>
            <h2 className="text-2xl italic text-[#b99553] tracking-widest mb-12">OF COMPLETION</h2>

            <p className="text-lg text-slate-600 mb-6 italic">This is proudly presented to</p>
            <h2 className="text-7xl font-black text-[#1e3a5f] mb-6 border-b-2 border-[#b99553] px-16 pb-4 text-center" style={{ fontFamily: 'Georgia, serif' }}>
              {recipient.name}
            </h2>

            <p className="text-lg text-slate-600 w-2/3 text-center leading-relaxed mb-6">
              {course.description}
            </p>
            <h3 className="text-3xl font-bold text-[#b99553] uppercase tracking-wider mb-16">{course.title}</h3>

            <div className="w-full flex justify-between px-32 absolute bottom-16">
              <div className="text-center w-64">
                <p className="text-lg font-bold border-b border-slate-400 pb-2 mb-2">{course.date}</p>
                <p className="text-sm text-slate-500 uppercase tracking-widest">Date</p>
              </div>
              <div className="text-center w-64 relative">
                {signature && <img src={signature} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 h-16 object-contain" />}
                <p className="text-lg font-bold border-b border-slate-400 pb-2 mb-2 relative z-10 pt-8">{issuer.signatoryName}</p>
                <p className="text-sm text-slate-500 uppercase tracking-widest">{issuer.signatoryTitle}</p>
              </div>
            </div>
          </div>
        );

      case 'modern':
        return (
          <div className="w-[1123px] h-[794px] bg-slate-900 text-white font-sans shadow-2xl p-0 box-border flex relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-emerald-500"></div>
            <div className="absolute -right-32 -top-32 w-96 h-96 bg-emerald-500 rounded-full opacity-20 blur-3xl"></div>
            
            <div className="p-20 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-16">
                <div>
                  {logo ? <img src={logo} className="h-20 object-contain mb-4 bg-white p-2 rounded" /> : <div className="h-20 w-20 bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-bold mb-4">LOGO</div>}
                  <p className="text-sm font-bold text-emerald-400 tracking-widest uppercase">{issuer.organizationName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-mono">CERTIFICATE ID</p>
                  <p className="text-sm font-bold text-slate-300 font-mono">{course.certificateId}</p>
                </div>
              </div>

              <h1 className="text-7xl font-black uppercase tracking-tight text-white mb-2">Certificate</h1>
              <h2 className="text-2xl font-bold text-emerald-500 tracking-widest mb-12 uppercase">Of Achievement</h2>

              <p className="text-slate-400 mb-4 uppercase tracking-widest text-sm">Awarded To</p>
              <h2 className="text-6xl font-black text-emerald-400 mb-6">{recipient.name}</h2>
              <p className="text-lg text-slate-300 w-3/4 leading-relaxed mb-6">{course.description}</p>
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-auto">{course.title}</h3>

              <div className="flex gap-20 mt-16">
                <div className="w-48">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Date</p>
                  <p className="text-lg font-bold text-white border-t border-slate-700 pt-2">{course.date}</p>
                </div>
                <div className="w-64 relative">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Signature</p>
                  <div className="border-t border-slate-700 pt-2 relative">
                    {signature && <img src={signature} className="absolute bottom-8 left-0 h-16 object-contain filter invert" />}
                    <p className="text-lg font-bold text-white relative z-10">{issuer.signatoryName}</p>
                    <p className="text-xs text-emerald-500">{issuer.signatoryTitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="w-[1123px] h-[794px] bg-white text-slate-900 font-serif shadow-2xl p-16 box-border relative flex flex-col items-center border-t-[30px] border-b-[30px] border-red-900">
            <div className="absolute top-10 left-16 right-16 flex justify-between items-center">
               <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">ID: {course.certificateId}</p>
               <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">{issuer.organizationName}</p>
            </div>
            
            {logo ? <img src={logo} className="h-28 object-contain mb-8 mt-4" /> : <div className="h-28 w-28 border-2 border-red-900 rounded-full flex items-center justify-center text-red-900 font-bold mb-8 mt-4">LOGO</div>}
            
            <h1 className="text-5xl font-black uppercase tracking-[0.3em] text-red-900 mb-8">Certificate of Excellence</h1>
            <p className="text-xl text-slate-600 mb-8 italic">This certifies that</p>
            
            <h2 className="text-6xl font-black text-slate-800 mb-6 px-20 text-center uppercase tracking-widest border-b-2 border-slate-300 pb-4">
              {recipient.name}
            </h2>

            <p className="text-lg text-slate-600 w-3/4 text-center leading-relaxed mb-6">
              {course.description}
            </p>
            <h3 className="text-2xl font-bold text-red-900 uppercase tracking-widest mb-auto">{course.title}</h3>

            <div className="w-full flex justify-between px-20 mt-12">
              <div className="text-center w-56 border-t-2 border-slate-800 pt-2">
                <p className="text-lg font-bold mb-1">{course.date}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Date of Award</p>
              </div>
              <div className="text-center w-56 border-t-2 border-slate-800 pt-2 relative">
                {signature && <img src={signature} className="absolute bottom-12 left-1/2 transform -translate-x-1/2 h-16 object-contain" />}
                <p className="text-lg font-bold mb-1 relative z-10">{issuer.signatoryName}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">{issuer.signatoryTitle}</p>
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="w-[1123px] h-[794px] bg-[#fafafa] text-slate-800 font-sans shadow-2xl p-20 box-border flex flex-col relative border border-slate-200">
             <div className="flex justify-between items-center mb-16">
               <div className="w-1/2">
                 {logo ? <img src={logo} className="h-12 object-contain grayscale" /> : <div className="font-black text-2xl tracking-tighter uppercase">{issuer.organizationName}</div>}
               </div>
               <div className="w-1/2 text-right">
                 <h1 className="text-sm font-bold uppercase tracking-widest text-slate-400">Certificate of Completion</h1>
                 <p className="text-xs text-slate-400 font-mono mt-1">NO. {course.certificateId}</p>
               </div>
             </div>

             <div className="flex-1">
               <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Presented To</p>
               <h2 className="text-7xl font-black tracking-tighter text-slate-900 mb-8">{recipient.name}</h2>
               
               <div className="flex gap-16 mb-8">
                 <div className="w-1/2">
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">For Completion Of</p>
                   <h3 className="text-2xl font-black text-slate-800">{course.title}</h3>
                 </div>
                 <div className="w-1/2">
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Date</p>
                   <h3 className="text-2xl font-black text-slate-800">{course.date}</h3>
                 </div>
               </div>
               
               <p className="text-slate-600 text-lg leading-relaxed w-2/3">{course.description}</p>
             </div>

             <div className="mt-16 flex gap-16">
               <div className="w-64 relative">
                 <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Authorized Signature</p>
                 {signature && <img src={signature} className="absolute bottom-12 left-0 h-16 object-contain" />}
                 <div className="border-t-2 border-slate-900 pt-2 mt-16">
                   <p className="font-black text-lg">{issuer.signatoryName}</p>
                   <p className="text-sm text-slate-500">{issuer.signatoryTitle}</p>
                 </div>
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
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-2xl font-black text-slate-800 mb-6">1. Choose Certificate Layout</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {id:'classic', name:'🏛️ Classic Gold', desc:'Traditional & Elegant'}, 
                {id:'modern', name:'🌌 Modern Dark', desc:'Tech & Bootcamps'}, 
                {id:'academic', name:'🎓 Academic Red', desc:'Universities & Schools'}, 
                {id:'minimal', name:'📄 Clean Minimal', desc:'Modern & Simple'}
              ].map(t => (
                <button key={t.id} onClick={() => setData({...data, template: t.id as Template})} className={`p-4 rounded-xl border-2 text-left transition-all ${data.template === t.id ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]' : 'border-slate-200 hover:border-blue-300'}`}>
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
            <h3 className="text-2xl font-black text-slate-800 mb-6">Recipient Details</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Participant / Recipient Full Name</label>
              <input type="text" value={data.recipient.name} onChange={e => handleObjChange('recipient', 'name', e.target.value)} className="w-full p-4 border-2 rounded-xl font-black text-xl bg-slate-50 mt-1 outline-none focus:border-blue-500" placeholder="e.g. John Doe" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Course or Event Details</h3>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Course / Event Name</label><input type="text" value={data.course.title} onChange={e => handleObjChange('course', 'title', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Reason / Description</label><textarea value={data.course.description} onChange={e => handleObjChange('course', 'description', e.target.value)} rows={3} className="w-full p-3 border rounded-xl font-medium bg-slate-50 mt-1 outline-none focus:border-blue-500 resize-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Date of Issue</label><input type="text" value={data.course.date} onChange={e => handleObjChange('course', 'date', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500" /></div>
              <div className="col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Certificate ID / No.</label><input type="text" value={data.course.certificateId} onChange={e => handleObjChange('course', 'certificateId', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500" /></div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Branding & Signature</h3>
            
            <div><label className="text-xs font-bold text-slate-500 uppercase">Organization / Institute Name</label><input type="text" value={data.issuer.organizationName} onChange={e => handleObjChange('issuer', 'organizationName', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500 mb-4" /></div>

            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2 md:col-span-1 border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center relative hover:border-blue-400 bg-slate-50 transition-colors text-center">
                 {data.logo ? <img src={data.logo} className="h-12 object-contain mb-2" /> : <span className="text-2xl mb-2">🏢</span>}
                 <p className="font-bold text-slate-600 text-xs">{data.logo ? 'Change Logo' : 'Upload Organization Logo'}</p>
                 <input type="file" accept="image/*" onChange={(e) => handleImage('logo', e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               </div>
               <div className="col-span-2 md:col-span-1 border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center relative hover:border-blue-400 bg-slate-50 transition-colors text-center">
                 {data.signature ? <img src={data.signature} className="h-12 object-contain mb-2" /> : <span className="text-2xl mb-2">✍️</span>}
                 <p className="font-bold text-slate-600 text-xs">{data.signature ? 'Change Signature' : 'Upload Digital Signature'}</p>
                 <input type="file" accept="image/*" onChange={(e) => handleImage('signature', e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Signatory Name</label><input type="text" value={data.issuer.signatoryName} onChange={e => handleObjChange('issuer', 'signatoryName', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500" /></div>
              <div className="col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Signatory Title</label><input type="text" value={data.issuer.signatoryTitle} onChange={e => handleObjChange('issuer', 'signatoryTitle', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500" /></div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <span className="text-6xl block mb-4">🎓</span>
            <h3 className="text-3xl font-black text-slate-800">Ready to Award!</h3>
            <p className="text-slate-500 font-medium">Your Certificate is ready. Download it as a high-quality PDF or Image to share with the recipient.</p>
            
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <button onClick={() => exportFile('pdf')} disabled={isProcessing} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 flex justify-center items-center gap-2">
                {isProcessing ? 'Processing...' : '📥 Download PDF'}
              </button>
              <button onClick={() => exportFile('png')} disabled={isProcessing} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-black text-lg py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 flex justify-center items-center gap-2">
                {isProcessing ? 'Processing...' : '🖼️ Download PNG'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">PSD Download (Coming Soon)</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Certificate Generator</h2>
        <p className="text-slate-500 mt-2 text-lg">Create authentic, high-quality certificates for courses, events, and achievements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col min-h-[500px]">
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
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={`px-4 py-3 rounded-xl font-bold transition-colors ${step === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Back</button>
            <button onClick={() => setStep(Math.min(FLOW_STEPS.length - 1, step + 1))} disabled={step === FLOW_STEPS.length - 1} className={`flex-1 py-3 rounded-xl font-bold shadow-md transition-transform ${step === FLOW_STEPS.length - 1 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1'}`}>Next Step</button>
          </div>
        </div>

        {/* RIGHT COLUMN: LANDSCAPE LIVE PREVIEW */}
        <div className="lg:col-span-8 bg-slate-100 rounded-3xl border border-slate-200 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[500px] relative">
           <span className="absolute top-4 left-6 bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200 z-10 shadow-sm">
              Live Landscape Preview
           </span>
           <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
              {/* Scale down heavily for landscape A4 to fit in the screen */}
              <div className="origin-center scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.65] xl:scale-[0.7] transition-all duration-300 flex-shrink-0" style={{ width: '1123px', height: '794px' }}>
                 <div ref={previewRef} className="w-full h-full shadow-2xl overflow-hidden">
                    {renderTemplate()}
                 </div>
              </div>
           </div>
        </div>

        {/* 🌟 HIDDEN OFF-SCREEN RENDERER FOR HD EXPORT 🌟 */}
        <div className="absolute top-[-9999px] left-[-9999px]">
           <div ref={printRef} className="w-[1123px] h-[794px] bg-white">
              {renderTemplate()}
           </div>
        </div>

      </div>
    </div>
  );
}