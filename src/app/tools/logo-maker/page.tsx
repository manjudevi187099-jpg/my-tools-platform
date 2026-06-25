'use client';

import React, { useState, useRef } from 'react';
import { Download, Zap, Star, Truck, PartyPopper, Briefcase, Camera, Globe, Building, LayoutTemplate, Type, Layers } from 'lucide-react';
import { toPng } from 'html-to-image';

const ICONS = [PartyPopper, Truck, Building, Briefcase, Zap, Star, Camera, Globe];
const FONTS = [
  { name: 'Sans (Modern)', class: 'font-sans' },
  { name: 'Serif (Classic)', class: 'font-serif' },
  { name: 'Mono (Tech)', class: 'font-mono' }
];
const COLORS = [
  { id: 'slate', hex: 'text-slate-900', bg: 'bg-slate-900' },
  { id: 'indigo', hex: 'text-indigo-600', bg: 'bg-indigo-600' },
  { id: 'rose', hex: 'text-rose-600', bg: 'bg-rose-600' },
  { id: 'emerald', hex: 'text-emerald-600', bg: 'bg-emerald-600' },
  { id: 'amber', hex: 'text-amber-500', bg: 'bg-amber-500' },
];

export default function LogoMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [brandName, setBrandName] = useState('MANAGEMENT BABA');
  const [tagline, setTagline] = useState('Premium Event Services');
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [font, setFont] = useState(FONTS[0].class);
  const [color, setColor] = useState(COLORS[0].hex);
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadLogo = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      // High-res export for professional use
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 4, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${brandName.replace(/\s+/g, '_')}_Logo.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  const Icon = ICONS[selectedIcon];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CONFIGURATION SIDEBAR */}
        <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 h-fit sticky top-10">
          <div className="flex items-center gap-2 mb-8">
            <LayoutTemplate className="text-indigo-600" />
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-800">Logo Engine</h2>
          </div>
          
          <div className="space-y-6">
            {/* Text Inputs */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Brand Details</label>
              <input 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full border-2 border-slate-200 focus:border-indigo-500 p-3 rounded-xl mb-3 font-bold outline-none transition-all"
                placeholder="Enter Brand Name"
              />
              <input 
                value={tagline} 
                onChange={(e) => setTagline(e.target.value)}
                className="w-full border-2 border-slate-200 focus:border-indigo-500 p-3 rounded-xl text-sm outline-none transition-all"
                placeholder="Tagline (Optional)"
              />
            </div>

            {/* Layout Toggle */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Layout Style</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setLayout('vertical')} 
                  className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${layout === 'vertical' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                >
                  Vertical (Stacked)
                </button>
                <button 
                  onClick={() => setLayout('horizontal')} 
                  className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${layout === 'horizontal' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                >
                  Horizontal (Inline)
                </button>
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Brand Icon</label>
              <div className="grid grid-cols-4 gap-2">
                {ICONS.map((I, i) => (
                  <button 
                    key={i} onClick={() => setSelectedIcon(i)} 
                    className={`p-4 rounded-xl flex items-center justify-center border-2 transition-all ${selectedIcon === i ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600'}`}
                  >
                    <I size={24} strokeWidth={2.5}/>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Typography</label>
              <div className="flex flex-wrap gap-2">
                {FONTS.map(f => (
                  <button 
                    key={f.name} onClick={() => setFont(f.class)} 
                    className={`px-4 py-2 text-sm border-2 rounded-xl transition-all ${f.class} ${font === f.class ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-bold' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Brand Color</label>
              <div className="flex gap-3">
                {COLORS.map(c => (
                  <button 
                    key={c.id} onClick={() => setColor(c.hex)} 
                    className={`w-10 h-10 rounded-full transition-all border-4 ${c.bg} ${color === c.hex ? 'border-slate-300 scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <button onClick={downloadLogo} disabled={isDownloading} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-4 rounded-xl font-black flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">
            {isDownloading ? <span className="animate-pulse">RENDERING...</span> : <><Download size={20}/> EXPORT HIGH-RES PNG</>}
          </button>
        </div>

        {/* LIVE CANVAS AREA */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center bg-slate-200/50 rounded-3xl p-4 md:p-10 border-2 border-dashed border-slate-300 min-h-[600px] relative overflow-hidden">
          
          <div className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <Layers size={16}/> Live Canvas
          </div>

          {/* The Actual Exportable Logo Container */}
          <div 
            ref={previewRef} 
            className={`bg-white p-16 flex items-center justify-center transition-all duration-300 ease-in-out ${layout === 'vertical' ? 'flex-col gap-6 w-[500px] h-[500px] rounded-3xl shadow-2xl' : 'flex-row gap-8 w-[700px] h-[300px] rounded-[3rem] shadow-2xl'}`}
          >
            {/* Logo Icon */}
            <div className={`${color} transition-colors duration-300`}>
              <Icon size={layout === 'vertical' ? 120 : 96} strokeWidth={2.5} />
            </div>
            
            {/* Text Container */}
            <div className={`flex flex-col justify-center ${layout === 'vertical' ? 'text-center' : 'text-left'}`}>
              <h1 className={`${font} ${color} ${layout === 'vertical' ? 'text-5xl' : 'text-6xl'} font-black uppercase tracking-tight leading-none transition-colors duration-300`}>
                {brandName || 'BRAND NAME'}
              </h1>
              {tagline && (
                <p className={`${font} text-slate-500 font-semibold tracking-[0.3em] uppercase mt-3 ${layout === 'vertical' ? 'text-sm' : 'text-base'}`}>
                  {tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}