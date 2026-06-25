'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Download, FileText, Loader2, Receipt, Building, User, Plus, Trash2, Calculator, ShoppingCart } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function ReceiptGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Business & Customer State
  const [formData, setFormData] = useState({
    // Business Details
    bizName: 'DHAMAKA ENTERPRISES',
    bizAddress: 'Shop No. 42, Supermarket, New Delhi - 110001',
    bizPhone: '+91-9876543210',
    bizEmail: 'billing@dhamaka.com',
    bizGst: '22AAAAA0000A1Z5',
    
    // Receipt Details
    receiptNo: 'REC-2026-001',
    date: new Date().toLocaleDateString('en-GB'),
    paymentMode: 'UPI / Online',
    
    // Customer Details
    custName: 'Rahul Sharma',
    custPhone: '+91-9988776655',
    custAddress: 'Sector 62, Noida, UP',
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Dynamic Items State
  const [items, setItems] = useState([
    { id: 1, desc: 'Web Development Services', qty: '1', rate: '15000' },
    { id: 2, desc: 'Server Hosting (1 Year)', qty: '1', rate: '5000' },
  ]);

  // Tax & Discount State
  const [taxRate, setTaxRate] = useState('18'); // Percentage
  const [discount, setDiscount] = useState('0'); // Flat amount

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
      discountAmount: flatDiscount.toFixed(2), // 🔥 YE LINE ADD KI HAI
      grandTotal: grandTotal.toFixed(2)
    };
  }, [items, taxRate, discount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      pdf.save(`Receipt_${formData.receiptNo}.pdf`);
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
      link.download = `Receipt_${formData.receiptNo}.jpg`;
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
            <Receipt className="w-10 h-10 text-emerald-600" />
            Smart Receipt Generator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Create professional Invoices & Cash Receipts instantly</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="xl:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* BUSINESS DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Building className="w-3 h-3"/> Business Details</h3>
              <div className="space-y-3">
                <input type="text" name="bizName" placeholder="Business Name" value={formData.bizName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-emerald-600 font-bold" />
                <input type="text" name="bizAddress" placeholder="Address" value={formData.bizAddress} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-emerald-600" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="bizPhone" placeholder="Phone" value={formData.bizPhone} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-emerald-600" />
                  <input type="text" name="bizEmail" placeholder="Email" value={formData.bizEmail} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-emerald-600" />
                  <input type="text" name="bizGst" placeholder="GSTIN / Tax ID (Optional)" value={formData.bizGst} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg focus:border-emerald-600" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Logo</label>
                  <input type="file" onChange={handleLogoUpload} className="w-full text-xs border p-1.5 rounded-lg bg-emerald-50" />
                </div>
              </div>
            </div>

            {/* RECEIPT & CUSTOMER INFO */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Receipt & Customer</h3>
              <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-slate-200">
                <input type="text" name="receiptNo" placeholder="Receipt No." value={formData.receiptNo} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg font-bold text-emerald-800" />
                <input type="text" name="date" placeholder="Date" value={formData.date} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                <input type="text" name="paymentMode" placeholder="Payment Mode (e.g. Cash, UPI)" value={formData.paymentMode} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg" />
              </div>
              <div className="space-y-3">
                <input type="text" name="custName" placeholder="Customer Name" value={formData.custName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-emerald-600" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="custPhone" placeholder="Customer Phone" value={formData.custPhone} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-emerald-600" />
                  <input type="text" name="custAddress" placeholder="City / Address" value={formData.custAddress} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-emerald-600" />
                </div>
              </div>
            </div>

            {/* ITEMS & BILLING */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-1"><ShoppingCart className="w-3 h-3"/> Items Billed</h3>
                <button onClick={addItem} className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded flex items-center gap-1">
                  <Plus className="w-3 h-3"/> Add Item
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase text-center">
                  <div className="col-span-6 text-left">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-3">Rate (₹)</div>
                  <div className="col-span-1"></div>
                </div>
                
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} placeholder="Item name" className="col-span-6 w-full text-xs border p-2 rounded" />
                    <input type="number" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} placeholder="0" className="col-span-2 w-full text-xs border p-2 rounded text-center" />
                    <input type="number" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} placeholder="0" className="col-span-3 w-full text-xs border p-2 rounded text-right font-bold" />
                    <button onClick={() => removeItem(item.id)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tax / GST (%)</label>
                  <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full text-sm border p-2 rounded-lg" placeholder="e.g. 18" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Discount (₹)</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full text-sm border p-2 rounded-lg" placeholder="Flat discount" />
                </div>
              </div>
            </div>

            {/* LIVE TOTALS PREVIEW */}
            <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-inner mb-4">
              <div className="flex items-center gap-2 font-bold text-sm mb-2 border-b border-emerald-500 pb-2">
                <Calculator className="w-4 h-4" /> Bill Summary
              </div>
              <div className="flex justify-between text-xs font-medium mb-1"><span>Subtotal:</span> <span>₹ {calculations.subtotal}</span></div>
              <div className="flex justify-between text-xs font-medium mb-1"><span>Tax (+):</span> <span>₹ {calculations.taxAmount}</span></div>
              {/* 🔥 YAHAN CHANGE KIYA HAI 👇 */}
              <div className="flex justify-between text-xs font-medium mb-1"><span>Discount (-):</span> <span>₹ {calculations.discountAmount}</span></div>
              <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-emerald-500">
                <span>TOTAL:</span> <span>₹ {calculations.grandTotal}</span>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="mt-auto grid grid-cols-2 gap-3">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="xl:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              
              {/* INVOICE / RECEIPT CANVAS */}
              <div ref={previewRef} className="bg-white w-[794px] min-h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-sans border border-slate-300">
                
                {/* --- HEADER --- */}
                <div className="p-10 pb-6 flex justify-between items-start border-b-[3px] border-emerald-600">
                  <div className="w-1/2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-20 object-contain mb-4" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded flex items-center justify-center border-2 border-slate-300 mb-4">
                        <Building className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <h1 className="font-black text-2xl uppercase tracking-wider text-slate-900">{formData.bizName}</h1>
                    <p className="text-sm font-medium text-slate-600 mt-1">{formData.bizAddress}</p>
                    <p className="text-sm font-medium text-slate-600">Ph: {formData.bizPhone} | {formData.bizEmail}</p>
                    {formData.bizGst && <p className="text-sm font-bold text-slate-800 mt-1">GSTIN: {formData.bizGst}</p>}
                  </div>

                  <div className="w-1/3 text-right">
                    <h2 className="text-4xl font-black text-emerald-600 uppercase tracking-widest mb-4">RECEIPT</h2>
                    <div className="space-y-1">
                      <div className="flex justify-end gap-4"><span className="text-slate-500 font-bold">Receipt No:</span> <span className="font-bold text-slate-900">{formData.receiptNo}</span></div>
                      <div className="flex justify-end gap-4"><span className="text-slate-500 font-bold">Date:</span> <span className="font-bold text-slate-900">{formData.date}</span></div>
                      <div className="flex justify-end gap-4"><span className="text-slate-500 font-bold">Payment:</span> <span className="font-bold text-slate-900">{formData.paymentMode}</span></div>
                    </div>
                  </div>
                </div>

                {/* --- BILL TO --- */}
                <div className="px-10 py-8 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Billed To</p>
                  <h3 className="text-xl font-black text-slate-900 uppercase">{formData.custName}</h3>
                  <p className="text-base font-medium text-slate-700 mt-1">{formData.custAddress}</p>
                  <p className="text-base font-medium text-slate-700">Phone: {formData.custPhone}</p>
                </div>

                {/* --- ITEMS TABLE --- */}
                <div className="px-10 py-8 flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="py-3 px-4 uppercase text-xs font-bold w-12 text-center">#</th>
                        <th className="py-3 px-4 uppercase text-xs font-bold">Item Description</th>
                        <th className="py-3 px-4 uppercase text-xs font-bold text-center w-24">Qty</th>
                        <th className="py-3 px-4 uppercase text-xs font-bold text-right w-32">Rate (₹)</th>
                        <th className="py-3 px-4 uppercase text-xs font-bold text-right w-32">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800 font-medium border-b-2 border-slate-800">
                      {items.map((item, index) => {
                        const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                        return (
                          <tr key={item.id} className="border-b border-slate-200">
                            <td className="py-4 px-4 text-center">{index + 1}</td>
                            <td className="py-4 px-4 font-bold">{item.desc || '-'}</td>
                            <td className="py-4 px-4 text-center">{item.qty}</td>
                            <td className="py-4 px-4 text-right">{Number(item.rate).toFixed(2)}</td>
                            <td className="py-4 px-4 text-right font-bold">{amount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* --- TOTALS CALCULATION --- */}
                  <div className="flex justify-end mt-6">
                    <div className="w-80 space-y-3">
                      <div className="flex justify-between text-base font-bold text-slate-600">
                        <span>Subtotal:</span>
                        <span>₹ {calculations.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-slate-600 border-b border-slate-200 pb-3">
                        <span>Tax ({taxRate}%):</span>
                        <span>₹ {calculations.taxAmount}</span>
                      </div>
                      {Number(discount) > 0 && (
                        <div className="flex justify-between text-base font-bold text-emerald-600">
                          <span>Discount:</span>
                          <span>- ₹ {Number(discount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-2xl font-black text-slate-900 bg-emerald-100 p-4 rounded-lg mt-2">
                        <span>Total:</span>
                        <span>₹ {calculations.grandTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- FOOTER / SIGNATURES --- */}
                <div className="mt-auto pt-10 pb-10 px-10 flex justify-between items-end border-t-2 border-slate-100 bg-slate-50">
                  <div className="w-2/3">
                    <h4 className="font-bold text-sm text-slate-800 mb-1">Terms & Conditions</h4>
                    <p className="text-xs text-slate-500 font-medium">1. Please keep this receipt for your records.<br/>2. All disputes are subject to local jurisdiction.<br/>3. Thank you for your business!</p>
                  </div>
                  
                  <div className="w-48 text-center">
                    <div className="h-16 border-b-2 border-slate-800 mb-2 flex items-center justify-center">
                      <div className="w-20 h-20 border-2 border-emerald-700/30 rounded-full flex items-center justify-center text-[10px] text-emerald-800/40 font-bold -rotate-12 transform translate-y-4">
                        PAID SEAL
                      </div>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">Authorized Signatory</p>
                    <p className="text-xs text-slate-500 font-medium">{formData.bizName}</p>
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