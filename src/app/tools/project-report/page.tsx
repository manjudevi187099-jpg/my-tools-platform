'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Printer, FileText, Building2, User, 
  Briefcase, IndianRupee, PieChart, Layers
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// --- SMART TEMPLATES FOR 13+ BUSINESS TYPES ---
const PROJECT_TEMPLATES: Record<string, any> = {
  'Mudra Loan Project': { cost: 500000, margin: 20, description: 'Micro-enterprise setup under Pradhan Mantri Mudra Yojana (PMMY).' },
  'PMEGP Project': { cost: 1500000, margin: 25, description: 'Manufacturing/Service unit under Prime Minister Employment Generation Programme.' },
  'MSME Project': { cost: 2500000, margin: 18, description: 'Small scale enterprise requiring term loan and working capital.' },
  'Startup Project': { cost: 5000000, margin: 30, description: 'Tech-enabled innovative startup project with high scalability.' },
  'Manufacturing Project': { cost: 4000000, margin: 15, description: 'Industrial manufacturing unit setup with machinery and raw materials.' },
  'Service Business': { cost: 800000, margin: 35, description: 'Service-oriented business with low CAPEX and high operating margins.' },
  'Dairy Project': { cost: 1200000, margin: 22, description: 'Commercial dairy farming project with livestock and shedding.' },
  'Poultry Project': { cost: 1000000, margin: 18, description: 'Poultry farming unit (Broiler/Layer) with automation.' },
  'Mobile Shop': { cost: 700000, margin: 12, description: 'Retail outlet for mobile phones, accessories, and repairing services.' },
  'Computer Shop': { cost: 1000000, margin: 15, description: 'IT hardware retail, laptop sales, and networking services.' },
  'Restaurant Project': { cost: 2000000, margin: 25, description: 'Dine-in restaurant and cloud kitchen with interior and kitchen setup.' },
  'Medical Store': { cost: 800000, margin: 20, description: 'Pharmacy retail outlet with valid drug license setup.' },
  'Bank Loan (General)': { cost: 2000000, margin: 20, description: 'General purpose project report for commercial bank funding.' }
};

