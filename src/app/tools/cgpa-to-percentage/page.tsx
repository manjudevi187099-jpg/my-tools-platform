'use client';

import React, { useState } from 'react';
import { 
  Calculator, GraduationCap, Percent, Copy, 
  RefreshCw, Info, CheckCircle2, Award
} from 'lucide-react';

export default function CGPAConverter() {
  const [cgpa, setCgpa] = useState<string>('');
  const [multiplier, setMultiplier] = useState<number>(9.5);
  const [isCopied, setIsCopied] = useState(false);

  // --- CALCULATIONS ---
  const numCgpa = parseFloat(cgpa);
  let percentage = 0;
  let isValid = false;

  if (!isNaN(numCgpa) && numCgpa > 0 && numCgpa <= 10) {
    percentage = numCgpa * multiplier;
    if (percentage > 100) percentage = 100; // Cap at 100%
    isValid = true;
  }

  // --- GRADE & DIVISION LOGIC ---
  const getGradeInfo = (pct: number) => {
    if (pct >= 80) return { grade: 'A+', div: 'First Class with Distinction', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (pct >= 60) return { grade: 'A', div: 'First Class', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (pct >= 50) return { grade: 'B', div: 'Second Class', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (pct >= 40) return { grade: 'C', div: 'Pass Class', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { grade: 'F', div: 'Fail', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const gradeInfo = isValid ? getGradeInfo(percentage) : null;

  // --- HANDLERS ---
  const handleCopy = () => {
    if (isValid) {
      navigator.clipboard.writeText(`${percentage.toFixed(2)}%`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setCgpa('');
    setMultiplier(9.5);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4 shadow-sm">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">CGPA to Percentage Converter</h1>
          <p className="text-slate-500 font-medium">Instantly convert your CGPA to Percentage based on your University formula.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* --- CALCULATOR CARD --- */}
          <div className="md:col-span-7 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 text-indigo-50 opacity-50 pointer-events-none">
              <Percent size={250} />
            </div>

            <div className="relative z-10 space-y-6">
              
              {/* CGPA Input */}
              <div>
                <label className="block text-sm font-black uppercase text-slate-500 tracking-widest mb-2">Enter Your CGPA</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0" 
                    max="10" 
                    step="0.01"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 8.5"
                    className="w-full text-4xl font-black text-slate-800 p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  />
                  {isValid && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={28} />}
                </div>
                {numCgpa > 10 && <p className="text-red-500 text-xs font-bold mt-2 animate-pulse">CGPA cannot be greater than 10.0</p>}
              </div>

              {/* Multiplier / Formula Select */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                  <Info size={14}/> Select University Formula / Multiplier
                </label>
                <select 
                  value={multiplier} 
                  onChange={(e) => setMultiplier(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 font-semibold text-slate-700 bg-white outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value={9.5}>CBSE / Standard Universities (x 9.5)</option>
                  <option value={10}>AKTU / VTU / Engineering (x 10)</option>
                  <option value={8.8}>Custom University (x 8.8)</option>
                  <option value={9.0}>Custom University (x 9.0)</option>
                </select>
                <p className="text-xs text-slate-400 mt-2 font-medium">Formula Applied: Percentage = CGPA × {multiplier}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={18} /> Reset
                </button>
              </div>

            </div>
          </div>

          {/* --- RESULT CARD --- */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Main Result Display */}
            <div className={`p-8 rounded-3xl border-2 shadow-lg flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 ${isValid ? 'bg-indigo-600 border-indigo-700 shadow-indigo-200' : 'bg-white border-slate-200'}`}>
              {!isValid ? (
                <div className="text-slate-400">
                  <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold text-lg">Enter a valid CGPA<br/>to see results</p>
                </div>
              ) : (
                <div className="text-white animate-in zoom-in duration-300">
                  <p className="text-indigo-200 font-bold uppercase tracking-widest text-sm mb-2">Equivalent Percentage</p>
                  <h2 className="text-7xl font-black mb-2">{percentage.toFixed(2)}<span className="text-4xl text-indigo-300">%</span></h2>
                  
                  <button 
                    onClick={handleCopy}
                    className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm flex items-center gap-2 mx-auto transition-colors backdrop-blur-sm"
                  >
                    {isCopied ? <><CheckCircle2 size={16}/> Copied!</> : <><Copy size={16}/> Copy Percentage</>}
                  </button>
                </div>
              )}
            </div>

            {/* Division & Grade Details (Only shows if valid) */}
            {isValid && gradeInfo && (
              <div className={`p-6 rounded-3xl border animate-in slide-in-from-bottom-4 ${gradeInfo.bg} ${gradeInfo.border}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl bg-white ${gradeInfo.color} shadow-sm`}>
                    {gradeInfo.grade}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${gradeInfo.color} opacity-70`}>Estimated Division</p>
                    <p className={`text-lg font-black ${gradeInfo.color}`}>{gradeInfo.div}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* --- SEO FRIENDLY CONTENT SECTION --- */}
        <div className="mt-16 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Award className="text-indigo-600"/> How is CGPA converted to Percentage?
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-slate-600 leading-relaxed">
            <div>
              <p className="mb-4">The Cumulative Grade Point Average (CGPA) is an educational grading system used by schools and colleges to measure overall academic performance. To convert this into a percentage, universities use a specific multiplier.</p>
              <h4 className="font-bold text-slate-900 mb-2">Standard Formula (CBSE)</h4>
              <div className="bg-indigo-50 p-4 rounded-xl text-indigo-900 font-mono font-bold text-sm mb-4">
                Percentage (%) = CGPA × 9.5
              </div>
              <p className="text-sm">Example: If your CGPA is 8.0, your percentage will be 8.0 × 9.5 = 76.0%.</p>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 mb-2">Engineering Universities (AKTU / VTU)</h4>
               <p className="mb-4">Many technical universities simply multiply the CGPA by 10. For instance, a 7.5 CGPA becomes 75%.</p>
               <h4 className="font-bold text-slate-900 mb-2">Why 9.5?</h4>
               <p className="text-sm">The 9.5 multiplier is statistically derived by educational boards like CBSE based on the average marks scored by students in the 91-100 range, ensuring a fair conversion for higher-performing students.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}