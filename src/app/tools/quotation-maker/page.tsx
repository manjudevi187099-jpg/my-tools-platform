'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Download, FileText, Loader2, Calculator, Building, User, Plus, Trash2, FileSignature, Briefcase } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function QuotationMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Unified Form State
  const [formData, setFormData] = useState({
    // Business Details
    bizName: 'DHAMAKA DIGITAL SOLUTIONS',
    bizAddress: 'Cyber Hub, Sector 24, Gurugram, Haryana - 122002',
    bizPhone: '+91-9876543210',
    bizEmail: 'hello@dhamakadigital.com',
    bizWebsite: 'www.dhamakadigital.com',
    
    // Quotation Metadata
    quoteNo: 'EST-2026-045',
    date: new Date().toLocaleDateString('en-GB'),
    validUntil: '15-Jul-2026', // Valid for 30 days generally
    
    // Client Details
    clientName: 'TechNova Industries Pvt. Ltd.',
    clientContact: 'Mr. Rajesh Sharma (+91-9988776655)',
    clientAddress: 'Okhla Phase 1, New Delhi',
    
    // Terms & Notes
    terms: '1. 50% advance payment required to commence work.\n2. Quotation is valid for 30 days from the date of issue.\n3. Taxes are calculated as per current government norms.',
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Dynamic Items State
  const [items, setItems] = useState([
    { id: 1, desc: 'E-Commerce Website Development', qty: '1', rate: '45000' },
    { id: 2, desc: 'Premium Hosting & SSL (1 Year)', qty: '1', rate: '8500' },
    { id: 3, desc: 'Monthly SEO Service (Advance)', qty: '1', rate: '12000' },
  ]);

  const [taxRate, setTaxRate] = useState('18'); // GST Percentage
  const [discount, setDiscount] = useState('5000'); // Flat amount

  // 🔥 SMART AUTO-CALCULATOR
  const calculations = useMemo(() => {
    const subtotal = items.reduce((acc, item) => {
      const q = Number(item.qty) || 0;
      const r = Number(item.rate) || 0;
      return acc + (q * r);
    }, 0);

    const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
    const flatDiscount = Number(discount) || 0;
    const grandTotal = subtotal + taxAmount - flatDiscount;

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      discountAmount: flatDiscount.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  }, [items, taxRate, discount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Item Handlers
  const addItem = () => setItems([...items, { id: Date.now(), desc: '', qty: '1', rate: '0' }]);
  const removeItem = (id: number) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };
  const handleItemChange = (id: number, field: string, value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // Download Handlers
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quotation_${formData.quoteNo}.pdf`);
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadImage = async () => {
    if (!previewRef.current) return;
    setIsDownloadingJpg(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `Quotation_${formData.quoteNo}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <FileSignature className="w-10 h-10 text-indigo-600" />
            Smart Quotation Maker
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create professional estimates and business proposals</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="xl:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* BUSINESS DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Building className="w-3 h-3"/> Your Business Profile</h3>
              <div className="space-y-3">
                <input type="text" name="bizName" placeholder="Company Name" value={formData.bizName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600 font-bold" />
                <input type="text" name="bizAddress" placeholder="Address" value={formData.bizAddress} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="bizPhone" placeholder="Phone" value={formData.bizPhone} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                  <input type="text" name="bizEmail" placeholder="Email" value={formData.bizEmail} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                  <input type="text" name="bizWebsite" placeholder="Website" value={formData.bizWebsite} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Company Logo</label>
                  <input type="file" onChange={handleLogoUpload} className="w-full text-xs border p-1.5 rounded-lg bg-indigo-50" />
                </div>
              </div>
            </div>

            {/* QUOTE & CLIENT INFO */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Client & Estimate Details</h3>
              <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-slate-200">
                <input type="text" name="quoteNo" placeholder="Quote No." value={formData.quoteNo} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg font-bold text-indigo-800" />
                <input type="text" name="date" placeholder="Issue Date" value={formData.date} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                <input type="text" name="validUntil" placeholder="Valid Until" value={formData.validUntil} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
              </div>
              <div className="space-y-3">
                <input type="text" name="clientName" placeholder="Client Company / Name" value={formData.clientName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600 font-bold" />
                <input type="text" name="clientContact" placeholder="Contact Person & Phone" value={formData.clientContact} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                <input type="text" name="clientAddress" placeholder="Client Address" value={formData.clientAddress} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
              </div>
            </div>

            {/* ITEMS & PRICING */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-1"><Briefcase className="w-3 h-3"/> Proposed Services / Items</h3>
                <button onClick={addItem} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-200">
                  <Plus className="w-3 h-3"/> Add Row
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase text-center">
                  <div className="col-span-6 text-left">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-3">Unit Price</div>
                  <div className="col-span-1"></div>
                </div>
                
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} placeholder="Service description" className="col-span-6 w-full text-xs border p-2 rounded" />
                    <input type="number" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} placeholder="0" className="col-span-2 w-full text-xs border p-2 rounded text-center" />
                    <input type="number" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} placeholder="0" className="col-span-3 w-full text-xs border p-2 rounded text-right font-bold" />
                    <button onClick={() => removeItem(item.id)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estimated Tax (%)</label>
                  <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full text-sm border p-2 rounded-lg" placeholder="e.g. 18" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Offer Discount (₹)</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full text-sm border p-2 rounded-lg" placeholder="Flat discount" />
                </div>
              </div>
            </div>

            {/* TERMS & CONDITIONS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3">Terms & Conditions</h3>
              <textarea name="terms" value={formData.terms} onChange={handleInputChange} className="w-full h-24 text-xs border p-2.5 rounded-lg focus:border-indigo-600 resize-none" placeholder="Enter terms of service..." />
            </div>

            {/* LIVE TOTALS WIDGET */}
            <div className="bg-indigo-600 text-white rounded-xl p-4 shadow-inner mb-4">
              <div className="flex items-center gap-2 font-bold text-sm mb-2 border-b border-indigo-500 pb-2">
                <Calculator className="w-4 h-4" /> Estimate Summary
              </div>
              <div className="flex justify-between text-xs font-medium mb-1"><span>Subtotal:</span> <span>₹ {calculations.subtotal}</span></div>
              <div className="flex justify-between text-xs font-medium mb-1"><span>Tax (+):</span> <span>₹ {calculations.taxAmount}</span></div>
              <div className="flex justify-between text-xs font-medium mb-1 text-indigo-200"><span>Discount (-):</span> <span>₹ {calculations.discountAmount}</span></div>
              <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-indigo-500">
                <span>TOTAL:</span> <span>₹ {calculations.grandTotal}</span>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="mt-auto grid grid-cols-2 gap-3">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="xl:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              
              {/* QUOTATION CANVAS */}
              <div ref={previewRef} className="bg-white w-[794px] min-h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-sans">
                
                {/* --- HEADER --- */}
                <div className="p-10 pb-8 flex justify-between items-start bg-indigo-50 border-b-4 border-indigo-900">
                  <div className="w-1/2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-16 object-contain mb-4" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center border-2 border-slate-300 mb-4">
                        <Building className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                    <h1 className="font-black text-xl uppercase tracking-wider text-slate-900">{formData.bizName}</h1>
                    <p className="text-xs font-medium text-slate-600 mt-1">{formData.bizAddress}</p>
                    <p className="text-xs font-medium text-slate-600 mt-1">Ph: {formData.bizPhone}</p>
                    <p className="text-xs font-medium text-slate-600">{formData.bizEmail} | {formData.bizWebsite}</p>
                  </div>

                  <div className="w-1/3 text-right">
                    <h2 className="text-4xl font-black text-indigo-900 uppercase tracking-widest mb-4">QUOTATION</h2>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-end gap-3"><span className="text-slate-500 font-bold">Quote No:</span> <span className="font-bold text-slate-900">{formData.quoteNo}</span></div>
                      <div className="flex justify-end gap-3"><span className="text-slate-500 font-bold">Date:</span> <span className="font-bold text-slate-900">{formData.date}</span></div>
                      <div className="flex justify-end gap-3"><span className="text-slate-500 font-bold">Valid Until:</span> <span className="font-bold text-indigo-700">{formData.validUntil}</span></div>
                    </div>
                  </div>
                </div>

                {/* --- PREPARED FOR (CLIENT INFO) --- */}
                <div className="px-10 py-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-slate-200 pb-1 mb-3">Prepared For</h3>
                  <h4 className="text-lg font-black text-slate-900 uppercase">{formData.clientName}</h4>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{formData.clientContact}</p>
                  <p className="text-sm font-medium text-slate-600">{formData.clientAddress}</p>
                </div>

                {/* --- ITEMS TABLE --- */}
                <div className="px-10 py-2 flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-indigo-900 text-white">
                        <th className="py-3 px-4 uppercase text-[11px] font-bold w-12 text-center">Sl.</th>
                        <th className="py-3 px-4 uppercase text-[11px] font-bold">Description of Services / Items</th>
                        <th className="py-3 px-4 uppercase text-[11px] font-bold text-center w-24">Qty</th>
                        <th className="py-3 px-4 uppercase text-[11px] font-bold text-right w-32">Unit Price (₹)</th>
                        <th className="py-3 px-4 uppercase text-[11px] font-bold text-right w-32">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800 font-medium">
                      {items.map((item, index) => {
                        const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                        return (
                          <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="py-4 px-4 text-center text-sm">{index + 1}</td>
                            <td className="py-4 px-4 font-bold text-sm">{item.desc || '-'}</td>
                            <td className="py-4 px-4 text-center text-sm">{item.qty}</td>
                            <td className="py-4 px-4 text-right text-sm">{Number(item.rate).toFixed(2)}</td>
                            <td className="py-4 px-4 text-right font-bold text-sm">{amount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* --- TOTALS SUMMARY --- */}
                  <div className="flex justify-end mt-6">
                    <div className="w-80 space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <div className="flex justify-between text-sm font-bold text-slate-600">
                        <span>Subtotal:</span>
                        <span>₹ {calculations.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-600 border-b border-slate-200 pb-3">
                        <span>Estimated Tax ({taxRate}%):</span>
                        <span>₹ {calculations.taxAmount}</span>
                      </div>
                      {Number(discount) > 0 && (
                        <div className="flex justify-between text-sm font-bold text-indigo-600">
                          <span>Discount:</span>
                          <span>- ₹ {calculations.discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-2xl font-black text-indigo-900 mt-2 pt-2">
                        <span>Estimate Total:</span>
                        <span>₹ {calculations.grandTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- FOOTER / TERMS --- */}
                <div className="mt-auto pt-8 pb-10 px-10 flex justify-between items-end border-t border-slate-200">
                  <div className="w-2/3 pr-8">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2 border-b-2 border-slate-200 pb-1">Terms & Conditions</h4>
                    <pre className="text-xs text-slate-600 font-medium whitespace-pre-wrap font-sans leading-relaxed">{formData.terms}</pre>
                  </div>
                  
                  <div className="w-48 text-center">
                    <div className="h-16 border-b-2 border-slate-800 mb-2"></div>
                    <p className="font-bold text-slate-900 text-sm">Authorized Signature</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">For {formData.bizName}</p>
                  </div>
                </div>
                
                {/* Decorative Bottom Bar */}
                <div className="h-4 w-full bg-indigo-900"></div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}