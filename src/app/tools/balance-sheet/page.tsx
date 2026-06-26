'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, Printer, Building2, Calendar, Plus, Trash2, 
  Landmark, Briefcase, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// Types
type Item = { id: string; category: string; name: string; amount: number };

export default function BalanceSheetGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- FORM STATE ---
  const [company, setCompany] = useState({
    name: 'DHAMAKA ENTERPRISES PVT. LTD.',
    year: '2025 - 2026'
  });

  const [assets, setAssets] = useState<Item[]>([
    { id: '1', category: 'Current', name: 'Cash and Bank Balances', amount: 250000 },
    { id: '2', category: 'Current', name: 'Accounts Receivable', amount: 150000 },
    { id: '3', category: 'Fixed', name: 'Property & Plant', amount: 800000 },
    { id: '4', category: 'Fixed', name: 'Software & Equipment', amount: 200000 },
  ]);

  const [liabilities, setLiabilities] = useState<Item[]>([
    { id: '1', category: 'Current', name: 'Accounts Payable', amount: 100000 },
    { id: '2', category: 'Current', name: 'Short-term Provisions', amount: 50000 },
    { id: '3', category: 'Long-Term', name: 'Bank Loan', amount: 400000 },
  ]);

  const [equity, setEquity] = useState<Item[]>([
    { id: '1', category: 'Capital', name: 'Share Capital', amount: 500000 },
    { id: '2', category: 'Capital', name: 'Retained Earnings', amount: 350000 },
  ]);

  const [notes, setNotes] = useState('All amounts are in Indian Rupees (INR). This balance sheet is prepared as per standard accounting principles.');

  // --- CALCULATIONS ---
  const totalCurrentAssets = assets.filter(a => a.category === 'Current').reduce((sum, a) => sum + a.amount, 0);
  const totalFixedAssets = assets.filter(a => a.category === 'Fixed').reduce((sum, a) => sum + a.amount, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = liabilities.filter(l => l.category === 'Current').reduce((sum, l) => sum + l.amount, 0);
  const totalLongTermLiabilities = liabilities.filter(l => l.category === 'Long-Term').reduce((sum, l) => sum + l.amount, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const isBalanced = totalAssets === totalLiabilitiesAndEquity;

  // --- HANDLERS ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addItem = (setter: React.Dispatch<React.SetStateAction<Item[]>>, category: string) => {
    setter(prev => [...prev, { id: generateId(), category, name: 'New Item', amount: 0 }]);
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
      pdf.save(`${company.name.replace(/\s+/g, '_')}_Balance_Sheet.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  // --- REUSABLE INPUT RENDERER ---
  const renderInputs = (items: Item[], setter: React.Dispatch<React.SetStateAction<Item[]>>, title: string, category: string) => (
    <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-center mb-3">
        <label className="text-xs font-black uppercase text-slate-500">{title}</label>
        <button onClick={() => addItem(setter, category)} className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 flex items-center gap-1">
          <Plus size={14}/> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.filter(i => i.category === category).map(item => (
          <div key={item.id} className="flex gap-2 items-center">
            <input type="text" value={item.name} onChange={(e) => updateItem(setter, item.id, 'name', e.target.value)} className="flex-1 text-sm p-2 rounded-lg border outline-none focus:border-indigo-500" placeholder="Item Name"/>
            <input type="number" value={item.amount || ''} onChange={(e) => updateItem(setter, item.id, 'amount', Number(e.target.value))} className="w-32 text-sm p-2 rounded-lg border outline-none focus:border-indigo-500 font-bold" placeholder="Amount"/>
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
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Landmark size={24} /></div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Balance Sheet</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial Engine</p>
            </div>
          </div>

          {/* Tally Status Banner */}
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-bold text-sm border ${isBalanced ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {isBalanced ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
            {isBalanced ? 'Balance Sheet is Tallied!' : `Difference: ${formatCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity))}`}
          </div>

          <div className="space-y-4">
            
            {/* Company Info */}
            <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Building2 size={14}/> Company Details</h3>
              <input value={company.name} onChange={(e) => setCompany({...company, name: e.target.value})} placeholder="Company Name" className="w-full text-sm font-bold p-2.5 rounded-lg border outline-none focus:border-indigo-500" />
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-slate-400"/>
                <input value={company.year} onChange={(e) => setCompany({...company, year: e.target.value})} placeholder="Financial Year (e.g. 2025-2026)" className="w-full text-sm p-2.5 rounded-lg border outline-none focus:border-indigo-500" />
              </div>
            </section>

            {/* Assets */}
            <section className="border-l-4 border-emerald-400 pl-4">
              <h3 className="text-sm font-black uppercase text-slate-800 mb-2">Assets</h3>
              {renderInputs(assets, setAssets, 'Current Assets', 'Current')}
              {renderInputs(assets, setAssets, 'Fixed Assets', 'Fixed')}
            </section>

            {/* Liabilities & Equity */}
            <section className="border-l-4 border-amber-400 pl-4">
              <h3 className="text-sm font-black uppercase text-slate-800 mb-2">Liabilities & Capital</h3>
              {renderInputs(equity, setEquity, 'Capital / Equity', 'Capital')}
              {renderInputs(liabilities, setLiabilities, 'Current Liabilities', 'Current')}
              {renderInputs(liabilities, setLiabilities, 'Long-Term Liabilities', 'Long-Term')}
            </section>

            {/* Notes */}
            <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 mb-2"><FileText size={14}/> Footnotes</h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full text-sm p-2.5 rounded-lg border outline-none focus:border-indigo-500 resize-none" placeholder="Add notes here..."/>
            </section>

          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button onClick={downloadPDF} disabled={isDownloading} className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-colors">
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
                <h2 className="text-xl font-bold text-slate-600 uppercase mt-2">Balance Sheet</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">As of Financial Year: {company.year}</p>
              </header>

              {/* T-Format Table Layout */}
              <div className="flex gap-8 flex-1">
                
                {/* LEFT: ASSETS */}
                <div className="w-1/2 flex flex-col">
                  <h3 className="text-lg font-black bg-slate-100 p-2 text-center border-b-2 border-slate-800 uppercase tracking-widest mb-4">Assets</h3>
                  
                  <div className="mb-6 space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase border-b border-slate-200 pb-1">Current Assets</h4>
                    {assets.filter(a => a.category === 'Current').map(a => (
                      <div key={a.id} className="flex justify-between text-sm">
                        <span>{a.name}</span>
                        <span className="font-semibold">{formatCurrency(a.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase border-b border-slate-200 pb-1">Fixed Assets</h4>
                    {assets.filter(a => a.category === 'Fixed').map(a => (
                      <div key={a.id} className="flex justify-between text-sm">
                        <span>{a.name}</span>
                        <span className="font-semibold">{formatCurrency(a.amount)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total Assets */}
                  <div className="mt-auto border-t-2 border-b-2 border-slate-800 py-3 flex justify-between items-center bg-slate-50 px-2">
                    <span className="font-black uppercase text-sm text-slate-800">Total Assets</span>
                    <span className="font-black text-lg text-slate-900">{formatCurrency(totalAssets)}</span>
                  </div>
                </div>

                {/* RIGHT: LIABILITIES & EQUITY */}
                <div className="w-1/2 flex flex-col">
                  <h3 className="text-lg font-black bg-slate-100 p-2 text-center border-b-2 border-slate-800 uppercase tracking-widest mb-4">Liabilities & Equity</h3>
                  
                  <div className="mb-6 space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase border-b border-slate-200 pb-1">Capital & Equity</h4>
                    {equity.map(e => (
                      <div key={e.id} className="flex justify-between text-sm">
                        <span>{e.name}</span>
                        <span className="font-semibold">{formatCurrency(e.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase border-b border-slate-200 pb-1">Current Liabilities</h4>
                    {liabilities.filter(l => l.category === 'Current').map(l => (
                      <div key={l.id} className="flex justify-between text-sm">
                        <span>{l.name}</span>
                        <span className="font-semibold">{formatCurrency(l.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase border-b border-slate-200 pb-1">Long-Term Liabilities</h4>
                    {liabilities.filter(l => l.category === 'Long-Term').map(l => (
                      <div key={l.id} className="flex justify-between text-sm">
                        <span>{l.name}</span>
                        <span className="font-semibold">{formatCurrency(l.amount)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total Liabilities & Equity */}
                  <div className="mt-auto border-t-2 border-b-2 border-slate-800 py-3 flex justify-between items-center bg-slate-50 px-2">
                    <span className="font-black uppercase text-sm text-slate-800">Total L & E</span>
                    <span className="font-black text-lg text-slate-900">{formatCurrency(totalLiabilitiesAndEquity)}</span>
                  </div>
                </div>

              </div>

              {/* Tally Warning on PDF if mismatched */}
              {!isBalanced && (
                <div className="mt-4 text-center text-xs font-bold text-red-500 border border-red-200 bg-red-50 py-2 rounded">
                  * Warning: The balance sheet is not tallied. Difference: {formatCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity))}
                </div>
              )}

              {/* Footer Notes & Signatures */}
              <div className="mt-12 pt-6 border-t border-slate-300">
                <p className="text-xs text-slate-500 italic mb-12">{notes}</p>
                
                <div className="flex justify-between text-sm font-bold text-slate-800 pt-8">
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-2"></div>
                    Director / Authorized Signatory
                  </div>
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-2"></div>
                    Prepared By (Accountant)
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