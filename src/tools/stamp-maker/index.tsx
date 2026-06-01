'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// --- DATA TYPES ---
type Category = 'proprietorship' | 'partnership' | 'gst' | 'received' | 'professional';
type Layout = 'basic_rect' | 'double_rect' | 'round' | 'oval' | 'dater';
type StampColor = '#0f52ba' | '#dc2626' | '#000000' | '#6b21a8' | '#059669';

interface StampData {
  category: Category;
  layout: Layout;
  color: StampColor;
  borderWidth: number;
  text: {
    top: string;      
    middle1: string;  
    middle2: string;  
    bottom: string;   
  };
}

const FLOW_STEPS = [
  'Select Category', 'Choose Design', 'Edit Text', 'Ink & Border', 'Download'
];

export default function StampMaker() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<StampData>({
    category: 'partnership',
    layout: 'round',
    color: '#0f52ba', 
    borderWidth: 4,
    text: {
      top: 'M/S ABC PARTNERS',
      middle1: '★',
      middle2: 'SEAL',
      bottom: 'AUTHORIZED PARTNER',
    }
  });

  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  const handleText = (field: keyof StampData['text'], value: string) => {
    setData({ ...data, text: { ...data.text, [field]: value.toUpperCase() } });
  };

  // 🌟 SMART DEFAULTS BY CATEGORY 🌟
  const setCategory = (cat: Category) => {
    let newText = { top: '', middle1: '', middle2: '', bottom: '' };
    switch(cat) {
      case 'proprietorship': newText = { top: 'ABC ENTERPRISES', middle1: '', middle2: '', bottom: 'PROPRIETOR' }; break;
      case 'partnership': newText = { top: 'M/S ABC PARTNERS', middle1: '', middle2: '', bottom: 'AUTHORIZED PARTNER' }; break;
      case 'gst': newText = { top: 'XYZ TRADERS', middle1: 'GSTIN: 27AAAAA0000A1Z5', middle2: '', bottom: 'AUTHORIZED SIGNATORY' }; break;
      case 'received': newText = { top: 'XYZ TRADERS', middle1: '', middle2: 'RECEIVED', bottom: 'WITH THANKS' }; break;
      case 'professional': newText = { top: 'DR. JOHN DOE', middle1: 'MBBS, MD', middle2: '', bottom: 'REG NO: 12345' }; break;
    }
    setData({ ...data, category: cat, text: newText });
    setStep(1); // Auto move to layout selection
  };

  // 🌟 EXPORT ENGINE 🌟
  const exportStamp = async (format: 'png' | 'pdf') => {
    if (!printRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 4, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: null // Transparent
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const safeName = data.text.top ? data.text.top.replace(/\s+/g, '_').substring(0, 15) : 'Stamp';

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${safeName}_Stamp.png`;
        link.href = imgData;
        link.click();
      } else {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = 80; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', (pdfWidth - imgWidth)/2, 50, imgWidth, imgHeight);
        pdf.save(`${safeName}_Stamp.pdf`);
      }
    } catch (error) {
      alert("Error generating stamp.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 🌟 LIVE STAMP RENDERER 🌟 ---
  const renderStamp = () => {
    const { layout, color, borderWidth, text } = data;
    const stampStyle = { borderColor: color, color: color };

    if (layout === 'basic_rect' || layout === 'double_rect') {
      const isDouble = layout === 'double_rect';
      return (
        <div className="p-2 inline-block bg-transparent">
          <div 
            className="flex flex-col items-center justify-center p-6 text-center bg-transparent min-w-[350px] max-w-[500px]"
            style={{ ...stampStyle, borderStyle: isDouble ? 'double' : 'solid', borderWidth: isDouble ? `${borderWidth * 2}px` : `${borderWidth}px` }}
          >
            <h2 className="text-2xl font-black uppercase tracking-widest leading-tight mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{text.top}</h2>
            {text.middle1 && <p className="text-md font-bold tracking-wider mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>{text.middle1}</p>}
            {text.middle2 && <p className="text-xl font-black tracking-widest py-1 my-1" style={{ fontFamily: 'Arial, sans-serif' }}>{text.middle2}</p>}
            {text.bottom && <p className="text-sm font-bold uppercase tracking-widest mt-6 pt-2 border-t border-dashed w-3/4" style={{ borderColor: color, fontFamily: 'Arial, sans-serif' }}>{text.bottom}</p>}
          </div>
        </div>
      );
    }

    if (layout === 'dater') {
      return (
        <div className="p-2 inline-block bg-transparent">
          <div className="flex flex-col items-center justify-center p-6 text-center bg-transparent min-w-[350px] border-solid" style={{ ...stampStyle, borderWidth: `${borderWidth}px` }}>
            <h2 className="text-2xl font-black uppercase tracking-widest leading-tight mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>{text.top}</h2>
            <div className="border-y-2 py-2 px-6 mb-4 w-full" style={{ borderColor: color }}>
               <p className="text-2xl font-bold tracking-widest" style={{ fontFamily: 'Courier New, monospace' }}>{currentDate}</p>
            </div>
            {text.middle2 && <p className="text-xl font-black tracking-widest mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>{text.middle2}</p>}
            {text.bottom && <p className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Arial, sans-serif' }}>{text.bottom}</p>}
          </div>
        </div>
      );
    }

    if (layout === 'oval') {
      return (
        <div className="p-2 inline-block bg-transparent">
          <div 
            className="flex flex-col items-center justify-center p-8 text-center bg-transparent min-w-[400px] h-[250px] border-double"
            style={{ ...stampStyle, borderWidth: `${borderWidth * 2}px`, borderRadius: '50% / 50%' }}
          >
            <h2 className="text-2xl font-black uppercase tracking-widest leading-tight mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{text.top}</h2>
            {text.middle1 && <p className="text-md font-bold tracking-wider mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>{text.middle1}</p>}
            {text.middle2 && <p className="text-xl font-black tracking-widest py-1 my-1" style={{ fontFamily: 'Arial, sans-serif' }}>{text.middle2}</p>}
            {text.bottom && <p className="text-sm font-bold uppercase tracking-widest mt-4" style={{ fontFamily: 'Arial, sans-serif' }}>{text.bottom}</p>}
          </div>
        </div>
      );
    }

    if (layout === 'round') {
      const size = 300; const center = size / 2; const radius = 110;
      return (
        <div className="p-2 inline-block bg-transparent relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-transparent">
            <defs>
              <path id="topCurve" d={`M ${center - radius}, ${center} A ${radius},${radius} 0 0,1 ${center + radius},${center}`} />
              <path id="bottomCurve" d={`M ${center - radius}, ${center} A ${radius},${radius} 0 0,0 ${center + radius},${center}`} />
            </defs>
            {/* Double Circle Outer */}
            <circle cx={center} cy={center} r={140} fill="none" stroke={color} strokeWidth={borderWidth * 1.5} />
            <circle cx={center} cy={center} r={132} fill="none" stroke={color} strokeWidth={borderWidth > 3 ? 2 : 0} />
            {/* Inner Circle */}
            <circle cx={center} cy={center} r={80} fill="none" stroke={color} strokeWidth={borderWidth} />

            <text fill={color} fontSize="24" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="1">
              <textPath href="#topCurve" startOffset="50%" textAnchor="middle">{text.top}</textPath>
            </text>
            <text fill={color} fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">
              <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">{text.bottom}</textPath>
            </text>

            <text x={center} y={center - 10} fill={color} fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif" textAnchor="middle">{text.middle1}</text>
            <text x={center} y={center + 15} fill={color} fontSize="22" fontWeight="black" fontFamily="Arial, sans-serif" textAnchor="middle">{text.middle2}</text>
          </svg>
        </div>
      );
    }
    return null;
  };

  // --- VISUAL ICONS FOR STEP 1 (THE 5 DESIGNS) ---
  const renderDesignIcon = (layout: Layout) => {
    switch(layout) {
      case 'basic_rect': return <div className="w-16 h-10 border-2 border-blue-600 rounded-sm flex items-center justify-center bg-white"><div className="w-10 h-1 bg-blue-400"></div></div>;
      case 'double_rect': return <div className="w-16 h-10 border-4 border-double border-blue-600 rounded-sm flex items-center justify-center bg-white"><div className="w-10 h-1 bg-blue-600"></div></div>;
      case 'round': return <div className="w-14 h-14 border-[3px] border-blue-600 rounded-full flex items-center justify-center bg-white"><div className="w-8 h-8 border border-blue-400 rounded-full"></div></div>;
      case 'oval': return <div className="w-16 h-10 border-[3px] border-blue-600 rounded-[50%] flex items-center justify-center bg-white"><div className="w-10 h-4 border border-blue-400 rounded-[50%]"></div></div>;
      case 'dater': return <div className="w-16 h-12 border-2 border-blue-600 rounded-sm flex flex-col items-center justify-center gap-1 bg-white p-1"><div className="w-full h-2 border-y border-blue-600 flex items-center justify-center"><span className="text-[4px] font-black text-blue-600">12 AUG 2024</span></div></div>;
    }
  }

  // --- FORM RENDERER ---
  const renderFormStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-2xl font-black text-slate-800 mb-4">1. What kind of stamp do you need?</h3>
            <div className="flex flex-col gap-3">
              {[
                {id: 'partnership', name: 'Partnership / Firm Stamp', icon: '🤝'},
                {id: 'proprietorship', name: 'Proprietorship Stamp', icon: '👤'},
                {id: 'gst', name: 'GST / Company Stamp', icon: '🏢'},
                {id: 'received', name: 'Received / Paid / Dispatch', icon: '✅'},
                {id: 'professional', name: 'Advocate / CA / Doctor', icon: '🎓'}
              ].map(c => (
                <button key={c.id} onClick={() => setCategory(c.id as Category)} className="flex items-center gap-4 p-4 rounded-xl border-2 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="font-bold text-lg text-slate-800">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-4">2. Choose Stamp Design (5 Variations)</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {id: 'round', name: 'Round Seal'}, {id: 'basic_rect', name: 'Basic Rectangle'}, 
                {id: 'double_rect', name: 'Premium Double'}, {id: 'oval', name: 'Govt Oval Seal'}, 
                {id: 'dater', name: 'Dater / Bank Stamp'}
              ].map(l => (
                <button 
                  key={l.id} onClick={() => setData({...data, layout: l.id as Layout})}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all hover:-translate-y-1 ${data.layout === l.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'}`}
                >
                  {renderDesignIcon(l.id as Layout)}
                  <span className="font-bold text-xs uppercase tracking-widest text-slate-700">{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">3. Edit Stamp Text</h3>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Top Heading (Name)</label><input type="text" value={data.text.top} onChange={e => handleText('top', e.target.value)} className="w-full p-3 border rounded-xl font-black bg-slate-50 mt-1 outline-none focus:border-blue-500 uppercase" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Middle Text 1 (Reg No / Symbol)</label><input type="text" value={data.text.middle1} onChange={e => handleText('middle1', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500 uppercase" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Middle Text 2 (Status / Label)</label><input type="text" value={data.text.middle2} onChange={e => handleText('middle2', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500 uppercase" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Bottom Text (Signatory / City)</label><input type="text" value={data.text.bottom} onChange={e => handleText('bottom', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500 uppercase" /></div>
            
            {data.layout === 'dater' && (
               <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mt-4">
                 <p className="text-xs font-bold text-emerald-800">📅 Dater Stamp Active: Today's date ({currentDate}) will be printed in the center automatically.</p>
               </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">Ink Color</h3>
              <div className="flex gap-4">
                {['#0f52ba', '#dc2626', '#000000', '#6b21a8', '#059669'].map(c => (
                  <button key={c} onClick={() => setData({...data, color: c as StampColor})} style={{ backgroundColor: c }} className={`w-12 h-12 rounded-full border-4 shadow-md transition-transform ${data.color === c ? 'border-white ring-4 ring-blue-300 scale-110' : 'border-transparent hover:scale-105'}`} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">Border Thickness</h3>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setData({...data, borderWidth: 2})} className={`p-3 rounded-xl border-2 font-bold transition-all ${data.borderWidth === 2 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Thin</button>
                <button onClick={() => setData({...data, borderWidth: 4})} className={`p-3 rounded-xl border-2 font-bold transition-all ${data.borderWidth === 4 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Standard</button>
                <button onClick={() => setData({...data, borderWidth: 6})} className={`p-3 rounded-xl border-2 font-bold transition-all ${data.borderWidth === 6 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Thick</button>
              </div>
            </div>
          </div>
        );
      case 4:
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
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Digital Stamp Maker</h2>
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
            <button onClick={() => setStep(Math.min(FLOW_STEPS.length - 1, step + 1))} disabled={step === FLOW_STEPS.length - 1 || step === 0} className={`px-8 py-3 rounded-xl font-bold shadow-md transition-transform ${step === FLOW_STEPS.length - 1 || step === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1'}`}>{step === 0 ? 'Select Category' : 'Next Step'}</button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE TRANSPARENT PREVIEW */}
        <div className="lg:col-span-7 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-slate-100 rounded-3xl border border-slate-200 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[600px] relative">
           <span className="absolute top-4 left-6 bg-white text-slate-800 text-xs font-black px-3 py-1 rounded-full border border-slate-300 z-10 shadow-sm">
              Live Preview (Transparent)
           </span>
           
           <div className="w-full h-full flex items-center justify-center">
              <div className="transition-all duration-300 transform scale-110 drop-shadow-md opacity-90 hover:opacity-100 hover:scale-125 cursor-pointer">
                 {step > 0 ? renderStamp() : <div className="text-slate-400 font-bold">Select a Category to view Stamp</div>}
              </div>
           </div>
        </div>

        {/* 🌟 HIDDEN OFF-SCREEN RENDERER FOR HD EXPORT 🌟 */}
        <div className="absolute top-[-9999px] left-[-9999px]">
           <div ref={printRef} className="inline-block bg-transparent p-4">
              {renderStamp()}
           </div>
        </div>

      </div>
    </div>
  );
}