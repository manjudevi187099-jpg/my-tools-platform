'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, Building, User, Banknote, FileText, Calculator, Building2, Calendar, CreditCard
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function SalarySlipGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- FORM STATE ---
  const [company, setCompany] = useState({
    name: 'DHAMAKA ENTERPRISES PVT. LTD.',
    address: 'Sector 62, Cyber Park, Gurugram, HR - 122002',
    monthYear: 'May 2026'
  });

  const [employee, setEmployee] = useState({
    name: 'Asmita Kumari',
    id: 'EMP-2026-001',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    doj: '15 Jan 2025',
    pan: 'ABCDE1234F',
    bankName: 'HDFC Bank',
    accountNo: 'XXXX-XXXX-1234',
    uan: '100012345678',
    lop: '0'
  });

  const [earnings, setEarnings] = useState({
    basic: 25000,
    hra: 12500,
    conveyance: 1600,
    medical: 1250,
    special: 9650
  });

  const [deductions, setDeductions] = useState({
    pf: 1800,
    pt: 200,
    tds: 2500,
    esi: 0,
    advance: 0
  });

  // --- AUTO CALCULATIONS ---
  const totalEarnings = Object.values(earnings).reduce((a, b) => Number(a) + Number(b), 0);
  const totalDeductions = Object.values(deductions).reduce((a, b) => Number(a) + Number(b), 0);
  const netPay = totalEarnings - totalDeductions;

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // --- HANDLERS ---
  const handleCompChange = (e: React.ChangeEvent<HTMLInputElement>) => setCompany({ ...company, [e.target.name]: e.target.value });
  const handleEmpChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmployee({ ...employee, [e.target.name]: e.target.value });
  const handleEarnChange = (e: React.ChangeEvent<HTMLInputElement>) => setEarnings({ ...earnings, [e.target.name]: Number(e.target.value) || 0 });
  const handleDedChange = (e: React.ChangeEvent<HTMLInputElement>) => setDeductions({ ...deductions, [e.target.name]: Number(e.target.value) || 0 });

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      pdf.save(`Payslip_${employee.name.replace(/\s+/g, '_')}_${company.monthYear.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- HR CONTROL PANEL --- */}
        <div className="xl:col-span-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText size={24} /></div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Payslip Generator</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">HR & Payroll Engine</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Company Info */}
            <section className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Building2 size={14}/> Company Details</h3>
              <input name="name" value={company.name} onChange={handleCompChange} placeholder="Company Name" className="w-full text-sm font-bold p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              <input name="address" value={company.address} onChange={handleCompChange} placeholder="Company Address" className="w-full text-sm p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-slate-400"/>
                <input name="monthYear" value={company.monthYear} onChange={handleCompChange} placeholder="Salary Month & Year (e.g. May 2026)" className="w-full text-sm font-bold p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </section>

            {/* Employee Info */}
            <section className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><User size={14}/> Employee Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" value={employee.name} onChange={handleEmpChange} placeholder="Employee Name" className="w-full text-sm font-bold p-2.5 rounded-lg border outline-none" />
                <input name="id" value={employee.id} onChange={handleEmpChange} placeholder="Emp ID" className="w-full text-sm font-bold p-2.5 rounded-lg border outline-none" />
                <input name="designation" value={employee.designation} onChange={handleEmpChange} placeholder="Designation" className="col-span-2 w-full text-sm p-2.5 rounded-lg border outline-none" />
                <input name="department" value={employee.department} onChange={handleEmpChange} placeholder="Department" className="w-full text-sm p-2.5 rounded-lg border outline-none" />
                <input name="doj" value={employee.doj} onChange={handleEmpChange} placeholder="Date of Joining" className="w-full text-sm p-2.5 rounded-lg border outline-none" />
                <input name="pan" value={employee.pan} onChange={handleEmpChange} placeholder="PAN Number" className="w-full text-sm p-2.5 rounded-lg border outline-none uppercase" />
                <input name="uan" value={employee.uan} onChange={handleEmpChange} placeholder="UAN Number" className="w-full text-sm p-2.5 rounded-lg border outline-none" />
                <input name="lop" value={employee.lop} onChange={handleEmpChange} placeholder="Loss of Pay (Days)" className="w-full text-sm p-2.5 rounded-lg border outline-none text-red-500 font-bold" />
              </div>
            </section>

            {/* Salary Components */}
            <section className="grid grid-cols-2 gap-4">
              {/* EARNINGS */}
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 space-y-3">
                <h3 className="text-xs font-black uppercase text-green-700 flex items-center gap-2"><Banknote size={14}/> Earnings</h3>
                {Object.keys(earnings).map((key) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold text-green-600 uppercase mb-1 block">{key}</label>
                    <input type="number" name={key} value={earnings[key as keyof typeof earnings] || ''} onChange={handleEarnChange} className="w-full text-sm font-bold p-2 rounded-md border-green-200 outline-none focus:ring-2 ring-green-400" />
                  </div>
                ))}
              </div>

              {/* DEDUCTIONS */}
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-3">
                <h3 className="text-xs font-black uppercase text-red-700 flex items-center gap-2"><Calculator size={14}/> Deductions</h3>
                {Object.keys(deductions).map((key) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold text-red-600 uppercase mb-1 block">{key}</label>
                    <input type="number" name={key} value={deductions[key as keyof typeof deductions] || ''} onChange={handleDedChange} className="w-full text-sm font-bold p-2 rounded-md border-red-200 outline-none focus:ring-2 ring-red-400" />
                  </div>
                ))}
              </div>
            </section>

          </div>

          <button onClick={downloadPDF} disabled={isDownloading} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 transition-colors text-white py-4 rounded-xl font-black flex justify-center items-center gap-2 shadow-lg shadow-blue-200">
            {isDownloading ? <span className="animate-pulse">GENERATING PDF...</span> : <><Download size={20}/> EXPORT PAYSLIP PDF</>}
          </button>
        </div>

        {/* --- LIVE A4 PREVIEW CANVAS --- */}
        <div className="xl:col-span-8 flex justify-center overflow-auto pb-10">
          <div className="bg-white shadow-2xl overflow-hidden border border-slate-200" style={{ width: '794px', minHeight: '1123px' }}>
            <div ref={previewRef} className="w-full h-full bg-white p-12 flex flex-col relative font-sans">
              
              {/* HEADER */}
              <header className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wide">{company.name}</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">{company.address}</p>
                <div className="mt-6 inline-block bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 tracking-widest uppercase">Payslip for the month of {company.monthYear}</h2>
                </div>
              </header>

              {/* EMPLOYEE DETAILS TABLE */}
              <div className="border border-slate-300 rounded-lg overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-3 bg-slate-50 font-bold text-slate-600 w-1/4">Employee Name</td>
                      <td className="p-3 font-semibold text-slate-900 w-1/4 border-r border-slate-200">{employee.name}</td>
                      <td className="p-3 bg-slate-50 font-bold text-slate-600 w-1/4">Employee ID</td>
                      <td className="p-3 font-semibold text-slate-900 w-1/4">{employee.id}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-3 bg-slate-50 font-bold text-slate-600">Designation</td>
                      <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">{employee.designation}</td>
                      <td className="p-3 bg-slate-50 font-bold text-slate-600">Department</td>
                      <td className="p-3 font-semibold text-slate-900">{employee.department}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-3 bg-slate-50 font-bold text-slate-600">Date of Joining</td>
                      <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">{employee.doj}</td>
                      <td className="p-3 bg-slate-50 font-bold text-slate-600">PAN Number</td>
                      <td className="p-3 font-semibold text-slate-900 uppercase">{employee.pan}</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-600">UAN Number</td>
                      <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">{employee.uan}</td>
                      <td className="p-3 bg-slate-50 font-bold text-slate-600">Loss of Pay (Days)</td>
                      <td className="p-3 font-bold text-red-600">{employee.lop}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SALARY CALCULATION TABLE */}
              <div className="flex border border-slate-300 rounded-lg overflow-hidden mb-8">
                {/* EARNINGS COLUMN */}
                <div className="w-1/2 border-r border-slate-300 flex flex-col">
                  <div className="bg-slate-100 p-3 border-b border-slate-300 font-black text-slate-800 uppercase tracking-wider flex justify-between">
                    <span>Earnings</span><span>Amount</span>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    {Object.entries(earnings).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="capitalize text-slate-600 font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium text-slate-900">{formatCurrency(value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-300 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Total Earnings (A)</span>
                    <span className="font-black text-green-700 text-lg">{formatCurrency(totalEarnings)}</span>
                  </div>
                </div>

                {/* DEDUCTIONS COLUMN */}
                <div className="w-1/2 flex flex-col">
                  <div className="bg-slate-100 p-3 border-b border-slate-300 font-black text-slate-800 uppercase tracking-wider flex justify-between">
                    <span>Deductions</span><span>Amount</span>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    {Object.entries(deductions).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="uppercase text-slate-600 font-semibold">{key}</span>
                        <span className="font-medium text-slate-900">{formatCurrency(value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-300 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Total Deductions (B)</span>
                    <span className="font-black text-red-600 text-lg">{formatCurrency(totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* NET PAY SUMMARY */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Net Salary Payable (A - B)</p>
                  <p className="text-xs font-semibold text-slate-500">Transferred to {employee.bankName} (A/C: {employee.accountNo})</p>
                </div>
                <div className="text-4xl font-black text-blue-800">
                  {formatCurrency(netPay)}
                </div>
              </div>

              {/* FOOTER / SIGNATURE */}
              <div className="mt-auto pt-16 flex justify-between text-sm font-bold text-slate-400">
                <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
                  Employer Signature
                </div>
                <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
                  Employee Signature
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-8 font-semibold">This is a computer-generated document. No signature is required.</p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}