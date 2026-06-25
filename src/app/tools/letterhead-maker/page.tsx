'use client';

import React, { useState, useRef } from 'react';
import { Download, Loader2, Building, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// --- CONFIGURATION ---
const LAYOUTS = ['Classic', 'Modern', 'Minimal', 'Bold', 'Corporate', 'Elegant', 'Executive', 'Creative', 'Academic', 'Legal'];
const THEMES = [
  { id: 'slate', primary: 'bg-slate-900', text: 'text-slate-900', border: 'border-slate-900' },
  { id: 'navy', primary: 'bg-blue-900', text: 'text-blue-900', border: 'border-blue-900' },
  { id: 'crimson', primary: 'bg-rose-800', text: 'text-rose-800', border: 'border-rose-800' },
  { id: 'emerald', primary: 'bg-emerald-800', text: 'text-emerald-800', border: 'border-emerald-800' },
  { id: 'charcoal', primary: 'bg-stone-800', text: 'text-stone-800', border: 'border-stone-800' },
];

// --- REUSABLE EDITABLE COMPONENT ---
// Ye component har text ko live-editable banata hai aur React warnings ko suppress karta hai.
const Editable = ({ defaultValue, className }: { defaultValue: string, className?: string }) => (
  <div 
    contentEditable 
    suppressContentEditableWarning 
    className={`outline-none hover:bg-slate-100/50 focus:bg-yellow-50 focus:ring-1 ring-slate-300 rounded px-1 transition-all ${className}`}
  >
    {defaultValue}
  </div>
);

export default function AdvancedLetterheadMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [settings, setSettings] = useState({ layout: 'Classic', theme: 'slate' });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const theme = THEMES.find(t => t.id === settings.theme) || THEMES[0];

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      pdf.save(`Letterhead_${settings.layout}_${settings.theme}.pdf`);
    } catch (error) {
      console.error("Export failed:", error);
    }
    setIsDownloading(false);
  };

  // --- TEMPLATE RENDERER ---
  // Ye function selected template ke hisaab se UI structure change karta hai
  const renderTemplate = () => {
    switch (settings.layout) {
      case 'Modern':
        return (
          <div className="flex flex-col h-full">
            <div className={`p-8 ${theme.primary} text-white flex justify-between items-center`}>
              <div className="w-24 h-24 bg-white/10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                {logoUrl ? <img src={logoUrl} className="max-h-full rounded-xl" alt="Logo" /> : <Building className="text-white/50 w-12 h-12"/>}
              </div>
              <div className="text-right">
                <Editable defaultValue="DHAMAKA ENTERPRISES" className="text-4xl font-black tracking-wider" />
                <Editable defaultValue="INNOVATION AT THE CORE" className="text-sm font-light tracking-[0.3em] opacity-80 mt-2" />
              </div>
            </div>
            <div className="flex-1 p-12 border-x border-slate-100"><Editable defaultValue="[Start typing your letter here...]" className="text-slate-400" /></div>
            <div className={`p-6 ${theme.primary} text-white/80 text-xs flex justify-around`}>
              <Editable defaultValue="+91 98765 43210" /><Editable defaultValue="contact@dhamaka.com" /><Editable defaultValue="www.dhamaka.com" />
            </div>
          </div>
        );
      case 'Minimal':
        return (
          <div className="flex flex-col h-full p-12">
            <div className="flex flex-col items-center mb-16 text-center">
              <div className="w-20 h-20 mb-6">
                 {logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo" /> : <Building className={`w-full h-full ${theme.text}`}/>}
              </div>
              <Editable defaultValue="DHAMAKA ENTERPRISES" className={`text-2xl font-semibold tracking-widest ${theme.text}`} />
            </div>
            <div className="flex-1"><Editable defaultValue="[Start typing your letter here...]" className="text-slate-400" /></div>
            <div className={`border-t pt-6 flex justify-between text-xs ${theme.text} opacity-70`}>
              <Editable defaultValue="Gurugram, HR - 122002" /><Editable defaultValue="www.dhamaka.com" />
            </div>
          </div>
        );
      case 'Corporate':
        return (
          <div className="flex h-full">
            <div className={`w-1/3 ${theme.primary} p-8 text-white flex flex-col justify-between`}>
              <div>
                <div className="w-full h-32 bg-white/10 mb-8 flex items-center justify-center">
                  {logoUrl ? <img src={logoUrl} className="max-h-full p-2" alt="Logo" /> : <Building className="w-12 h-12 opacity-50"/>}
                </div>
                <Editable defaultValue="DHAMAKA PVT LTD" className="text-2xl font-bold mb-2" />
                <Editable defaultValue="CIN: U12345HR2026PTC" className="text-xs opacity-60 mb-8" />
              </div>
              <div className="space-y-4 text-sm opacity-80">
                <Editable defaultValue="Sector 62, Cyber Park" />
                <Editable defaultValue="+91 98765 43210" />
                <Editable defaultValue="hello@dhamaka.com" />
              </div>
            </div>
            <div className="w-2/3 p-12 flex flex-col">
              <div className="flex-1 mt-8"><Editable defaultValue="[Start typing your letter here...]" className="text-slate-400" /></div>
            </div>
          </div>
        );
      case 'Bold':
        return (
          <div className="flex flex-col h-full p-12 border-[12px] border-slate-100">
            <div className={`border-b-8 ${theme.border} pb-6 mb-8 flex justify-between`}>
              <div>
                <Editable defaultValue="DHAMAKA" className={`text-6xl font-black ${theme.text} -ml-1`} />
                <Editable defaultValue="ENTERPRISES PVT. LTD." className="text-lg font-bold tracking-widest text-slate-400" />
              </div>
              <div className="w-24 h-24">
                 {logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo" /> : <Building className={`w-full h-full ${theme.text} opacity-20`}/>}
              </div>
            </div>
            <div className="flex-1"><Editable defaultValue="[Start typing your letter here...]" className="text-slate-400 font-medium" /></div>
            <div className={`border-t-4 ${theme.border} pt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600`}>
              <Editable defaultValue="P: +91 98765 43210" /><Editable defaultValue="E: contact@dhamaka.com" className="text-right" />
            </div>
          </div>
        );
      case 'Academic':
        return (
          <div className="flex flex-col h-full p-12 font-serif">
            <div className="flex items-center justify-between border-b-2 border-double border-slate-400 pb-8 mb-8">
              <div className="text-center w-1/3">
                <Editable defaultValue="Estd. 2026" className="text-xs font-bold text-slate-500" />
              </div>
              <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center">
                 {logoUrl ? <img src={logoUrl} className="max-h-full rounded-full" alt="Logo" /> : <Building className="w-10 h-10 text-slate-300"/>}
              </div>
              <div className="text-center w-1/3">
                <Editable defaultValue="ISO 9001:2015" className="text-xs font-bold text-slate-500" />
              </div>
            </div>
            <div className="text-center mb-12">
               <Editable defaultValue="DHAMAKA INSTITUTION" className={`text-4xl font-black ${theme.text}`} />
            </div>
            <div className="flex-1"><Editable defaultValue="[Start typing your letter here...]" className="text-slate-400" /></div>
          </div>
        );
      case 'Legal':
        return (
          <div className="flex flex-col h-full p-12">
            <div className="border-b-4 border-double border-slate-800 pb-6 mb-8 flex items-end justify-between">
              <div className="w-3/4">
                 <Editable defaultValue="DHAMAKA LEGAL ADVISORS" className="text-3xl font-black font-serif text-slate-900" />
                 <Editable defaultValue="ADVOCATES & SOLICITORS" className="text-sm font-bold tracking-widest mt-1 text-slate-600" />
              </div>
              <div className="w-1/4 text-right text-xs space-y-1 font-serif text-slate-700">
                 <Editable defaultValue="Ref No: ________" />
                 <Editable defaultValue="Date: ________" />
              </div>
            </div>
            <div className="flex-1 font-serif leading-loose"><Editable defaultValue="[Start typing your legal document here...]" className="text-slate-400" /></div>
          </div>
        );
      // Classic, Elegant, Executive, Creative fallbacks use variations of standard layouts for brevity
      default:
        return (
          <div className="flex flex-col h-full p-12">
            <div className={`border-b-[3px] ${theme.border} pb-8 mb-10 flex justify-between items-center`}>
              <div className="w-24 h-24 bg-slate-100 flex items-center justify-center">
                {logoUrl ? <img src={logoUrl} className="max-h-full" alt="Logo" /> : <Building className="text-slate-400 w-10 h-10"/>}
              </div>
              <div className="text-right">
                <Editable defaultValue="DHAMAKA ENTERPRISES" className={`text-3xl font-black uppercase ${theme.text}`} />
                <Editable defaultValue="INNOVATION AT THE CORE" className={`text-xs font-bold uppercase tracking-widest ${theme.text} mt-1`} />
              </div>
            </div>
            <div className="flex-1"><Editable defaultValue="[Start typing your letter here...]" className="text-slate-400" /></div>
            <div className={`pt-8 grid grid-cols-3 gap-4 text-[10px] font-bold ${theme.text}`}>
              <div className="flex items-center gap-2"><MapPin className="w-3 h-3"/> <Editable defaultValue="Sector 62, Gurugram" /></div>
              <div className="flex items-center gap-2"><Phone className="w-3 h-3"/> <Editable defaultValue="+91 98765 43210" /></div>
              <div className="flex items-center gap-2"><Globe className="w-3 h-3"/> <Editable defaultValue="www.dhamaka.com" /></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* SIDEBAR CONTROLS */}
        <div className="xl:col-span-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-fit sticky top-10">
          <h2 className="text-xl font-black mb-6 text-slate-800 uppercase tracking-widest">Builder Engine</h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Select Template Layout</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {LAYOUTS.map(l => (
                  <button 
                    key={l} 
                    onClick={() => setSettings({ ...settings, layout: l })}
                    className={`p-2 border rounded-lg text-sm font-bold transition-all ${settings.layout === l ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Brand Color Theme</label>
              <div className="flex gap-2 mt-2">
                {THEMES.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setSettings({ ...settings, theme: t.id })}
                    className={`w-10 h-10 rounded-full border-4 transition-all ${t.primary} ${settings.theme === t.id ? 'border-slate-300 scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    title={t.id}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Upload Logo</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setLogoUrl(URL.createObjectURL(e.target.files[0]));
                  }
                }} 
                className="w-full text-xs border p-2 rounded-lg mt-2 bg-slate-50" 
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
             <p className="text-xs text-blue-800 font-semibold flex gap-2 items-center">
                💡 <span><strong>Live Edit Active:</strong> Click directly on any text in the preview to edit it instantly.</span>
             </p>
          </div>

          <button onClick={downloadPDF} disabled={isDownloading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-black py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-blue-200">
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