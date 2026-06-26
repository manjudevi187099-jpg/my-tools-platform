'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, Printer, Building2, Calendar, Plus, Trash2, 
  TrendingUp, TrendingDown, Calculator, FileText
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// Types
type Item = { id: string; name: string; amount: number };

export default function ProfitLossGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- FORM STATE ---
  const [company, setCompany] = useState({
    name: 'DHAMAKA ENTERPRISES PVT. LTD.',
    period: 'For the Year Ended March 31, 2026'
  });

  const [revenues, setRevenues] = useState<Item[]>([
    { id: '1', name: 'Sales Revenue', amount: 1500000 },
    { id: '2', name: 'Service Income', amount: 500000 },
    { id: '3', name: 'Other Income', amount: 50000 },
  ]);

  const [cogs, setCogs] = useState<Item[]>([
    { id: '1', name: 'Cost of Raw Materials', amount: 600000 },
    { id: '2', name: 'Direct Labor', amount: 200000 },
  ]);

  const [expenses, setExpenses] = useState<Item[]>([
    { id: '1', name: 'Rent & Office Expenses', amount: 180000 },
    { id: '2', name: 'Salaries & Wages', amount: 450000 },
    { id: '3', name: 'Marketing & Advertising', amount: 120000 },
    { id: '4', name: 'Utilities & Internet', amount: 45000 },
  ]);

  const [taxes, setTaxes] = useState<Item[]>([
    { id: '1', name: 'Income Tax', amount: 85000 },
    { id: '2', name: 'Interest on Loan', amount: 30000 },
  ]);

  const [notes, setNotes] = useState('All amounts are in Indian Rupees (INR).');

  // --- CALCULATIONS ---
  const sumItems = (items: Item[]) => items.reduce((sum, item) => sum + item.amount, 0);

  const totalRevenue = sumItems(revenues);
  const totalCogs = sumItems(cogs);
  const grossProfit = totalRevenue - totalCogs;
  
  const totalExpenses = sumItems(expenses);
  const operatingProfit = grossProfit - totalExpenses;
  
  const totalTaxesAndInterest = sumItems(taxes);
  const netProfit = operatingProfit - totalTaxesAndInterest;

  const isProfitable = netProfit >= 0;

  // --- HANDLERS ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addItem = (setter: React.Dispatch<React.SetStateAction<Item[]>>) => {
    setter(prev => [...prev, { id: generateId(), name: 'New Item', amount: 0 }]);
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<Item[]>>, id: string, field: keyof Item, value: string | number) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<Item[]>>, id: string) => {
    setter(prev => prev.filter(item => item.id !== id));
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
      pdf.save(`${company.name.replace(/\s+/g, '_')}_Profit_Loss.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  // --- REUSABLE INPUT RENDERER ---
  const renderInputs = (items: Item[], setter: React.Dispatch<React.SetStateAction<Item[]>>, title: string) => (
    <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-center mb-3">
        <label className="text-xs font-black uppercase text-slate-500">{title}</label>
        <button onClick={() => addItem(setter)} className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1">
          <Plus size={14}/> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex gap-2 items-center">
            <input type="text" value={item.name} onChange={(e) => updateItem(setter, item.id, 'name', e.target.value)} className="flex-1 text-sm p-2 rounded-lg border outline-none focus:border-blue-500" placeholder="Item Name"/>
            <input type="number" value={item.amount || ''} onChange={(e) => updateItem(setter, item.id, 'amount', Number(e.target.value))} className="w-32 text-sm p-2 rounded-lg border outline-none focus:border-blue-500 font-bold" placeholder="Amount"/>
            <button onClick={() => removeItem(setter, item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-800 print:bg-white print:p-0">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 print:block">
        
        {/* --- CONTROLS SIDEBAR (Hides on Print) --- */}
        <div className="xl:col-span-5 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar print:hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calculator size={24} /></div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">P&L Statement</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Income Generator</p>
            </div>
          </div>

          {/* Smart Profit/Loss Indicator */}
          <div className={`p-5 rounded-2xl mb-6 flex items-center justify-between font-bold border shadow-sm ${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3">
              {isProfitable ? <TrendingUp size={24} className="text-green-600"/> : <TrendingDown size={24} className="text-red-600"/>}
              <div>
                <p className={`text-xs uppercase tracking-widest ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>Net {isProfitable ? 'Profit' : 'Loss'}</p>
                <p className={`text-xl font-black ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(Math.abs(netProfit))}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Company Info */}
            <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Building2 size={14}/> Company Details</h3>
              <input value={company.name} onChange={(e) => setCompany({...company, name: e.target.value})} placeholder="Company Name" className="w-full text-sm font-bold p-2.5 rounded-lg border outline-none focus:border-blue-500" />
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-slate-400"/>
                <input value={company.period} onChange={(e) => setCompany({...company, period: e.target.value})} placeholder="Period (e.g. For the Year Ended Mar 2026)" className="w-full text-sm p-2.5 rounded-lg border outline-none focus:border-blue-500" />
              </div>
            </section>

            {/* Incomes & Direct Costs */}
            <section className="border-l-4 border-emerald-400 pl-4">
              <h3 className="text-sm font-black uppercase text-slate-800 mb-2">Income & Direct Costs</h3>
              {renderInputs(revenues, setRevenues, 'Revenue / Income')}
              {renderInputs(cogs, setCogs, 'Cost of Goods Sold (COGS)')}
            </section>

            {/* Expenses & Taxes */}
            <section className="border-l-4 border-amber-400 pl-4">
              <h3 className="text-sm font-black uppercase text-slate-800 mb-2">Operating Expenses & Taxes</h3>
              {renderInputs(expenses, setExpenses, 'Operating Expenses')}
              {renderInputs(taxes, setTaxes, 'Taxes & Interest')}
            </section>

            {/* Notes */}
            <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 mb-2"><FileText size={14}/> Footnotes</h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full text-sm p-2.5 rounded-lg border outline-none focus:border-blue-500 resize-none" placeholder="Add notes here..."/>
            </section>

          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button onClick={downloadPDF} disabled={isDownloading} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-colors">
              {isDownloading ? <span className="animate-pulse">EXPORTING...</span> : <><Download size={18}/> PDF</>}
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
              
              {/* Header */}
              <header className="text-center border-b-4 border-slate-800 pb-6 mb-8">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wider">{company.name}</h1>
                <h2 className="text-xl font-bold text-slate-600 uppercase mt-2">Profit & Loss Statement</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">{company.period}</p>
              </header>

              {/* P&L Table */}
              <div className="flex-1 w-full max-w-2xl mx-auto">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    
                    {/* REVENUES */}
                    <tr><td colSpan={2} className="py-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-300">Revenue</td></tr>
                    {revenues.map(r => (
                      <tr key={r.id}>
                        <td className="py-2 px-4 text-sm text-slate-700">{r.name}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{formatCurrency(r.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">Total Revenue</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-900 text-right">{formatCurrency(totalRevenue)}</td>
                    </tr>

                    {/* COGS */}
                    <tr><td colSpan={2} className="py-2 mt-4 pt-6 text-sm font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-300">Cost of Goods Sold</td></tr>
                    {cogs.map(c => (
                      <tr key={c.id}>
                        <td className="py-2 px-4 text-sm text-slate-700">{c.name}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{formatCurrency(c.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">Total COGS</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-900 text-right">{formatCurrency(totalCogs)}</td>
                    </tr>

                    {/* GROSS PROFIT */}
                    <tr className="border-t-2 border-b-2 border-slate-800 bg-blue-50">
                      <td className="py-4 px-4 text-base font-black text-blue-900 uppercase">Gross Profit</td>
                      <td className="py-4 px-4 text-base font-black text-blue-900 text-right">{formatCurrency(grossProfit)}</td>
                    </tr>

                    {/* EXPENSES */}
                    <tr><td colSpan={2} className="py-2 mt-4 pt-6 text-sm font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-300">Operating Expenses</td></tr>
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td className="py-2 px-4 text-sm text-slate-700">{e.name}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{formatCurrency(e.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">Total Operating Expenses</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-900 text-right">{formatCurrency(totalExpenses)}</td>
                    </tr>

                    {/* OPERATING PROFIT */}
                    <tr className="border-t-2 border-b-2 border-slate-400 bg-slate-100">
                      <td className="py-3 px-4 text-sm font-black text-slate-800 uppercase">Operating Profit</td>
                      <td className="py-3 px-4 text-sm font-black text-slate-900 text-right">{formatCurrency(operatingProfit)}</td>
                    </tr>

                    {/* TAXES & INTEREST */}
                    <tr><td colSpan={2} className="py-2 mt-4 pt-6 text-sm font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-300">Taxes & Interest</td></tr>
                    {taxes.map(t => (
                      <tr key={t.id}>
                        <td className="py-2 px-4 text-sm text-slate-700">{t.name}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">Total Taxes & Interest</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-900 text-right">{formatCurrency(totalTaxesAndInterest)}</td>
                    </tr>

                    {/* NET PROFIT / LOSS */}
                    <tr className={`border-t-4 border-b-4 border-slate-900 ${isProfitable ? 'bg-green-100' : 'bg-red-100'}`}>
                      <td className={`py-5 px-4 text-lg font-black uppercase ${isProfitable ? 'text-green-900' : 'text-red-900'}`}>
                        Net {isProfitable ? 'Profit' : 'Loss'}
                      </td>
                      <td className={`py-5 px-4 text-lg font-black text-right ${isProfitable ? 'text-green-900' : 'text-red-900'}`}>
                        {formatCurrency(netProfit)}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Footer Notes & Signatures */}
              <div className="mt-16 pt-6 border-t border-slate-300">
                <p className="text-xs text-slate-500 italic mb-12 text-center">{notes}</p>
                
                <div className="flex justify-between text-sm font-bold text-slate-800 pt-8">
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-2 mx-auto"></div>
                    Director / Owner
                  </div>
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-2 mx-auto"></div>
                    Accountant / Auditor
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