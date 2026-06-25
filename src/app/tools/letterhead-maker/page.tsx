'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, Building, Mail, Phone, Globe, MapPin, LayoutTemplate } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

const LAYOUTS = ['classic', 'modern', 'minimal', 'bold', 'corporate'];
const THEMES = [
  { id: 'slate', primary: 'bg-slate-900', text: 'text-slate-900', border: 'border-slate-900' },
  { id: 'navy', primary: 'bg-blue-900', text: 'text-blue-900', border: 'border-blue-900' },
  { id: 'crimson', primary: 'bg-rose-800', text: 'text-rose-800', border: 'border-rose-800' },
  { id: 'emerald', primary: 'bg-emerald-800', text: 'text-emerald-800', border: 'border-emerald-800' },
  { id: 'charcoal', primary: 'bg-stone-800', text: 'text-stone-800', border: 'border-stone-800' },
];

export default function LetterheadMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: 'DHAMAKA ENTERPRISES PVT. LTD.',
    tagline: 'INNOVATION AT THE CORE',
    address: 'Sector 62, Cyber Park, Gurugram, HR - 122002',
    phone: '+91 98765 43210',
    email: 'contact@dhamaka.com',
    website: 'www.dhamaka.com',
    regNo: 'CIN: U12345HR2026PTC67890'
  });

  const [settings, setSettings] = useState({ layout: 'classic', theme: 'slate', font: 'font-serif' });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    const dataUrl = await toPng(previewRef.current, { pixelRatio: 2 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
    pdf.save(`Letterhead_${formData.companyName.replace(/\s+/g, '_')}.pdf`);
    setIsDownloading(false);
  };

  const theme = THEMES.find(t => t.id === settings.theme) || THEMES[0];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* FORM SIDE */}
        <div className="xl:col-span-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
          <h2 className="text-xl font-black mb-6 text-slate-800 uppercase tracking-widest">Configure Letterhead</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <select onChange={(e) => setSettings({...settings, layout: e.target.value})} className="border p-2 rounded text-sm font-bold">
              {LAYOUTS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <select onChange={(e) => setSettings({...settings, theme: e.target.value})} className="border p-2 rounded text-sm font-bold">
              {THEMES.map(t => <option key={t.id} value={t.id}>{t.id.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <input name="companyName" placeholder="Company Name" onChange={handleInputChange} className="w-full border p-3 rounded-lg font-bold" />
            <input name="tagline" placeholder="Tagline" onChange={handleInputChange} className="w-full border p-3 rounded-lg" />
            <input name="address" placeholder="Address" onChange={handleInputChange} className="w-full border p-3 rounded-lg" />
            <input name="phone" placeholder="Phone" onChange={handleInputChange} className="w-full border p-3 rounded-lg" />
            <input name="email" placeholder="Email" onChange={handleInputChange} className="w-full border p-3 rounded-lg" />
            <input name="website" placeholder="Website" onChange={handleInputChange} className="w-full border p-3 rounded-lg" />
            <input type="file" onChange={(e) => setLogoUrl(URL.createObjectURL(e.target.files![0]))} className="w-full text-xs border p-2" />
          </div>

          <button onClick={downloadPDF} className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center gap-2">
            {isDownloading ? <Loader2 className="animate-spin" /> : <Download />} Export PDF
          </button>
        </div>

        {/* PREVIEW SIDE */}
        <div className="xl:col-span-8 flex justify-center overflow-auto">
          <div ref={previewRef} className="w-[794px] h-[1123px] bg-white shadow-2xl p-12 flex flex-col relative font-serif">
            
            {/* DYNAMIC HEADER */}
            <div className={`border-b-[3px] ${theme.border} pb-8 mb-10 flex justify-between items-center`}>
              <div className="w-24 h-24 bg-slate-100 flex items-center justify-center">
                {logoUrl ? <img src={logoUrl} className="max-h-full" /> : <Building className="text-slate-400"/>}
              </div>
              <div className="text-right">
                <h1 className={`text-3xl font-black uppercase ${theme.text}`}>{formData.companyName}</h1>
                <p className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>{formData.tagline}</p>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 border-b-2 border-slate-200">
               <div className="h-64 border-dashed border-2 border-slate-100 rounded-lg flex items-center justify-center text-slate-300 font-bold">Document Content Area</div>
            </div>

            {/* FOOTER */}
            <div className={`pt-8 grid grid-cols-3 gap-4 text-[10px] font-bold ${theme.text}`}>
              <div className="flex items-center gap-2"><MapPin className="w-3 h-3"/> {formData.address}</div>
              <div className="flex items-center gap-2"><Phone className="w-3 h-3"/> {formData.phone}</div>
              <div className="flex items-center gap-2"><Globe className="w-3 h-3"/> {formData.website}</div>
              <p className="col-span-3 text-center border-t pt-2 opacity-50">{formData.regNo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}