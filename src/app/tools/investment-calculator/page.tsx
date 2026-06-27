'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, Printer, Calculator, TrendingUp, Landmark, 
  Wallet, Coins, PieChart, Activity, Briefcase, PiggyBank
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function InvestmentCalculatorSuite() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<'sip' | 'lumpsum' | 'fd' | 'rd' | 'ppf' | 'cagr' | 'swp'>('sip');

  // --- SHARED INPUT STATES ---
  const [investment, setInvestment] = useState(5000); // SIP/RD/Monthly or Lumpsum/FD
  const [rate, setRate] = useState(12); // Expected Return %
  const [tenure, setTenure] = useState(10); // Years
  
  // Specific States
  const [finalValue, setFinalValue] = useState(15000); // For CAGR
  const [withdrawal, setWithdrawal] = useState(10000); // For SWP

  // --- HELPER FORMATTER ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // --- CORE CALCULATIONS ENGINE ---
  let totalInvested = 0;
  let maturityValue = 0;
  let totalReturns = 0;
  let specialMessage = '';

  const rMonthly = rate / 12 / 100;
  const months = tenure * 12;

  switch (activeTab) {
    case 'sip':
    case 'rd': // RD formula is similar to SIP (Monthly investment)
      // M = P * (((1 + i)^n - 1) / i) * (1 + i)
      if (rMonthly > 0) {
        maturityValue = investment * ((Math.pow(1 + rMonthly, months) - 1) / rMonthly) * (1 + rMonthly);
      } else {
        maturityValue = investment * months;
      }
      totalInvested = investment * months;
      totalReturns = maturityValue - totalInvested;
      break;

    case 'lumpsum':
    case 'fd':
      // A = P(1 + r/100)^t (Yearly Compounding for Lumpsum, FD usually quarterly but keeping standard here)
      maturityValue = investment * Math.pow(1 + rate / 100, tenure);
      totalInvested = investment;
      totalReturns = maturityValue - totalInvested;
      break;

    case 'ppf':
      // PPF is yearly investment, 15 years minimum, ~7.1% fixed
      const rYearly = rate / 100;
      if (rYearly > 0) {
        // A = P * (((1 + r)^t - 1) / r)
        maturityValue = investment * ((Math.pow(1 + rYearly, tenure) - 1) / rYearly);
      } else {
        maturityValue = investment * tenure;
      }
      totalInvested = investment * tenure;
      totalReturns = maturityValue - totalInvested;
      specialMessage = tenure < 15 ? '* Note: Minimum lock-in period for PPF is 15 years.' : '';
      break;

    case 'cagr':
      // CAGR = (EV/BV)^(1/n) - 1
      const cagr = (Math.pow(finalValue / investment, 1 / tenure) - 1) * 100;
      totalInvested = investment;
      maturityValue = finalValue;
      totalReturns = cagr; // Using this variable to store % for UI
      break;

    case 'swp':
      // Systematic Withdrawal Plan
      let balance = investment;
      let withdrawn = 0;
      for(let m = 1; m <= months; m++) {
        balance += balance * rMonthly; // add monthly interest
        balance -= withdrawal;         // deduct withdrawal
        withdrawn += withdrawal;
        if(balance < 0) { balance = 0; break; }
      }
      totalInvested = investment;
      maturityValue = balance; // Final Balance Left
      totalReturns = withdrawn; // Total amount withdrawn
      break;
  }

  // --- CHART MATH ---
  const investedPercent = activeTab !== 'cagr' && activeTab !== 'swp' 
    ? (totalInvested / maturityValue) * 100 || 0 
    : 0;
  const returnsPercent = activeTab !== 'cagr' && activeTab !== 'swp' 
    ? (totalReturns / maturityValue) * 100 || 0 
    : 0;

  // --- PDF EXPORT ---
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Investment_Report_${activeTab.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  // --- NATIVE SVG DONUT CHART ENGINE ---
  const DonutChart = () => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const investedDashoffset = circumference - (investedPercent / 100) * circumference;

    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Returns Circle (Background/Purple) */}
          <circle cx="96" cy="96" r={radius} fill="transparent" stroke="#8b5cf6" strokeWidth="24" />
          {/* Invested Circle (Foreground/Blue) */}
          <circle 
            cx="96" cy="96" r={radius} fill="transparent" stroke="#3b82f6" strokeWidth="24"
            strokeDasharray={circumference}
            strokeDashoffset={investedDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <PieChart className="text-slate-300 w-8 h-8 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wealth</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 print:block">
        
        {/* --- CONTROLS SIDEBAR --- */}
        <div className="xl:w-[450px] shrink-0 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar print:hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Activity size={24} /></div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Wealth Engine</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Investment Calculators</p>
            </div>
          </div>

          {/* TAB NAVIGATION (GRID) */}
          <div className="grid grid-cols-3 gap-2 mb-6 border-b border-slate-100 pb-6">
            <button onClick={() => { setActiveTab('sip'); setInvestment(5000); setRate(12); setTenure(10); }} className={`py-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-1 transition-all ${activeTab === 'sip' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'text-slate-500 border-slate-200'}`}><TrendingUp size={16}/> SIP</button>
            <button onClick={() => { setActiveTab('lumpsum'); setInvestment(100000); setRate(12); setTenure(10); }} className={`py-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-1 transition-all ${activeTab === 'lumpsum' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'text-slate-500 border-slate-200'}`}><Wallet size={16}/> Lumpsum</button>
            <button onClick={() => { setActiveTab('fd'); setInvestment(100000); setRate(7); setTenure(5); }} className={`py-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-1 transition-all ${activeTab === 'fd' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'text-slate-500 border-slate-200'}`}><Landmark size={16}/> FD</button>
            <button onClick={() => { setActiveTab('rd'); setInvestment(5000); setRate(6.5); setTenure(5); }} className={`py-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-1 transition-all ${activeTab === 'rd' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'text-slate-500 border-slate-200'}`}><Coins size={16}/> RD</button>
            <button onClick={() => { setActiveTab('ppf'); setInvestment(150000); setRate(7.1); setTenure(15); }} className={`py-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-1 transition-all ${activeTab === 'ppf' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'text-slate-500 border-slate-200'}`}><PiggyBank size={16}/> PPF</button>
            <button onClick={() => { setActiveTab('cagr'); setInvestment(100000); setFinalValue(200000); setTenure(5); }} className={`py-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-1 transition-all ${activeTab === 'cagr' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'text-slate-500 border-slate-200'}`}><Activity size={16}/> CAGR</button>
            <button onClick={() => { setActiveTab('swp'); setInvestment(1000000); setWithdrawal(10000); setRate(10); setTenure(5); }} className={`col-span-3 py-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-1 transition-all ${activeTab === 'swp' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'text-slate-500 border-slate-200'}`}><Briefcase size={16}/> SWP (Systematic Withdrawal Plan)</button>
          </div>

          {/* DYNAMIC INPUT FORMS */}
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Amount Input */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>
                  {activeTab === 'sip' || activeTab === 'rd' ? 'Monthly Investment' : 
                   activeTab === 'ppf' ? 'Yearly Investment' : 
                   activeTab === 'cagr' ? 'Initial Investment' : 'Total Investment'}
                </span>
                <span className="text-purple-600">{formatCurrency(investment)}</span>
              </div>
              <input type="range" min="500" max={activeTab === 'lumpsum' || activeTab === 'fd' || activeTab === 'swp' ? 10000000 : 150000} step="500" value={investment} onChange={(e) => setInvestment(Number(e.target.value))} className="w-full accent-purple-600" />
              <input type="number" value={investment || ''} onChange={(e) => setInvestment(Number(e.target.value))} className="mt-2 w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 font-bold text-slate-700 text-sm" />
            </div>

            {/* Special Inputs for CAGR & SWP */}
            {activeTab === 'cagr' && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Final Value (Maturity)</span><span className="text-purple-600">{formatCurrency(finalValue)}</span></div>
                <input type="number" value={finalValue || ''} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 font-bold text-slate-700 text-sm" />
              </div>
            )}
            
            {activeTab === 'swp' && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Monthly Withdrawal</span><span className="text-purple-600">{formatCurrency(withdrawal)}</span></div>
                <input type="number" value={withdrawal || ''} onChange={(e) => setWithdrawal(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 font-bold text-slate-700 text-sm" />
              </div>
            )}

            {/* Rate & Tenure */}
            <div className="grid grid-cols-2 gap-4">
              {activeTab !== 'cagr' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">
                    {activeTab === 'fd' || activeTab === 'rd' || activeTab === 'ppf' ? 'Interest Rate (%)' : 'Expected Return (%)'}
                  </label>
                  <input type="number" step="0.1" value={rate || ''} onChange={(e) => setRate(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 font-bold text-slate-700 text-sm" />
                </div>
              )}
              <div className={activeTab === 'cagr' ? 'col-span-2' : ''}>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Time Period (Years)</label>
                <input type="number" min="1" max="50" value={tenure || ''} onChange={(e) => setTenure(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 font-bold text-slate-700 text-sm" />
              </div>
            </div>

          </div>
          
          <button onClick={downloadPDF} disabled={isDownloading} className="w-full mt-8 bg-slate-900 hover:bg-black transition-colors text-white py-4 rounded-xl font-black flex justify-center items-center gap-2 shadow-lg">
            {isDownloading ? <span className="animate-pulse">EXPORTING PDF...</span> : <><Download size={18}/> EXPORT REPORT PDF</>}
          </button>
        </div>

        {/* --- LIVE PREVIEW DASHBOARD --- */}
        <div className="flex-1 flex justify-center print:block">
          
          <div ref={previewRef} className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl print:shadow-none border border-slate-200 print:border-none p-8 md:p-12">
            
            {/* HEADER */}
            <header className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                  {activeTab} Calculator
                </h1>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Wealth Planning Report</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Calculated On</p>
                <p className="text-sm font-black text-slate-800">{new Date().toLocaleDateString()}</p>
              </div>
            </header>

            {/* ERROR / INFO ALERTS */}
            {specialMessage && (
              <div className="mb-6 p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold uppercase tracking-widest">
                {specialMessage}
              </div>
            )}

            {/* DYNAMIC RESULT CARDS */}
            {activeTab === 'cagr' ? (
              <div className="animate-in fade-in zoom-in duration-500 text-center py-10">
                <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <TrendingUp size={48} />
                </div>
                <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-2">Compounded Annual Growth Rate</h2>
                <h3 className="text-6xl font-black text-purple-600 mb-8">{totalReturns.toFixed(2)}%</h3>
                
                <div className="max-w-md mx-auto grid grid-cols-2 gap-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Initial Value</p><p className="text-lg font-black text-slate-800">{formatCurrency(investment)}</p></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Final Value</p><p className="text-lg font-black text-slate-800">{formatCurrency(maturityValue)}</p></div>
                  <div className="col-span-2 border-t pt-2"><p className="text-xs font-bold text-slate-400 uppercase">Duration</p><p className="text-lg font-black text-slate-800">{tenure} Years</p></div>
                </div>
              </div>
            ) : activeTab === 'swp' ? (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                    <p className="text-xs font-black uppercase text-slate-500 mb-1">Total Investment</p>
                    <p className="text-2xl font-black text-slate-800">{formatCurrency(totalInvested)}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
                    <p className="text-xs font-black uppercase text-green-600 mb-1">Total Withdrawn</p>
                    <p className="text-2xl font-black text-green-700">{formatCurrency(totalReturns)}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-6 rounded-2xl">
                    <p className="text-xs font-black uppercase text-purple-600 mb-1">Final Balance Left</p>
                    <p className="text-2xl font-black text-purple-700">{formatCurrency(maturityValue)}</p>
                  </div>
                </div>
                <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl text-center">
                  <p className="text-slate-600 font-medium">By withdrawing <strong className="text-slate-900">{formatCurrency(withdrawal)}</strong> every month for <strong className="text-slate-900">{tenure} years</strong> at an expected return of <strong className="text-slate-900">{rate}%</strong>, you will withdraw a total of <strong className="text-green-600">{formatCurrency(totalReturns)}</strong> and still have <strong className="text-purple-600">{formatCurrency(maturityValue)}</strong> left in your portfolio.</p>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                
                {/* TOP SUMMARY METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                    <p className="text-xs font-black uppercase text-slate-500 mb-1">Invested Amount</p>
                    <p className="text-2xl font-black text-slate-800">{formatCurrency(totalInvested)}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl">
                    <p className="text-xs font-black uppercase text-purple-500 mb-1">Est. Returns</p>
                    <p className="text-2xl font-black text-purple-700">{formatCurrency(totalReturns)}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 p-6 rounded-2xl relative overflow-hidden">
                    <p className="text-xs font-black uppercase text-green-600 mb-1 relative z-10">Total Value</p>
                    <p className="text-3xl font-black text-green-900 relative z-10">{formatCurrency(maturityValue)}</p>
                  </div>
                </div>

                {/* BREAKDOWN & VISUALIZATION (DONUT CHART) */}
                <div className="flex flex-col md:flex-row gap-10 items-center mb-12">
                  <div className="flex-1 w-full space-y-4">
                    <h3 className="text-lg font-black text-slate-800 border-b pb-2">Wealth Breakdown</h3>
                    <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Total Investment:</span> <span className="font-black text-blue-600">{formatCurrency(totalInvested)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Estimated Returns:</span> <span className="font-black text-purple-600">{formatCurrency(totalReturns)}</span></div>
                    <div className="flex justify-between items-center text-base pt-3 border-t-2 border-slate-800"><span className="font-black uppercase text-slate-800">Total Expected Value:</span> <span className="font-black text-xl text-green-600">{formatCurrency(maturityValue)}</span></div>
                  </div>

                  {/* PROFESSIONAL DONUT CHART */}
                  <div className="w-full md:w-auto flex flex-col items-center">
                     <DonutChart />
                     <div className="flex flex-col gap-2 mt-4 w-full">
                        <div className="flex items-center justify-between text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Invested</span>
                          <span className="text-blue-700">{investedPercent.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-sm"></div> Returns</span>
                          <span className="text-purple-700">{returnsPercent.toFixed(1)}%</span>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-500 font-medium text-center">
                  * Mutual fund investments are subject to market risks. The calculations are based on assumed expected returns and are not guaranteed. For FD/RD, rates are assumed to be compounded according to standard banking logic.
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}