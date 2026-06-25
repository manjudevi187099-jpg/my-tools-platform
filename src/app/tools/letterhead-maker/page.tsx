'use client';

import React, { useState, useRef } from 'react';
import { Download, Loader2, Building, Mail, Phone, Globe, MapPin, Briefcase } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

const LAYOUTS = [
  'Classic', 'Modern', 'Minimal', 'Corporate', 'Bold', 
  'Elegant', 'Executive', 'Creative', 'Academic', 'Logistics'
];

const THEMES = [
  { id: 'slate', primary: 'bg-slate-900', text: 'text-slate-900', border: 'border-slate-900', light: 'bg-slate-50' },
  { id: 'navy', primary: 'bg-blue-900', text: 'text-blue-900', border: 'border-blue-900', light: 'bg-blue-50' },
  { id: 'emerald', primary: 'bg-emerald-800', text: 'text-emerald-800', border: 'border-emerald-800', light: 'bg-emerald-50' },
  { id: 'crimson', primary: 'bg-rose-800', text: 'text-rose-800', border: 'border-rose-800', light: 'bg-rose-50' },
];

// Reusable Live Editable Component
const Editable = ({ defaultValue, className, placeholder }: { defaultValue: string, className?: string, placeholder?: string }) => (
  <div 
    contentEditable 
    suppressContentEditableWarning 
    data-placeholder={placeholder}
    className={`outline-none hover:bg-slate-100/50 focus:bg-yellow-50 focus:ring-1 ring-slate-300 rounded px-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 ${className}`}
  >
    {defaultValue}
  </div>
);

