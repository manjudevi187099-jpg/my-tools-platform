'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, Zap, Star, Truck, PartyPopper, Briefcase, Camera, Globe, 
  Building, LayoutTemplate, Layers, Palette, Circle, Square, 
  Monitor, SlidersHorizontal, Image as ImageIcon, Flame, Droplet, Leaf, Hexagon,
  UploadCloud, Box, Shield, Anchor, Crown, Gem, ChartBar, PieChart, TrendingUp, 
  Wallet, Landmark, Laptop, Smartphone, Cpu, Database, Code, Wifi, Cloud, Rocket, 
  Package, MapPin, Navigation, Compass, Coffee, Utensils, Music, Ticket, Sun, Moon, 
  Umbrella, Mic, Headphones, Heart, Smile, Activity, Aperture, Archive, AtSign, 
  Award, Bell, Book, Bookmark, Calendar, Clipboard, Crosshair, Flag, Gift, Key, 
  Link, Paperclip, PenTool, Printer, Scissors, ShoppingBag, ShoppingCart, Tag, 
  Target, Terminal, Wrench, User, Video
} from 'lucide-react';
import { toPng } from 'html-to-image';

// 75+ Premium Icons for diverse industries
const ICONS = [
  Building, Truck, PartyPopper, Briefcase, Globe, Camera, Zap, Star, Flame, Droplet, Leaf, Hexagon,
  Box, Shield, Anchor, Crown, Gem, ChartBar, PieChart, TrendingUp, Wallet, Landmark,
  Laptop, Smartphone, Cpu, Database, Code, Wifi, Cloud, Rocket, Package, MapPin, Navigation, Compass,
  Coffee, Utensils, Music, Ticket, Sun, Moon, Umbrella, Mic, Headphones, Heart, Smile,
  Activity, Aperture, Archive, AtSign, Award, Bell, Book, Bookmark, Calendar, Clipboard,
  Crosshair, Flag, Gift, Key, Link, Paperclip, PenTool, Printer, Scissors,
  ShoppingBag, ShoppingCart, Tag, Target, Terminal, Wrench, User, Video
];

const FONTS = [
  { name: 'Modern Sans', class: 'font-sans' },
  { name: 'Elegant Serif', class: 'font-serif' },
  { name: 'Tech Mono', class: 'font-mono' }
];

const SHAPES = [
  { id: 'none', name: 'Transparent', icon: ImageIcon, radius: '0px' },
  { id: 'circle', name: 'Circle', icon: Circle, radius: '50%' },
  { id: 'rounded', name: 'Rounded', icon: Monitor, radius: '24px' },
  { id: 'square', name: 'Square', icon: Square, radius: '0px' },
];

