'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Loader2, CreditCard, Building, User, Layout, Palette, Type, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

// 🎨 25 PREMIUM COLOR THEMES
const COLOR_THEMES = [
  { id: 'dark-slate', name: 'Executive Dark', bg: 'bg-slate-900', text: 'text-slate-100', accent: 'text-indigo-400', border: 'border-indigo-400' },
  { id: 'light-clean', name: 'Clean White', bg: 'bg-white', text: 'text-slate-900', accent: 'text-blue-600', border: 'border-blue-600' },
  { id: 'navy-gold', name: 'Navy & Gold', bg: 'bg-blue-950', text: 'text-blue-50', accent: 'text-yellow-500', border: 'border-yellow-500' },
  { id: 'emerald-dark', name: 'Forest Green', bg: 'bg-emerald-950', text: 'text-emerald-50', accent: 'text-emerald-400', border: 'border-emerald-400' },
  { id: 'rose-elegant', name: 'Rose Elegant', bg: 'bg-rose-50', text: 'text-rose-950', accent: 'text-rose-600', border: 'border-rose-600' },
  { id: 'purple-deep', name: 'Deep Purple', bg: 'bg-purple-950', text: 'text-purple-50', accent: 'text-purple-400', border: 'border-purple-400' },
  { id: 'grad-ocean', name: 'Ocean Gradient', bg: 'bg-gradient-to-r from-cyan-600 to-blue-700', text: 'text-white', accent: 'text-cyan-200', border: 'border-cyan-200' },
  { id: 'grad-sunset', name: 'Sunset Gradient', bg: 'bg-gradient-to-r from-orange-500 to-rose-600', text: 'text-white', accent: 'text-yellow-200', border: 'border-yellow-200' },
  { id: 'grad-midnight', name: 'Midnight Gradient', bg: 'bg-gradient-to-br from-gray-900 to-slate-800', text: 'text-gray-100', accent: 'text-teal-400', border: 'border-teal-400' },
  { id: 'grad-aurora', name: 'Aurora Gradient', bg: 'bg-gradient-to-r from-teal-400 to-emerald-600', text: 'text-white', accent: 'text-teal-100', border: 'border-teal-100' },
  { id: 'amber-warm', name: 'Warm Amber', bg: 'bg-amber-100', text: 'text-amber-900', accent: 'text-amber-700', border: 'border-amber-700' },
  { id: 'slate-minimal', name: 'Slate Minimal', bg: 'bg-slate-100', text: 'text-slate-800', accent: 'text-slate-500', border: 'border-slate-400' },
  { id: 'neon-cyber', name: 'Cyberpunk', bg: 'bg-black', text: 'text-white', accent: 'text-fuchsia-500', border: 'border-fuchsia-500' },
  { id: 'teal-ocean', name: 'Teal Ocean', bg: 'bg-teal-900', text: 'text-teal-50', accent: 'text-teal-300', border: 'border-teal-300' },
  { id: 'red-impact', name: 'Red Impact', bg: 'bg-red-700', text: 'text-white', accent: 'text-red-200', border: 'border-red-200' },
  { id: 'indigo-vibes', name: 'Indigo Vibes', bg: 'bg-indigo-100', text: 'text-indigo-900', accent: 'text-indigo-600', border: 'border-indigo-600' },
  { id: 'charcoal', name: 'Charcoal Matte', bg: 'bg-[#222222]', text: 'text-gray-200', accent: 'text-gray-400', border: 'border-gray-500' },
  { id: 'cream-luxury', name: 'Cream Luxury', bg: 'bg-[#F9F6F0]', text: 'text-[#4A4036]', accent: 'text-[#8C7A6B]', border: 'border-[#8C7A6B]' },
  { id: 'grad-berry', name: 'Berry Gradient', bg: 'bg-gradient-to-r from-fuchsia-700 to-purple-800', text: 'text-white', accent: 'text-fuchsia-200', border: 'border-fuchsia-300' },
  { id: 'grad-earth', name: 'Earth Gradient', bg: 'bg-gradient-to-r from-stone-700 to-stone-900', text: 'text-stone-100', accent: 'text-stone-400', border: 'border-stone-400' },
  { id: 'neon-green', name: 'Matrix Green', bg: 'bg-zinc-950', text: 'text-zinc-300', accent: 'text-lime-500', border: 'border-lime-500' },
  { id: 'blue-steel', name: 'Blue Steel', bg: 'bg-slate-700', text: 'text-slate-100', accent: 'text-cyan-400', border: 'border-cyan-400' },
  { id: 'vintage', name: 'Vintage Paper', bg: 'bg-[#EAE0C8]', text: 'text-[#3E3222]', accent: 'text-[#7B5E43]', border: 'border-[#7B5E43]' },
  { id: 'royal-blood', name: 'Royal Crimson', bg: 'bg-rose-950', text: 'text-rose-100', accent: 'text-rose-400', border: 'border-rose-400' },
  { id: 'pure-black', name: 'Pure Black', bg: 'bg-black', text: 'text-white', accent: 'text-gray-300', border: 'border-gray-300' },
];

