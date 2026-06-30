'use client';

import React, { useState } from 'react';
import { 
  Calculator, GraduationCap, Percent, Copy, 
  RefreshCw, Info, CheckCircle2, Award, BookOpen
} from 'lucide-react';

export default function CGPAConverter() {
  const [cgpa, setCgpa] = useState<string>('');
  const [multiplier, setMultiplier] = useState<number>(9.5);
  const [totalMarks, setTotalMarks] = useState<number>(500); // 🔥 NAYA: Total Marks State
  const [isCopied, setIsCopied] = useState(false);

  // --- CALCULATIONS ---
  const numCgpa = parseFloat(cgpa);
  let percentage = 0;
  let estimatedMarks = 0;
  let isValid = false;

  if (!isNaN(numCgpa) && numCgpa > 0 && numCgpa <= 10) {
    percentage = numCgpa * multiplier;
    if (percentage > 100) percentage = 100; // Cap at 100%
    
    // 🔥 NAYA: Marks Calculation
    estimatedMarks = Math.round((percentage / 100) * totalMarks);
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
    setTotalMarks(500);
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
          <p className="text-slate-500 font-medium">Instantly convert your CGPA to Percentage and calculate estimated marks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* --- CALCULATOR CARD --- */}
          <div className="md:col-span-6 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
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

              {/* Total Marks Input (NAYA) */}
              <div>
                <label className="block text-sm font-black uppercase text-slate-500 tracking-widest mb-2">Total Max Marks</label>
                <input 
                  type="number" 
                  min="100" 
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full text-lg font-bold text-slate-800 p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 transition-all"
                />
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
                <p className="text-xs text-slate-400 mt-2 font-medium">Formula: Percentage = CGPA × {multiplier}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button 
                  onClick={handleReset}
                  className="w-full px-4 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> Reset Calculator
                </button>
              </div>

            </div>
          </div>

          {/* --- RESULT CARD --- */}
          <div className="md:col-span-6 flex flex-col gap-6">
            
            {/* Main Result Display (Percentage) */}
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

            {/* Division & Marks Details (Only shows if valid) */}
            {isValid && gradeInfo && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
                
                {/* Grade Box */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-center items-center text-center ${gradeInfo.bg} ${gradeInfo.border}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl bg-white ${gradeInfo.color} shadow-sm mb-2`}>
                    {gradeInfo.grade}
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${gradeInfo.color} opacity-70`}>Division</p>
                  <p className={`text-sm font-black leading-tight ${gradeInfo.color}`}>{gradeInfo.div}</p>
                </div>

                {/* 🔥 NAYA: Estimated Marks Box 🔥 */}
                <div className="p-5 rounded-3xl border bg-orange-50 border-orange-200 flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white text-orange-500 shadow-sm mb-2">
                    <BookOpen size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 opacity-70">Estimated Marks</p>
                  <p className="text-2xl font-black text-orange-600 leading-none mt-1">
                    {estimatedMarks} <span className="text-sm text-orange-400">/ {totalMarks}</span>
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}