export default function ProjectReportGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- FORM STATE ---
  const [reportType, setReportType] = useState('Mudra Loan Project');
  
  const [promoter, setPromoter] = useState({
    name: 'Rahul Sharma',
    businessName: 'Sharma Enterprises',
    address: 'Sector 62, Cyber Hub, Gurugram, Haryana',
    constitution: 'Proprietorship',
    experience: '5 Years in related field'
  });

  const [financials, setFinancials] = useState({
    termLoan: 350000,
    workingCapital: 100000,
    ownContribution: 50000,
    projectedSalesYear1: 1200000,
    projectedSalesYear2: 1500000,
    netProfitMargin: 20, // percentage
  });

  // Auto-fill realistic data when project type changes
  useEffect(() => {
    const template = PROJECT_TEMPLATES[reportType];
    const totalCost = template.cost;
    setFinancials({
      termLoan: totalCost * 0.65, // 65% Term Loan
      workingCapital: totalCost * 0.25, // 25% Working Capital
      ownContribution: totalCost * 0.10, // 10% Margin Money
      projectedSalesYear1: totalCost * 1.5,
      projectedSalesYear2: totalCost * 1.8,
      netProfitMargin: template.margin,
    });
  }, [reportType]);

  // --- CALCULATIONS ---
  const totalProjectCost = financials.termLoan + financials.workingCapital + financials.ownContribution;
  const netProfitYear1 = (financials.projectedSalesYear1 * financials.netProfitMargin) / 100;
  const netProfitYear2 = (financials.projectedSalesYear2 * financials.netProfitMargin) / 100;

  // --- HANDLERS ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const handlePromoterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPromoter({ ...promoter, [e.target.name]: e.target.value });
  };

  const handleFinanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFinancials({ ...financials, [e.target.name]: Number(e.target.value) || 0 });
  };

  // --- EXPORT & PRINT ---
  const handlePrint = () => {
    window.print();
  };

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
      pdf.save(`${promoter.businessName.replace(/\s+/g, '_')}_Project_Report.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-800 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 print:block">
        
        {/* --- HR / CONTROLS SIDEBAR --- */}
        <div className="xl:col-span-5 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar print:hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Layers size={24} /></div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Project Report</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bank/Subsidy Formats</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* 1. Report Type Selector */}
            <section className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <label className="text-xs font-black uppercase text-purple-700 block mb-2">Select Project Category</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="w-full text-sm font-bold p-3 rounded-xl border-2 border-purple-200 outline-none focus:border-purple-500 text-purple-900 bg-white"
              >
                {Object.keys(PROJECT_TEMPLATES).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <p className="text-xs text-purple-600 mt-2 font-medium leading-relaxed">
                {PROJECT_TEMPLATES[reportType].description}
              </p>
            </section>

            {/* 2. Promoter Info */}
            <section className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><User size={14}/> Promoter Details</h3>
              <input name="businessName" value={promoter.businessName} onChange={handlePromoterChange} placeholder="Enterprise / Business Name" className="w-full text-sm font-bold p-2.5 rounded-lg border outline-none focus:border-purple-500" />
              <input name="name" value={promoter.name} onChange={handlePromoterChange} placeholder="Applicant / Promoter Name" className="w-full text-sm p-2.5 rounded-lg border outline-none focus:border-purple-500" />
              <input name="address" value={promoter.address} onChange={handlePromoterChange} placeholder="Business Address" className="w-full text-sm p-2.5 rounded-lg border outline-none focus:border-purple-500" />
              <div className="grid grid-cols-2 gap-2">
                <select name="constitution" value={promoter.constitution} onChange={handlePromoterChange} className="w-full text-sm p-2.5 rounded-lg border outline-none focus:border-purple-500 bg-white">
                  <option>Proprietorship</option>
                  <option>Partnership</option>
                  <option>Private Limited</option>
                </select>
                <input name="experience" value={promoter.experience} onChange={handlePromoterChange} placeholder="Experience (e.g. 5 Years)" className="w-full text-sm p-2.5 rounded-lg border outline-none focus:border-purple-500" />
              </div>
            </section>

            {/* 3. Financial Projections (Cost & Means) */}
            <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 border-b pb-2"><IndianRupee size={14}/> Cost of Project & Funding</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fixed Assets / Machinery</label>
                  <input type="number" name="termLoan" value={financials.termLoan} onChange={handleFinanceChange} className="w-full text-sm font-bold text-slate-800 p-2 rounded border focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Working Capital Limit</label>
                  <input type="number" name="workingCapital" value={financials.workingCapital} onChange={handleFinanceChange} className="w-full text-sm font-bold text-slate-800 p-2 rounded border focus:border-purple-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Promoter's Contribution (Margin Money)</label>
                  <input type="number" name="ownContribution" value={financials.ownContribution} onChange={handleFinanceChange} className="w-full text-sm font-bold text-slate-800 p-2 rounded border focus:border-purple-500 outline-none" />
                </div>
              </div>

              <div className="bg-slate-800 p-3 rounded-xl flex justify-between items-center text-white mt-2">
                <span className="text-xs font-bold uppercase">Total Project Cost</span>
                <span className="font-black">{formatCurrency(totalProjectCost)}</span>
              </div>
            </section>

             {/* 4. Profitability Projections */}
             <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 border-b pb-2"><PieChart size={14}/> Profitability Forecast</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Proj. Sales (Year 1)</label>
                  <input type="number" name="projectedSalesYear1" value={financials.projectedSalesYear1} onChange={handleFinanceChange} className="w-full text-sm p-2 rounded border focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Proj. Sales (Year 2)</label>
                  <input type="number" name="projectedSalesYear2" value={financials.projectedSalesYear2} onChange={handleFinanceChange} className="w-full text-sm p-2 rounded border focus:border-purple-500 outline-none" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Net Profit Margin (%)</label>
                    <input type="number" name="netProfitMargin" value={financials.netProfitMargin} onChange={handleFinanceChange} className="w-full text-sm p-2 rounded border focus:border-purple-500 outline-none font-bold text-purple-700" />
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button onClick={downloadPDF} disabled={isDownloading} className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-colors">
              {isDownloading ? <span className="animate-pulse">GENERATING...</span> : <><Download size={18}/> EXPORT PDF</>}
            </button>
            <button onClick={handlePrint} className="bg-slate-800 hover:bg-black text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-colors">
              <Printer size={18}/> PRINT
            </button>
          </div>
        </div>

        {/* --- LIVE A4 PREVIEW CANVAS --- */}
        <div className="xl:col-span-7 flex justify-center overflow-auto pb-10 print:pb-0 print:col-span-12">
          
          <div className="bg-white shadow-2xl print:shadow-none border border-slate-200 print:border-none w-[794px] min-h-[1123px] relative">
            <div ref={previewRef} className="w-full h-full bg-white p-12 flex flex-col font-sans">
              
              {/* Report Header */}
              <header className="border-b-4 border-slate-900 pb-6 mb-8 text-center">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Project Report & CMA Summary</h3>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wide">{promoter.businessName}</h1>
                <p className="text-sm font-semibold text-slate-600 mt-2 bg-slate-100 inline-block px-4 py-1 rounded-full border border-slate-200">
                  Profile: {reportType}
                </p>
              </header>

              {/* SECTION 1: PROMOTER & BUSINESS PROFILE */}
              <div className="mb-8">
                <h4 className="text-sm font-black text-white bg-slate-900 p-2 pl-4 uppercase tracking-wider mb-4 rounded-t-lg">1. Executive Summary & Profile</h4>
                <table className="w-full text-sm border-collapse border border-slate-300">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-3 bg-slate-50 font-bold w-1/3 border-r border-slate-300">Name of Applicant</td>
                      <td className="p-3 font-semibold text-slate-900">{promoter.name}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-3 bg-slate-50 font-bold border-r border-slate-300">Name of Enterprise</td>
                      <td className="p-3 font-semibold text-slate-900">{promoter.businessName}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-3 bg-slate-50 font-bold border-r border-slate-300">Constitution</td>
                      <td className="p-3 font-semibold text-slate-900">{promoter.constitution}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-3 bg-slate-50 font-bold border-r border-slate-300">Proposed Location</td>
                      <td className="p-3 font-semibold text-slate-900">{promoter.address}</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 font-bold border-r border-slate-300">Promoter Experience</td>
                      <td className="p-3 font-semibold text-slate-900">{promoter.experience}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 2: COST OF PROJECT & MEANS OF FINANCE */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Cost of Project */}
                <div>
                  <h4 className="text-sm font-black text-white bg-slate-900 p-2 pl-4 uppercase tracking-wider mb-4 rounded-t-lg">2. Cost of Project</h4>
                  <table className="w-full text-sm border-collapse border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr><th className="p-2 text-left">Particulars</th><th className="p-2 text-right">Amount (₹)</th></tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 text-slate-700">Machinery & Equipment</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(financials.termLoan)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 text-slate-700">Working Capital Req.</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(financials.workingCapital)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 text-slate-700">Pre-operative Expenses</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(financials.ownContribution)}</td>
                      </tr>
                      <tr className="bg-slate-50 border-t-2 border-slate-800">
                        <td className="p-2 font-black text-slate-900">Total Cost</td>
                        <td className="p-2 text-right font-black text-slate-900">{formatCurrency(totalProjectCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Means of Finance */}
                <div>
                  <h4 className="text-sm font-black text-white bg-slate-900 p-2 pl-4 uppercase tracking-wider mb-4 rounded-t-lg">3. Means of Finance</h4>
                  <table className="w-full text-sm border-collapse border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr><th className="p-2 text-left">Particulars</th><th className="p-2 text-right">Amount (₹)</th></tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 text-slate-700">Bank Term Loan</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(financials.termLoan)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 text-slate-700">Bank Cash Credit (WC)</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(financials.workingCapital)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 text-slate-700">Promoter's Contribution</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(financials.ownContribution)}</td>
                      </tr>
                      <tr className="bg-slate-50 border-t-2 border-slate-800">
                        <td className="p-2 font-black text-slate-900">Total Finance</td>
                        <td className="p-2 text-right font-black text-slate-900">{formatCurrency(totalProjectCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: PROFITABILITY PROJECTIONS */}
              <div className="mb-10 flex-1">
                <h4 className="text-sm font-black text-white bg-slate-900 p-2 pl-4 uppercase tracking-wider mb-4 rounded-t-lg">4. Financial Projections & Profitability</h4>
                <table className="w-full text-sm border-collapse border border-slate-300">
                  <thead className="bg-slate-100 border-b-2 border-slate-800">
                    <tr>
                      <th className="p-3 text-left border-r border-slate-300">Particulars</th>
                      <th className="p-3 text-right border-r border-slate-300">Year 1 Projection</th>
                      <th className="p-3 text-right">Year 2 Projection</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-3 font-bold border-r border-slate-300 text-slate-800">Gross Sales / Revenue</td>
                      <td className="p-3 text-right font-medium border-r border-slate-300">{formatCurrency(financials.projectedSalesYear1)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(financials.projectedSalesYear2)}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-3 font-bold border-r border-slate-300 text-slate-800 text-sm">Estimated Net Profit Margin (%)</td>
                      <td className="p-3 text-right font-medium border-r border-slate-300 text-purple-700">{financials.netProfitMargin}%</td>
                      <td className="p-3 text-right font-medium text-purple-700">{financials.netProfitMargin}%</td>
                    </tr>
                    <tr className="bg-slate-50 border-t-2 border-slate-800">
                      <td className="p-3 font-black text-slate-900 border-r border-slate-300 uppercase">Projected Net Profit</td>
                      <td className="p-3 text-right font-black text-green-700 border-r border-slate-300">{formatCurrency(netProfitYear1)}</td>
                      <td className="p-3 text-right font-black text-green-700">{formatCurrency(netProfitYear2)}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-3 font-bold border-r border-slate-300 text-slate-800 text-sm">Debt Service Coverage Ratio (DSCR)</td>
                      <td className="p-3 text-right font-medium border-r border-slate-300 text-slate-500">Approx. 1.85</td>
                      <td className="p-3 text-right font-medium text-slate-500">Approx. 2.10</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-slate-400 mt-3 italic">* The above projections are estimates based on the business model and current market trends. DSCR is maintained above the banking norm of 1.5.</p>
              </div>

              {/* Signatures */}
              <div className="mt-auto pt-6 border-t border-slate-300">
                <div className="flex justify-between text-sm font-bold text-slate-800 pt-10">
                  <div className="text-center">
                    <div className="w-48 border-b-2 border-slate-400 mb-2 mx-auto"></div>
                    Signature of Promoter / Applicant
                  </div>
                  <div className="text-center">
                    <div className="w-48 border-b-2 border-slate-400 mb-2 mx-auto"></div>
                    Seal / Stamp
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}