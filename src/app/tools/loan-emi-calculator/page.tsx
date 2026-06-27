'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, Printer, Calculator, Home as HomeIcon, Car, 
  Briefcase, GraduationCap, CheckCircle, PieChart, Landmark,
  IndianRupee, UserCheck
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function LoanCalculatorSuite() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<'emi' | 'home' | 'eligibility'>('emi');
  const [loanCategory, setLoanCategory] = useState('Personal Loan'); 

  // --- STANDARD EMI STATE ---
  const [amount, setAmount] = useState(500000);
  const [interest, setInterest] = useState(10.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [processingFee, setProcessingFee] = useState(1.5); 

  // --- HOME LOAN SPECIFIC STATE ---
  const [propertyCost, setPropertyCost] = useState(5000000);
  const [downPayment, setDownPayment] = useState(1000000);
  const [stampDuty, setStampDuty] = useState(5); 
  const [registration, setRegistration] = useState(1); 

  // --- ELIGIBILITY STATE ---
  const [monthlyIncome, setMonthlyIncome] = useState(75000);
  const [existingEmi, setExistingEmi] = useState(15000);
  const [age, setAge] = useState(30);

  // --- HELPER FORMATTER ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // --- CORE EMI MATH ---
  const calculateEMI = (p: number, rAnnual: number, tYears: number) => {
    if (p <= 0 || tYears <= 0) return 0;
    if (rAnnual === 0) return p / (tYears * 12);
    const r = rAnnual / 12 / 100;
    const n = tYears * 12;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  // --- CALCULATIONS FOR STANDARD EMI ---
  const emi = calculateEMI(amount, interest, tenureYears);
  const totalPayment = emi * tenureYears * 12;
  const totalInterest = totalPayment - amount;
  const feeAmount = (amount * processingFee) / 100;
  
  const principalPercent = (amount / totalPayment) * 100 || 0;
  const interestPercent = (totalInterest / totalPayment) * 100 || 0;

  // --- CALCULATIONS FOR HOME LOAN ---
  const stampDutyAmount = (propertyCost * stampDuty) / 100;
  const registrationAmount = (propertyCost * registration) / 100;
  const actualHomeLoan = propertyCost - downPayment;
  const totalHomeCost = propertyCost + stampDutyAmount + registrationAmount;
  const homeEmi = calculateEMI(actualHomeLoan, interest, tenureYears);
  const homeTotalPayment = homeEmi * tenureYears * 12;
  const homeTotalInterest = homeTotalPayment - actualHomeLoan;

  const homePrincipalPercent = (actualHomeLoan / homeTotalPayment) * 100 || 0;
  const homeInterestPercent = (homeTotalInterest / homeTotalPayment) * 100 || 0;

  // --- CALCULATIONS FOR ELIGIBILITY ---
  const maxAffordableEmi = (monthlyIncome * 0.5) - existingEmi;
  let eligibleLoanAmount = 0;
  if (maxAffordableEmi > 0 && interest > 0 && tenureYears > 0) {
    const r = interest / 12 / 100;
    const n = tenureYears * 12;
    eligibleLoanAmount = maxAffordableEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  }

  // --- AMORTIZATION GENERATOR ---
  const generateAmortization = (p: number, rAnnual: number, tYears: number, emiVal: number) => {
    let balance = p;
    const r = rAnnual / 12 / 100;
    const schedule = [];
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for (let month = 1; month <= tYears * 12; month++) {
      const interestPayment = balance * r;
      const principalPayment = emiVal - interestPayment;
      balance -= principalPayment;
      yearlyInterest += interestPayment;
      yearlyPrincipal += principalPayment;

      if (month % 12 === 0) {
        schedule.push({
          year: month / 12,
          principalPaid: yearlyPrincipal,
          interestPaid: yearlyInterest,
          balance: balance > 0 ? balance : 0
        });
        yearlyInterest = 0;
        yearlyPrincipal = 0;
      }
    }
    return schedule;
  };

  const currentSchedule = activeTab === 'home' 
    ? generateAmortization(actualHomeLoan, interest, tenureYears, homeEmi)
    : generateAmortization(amount, interest, tenureYears, emi);

  // --- PRESETS FOR STANDARD EMI ---
  const applyPreset = (category: string, defAmt: number, defInt: number, defTenure: number) => {
    setLoanCategory(category);
    setAmount(defAmt);
    setInterest(defInt);
    setTenureYears(defTenure);
  };

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
      pdf.save(`Loan_Report_${activeTab.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  // --- NATIVE SVG DONUT CHART ENGINE ---
  const DonutChart = ({ pPercent, iPercent }: { pPercent: number, iPercent: number }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const principalDashoffset = circumference - (pPercent / 100) * circumference;

    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Interest Circle (Background/Red) */}
          <circle cx="96" cy="96" r={radius} fill="transparent" stroke="#ef4444" strokeWidth="24" />
          {/* Principal Circle (Foreground/Green) */}
          <circle 
            cx="96" cy="96" r={radius} fill="transparent" stroke="#10b981" strokeWidth="24"
            strokeDasharray={circumference}
            strokeDashoffset={principalDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <PieChart className="text-slate-300 w-8 h-8 mb-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pay</span>
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
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Landmark size={24} /></div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Loan Engine</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Master Calculator Suite</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 shadow-inner">
            <button onClick={() => setActiveTab('emi')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${activeTab === 'emi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Calculator size={16}/> Standard</button>
            <button onClick={() => setActiveTab('home')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${activeTab === 'home' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><HomeIcon size={16}/> Home Loan</button>
            <button onClick={() => setActiveTab('eligibility')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${activeTab === 'eligibility' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><UserCheck size={16}/> Eligibility</button>
          </div>

          <div className="space-y-5 animate-in fade-in duration-300">
            
            {activeTab === 'emi' && (
              <>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <button onClick={() => applyPreset('Personal Loan', 500000, 10.5, 5)} className={`p-2 border rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${loanCategory === 'Personal Loan' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'text-slate-500 border-slate-200'}`}><Briefcase size={16}/> Personal</button>
                  <button onClick={() => applyPreset('Car Loan', 800000, 8.5, 5)} className={`p-2 border rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${loanCategory === 'Car Loan' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'text-slate-500 border-slate-200'}`}><Car size={16}/> Auto / Car</button>
                  <button onClick={() => applyPreset('Education Loan', 1500000, 9.5, 10)} className={`p-2 border rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${loanCategory === 'Education Loan' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'text-slate-500 border-slate-200'}`}><GraduationCap size={16}/> Education</button>
                  <button onClick={() => applyPreset('Business Loan', 2000000, 12.0, 3)} className={`p-2 border rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${loanCategory === 'Business Loan' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'text-slate-500 border-slate-200'}`}><Landmark size={16}/> Business</button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Loan Amount</span><span className="text-blue-600">{formatCurrency(amount)}</span></div>
                  <input type="range" min="10000" max="10000000" step="10000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-blue-600" />
                  <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-2 w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Interest Rate (%)</label>
                    <input type="number" step="0.1" value={interest} onChange={(e) => setInterest(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Tenure (Years)</label>
                    <input type="number" min="1" max="30" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Processing Fee (%)</label>
                  <input type="number" step="0.1" value={processingFee} onChange={(e) => setProcessingFee(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 text-sm" />
                </div>
              </>
            )}

            {activeTab === 'home' && (
              <>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-4 text-xs font-bold text-indigo-700 flex items-start gap-2">
                  <HomeIcon size={16} className="shrink-0 mt-0.5"/> 
                  Includes real estate parameters like Stamp Duty, Registration, and Down Payment margin calculations.
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Property Cost</label>
                  <input type="number" value={propertyCost} onChange={(e) => setPropertyCost(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 text-sm" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Down Payment (Your Margin)</span><span className="text-indigo-600">{((downPayment/propertyCost)*100).toFixed(0)}%</span></div>
                  <input type="range" min="0" max={propertyCost} step="50000" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full accent-indigo-600" />
                  <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="mt-2 w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Stamp Duty (%)</label>
                    <input type="number" step="0.1" value={stampDuty} onChange={(e) => setStampDuty(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Registration (%)</label>
                    <input type="number" step="0.1" value={registration} onChange={(e) => setRegistration(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Interest Rate (%)</label>
                    <input type="number" step="0.1" value={interest} onChange={(e) => setInterest(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Tenure (Years)</label>
                    <input type="number" min="1" max="30" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-700 text-sm" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'eligibility' && (
              <>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 text-xs font-bold text-emerald-700 flex items-start gap-2">
                  <UserCheck size={16} className="shrink-0 mt-0.5"/> 
                  Find out how much loan you can get based on FOIR (Fixed Obligation to Income Ratio).
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Net Monthly Income (In-Hand)</label>
                  <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Existing Monthly EMIs (If any)</label>
                  <input type="number" value={existingEmi} onChange={(e) => setExistingEmi(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Expected Interest (%)</label>
                    <input type="number" step="0.1" value={interest} onChange={(e) => setInterest(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Desired Tenure (Yrs)</label>
                    <input type="number" min="1" max="30" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-sm" />
                  </div>
                </div>
              </>
            )}

          </div>
          
          <button onClick={downloadPDF} disabled={isDownloading || activeTab === 'eligibility'} className="w-full mt-8 bg-slate-900 hover:bg-black transition-colors text-white py-4 rounded-xl font-black flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isDownloading ? <span className="animate-pulse">EXPORTING PDF...</span> : <><Download size={18}/> {activeTab === 'eligibility' ? 'PDF NOT APPLICABLE' : 'EXPORT REPORT PDF'}</>}
          </button>
        </div>

        {/* --- LIVE PREVIEW DASHBOARD --- */}
        <div className="flex-1 flex justify-center print:block">
          
          <div ref={previewRef} className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl print:shadow-none border border-slate-200 print:border-none p-8 md:p-12">
            
            {/* HEADER */}
            <header className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeTab === 'emi' ? `${loanCategory} Report` : activeTab === 'home' ? 'Home Loan Estimate' : 'Eligibility Report'}
                </h1>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Dhamaka FinTech Engine</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Generated On</p>
                <p className="text-sm font-black text-slate-800">{new Date().toLocaleDateString()}</p>
              </div>
            </header>

            {/* DYNAMIC RESULT CARDS */}
            {activeTab === 'eligibility' ? (
              <div className="animate-in fade-in zoom-in duration-500 text-center py-10">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-2">Max Eligible Loan Amount</h2>
                <h3 className="text-6xl font-black text-emerald-600 mb-8">{maxAffordableEmi > 0 ? formatCurrency(eligibleLoanAmount) : '₹0'}</h3>
                
                <div className="max-w-md mx-auto grid grid-cols-2 gap-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Max EMI Affordability</p><p className="text-lg font-black text-slate-800">{formatCurrency(maxAffordableEmi)}/mo</p></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">FOIR Applied</p><p className="text-lg font-black text-slate-800">50%</p></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Assumed Interest</p><p className="text-lg font-black text-slate-800">{interest}%</p></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Tenure</p><p className="text-lg font-black text-slate-800">{tenureYears} Years</p></div>
                </div>
                <p className="text-xs text-slate-400 mt-6 italic">Disclaimer: Final eligibility depends on Bank's internal credit policy and CIBIL score.</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                
                {/* TOP SUMMARY METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl relative overflow-hidden">
                    <IndianRupee className="absolute -right-4 -bottom-4 text-blue-100 w-24 h-24 opacity-50" />
                    <p className="text-xs font-black uppercase text-blue-600 mb-1 relative z-10">Monthly EMI</p>
                    <p className="text-3xl font-black text-blue-900 relative z-10">{formatCurrency(activeTab === 'home' ? homeEmi : emi)}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                    <p className="text-xs font-black uppercase text-slate-500 mb-1">Principal Amount</p>
                    <p className="text-2xl font-black text-slate-800">{formatCurrency(activeTab === 'home' ? actualHomeLoan : amount)}</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                    <p className="text-xs font-black uppercase text-red-500 mb-1">Total Interest</p>
                    <p className="text-2xl font-black text-red-700">{formatCurrency(activeTab === 'home' ? homeTotalInterest : totalInterest)}</p>
                  </div>
                </div>

                {/* BREAKDOWN & VISUALIZATION (WITH NEW DONUT CHART) */}
                <div className="flex flex-col md:flex-row gap-10 items-center mb-12">
                  <div className="flex-1 w-full space-y-4">
                    <h3 className="text-lg font-black text-slate-800 border-b pb-2">Payment Breakdown</h3>
                    <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Principal Amount:</span> <span className="font-black text-emerald-600">{formatCurrency(activeTab === 'home' ? actualHomeLoan : amount)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Total Interest:</span> <span className="font-black text-red-500">{formatCurrency(activeTab === 'home' ? homeTotalInterest : totalInterest)}</span></div>
                    {activeTab === 'emi' && <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Processing Fee ({processingFee}%):</span> <span className="font-black">{formatCurrency(feeAmount)}</span></div>}
                    {activeTab === 'home' && (
                      <>
                        <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Property Value:</span> <span className="font-black">{formatCurrency(propertyCost)}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Down Payment:</span> <span className="font-black">{formatCurrency(downPayment)}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Stamp Duty ({stampDuty}%):</span> <span className="font-black">{formatCurrency(stampDutyAmount)}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-500">Registration ({registration}%):</span> <span className="font-black">{formatCurrency(registrationAmount)}</span></div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t"><span className="font-bold text-slate-800">Total Upfront Cash Needed:</span> <span className="font-black text-indigo-600">{formatCurrency(downPayment + stampDutyAmount + registrationAmount)}</span></div>
                      </>
                    )}
                    <div className="flex justify-between items-center text-base pt-3 border-t-2 border-slate-800"><span className="font-black uppercase text-slate-800">Total Payment (P+I):</span> <span className="font-black text-xl">{formatCurrency(activeTab === 'home' ? homeTotalPayment : totalPayment)}</span></div>
                  </div>

                  {/* 🔥 NEW PROFESSIONAL DONUT CHART 🔥 */}
                  <div className="w-full md:w-auto flex flex-col items-center">
                     <DonutChart 
                       pPercent={activeTab === 'home' ? homePrincipalPercent : principalPercent} 
                       iPercent={activeTab === 'home' ? homeInterestPercent : interestPercent} 
                     />
                     <div className="flex flex-col gap-2 mt-4 w-full">
                        <div className="flex items-center justify-between text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Principal</span>
                          <span className="text-emerald-700">{(activeTab === 'home' ? homePrincipalPercent : principalPercent).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Interest</span>
                          <span className="text-red-700">{(activeTab === 'home' ? homeInterestPercent : interestPercent).toFixed(1)}%</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* AMORTIZATION TABLE (Yearly Summary) */}
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={18}/> Amortization Schedule (Yearly)</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-3 font-black text-slate-500 uppercase">Year</th>
                          <th className="p-3 font-black text-slate-500 uppercase">Principal Paid</th>
                          <th className="p-3 font-black text-slate-500 uppercase text-red-500">Interest Paid</th>
                          <th className="p-3 font-black text-slate-500 uppercase text-right">Closing Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentSchedule.map((row) => (
                          <tr key={row.year} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">Year {row.year}</td>
                            <td className="p-3 font-semibold text-emerald-600">{formatCurrency(row.principalPaid)}</td>
                            <td className="p-3 font-semibold text-red-500">{formatCurrency(row.interestPaid)}</td>
                            <td className="p-3 font-black text-slate-800 text-right">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}