export default function AdvancedLetterheadMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [settings, setSettings] = useState({ layout: 'Classic', theme: 'navy' });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const theme = THEMES.find(t => t.id === settings.theme) || THEMES[0];

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      pdf.save(`Letterhead_${settings.layout}.pdf`);
    } catch (error) {
      console.error("Export failed:", error);
    }
    setIsDownloading(false);
  };

  // Shared Body Content (Taaki har template me same smart content dikhe)
  const DocumentBody = () => (
    <div className="flex-1 py-8 flex flex-col text-sm text-slate-800">
      <div className="flex justify-between mb-8 font-semibold">
        <div className="flex gap-2"><span className="text-slate-500">Ref No:</span> <Editable defaultValue="DEPL/2026/05-142" /></div>
        <div className="flex gap-2"><span className="text-slate-500">Date:</span> <Editable defaultValue="24 May, 2026" /></div>
      </div>
      <div className="mb-6">
        <Editable defaultValue="To," className="font-bold mb-1" />
        <Editable defaultValue="The Managing Director," />
        <Editable defaultValue="Client Company Pvt. Ltd." />
        <Editable defaultValue="East Champaran, Bihar" />
      </div>
      <div className="flex gap-2 mb-6 font-bold border-b pb-2">
        <span>Subject:</span> <Editable defaultValue="Proposal for Event Management & Transport Logistics Integration" className="flex-1" />
      </div>
      <Editable defaultValue="Dear Sir/Madam," className="mb-4 font-semibold" />
      <Editable 
        defaultValue="We are pleased to submit our comprehensive proposal for your upcoming requirements. Our platform is designed to provide seamless operations, ensuring top-tier service delivery and robust management. Kindly review the attached annexures for detailed pricing and technical specifications." 
        className="text-justify leading-relaxed flex-1" 
      />
      <div className="mt-12">
        <Editable defaultValue="For DHAMAKA ENTERPRISES PVT. LTD." className="font-bold mb-8" />
        <Editable defaultValue="Authorized Signatory" className="text-xs text-slate-500 border-t w-48 pt-2" />
      </div>
    </div>
  );

  // 10 Smart Layout Engine
  const renderTemplate = () => {
    switch (settings.layout) {
      case 'Classic':
        return (
          <div className="flex flex-col h-full p-12 bg-white">
            <header className={`border-b-[3px] ${theme.border} pb-6 flex justify-between items-center`}>
              <div className="w-24 h-24">{logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo"/> : <Building className={`w-full h-full ${theme.text}`}/>}</div>
              <div className="text-right">
                <Editable defaultValue="DHAMAKA ENTERPRISES" className={`text-3xl font-black ${theme.text}`} />
                <Editable defaultValue="INNOVATION AT THE CORE" className="text-sm tracking-widest font-bold text-slate-500" />
                <Editable defaultValue="GSTIN: 10AAAAA0000A1Z5 | CIN: U12345BR2026PTC" className="text-[10px] text-slate-400 mt-1" />
              </div>
            </header>
            <DocumentBody />
            <footer className={`border-t-2 ${theme.border} pt-4 grid grid-cols-3 gap-4 text-[10px] font-semibold text-slate-600`}>
              <div className="flex items-center gap-2"><MapPin size={14}/> <Editable defaultValue="Sector 62, Cyber Park, Gurugram" /></div>
              <div className="flex items-center justify-center gap-2"><Phone size={14}/> <Editable defaultValue="+91 98765 43210" /></div>
              <div className="flex items-center justify-end gap-2"><Globe size={14}/> <Editable defaultValue="www.dhamaka.com" /></div>
            </footer>
          </div>
        );

      case 'Modern':
        return (
          <div className="flex flex-col h-full bg-white">
            <header className={`${theme.primary} text-white p-10 flex justify-between items-center shadow-md`}>
              <div>
                <Editable defaultValue="DHAMAKA" className="text-5xl font-black tracking-tighter" />
                <Editable defaultValue="ENTERPRISES PVT. LTD." className="text-sm font-medium tracking-widest opacity-80" />
              </div>
              <div className="w-20 h-20 bg-white p-2 rounded-lg shadow-inner">
                {logoUrl ? <img src={logoUrl} className="max-h-full mx-auto" alt="Logo"/> : <Building className={`w-full h-full ${theme.text}`}/>}
              </div>
            </header>
            <div className="px-12 flex-1 flex flex-col"><DocumentBody /></div>
            <footer className={`${theme.light} p-6 flex justify-between text-xs font-bold ${theme.text} border-t ${theme.border}`}>
               <Editable defaultValue="E: contact@dhamaka.com" />
               <Editable defaultValue="P: +91 98765 43210" />
               <Editable defaultValue="GSTIN: 10AAAAA0000A1Z5" />
            </footer>
          </div>
        );

      case 'Logistics': // Best for Transport/Logistics Platforms
        return (
          <div className="flex flex-col h-full p-12 bg-white">
            <header className="flex gap-6 border-b-4 border-slate-900 pb-6">
              <div className="w-28 h-28 border-2 border-slate-200 p-2 flex items-center justify-center">
                {logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo"/> : <Briefcase className={`w-12 h-12 ${theme.text}`}/>}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <Editable defaultValue="DHAMAKA LOGISTICS & EVENTS" className={`text-3xl font-black uppercase ${theme.text}`} />
                <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500">
                  <Editable defaultValue="ISO 9001:2015 Certified" /> | 
                  <Editable defaultValue="Reg No: 12345/BR/2026" />
                </div>
              </div>
            </header>
            <DocumentBody />
            <footer className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border rounded-lg">
              <div>
                 <span className="font-bold text-slate-400 block mb-1">Corporate Office:</span>
                 <Editable defaultValue="East Champaran, Bihar, India - 845401" className="font-semibold text-slate-700"/>
              </div>
              <div className="text-right">
                 <span className="font-bold text-slate-400 block mb-1">Bank Details:</span>
                 <Editable defaultValue="HDFC Bank | A/C: 1234567890 | IFSC: HDFC000123" className="font-semibold text-slate-700"/>
              </div>
            </footer>
          </div>
        );

      case 'Minimal':
        return (
          <div className="flex flex-col h-full p-12 bg-white">
            <header className="text-center pb-8 border-b border-slate-200">
              <div className="w-16 h-16 mx-auto mb-4">{logoUrl ? <img src={logoUrl} className="max-h-full mx-auto" alt="Logo"/> : <Building className={`w-full h-full ${theme.text}`}/>}</div>
              <Editable defaultValue="DHAMAKA ENTERPRISES" className={`text-2xl font-semibold tracking-[0.2em] ${theme.text}`} />
              <Editable defaultValue="www.dhamaka.com" className="text-xs text-slate-400 mt-2 font-mono" />
            </header>
            <DocumentBody />
            <footer className="text-center border-t border-slate-200 pt-6 text-[10px] text-slate-500 space-y-1">
              <Editable defaultValue="Sector 62, Gurugram, Haryana - 122002 | +91 98765 43210 | contact@dhamaka.com" />
              <Editable defaultValue="CIN: U12345BR2026PTC | GSTIN: 10AAAAA0000A1Z5" />
            </footer>
          </div>
        );

      case 'Corporate':
        return (
          <div className="flex h-full bg-white">
            <aside className={`w-1/3 ${theme.primary} text-white p-8 flex flex-col`}>
              <div className="bg-white/10 p-4 rounded-xl mb-8 flex items-center justify-center h-32">
                 {logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo"/> : <Building className="w-16 h-16 opacity-80"/>}
              </div>
              <Editable defaultValue="DHAMAKA" className="text-3xl font-black" />
              <Editable defaultValue="ENTERPRISES PVT. LTD." className="text-sm font-bold opacity-80 mb-12" />
              
              <div className="space-y-6 text-sm mt-auto">
                <div><Mail size={16} className="mb-2 opacity-50"/><Editable defaultValue="contact@dhamaka.com" /></div>
                <div><Phone size={16} className="mb-2 opacity-50"/><Editable defaultValue="+91 98765 43210" /></div>
                <div><MapPin size={16} className="mb-2 opacity-50"/><Editable defaultValue="East Champaran, Bihar" /></div>
                <div className="pt-6 border-t border-white/20"><Editable defaultValue="GST: 10AAAAA0000A1Z5" className="text-xs opacity-70"/></div>
              </div>
            </aside>
            <main className="w-2/3 p-12 flex flex-col"><DocumentBody /></main>
          </div>
        );

      case 'Bold':
        return (
          <div className={`flex flex-col h-full p-10 border-[16px] ${theme.border} bg-white`}>
            <header className="flex justify-between items-end border-b-4 border-slate-900 pb-4">
              <div>
                <Editable defaultValue="DHAMAKA." className={`text-6xl font-black ${theme.text} -ml-1 leading-none`} />
                <Editable defaultValue="BUSINESS SOLUTIONS" className="text-sm font-bold tracking-[0.3em] text-slate-500 mt-2" />
              </div>
              <div className="text-right text-xs font-bold text-slate-400 space-y-1">
                <Editable defaultValue="Ref: DEPL/2026/01" />
                <Editable defaultValue="Date: DD/MM/YYYY" />
              </div>
            </header>
            <DocumentBody />
            <footer className={`bg-slate-900 text-white p-4 grid grid-cols-2 text-xs rounded-t-lg mt-4`}>
               <Editable defaultValue="123 Business Park, Sector 62, HR" />
               <Editable defaultValue="contact@dhamaka.com | +91 98765 43210" className="text-right" />
            </footer>
          </div>
        );

      case 'Academic':
        return (
          <div className="flex flex-col h-full p-12 bg-white font-serif">
            <header className="flex items-center justify-between border-b-2 border-double border-slate-400 pb-6">
              <div className="text-center w-1/4">
                <Editable defaultValue="Estd. 2026" className="text-sm font-bold text-slate-500" />
                <Editable defaultValue="ISO 9001:2015" className="text-xs text-slate-400" />
              </div>
              <div className="w-24 h-24 rounded-full border-4 p-2 flex items-center justify-center">
                 {logoUrl ? <img src={logoUrl} className="max-h-full rounded-full" alt="Logo"/> : <Building className="w-10 h-10 text-slate-300"/>}
              </div>
              <div className="text-center w-1/4">
                <Editable defaultValue="Govt. Regd." className="text-sm font-bold text-slate-500" />
                <Editable defaultValue="Code: 845401" className="text-xs text-slate-400" />
              </div>
            </header>
            <div className="text-center mt-6 mb-2">
               <Editable defaultValue="DHAMAKA INSTITUTION & MGT." className={`text-3xl font-black uppercase ${theme.text}`} />
            </div>
            <DocumentBody />
            <footer className="border-t-2 border-double border-slate-400 pt-4 text-center text-xs italic text-slate-600">
              <Editable defaultValue="Campus: East Champaran, Bihar | Contact: +91 98765 43210 | Email: admin@dhamaka.edu" />
            </footer>
          </div>
        );

      case 'Elegant':
        return (
          <div className="flex flex-col h-full p-12 bg-white font-serif">
            <header className="flex flex-col items-center border-b-[1px] border-slate-300 pb-8">
              <div className="w-16 h-16 mb-4">{logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo"/> : <Building className={`w-full h-full ${theme.text}`}/>}</div>
              <Editable defaultValue="Dhamaka Enterprises" className={`text-4xl ${theme.text}`} />
              <Editable defaultValue="Exceptional Management & Logistics" className="text-sm italic text-slate-500 mt-2" />
            </header>
            <DocumentBody />
            <footer className="flex justify-between items-center border-t-[1px] border-slate-300 pt-6 text-[11px] text-slate-500 uppercase tracking-widest">
              <Editable defaultValue="+91 98765 43210" />
              <Editable defaultValue="contact@dhamaka.com" />
              <Editable defaultValue="Bihar, India" />
            </footer>
          </div>
        );

      case 'Executive':
        return (
          <div className="flex flex-col h-full p-12 bg-white relative">
            <div className={`absolute top-0 left-0 w-2 h-full ${theme.primary}`}></div>
            <header className="flex justify-between items-start border-b-2 border-slate-100 pb-8 ml-4">
              <div>
                <Editable defaultValue="DHAMAKA PVT. LTD." className={`text-3xl font-black ${theme.text}`} />
                <Editable defaultValue="Reg No: BR-2026-XYZ" className="text-xs font-bold text-slate-400 mt-1" />
              </div>
              <div className="w-16 h-16">{logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo"/> : <Building className={`w-full h-full ${theme.text}`}/>}</div>
            </header>
            <div className="ml-4 flex-1 flex flex-col"><DocumentBody /></div>
            <footer className="ml-4 border-t-2 border-slate-100 pt-4 grid grid-cols-2 text-xs font-medium text-slate-500">
               <Editable defaultValue="HQ: East Champaran, Bihar 845401" />
               <Editable defaultValue="P: +91 98765 43210 | W: dhamaka.com" className="text-right" />
            </footer>
          </div>
        );

      case 'Creative':
        return (
          <div className="flex flex-col h-full bg-white relative overflow-hidden">
            <div className={`absolute -top-16 -right-16 w-64 h-64 rounded-full ${theme.light} opacity-50`}></div>
            <header className="p-12 pb-4 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${theme.primary} flex items-center justify-center p-3 text-white shadow-lg`}>
                  {logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo"/> : <Building />}
                </div>
                <div>
                  <Editable defaultValue="Dhamaka" className={`text-3xl font-black ${theme.text}`} />
                  <Editable defaultValue="Studios & Management" className="text-sm font-bold text-slate-400" />
                </div>
              </div>
            </header>
            <div className="px-12 flex-1 flex flex-col relative z-10"><DocumentBody /></div>
            <footer className={`m-8 p-6 rounded-2xl ${theme.light} flex justify-between items-center text-xs font-bold ${theme.text}`}>
               <div className="flex gap-4">
                 <Editable defaultValue="@dhamakastudios" /> | <Editable defaultValue="contact@dhamaka.com" />
               </div>
               <Editable defaultValue="+91 98765 43210" className={`px-4 py-2 bg-white rounded-full border ${theme.border}`} />
            </footer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* SIDEBAR CONTROLS */}
        <div className="xl:col-span-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-fit sticky top-10">
          <h2 className="text-xl font-black mb-6 text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Briefcase className="text-blue-600"/> Smart Engine
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Select Smart Layout</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {LAYOUTS.map(l => (
                  <button 
                    key={l} onClick={() => setSettings({ ...settings, layout: l })}
                    className={`p-2 border rounded-lg text-sm font-bold transition-all ${settings.layout === l ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Brand Theme Color</label>
              <div className="flex gap-3 mt-2">
                {THEMES.map(t => (
                  <button 
                    key={t.id} onClick={() => setSettings({ ...settings, theme: t.id })}
                    className={`w-10 h-10 rounded-full border-4 transition-all ${t.primary} ${settings.theme === t.id ? 'border-slate-300 scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Upload Company Logo</label>
              <input 
                type="file" accept="image/*"
                onChange={(e) => { if (e.target.files && e.target.files[0]) setLogoUrl(URL.createObjectURL(e.target.files[0])); }} 
                className="w-full text-xs border bg-white p-2 rounded-lg" 
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 font-semibold leading-relaxed">
             ✨ <strong>Pro Tip:</strong> Preview mein kisi bhi text par (Ref, Date, GSTIN, Bank Details) click karein aur seedha edit karein. Khaali chhodne par wo line print mein hide ho jayegi!
          </div>

          <button onClick={downloadPDF} disabled={isDownloading} className="w-full mt-6 bg-slate-900 hover:bg-black transition-colors text-white font-black py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg">
            {isDownloading ? <Loader2 className="animate-spin" /> : <Download />} EXPORT HIGH-RES PDF
          </button>
        </div>

        {/* LIVE PREVIEW CANVAS */}
        <div className="xl:col-span-8 flex justify-center overflow-auto pb-10">
          <div className="bg-white shadow-2xl overflow-hidden relative" style={{ width: '794px', height: '1123px' }}>
            <div ref={previewRef} className="w-full h-full bg-white relative">
               {renderTemplate()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}