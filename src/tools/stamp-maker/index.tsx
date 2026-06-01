'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

type Shape = 'rectangle' | 'round' | 'oval';
type StampColor = '#0f52ba' | '#dc2626' | '#000000' | '#6b21a8' | '#059669'; // Blue, Red, Black, Purple, Green

interface StampData {
  type: string;
  shape: Shape;
  color: StampColor;
  borderWidth: number;
  text: {
    top: string;      // Company Name / Main Heading
    middle1: string;  // GST / Reg No / Department
    middle2: string;  // Received / Paid / Date
    bottom: string;   // Address / Signatory
  };
  includeDate: boolean;
}

const STAMP_TYPES = [
  'Proprietorship Stamp', 'Partnership Firm Stamp', 'GST Stamp', 'Company Stamp', 
  'Address Stamp', 'Name Stamp', 'Signature Stamp', 'Received / Paid Stamp', 
  'Round Seal / Round Mohar', 'Advocate / CA / Doctor Stamp', 'Govt Office Seal'
];

const FLOW_STEPS = [
  'Stamp Type', 'Details', 'Shape & Design', 'Preview & Download'
];

export default function StampMaker() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<StampData>({
    type: 'Company Stamp',
    shape: 'rectangle',
    color: '#0f52ba', // Standard Stamp Blue
    borderWidth: 4,
    text: {
      top: 'TECHNOVA SOLUTIONS PVT. LTD.',
      middle1: 'GSTIN: 07AABCU9603R1ZM',
      middle2: '',
      bottom: 'AUTHORIZED SIGNATORY',
    },
    includeDate: false
  });

  const handleText = (field: keyof StampData['text'], value: string) => {
    setData({ ...data, text: { ...data.text, [field]: value.toUpperCase() } });
  };

  // 🌟 OFF-SCREEN TRANSPARENT PNG & PDF ENGINE 🌟
  const exportStamp = async (format: 'png' | 'pdf') => {
    if (!printRef.current) return;
    setIsProcessing(true);
    try {
      // Create high-res transparent canvas
      const canvas = await html2canvas(printRef.current, { 
        scale: 4, // Extremely high quality for stamps
        useCORS: true, 
        allowTaint: true,
        backgroundColor: null // 🌟 CRITICAL: Transparent Background for PNG 🌟
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const safeName = data.text.top ? data.text.top.replace(/\s+/g, '_').substring(0, 15) : 'Stamp';

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${safeName}_Digital_Stamp.png`;
        link.href = imgData;
        link.click();
      } else {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        // Place stamp in the center of A4 for physical rubber stamp manufacturing
        const imgWidth = 80; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', (pdfWidth - imgWidth)/2, 50, imgWidth, imgHeight);
        pdf.save(`${safeName}_Printable_Stamp.pdf`);
      }
    } catch (error: any) {
      console.error("Export Engine Crash:", error);
      alert("Error generating stamp. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 🌟 SVG & HTML STAMP RENDERER 🌟 ---
  const renderStamp = () => {
    const { shape, color, borderWidth, text, includeDate } = data;
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Inner styling for the stamp look
    const stampStyle = {
      borderColor: color,
      color: color,
      borderWidth: `${borderWidth}px`,
    };

    if (shape === 'rectangle') {
      return (
        <div className="p-1 inline-block bg-transparent">
          <div 
            className="flex flex-col items-center justify-center p-6 text-center border-double bg-transparent min-w-[350px] max-w-[500px]"
            style={{ ...stampStyle, borderStyle: borderWidth > 4 ? 'double' : 'solid', borderWidth: `${borderWidth * 1.5}px` }}
          >
            <h2 className="text-2xl font-black uppercase tracking-widest leading-tight mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              {text.top}
            </h2>
            {text.middle1 && <p className="text-md font-bold tracking-wider mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>{text.middle1}</p>}
            {text.middle2 && <p className="text-xl font-black tracking-widest border-y-2 py-1 my-2" style={{ borderColor: color, fontFamily: 'Arial, sans-serif' }}>{text.middle2}</p>}
            {includeDate && <p className="text-lg font-bold tracking-widest my-2" style={{ fontFamily: 'Courier New, monospace' }}>DATE: {currentDate}</p>}
            {text.bottom && <p className="text-sm font-bold uppercase tracking-widest mt-6 pt-2 border-t border-dashed w-3/4" style={{ borderColor: color, fontFamily: 'Arial, sans-serif' }}>{text.bottom}</p>}
          </div>
        </div>
      );
    }

    if (shape === 'round') {
      // 🌟 TRUE SVG ROUND TEXT ENGINE 🌟
      const size = 300;
      const center = size / 2;
      const radius = 110;
      
      return (
        <div className="p-1 inline-block bg-transparent relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-transparent">
            <defs>
              {/* Path for Top Text (Clockwise) */}
              <path id="topCurve" d={`M ${center - radius}, ${center} A ${radius},${radius} 0 0,1 ${center + radius},${center}`} />
              {/* Path for Bottom Text (Counter-Clockwise) */}
              <path id="bottomCurve" d={`M ${center - radius}, ${center} A ${radius},${radius} 0 0,0 ${center + radius},${center}`} />
            </defs>

            {/* Outer Border */}
            <circle cx={center} cy={center} r={140} fill="none" stroke={color} strokeWidth={borderWidth * 1.5} strokeDasharray={borderWidth === 3 ? "10,5" : "none"} />
            <circle cx={center} cy={center} r={132} fill="none" stroke={color} strokeWidth={borderWidth > 4 ? 2 : 0} />
            
            {/* Inner Border */}
            <circle cx={center} cy={center} r={80} fill="none" stroke={color} strokeWidth={borderWidth} />

            {/* Top Text */}
            <text fill={color} fontSize="22" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="2">
              <textPath href="#topCurve" startOffset="50%" textAnchor="middle">{text.top}</textPath>
            </text>

            {/* Bottom Text */}
            <text fill={color} fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">
              <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">{text.bottom}</textPath>
            </text>

            {/* Center Content */}
            <text x={center} y={center - 10} fill={color} fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif" textAnchor="middle">
              {text.middle1}
            </text>
            <text x={center} y={center + 15} fill={color} fontSize="22" fontWeight="black" fontFamily="Arial, sans-serif" textAnchor="middle">
              {text.middle2}
            </text>
            {includeDate && (
              <text x={center} y={center + 40} fill={color} fontSize="14" fontWeight="bold" fontFamily="Courier New, monospace" textAnchor="middle">
                {currentDate}
              </text>
            )}
          </svg>
        </div>
      );
    }

    if (shape === 'oval') {
      return (
        <div className="p-1 inline-block bg-transparent">
          <div 
            className="flex flex-col items-center justify-center p-8 text-center bg-transparent min-w-[400px] h-[250px]"
            style={{ ...stampStyle, borderStyle: borderWidth > 4 ? 'double' : 'solid', borderWidth: `${borderWidth * 1.5}px`, borderRadius: '50% / 50%' }}
          >
            <h2 className="text-2xl font-black uppercase tracking-widest leading-tight mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              {text.top}
            </h2>
            {text.middle1 && <p className="text-md font-bold tracking-wider mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>{text.middle1}</p>}
            {text.middle2 && <p className="text-xl font-black tracking-widest py-1 my-1" style={{ color: color, fontFamily: 'Arial, sans-serif' }}>{text.middle2}</p>}
            {includeDate && <p className="text-md font-bold tracking-widest my-1" style={{ fontFamily: 'Courier New, monospace' }}>{currentDate}</p>}
            {text.bottom && <p className="text-sm font-bold uppercase tracking-widest mt-4" style={{ fontFamily: 'Arial, sans-serif' }}>{text.bottom}</p>}
          </div>
        </div>
      );
    }

    return null;
  };

  // --- FORM RENDERER ---
  const renderFormStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-2xl font-black text-slate-800 mb-4">Choose Stamp Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STAMP_TYPES.map(type => (
                <button 
                  key={type} 
                  onClick={() => setData({...data, type: type})} 
                  className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${data.type === type ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-md transform scale-[1.02]' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">Stamp Content</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">{data.type}</span>
            </div>
            
            <div><label className="text-xs font-bold text-slate-500 uppercase">Top Heading (Company / Dept Name)</label><input type="text" value={data.text.top} onChange={e => handleText('top', e.target.value)} className="w-full p-3 border rounded-xl font-black bg-slate-50 mt-1 outline-none focus:border-blue-500 uppercase" placeholder="e.g. ABC ENTERPRISES" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Middle Text 1 (GSTIN / Reg No / Address)</label><input type="text" value={data.text.middle1} onChange={e => handleText('middle1', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500 uppercase" placeholder="e.g. GSTIN: 07AABCU1234" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Middle Text 2 (RECEIVED / PAID / VERIFIED)</label><input type="text" value={data.text.middle2} onChange={e => handleText('middle2', e.target.value)} className="w-full p-3 border rounded-xl font-black text-lg bg-slate-50 mt-1 outline-none focus:border-blue-500 uppercase" placeholder="e.g. RECEIVED" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Bottom Text (Signatory / City)</label><input type="text" value={data.text.bottom} onChange={e => handleText('bottom', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500 uppercase" placeholder="e.g. AUTHORIZED SIGNATORY" /></div>
            
            <label className="flex items-center gap-3 p-4 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors mt-4">
              <input type="checkbox" checked={data.includeDate} onChange={(e) => setData({...data, includeDate: e.target.checked})} className="w-5 h-5 accent-blue-600" />
              <span className="font-bold text-slate-700">Include Current Date in Stamp</span>
            </label>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">Stamp Shape</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'rectangle', icon: '▭', label: 'Rectangle' },
                  { id: 'round', icon: '◯', label: 'Round Seal' },
                  { id: 'oval', icon: '⬭', label: 'Oval' },
                ].map(s => (
                  <button key={s.id} onClick={() => setData({...data, shape: s.id as Shape})} className={`p-4 rounded-xl border-2 font-black flex flex-col items-center gap-2 transition-all ${data.shape === s.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}>
                    <span className="text-3xl">{s.icon}</span>
                    <span className="text-xs uppercase tracking-widest">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">Ink Color</h3>
              <div className="flex gap-4">
                {['#0f52ba', '#dc2626', '#000000', '#6b21a8', '#059669'].map(c => (
                  <button key={c} onClick={() => setData({...data, color: c as StampColor})} style={{ backgroundColor: c }} className={`w-12 h-12 rounded-full border-4 shadow-md transition-transform ${data.color === c ? 'border-white ring-4 ring-blue-300 scale-110' : 'border-transparent hover:scale-105'}`} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">Border Style</h3>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setData({...data, borderWidth: 2})} className={`p-3 rounded-xl border-2 font-bold transition-all ${data.borderWidth === 2 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Thin</button>
                <button onClick={() => setData({...data, borderWidth: 4})} className={`p-3 rounded-xl border-2 font-bold transition-all ${data.borderWidth === 4 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Standard</button>
                <button onClick={() => setData({...data, borderWidth: 6})} className={`p-3 rounded-xl border-2 font-bold transition-all ${data.borderWidth === 6 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Thick / Double</button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <span className="text-6xl block mb-4">🔏</span>
            <h3 className="text-3xl font-black text-slate-800">Stamp is Ready!</h3>
            <p className="text-slate-500 font-medium">Download as a Transparent PNG to place on digital documents (Invoices, PDFs), or download a Printable PDF for physical rubber stamp making.</p>
            
            <div className="flex flex-col gap-4 mt-8">
              <button onClick={() => exportStamp('png')} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 flex justify-center items-center gap-2">
                {isProcessing ? 'Processing...' : '🖼️ Download Transparent PNG'}
              </button>
              <button onClick={() => exportStamp('pdf')} disabled={isProcessing} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black text-lg py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 flex justify-center items-center gap-2">
                {isProcessing ? 'Processing...' : '📥 Download Printable PDF'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Stamp & Seal Maker</h2>
        <p className="text-slate-500 mt-2 text-lg">Generate Govt & Private digital rubber stamps with transparent backgrounds instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col min-h-[600px]">
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

        {/* RIGHT COLUMN: LIVE TRANSPARENT PREVIEW */}
        <div className="lg:col-span-7 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-slate-100 rounded-3xl border border-slate-200 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[600px] relative">
           <span className="absolute top-4 left-6 bg-white text-slate-800 text-xs font-black px-3 py-1 rounded-full border border-slate-300 z-10 shadow-sm">
              Live Preview (Transparent)
           </span>
           
           {/* Visual preview container */}
           <div className="w-full h-full flex items-center justify-center">
              <div className="transition-all duration-300 transform scale-110 drop-shadow-md opacity-90 hover:opacity-100 hover:scale-125 cursor-pointer">
                 {renderStamp()}
              </div>
           </div>
        </div>

        {/* 🌟 HIDDEN OFF-SCREEN RENDERER FOR HD EXPORT 🌟 */}
        {/* We use inline-block so the container perfectly hugs the stamp without extra white space */}
        <div className="absolute top-[-9999px] left-[-9999px]">
           <div ref={printRef} className="inline-block bg-transparent p-4">
              {renderStamp()}
           </div>
        </div>

      </div>
    </div>
  );
}