export default function LogoMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- BRAND STATE ---
  const [brandName, setBrandName] = useState('DHAMAKA');
  const [tagline, setTagline] = useState('BUSINESS LOGISTICS');
  
  // --- DESIGN STATE ---
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [font, setFont] = useState(FONTS[0].class);
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  
  // --- SHAPE & SIZE STATE ---
  const [shape, setShape] = useState(SHAPES[0]);
  const [iconSize, setIconSize] = useState(100);
  const [padding, setPadding] = useState(64);
  
  // --- FULL COLOR CONTROL (HEX) ---
  const [iconColor, setIconColor] = useState('#4f46e5');
  const [textColor, setTextColor] = useState('#0f172a');
  const [taglineColor, setTaglineColor] = useState('#64748b');
  const [bgColor, setBgColor] = useState('#ffffff');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomImage(url);
    }
  };

  const handleIconSelect = (index: number) => {
    setSelectedIcon(index);
    setCustomImage(null); // Clear custom image if user selects a library icon
  };

  const downloadLogo = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { 
        pixelRatio: 4, 
        backgroundColor: shape.id === 'none' ? 'rgba(0,0,0,0)' : bgColor,
        style: { transform: 'scale(1)', margin: '0' } 
      });
      
      const link = document.createElement('a');
      link.download = `${brandName.replace(/\s+/g, '_')}_Pro_Logo.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  const Icon = ICONS[selectedIcon];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- PRO CONTROLS SIDEBAR --- */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Logo Pro Engine</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Industry Level Studio</p>
            </div>
            <Layers className="text-indigo-600 w-8 h-8" />
          </div>
          
          <div className="space-y-8">
            
            {/* 1. BRAND TEXT */}
            <section>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3"><LayoutTemplate size={16}/> Brand Text</label>
              <div className="space-y-3">
                <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className="w-full border-2 border-slate-200 focus:border-indigo-500 p-3 rounded-xl font-bold outline-none" placeholder="Brand Name" />
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full border-2 border-slate-200 focus:border-indigo-500 p-3 rounded-xl text-sm outline-none" placeholder="Tagline (Optional)" />
              </div>
            </section>

            {/* 2. ICON LIBRARY & UPLOAD */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800"><Layers size={16}/> Icon Symbol</label>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{ICONS.length}+ Icons</span>
              </div>
              
              {/* UPLOAD CUSTOM ICON */}
              <div className="mb-4">
                <label className={`w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed font-bold rounded-xl cursor-pointer transition-all ${customImage ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-400 hover:text-indigo-500'}`}>
                  <UploadCloud size={18} />
                  {customImage ? 'Custom Icon Active (Click to Change)' : 'Upload Custom Icon (SVG/PNG)'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {customImage && (
                  <button onClick={() => setCustomImage(null)} className="text-xs text-red-500 font-bold mt-2 text-center w-full hover:underline">
                    ✕ Remove Custom Icon & Use Library
                  </button>
                )}
              </div>

              {/* SCROLLABLE ICON GRID */}
              <div className={`grid grid-cols-6 gap-2 max-h-56 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50 shadow-inner ${customImage ? 'opacity-50 pointer-events-none' : ''}`}>
                {ICONS.map((I, i) => (
                  <button key={i} onClick={() => handleIconSelect(i)} className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all ${selectedIcon === i ? 'border-indigo-600 bg-white text-indigo-600 shadow-sm' : 'border-transparent bg-white text-slate-400 hover:border-slate-200 hover:text-slate-700'}`}>
                    <I size={24} strokeWidth={2}/>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. SHAPE & LAYOUT */}
            <section className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3"><Monitor size={16}/> Background Shape</label>
                <div className="grid grid-cols-2 gap-2">
                  {SHAPES.map(s => (
                    <button key={s.id} onClick={() => setShape(s)} className={`p-2 flex flex-col items-center gap-1 rounded-xl text-xs font-bold border-2 transition-all ${shape.id === s.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                      <s.icon size={18}/> {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3"><SlidersHorizontal size={16}/> Layout Style</label>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setLayout('vertical')} className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${layout === 'vertical' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-100 text-slate-500'}`}>Stacked (Vertical)</button>
                  <button onClick={() => setLayout('horizontal')} className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${layout === 'horizontal' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-100 text-slate-500'}`}>Inline (Horizontal)</button>
                </div>
              </div>
            </section>

            {/* 4. PRO COLOR PICKERS */}
            <section>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3"><Palette size={16}/> Custom Colors</label>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">Icon Color</span>
                  <input type="color" value={iconColor} onChange={(e) => setIconColor(e.target.value)} disabled={!!customImage} className={`w-8 h-8 rounded cursor-pointer border-0 p-0 ${customImage ? 'opacity-30' : ''}`} title={customImage ? 'Color disabled for custom images' : ''} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">Brand Name</span>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">Tagline</span>
                  <input type="color" value={taglineColor} onChange={(e) => setTaglineColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                </div>
                {shape.id !== 'none' && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">Background</span>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  </div>
                )}
              </div>
            </section>

            {/* 5. TYPOGRAPHY & SCALING */}
            <section className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Typography</label>
                <div className="flex gap-2">
                  {FONTS.map(f => (
                    <button key={f.name} onClick={() => setFont(f.class)} className={`flex-1 py-2 text-xs border-2 rounded-xl transition-all ${f.class} ${font === f.class ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-bold' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-2"><span>Icon / Logo Size</span><span>{iconSize}px</span></div>
                  <input type="range" min="40" max="250" value={iconSize} onChange={(e) => setIconSize(Number(e.target.value))} className="w-full accent-indigo-600" />
                </div>
                {shape.id !== 'none' && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-2"><span>Container Padding</span><span>{padding}px</span></div>
                    <input type="range" min="20" max="150" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
                )}
              </div>
            </section>

          </div>

          <button onClick={downloadLogo} disabled={isDownloading} className="w-full mt-8 bg-slate-900 hover:bg-black transition-colors text-white py-4 rounded-xl font-black flex justify-center items-center gap-2 shadow-lg">
            {isDownloading ? <span className="animate-pulse">EXPORTING HD...</span> : <><Download size={20}/> EXPORT HD LOGO</>}
          </button>
        </div>

        {/* --- LIVE CANVAS AREA --- */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-slate-200/50 rounded-3xl p-4 md:p-10 border border-slate-200 min-h-[600px] relative overflow-hidden">
          
          <div className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
            <Monitor size={14}/> Live Canvas
          </div>

          <div className="relative shadow-2xl transition-all duration-300" style={{
            borderRadius: shape.radius,
            backgroundImage: shape.id === 'none' ? 'repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%)' : 'none',
            backgroundSize: '20px 20px'
          }}>
            
            {/* THE EXPORTABLE NODE */}
            <div 
              ref={previewRef} 
              className={`flex items-center justify-center transition-all duration-300 overflow-hidden ${layout === 'vertical' ? 'flex-col gap-4 text-center' : 'flex-row gap-8 text-left'}`}
              style={{
                backgroundColor: shape.id === 'none' ? 'transparent' : bgColor,
                borderRadius: shape.radius,
                padding: shape.id === 'none' ? '20px' : `${padding}px`,
                minWidth: layout === 'horizontal' ? '500px' : 'auto',
                minHeight: layout === 'vertical' ? 'auto' : 'auto',
                aspectRatio: shape.id === 'circle' || shape.id === 'square' ? '1/1' : 'auto'
              }}
            >
              {/* DYNAMIC ICON / IMAGE RENDERER */}
              <div className="flex-shrink-0 transition-all duration-300 flex items-center justify-center">
                {customImage ? (
                  <img 
                    src={customImage} 
                    alt="Custom Logo" 
                    style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} 
                  />
                ) : (
                  <div style={{ color: iconColor }}>
                    <Icon size={iconSize} strokeWidth={2.5} />
                  </div>
                )}
              </div>
              
              {/* LOGO TEXT */}
              <div className="flex flex-col justify-center">
                <h1 className={`${font} font-black uppercase tracking-tight leading-none transition-colors duration-300 whitespace-nowrap`} style={{ color: textColor, fontSize: layout === 'vertical' ? `${iconSize * 0.4}px` : `${iconSize * 0.6}px` }}>
                  {brandName || 'BRAND'}
                </h1>
                {tagline && (
                  <p className={`${font} font-bold uppercase mt-2 whitespace-nowrap`} style={{ color: taglineColor, fontSize: layout === 'vertical' ? `${iconSize * 0.12}px` : `${iconSize * 0.16}px`, letterSpacing: '0.3em' }}>
                    {tagline}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}