// 🅰️ 5 PREMIUM FONTS
const FONTS = [
  { id: 'font-sans', name: 'Modern Sans' },
  { id: 'font-serif', name: 'Classic Serif' },
  { id: 'font-mono', name: 'Tech Mono' },
  { id: 'font-[Arial]', name: 'Standard Arial' },
  { id: 'font-[Georgia]', name: 'Elegant Georgia' },
];

export default function VisitingCardMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: 'DHAMAKA STUDIOS',
    tagline: 'Creative Digital Agency',
    name: 'Rahul Sharma',
    designation: 'Founder & CEO',
    phone: '+91 98765 43210',
    email: 'rahul@dhamaka.com',
    website: 'www.dhamaka.com',
    address: 'Sector 62, Cyber Hub, Noida',
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Customization State
  const [layout, setLayout] = useState('modern'); // classic, modern, center, vertical, corporate
  const [themeId, setThemeId] = useState('dark-slate');
  const [font, setFont] = useState('font-sans');

  const theme = COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];

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

  // Download logic (Standard Business Card size: 3.5" x 2" -> 85mm x 55mm)
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 3 });
      // Vertical or Horizontal check
      const orientation = layout === 'vertical' ? 'p' : 'l';
      const w = layout === 'vertical' ? 55 : 85;
      const h = layout === 'vertical' ? 85 : 55;
      
      const pdf = new jsPDF(orientation, 'mm', [w, h]);
      pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
      pdf.save(`${formData.name}_Business_Card.pdf`);
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
      const dataUrl = await toJpeg(previewRef.current, { cacheBust: true, pixelRatio: 3, quality: 1.0 });
      const link = document.createElement('a');
      link.download = `${formData.name}_Business_Card.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  // 🎨 DYNAMIC RENDERER FOR 5 LAYOUTS
  const renderCard = () => {
    const isVertical = layout === 'vertical';
    const cardDims = isVertical ? "w-[300px] h-[525px]" : "w-[525px] h-[300px]";
    
    // LAYOUT 1: MODERN SPLIT (50/50 Color Block)
    if (layout === 'modern') {
      return (
        <div ref={previewRef} className={`${cardDims} ${font} flex shadow-2xl overflow-hidden bg-white`}>
          <div className={`w-2/5 ${theme.bg} ${theme.text} flex flex-col items-center justify-center p-6 text-center border-r-4 ${theme.border}`}>
            {logoUrl ? <img src={logoUrl} className="w-20 h-20 object-contain mb-3" /> : <div className={`w-16 h-16 rounded-full border-2 ${theme.border} flex items-center justify-center mb-3`}><Building className="w-8 h-8"/></div>}
            <h1 className="font-black text-lg tracking-widest leading-tight uppercase">{formData.companyName}</h1>
            <p className={`text-[9px] mt-1 font-medium tracking-widest ${theme.accent} uppercase`}>{formData.tagline}</p>
          </div>
          <div className="w-3/5 p-8 flex flex-col justify-center bg-white text-slate-900">
            <h2 className="text-2xl font-black uppercase tracking-wide text-slate-900">{formData.name}</h2>
            <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${theme.accent.replace('text-', 'text-').replace('-100','-600').replace('-200','-600').replace('-300','-600')}`}>{formData.designation}</p>
            <div className="space-y-3 text-[10px] font-medium text-slate-700">
              {formData.phone && <div className="flex items-center gap-3"><Phone className="w-3 h-3"/> {formData.phone}</div>}
              {formData.email && <div className="flex items-center gap-3"><Mail className="w-3 h-3"/> {formData.email}</div>}
              {formData.website && <div className="flex items-center gap-3"><Globe className="w-3 h-3"/> {formData.website}</div>}
              {formData.address && <div className="flex items-center gap-3"><MapPin className="w-3 h-3"/> {formData.address}</div>}
            </div>
          </div>
        </div>
      );
    }

    // LAYOUT 2: CLASSIC HORIZONTAL
    if (layout === 'classic') {
      return (
        <div ref={previewRef} className={`${cardDims} ${font} ${theme.bg} ${theme.text} flex flex-col justify-between p-8 shadow-2xl overflow-hidden relative`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">{formData.name}</h2>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${theme.accent}`}>{formData.designation}</p>
            </div>
            {logoUrl ? <img src={logoUrl} className="w-16 h-16 object-contain" /> : <Building className={`w-12 h-12 ${theme.accent}`} />}
          </div>
          <div className="flex justify-between items-end">
            <div className="space-y-2 text-[10px] font-medium opacity-90">
              {formData.phone && <p>{formData.phone}</p>}
              {formData.email && <p>{formData.email}</p>}
              {formData.website && <p>{formData.website}</p>}
              {formData.address && <p>{formData.address}</p>}
            </div>
            <div className="text-right">
              <h1 className="font-black text-sm tracking-widest uppercase">{formData.companyName}</h1>
              <p className={`text-[8px] font-medium tracking-widest ${theme.accent} uppercase`}>{formData.tagline}</p>
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r ${theme.border.replace('border-', 'from-').replace('-400','-600')} to-transparent opacity-50`}></div>
        </div>
      );
    }

    // LAYOUT 3: CENTERED MINIMAL
    if (layout === 'center') {
      return (
        <div ref={previewRef} className={`${cardDims} ${font} ${theme.bg} ${theme.text} flex flex-col items-center justify-center p-8 text-center shadow-2xl overflow-hidden border-[8px] border-double ${theme.border}`}>
          <h1 className="font-black text-xl tracking-widest uppercase mb-1">{formData.companyName}</h1>
          <p className={`text-[8px] font-bold tracking-widest uppercase mb-6 ${theme.accent}`}>{formData.tagline}</p>
          
          <h2 className="text-2xl font-black uppercase">{formData.name}</h2>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-6 opacity-80 border-b pb-2">{formData.designation}</p>
          
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[9px] font-medium opacity-90">
            {formData.phone && <span>{formData.phone}</span>}
            {formData.email && <span>{formData.email}</span>}
            {formData.website && <span>{formData.website}</span>}
            {formData.address && <span className="w-full mt-1">{formData.address}</span>}
          </div>
        </div>
      );
    }

    // LAYOUT 4: VERTICAL STANDARD
    if (layout === 'vertical') {
      return (
        <div ref={previewRef} className={`${cardDims} ${font} ${theme.bg} ${theme.text} flex flex-col shadow-2xl overflow-hidden relative`}>
          <div className={`h-1/2 flex flex-col items-center justify-center p-6 text-center bg-black/20 backdrop-blur-sm border-b-4 ${theme.border}`}>
            {logoUrl ? <img src={logoUrl} className="w-20 h-20 object-contain mb-4" /> : <Building className={`w-16 h-16 mb-4 ${theme.accent}`} />}
            <h1 className="font-black text-lg tracking-widest uppercase leading-tight">{formData.companyName}</h1>
            <p className={`text-[8px] mt-2 font-bold tracking-widest uppercase ${theme.accent}`}>{formData.tagline}</p>
          </div>
          <div className="h-1/2 p-6 flex flex-col justify-center text-center">
            <h2 className="text-xl font-black uppercase tracking-wider">{formData.name}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-5 ${theme.accent}`}>{formData.designation}</p>
            <div className="space-y-2 text-[10px] font-medium opacity-90">
              {formData.phone && <p>{formData.phone}</p>}
              {formData.email && <p>{formData.email}</p>}
              {formData.website && <p>{formData.website}</p>}
            </div>
          </div>
        </div>
      );
    }

    // LAYOUT 5: CORPORATE SHARP
    if (layout === 'corporate') {
      return (
        <div ref={previewRef} className={`${cardDims} ${font} ${theme.bg} ${theme.text} flex shadow-2xl overflow-hidden relative`}>
          <div className={`w-12 h-full border-r border-white/20 flex items-center justify-center bg-black/20`}>
            <div className="transform -rotate-90 whitespace-nowrap font-black tracking-[0.3em] uppercase text-[10px] opacity-60">
              {formData.companyName}
            </div>
          </div>
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{formData.name}</h2>
                <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${theme.accent}`}>{formData.designation}</p>
              </div>
              {logoUrl && <img src={logoUrl} className="w-12 h-12 object-contain" />}
            </div>
            <div className="space-y-2 text-[10px] font-medium opacity-90 pl-4 border-l-2 border-white/30">
              {formData.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3"/> {formData.phone}</div>}
              {formData.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3"/> {formData.email}</div>}
              {formData.website && <div className="flex items-center gap-2"><Globe className="w-3 h-3"/> {formData.website}</div>}
              {formData.address && <div className="flex items-center gap-2"><MapPin className="w-3 h-3"/> {formData.address}</div>}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <CreditCard className="w-10 h-10 text-rose-600" />
            Mega Visiting Card Maker
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Over 625+ unique design combinations (5 Layouts × 25 Colors × 5 Fonts)</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM & CONTROLS ================= */}
          <div className="xl:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* DESIGN CONTROLS */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-4">
                <h3 className="font-bold text-xs text-rose-800 uppercase flex items-center gap-1"><Palette className="w-4 h-4"/> Design Engine</h3>
                
                {/* Layouts */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">1. Select Layout Structure</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['classic', 'modern', 'center', 'vertical', 'corporate'].map(l => (
                      <button key={l} onClick={() => setLayout(l)} className={`py-1.5 text-[10px] font-bold uppercase rounded border-2 transition-all ${layout === l ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fonts */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">2. Select Typography (Font)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => setFont(f.id)} className={`py-1.5 text-[10px] font-bold rounded border-2 transition-all ${f.id} ${font === f.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-200'}`}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Themes */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2 flex justify-between">
                    <span>3. Color Theme (25 Styles)</span>
                    <span className="text-rose-600">{theme.name}</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2 h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {COLOR_THEMES.map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => setThemeId(t.id)} 
                        title={t.name}
                        className={`h-8 rounded-md border-2 transition-all ${t.bg} ${themeId === t.id ? 'ring-2 ring-offset-2 ring-rose-500 border-white' : 'border-transparent'}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-4 h-4"/> Card Details</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-rose-500 font-bold" />
                    <input type="text" name="tagline" placeholder="Tagline" value={formData.tagline} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-rose-500" />
                    <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg focus:border-rose-500 font-bold text-rose-800" />
                    <input type="text" name="designation" placeholder="Designation" value={formData.designation} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg focus:border-rose-500" />
                    <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-rose-500" />
                    <input type="text" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-rose-500" />
                    <input type="text" name="website" placeholder="Website" value={formData.website} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg focus:border-rose-500" />
                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 mt-2">Upload Logo (Optional)</label>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs border p-1.5 rounded-lg bg-rose-50" />
                  </div>
                </div>
              </div>

            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="p-4 border-t border-slate-200 grid grid-cols-2 gap-3 bg-white">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="xl:col-span-7 flex items-center justify-center bg-slate-200 rounded-3xl p-4 md:p-8 shadow-inner overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="z-10 transition-all duration-500 hover:scale-105">
              {renderCard()}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}