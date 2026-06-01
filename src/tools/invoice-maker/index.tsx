'use client';
import React, { useState, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// --- DATA TYPES ---
type Template = 'corporate' | 'modern' | 'minimal';
type Currency = '₹' | '$' | '€' | '£';

interface LineItem {
  id: string;
  name: string;
  desc: string;
  qty: number;
  price: number;
  taxPct: number;
  discountPct: number;
}

interface InvoiceData {
  template: Template;
  currency: Currency;
  logo: string | null;
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string; // GST/VAT No.
  };
  client: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
  };
  meta: {
    invoiceNo: string;
    date: string;
    dueDate: string;
    notes: string;
  };
  items: LineItem[];
}

const FLOW_STEPS = [
  'Setup & Business', 'Client Info', 'Add Products/Services', 'Preview & Download'
];

export default function InvoiceMaker() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Initial Dummy Data
  const [data, setData] = useState<InvoiceData>({
    template: 'corporate',
    currency: '₹',
    logo: null,
    business: {
      name: 'TechNova Solutions',
      address: 'Plot 45, Cyber Hub, Noida - 201301',
      phone: '+91 9876543210',
      email: 'billing@technova.in',
      taxId: 'GSTIN: 07AABCU9603R1ZM',
    },
    client: {
      name: 'Acme Corporation',
      address: '12th Floor, Tower B, Gurugram - 122002',
      phone: '+91 9988776655',
      email: 'accounts@acmecorp.com',
      taxId: 'GSTIN: 06BBAAC9876H1Z1',
    },
    meta: {
      invoiceNo: `INV-${new Date().getFullYear()}-001`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: 'Thank you for your business! Please process the payment within 15 days.',
    },
    items: [
      { id: '1', name: 'Web Development Services', desc: 'Frontend UI/UX using React & Next.js', qty: 1, price: 45000, taxPct: 18, discountPct: 0 },
      { id: '2', name: 'Cloud Hosting (1 Year)', desc: 'AWS Server Maintenance', qty: 1, price: 12000, taxPct: 18, discountPct: 10 },
    ]
  });

  const handleObjChange = (section: 'business' | 'client' | 'meta', field: string, value: string) => {
    setData({ ...data, [section]: { ...data[section], [field]: value } });
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setData({ ...data, logo: URL.createObjectURL(file) });
  };

  // --- ITEM MANAGEMENT ---
  const addItem = () => setData({ ...data, items: [...data.items, { id: Date.now().toString(), name: '', desc: '', qty: 1, price: 0, taxPct: 0, discountPct: 0 }] });
  const removeItem = (id: string) => setData({ ...data, items: data.items.filter(i => i.id !== id) });
  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setData({ ...data, items: data.items.map(i => i.id === id ? { ...i, [field]: value } : i) });
  };

  // --- AUTO MATH CALCULATIONS ---
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    
    data.items.forEach(item => {
      const lineTotal = item.qty * item.price;
      const lineDiscount = lineTotal * (item.discountPct / 100);
      const taxableAmount = lineTotal - lineDiscount;
      const lineTax = taxableAmount * (item.taxPct / 100);
      
      subtotal += lineTotal;
      totalDiscount += lineDiscount;
      totalTax += lineTax;
    });

    const grandTotal = subtotal - totalDiscount + totalTax;
    return { subtotal, totalDiscount, totalTax, grandTotal };
  }, [data.items]);

  // 🌟 OFF-SCREEN PDF ENGINE 🌟
  const generatePDF = async () => {
    if (!printRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const safeName = data.client.name ? data.client.name.replace(/\s+/g, '_') : 'Client';
      pdf.save(`Invoice_${data.meta.invoiceNo}_${safeName}.pdf`);
    } catch (error: any) {
      console.error("PDF Engine Crash:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${data.currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // --- TEMPLATES RENDERER ---
  const renderTemplate = () => {
    const { template, logo, business, client, meta, items } = data;

    switch(template) {
      case 'corporate':
        return (
          <div className="w-[794px] h-[1123px] bg-white text-slate-800 font-sans shadow-2xl p-12 box-border flex flex-col relative border-t-[16px] border-blue-900">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
              <div className="w-1/2">
                {logo ? <img src={logo} className="h-20 object-contain mb-4" /> : <div className="h-16 w-16 bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-400 mb-4 border border-dashed border-blue-300">LOGO</div>}
                <h1 className="text-2xl font-black text-blue-900 uppercase tracking-widest">{business.name}</h1>
                <p className="text-sm mt-1 text-slate-600 leading-relaxed w-3/4">{business.address}</p>
                <div className="text-sm mt-2 font-medium text-slate-500">
                  <p>{business.phone} | {business.email}</p>
                  <p>{business.taxId}</p>
                </div>
              </div>
              <div className="text-right w-1/2">
                <h2 className="text-5xl font-black text-slate-300 uppercase tracking-widest mb-4">Invoice</h2>
                <div className="space-y-1 text-sm font-bold text-slate-700">
                  <p className="text-lg text-blue-900 mb-2">{meta.invoiceNo}</p>
                  <p>Date: <span className="text-slate-500">{meta.date}</span></p>
                  <p>Due Date: <span className="text-slate-500">{meta.dueDate}</span></p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-10 bg-slate-50 p-6 rounded-lg border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Billed To</h3>
              <h2 className="text-xl font-bold text-slate-800">{client.name}</h2>
              <p className="text-sm text-slate-600 mt-1 w-1/2">{client.address}</p>
              <div className="text-sm mt-2 text-slate-600">
                 <p>{client.phone} | {client.email}</p>
                 <p className="font-bold text-slate-700 mt-1">{client.taxId}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8 border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white text-xs uppercase tracking-wider text-left">
                  <th className="p-3 w-1/2">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Tax/Disc</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const lineTotal = item.qty * item.price;
                  const discount = lineTotal * (item.discountPct / 100);
                  const taxable = lineTotal - discount;
                  const tax = taxable * (item.taxPct / 100);
                  const net = taxable + tax;
                  
                  return (
                    <tr key={item.id} className="border-b border-slate-200 text-sm">
                      <td className="p-3 py-4">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
                      </td>
                      <td className="p-3 py-4 text-center font-bold text-slate-600">{item.qty}</td>
                      <td className="p-3 py-4 text-right">{formatCurrency(item.price)}</td>
                      <td className="p-3 py-4 text-right text-xs text-slate-500">
                        {item.taxPct > 0 && <p>Tax: {item.taxPct}%</p>}
                        {item.discountPct > 0 && <p className="text-emerald-600">Disc: {item.discountPct}%</p>}
                      </td>
                      <td className="p-3 py-4 text-right font-bold text-slate-800">{formatCurrency(net)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Calculations */}
            <div className="flex justify-end mb-10">
              <div className="w-[350px] space-y-3 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal:</span> <span>{formatCurrency(totals.subtotal)}</span></div>
                {totals.totalDiscount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount:</span> <span>-{formatCurrency(totals.totalDiscount)}</span></div>}
                {totals.totalTax > 0 && <div className="flex justify-between text-slate-600"><span>Tax Amount:</span> <span>+{formatCurrency(totals.totalTax)}</span></div>}
                <div className="border-t-2 border-slate-900 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-xl font-black text-blue-900">Total:</span> 
                  <span className="text-2xl font-black text-blue-900">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Notes & Terms:</h4>
              <p className="text-xs text-slate-500 leading-relaxed w-3/4">{meta.notes}</p>
            </div>
          </div>
        );

      case 'modern':
        return (
          <div className="w-[794px] h-[1123px] bg-slate-900 text-white font-sans shadow-2xl p-0 box-border flex flex-col relative">
             <div className="p-12 flex justify-between items-start border-b border-slate-800">
                <div>
                   {logo && <img src={logo} className="h-16 object-contain mb-6 bg-white p-1 rounded" />}
                   <h1 className="text-3xl font-black text-emerald-400 uppercase tracking-widest">{business.name}</h1>
                   <p className="text-sm text-slate-400 mt-2 w-2/3">{business.address}</p>
                   <p className="text-xs font-bold text-emerald-500 mt-2">{business.phone} | {business.email}</p>
                   <p className="text-xs font-bold text-slate-500">{business.taxId}</p>
                </div>
                <div className="text-right">
                   <h2 className="text-5xl font-black text-white opacity-20 uppercase tracking-widest mb-4">Invoice</h2>
                   <p className="text-xl font-bold text-emerald-400 mb-1">{meta.invoiceNo}</p>
                   <p className="text-sm text-slate-400">Date: {meta.date}</p>
                   <p className="text-sm text-slate-400">Due: {meta.dueDate}</p>
                </div>
             </div>

             <div className="bg-slate-800 p-10 flex">
                <div className="w-1/2">
                   <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Invoice To:</h3>
                   <h2 className="text-xl font-bold">{client.name}</h2>
                   <p className="text-sm text-slate-400 mt-1 w-3/4">{client.address}</p>
                   <p className="text-sm text-slate-300 mt-2">{client.phone} | {client.email}</p>
                   <p className="text-xs font-bold text-slate-500 mt-1">{client.taxId}</p>
                </div>
                <div className="w-1/2 flex items-center justify-end">
                   <div className="text-right">
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Amount Due</p>
                     <p className="text-4xl font-black text-emerald-400">{formatCurrency(totals.grandTotal)}</p>
                   </div>
                </div>
             </div>

             <div className="p-12 flex-1">
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-emerald-500 text-slate-300 text-xs uppercase tracking-wider text-left">
                      <th className="pb-4 w-1/2">Item Description</th>
                      <th className="pb-4 text-center">Qty</th>
                      <th className="pb-4 text-right">Price</th>
                      <th className="pb-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const net = (item.qty * item.price) * (1 - item.discountPct/100) * (1 + item.taxPct/100);
                      return (
                        <tr key={item.id} className="border-b border-slate-800 text-sm">
                          <td className="py-4">
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
                          </td>
                          <td className="py-4 text-center text-slate-400">{item.qty}</td>
                          <td className="py-4 text-right text-slate-400">{formatCurrency(item.price)}</td>
                          <td className="py-4 text-right font-bold text-emerald-400">{formatCurrency(net)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div className="flex justify-end mb-10">
                  <div className="w-[300px] space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400"><span>Subtotal:</span> <span>{formatCurrency(totals.subtotal)}</span></div>
                    {totals.totalDiscount > 0 && <div className="flex justify-between text-red-400"><span>Discount:</span> <span>-{formatCurrency(totals.totalDiscount)}</span></div>}
                    {totals.totalTax > 0 && <div className="flex justify-between text-slate-400"><span>Tax:</span> <span>+{formatCurrency(totals.totalTax)}</span></div>}
                    <div className="border-t border-emerald-500 pt-3 mt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Grand Total:</span> 
                      <span className="text-xl font-black text-emerald-400">{formatCurrency(totals.grandTotal)}</span>
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-emerald-900 p-8 text-center text-xs text-emerald-200">
               <p className="font-bold mb-1">Notes</p>
               <p>{meta.notes}</p>
             </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="w-[794px] h-[1123px] bg-white text-gray-900 font-serif shadow-2xl p-16 box-border flex flex-col relative border border-gray-200">
             <div className="text-center border-b border-gray-300 pb-8 mb-10">
                {logo && <img src={logo} className="h-16 mx-auto mb-4 object-contain grayscale" />}
                <h1 className="text-3xl font-black tracking-widest uppercase mb-2">{business.name}</h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{business.address}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{business.phone} | {business.email}</p>
             </div>

             <div className="flex justify-between mb-12 text-sm">
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-gray-400 mb-2">Billed To:</h3>
                  <p className="font-black text-lg">{client.name}</p>
                  <p className="text-gray-600 mt-1 w-2/3">{client.address}</p>
                  <p className="text-gray-600 mt-1 font-sans font-bold">{client.taxId}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold uppercase tracking-widest text-gray-400 mb-2">Invoice Details:</h3>
                  <p><strong>No:</strong> {meta.invoiceNo}</p>
                  <p><strong>Date:</strong> {meta.date}</p>
                  <p><strong>Due:</strong> {meta.dueDate}</p>
                </div>
             </div>

             <table className="w-full mb-10 border-t border-b border-gray-900">
               <thead>
                 <tr className="text-xs uppercase tracking-widest text-left">
                   <th className="py-4 w-1/2">Item</th>
                   <th className="py-4 text-center">Qty</th>
                   <th className="py-4 text-right">Price</th>
                   <th className="py-4 text-right">Total</th>
                 </tr>
               </thead>
               <tbody>
                 {items.map((item) => {
                   const net = (item.qty * item.price) * (1 - item.discountPct/100) * (1 + item.taxPct/100);
                   return (
                     <tr key={item.id} className="border-b border-gray-200 text-sm">
                       <td className="py-4">
                         <p className="font-bold">{item.name}</p>
                         <p className="text-gray-500 text-xs mt-1 font-sans">{item.desc}</p>
                       </td>
                       <td className="py-4 text-center font-sans">{item.qty}</td>
                       <td className="py-4 text-right font-sans">{formatCurrency(item.price)}</td>
                       <td className="py-4 text-right font-bold font-sans">{formatCurrency(net)}</td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>

             <div className="flex justify-end mb-12">
               <div className="w-[250px] space-y-2 text-sm font-sans">
                 <div className="flex justify-between text-gray-600"><span>Subtotal:</span> <span>{formatCurrency(totals.subtotal)}</span></div>
                 {totals.totalDiscount > 0 && <div className="flex justify-between text-gray-600"><span>Discount:</span> <span>-{formatCurrency(totals.totalDiscount)}</span></div>}
                 {totals.totalTax > 0 && <div className="flex justify-between text-gray-600"><span>Tax:</span> <span>+{formatCurrency(totals.totalTax)}</span></div>}
                 <div className="border-t border-gray-900 pt-2 mt-2 flex justify-between items-center">
                   <span className="font-bold uppercase tracking-widest text-xs">Total Due:</span> 
                   <span className="text-xl font-black">{formatCurrency(totals.grandTotal)}</span>
                 </div>
               </div>
             </div>

             <div className="mt-auto pt-8">
                <p className="font-bold text-xs uppercase tracking-widest mb-2 text-gray-400">Notes</p>
                <p className="text-sm text-gray-600 italic">{meta.notes}</p>
             </div>
          </div>
        );
        
      default: return <div></div>;
    }
  };

  // --- FORM RENDERER ---
  const renderFormStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-8 animate-in fade-in">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-6">1. Setup & Template</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Currency</label>
                  <select value={data.currency} onChange={(e) => setData({...data, currency: e.target.value as Currency})} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500">
                    <option value="₹">₹ INR (Rupee)</option>
                    <option value="$">$ USD (Dollar)</option>
                    <option value="€">€ EUR (Euro)</option>
                    <option value="£">£ GBP (Pound)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {id:'corporate', name:'🏢 Corporate', desc:'Professional Blue'}, 
                  {id:'modern', name:'🌌 Modern Dark', desc:'Tech Dark Mode'}, 
                  {id:'minimal', name:'📄 Minimal Print', desc:'Clean B&W'}
                ].map(t => (
                  <button key={t.id} onClick={() => setData({...data, template: t.id as Template})} className={`p-4 rounded-xl border-2 text-left transition-all ${data.template === t.id ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="font-black text-lg text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">2. Business Details</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center relative hover:border-blue-400 bg-slate-50 transition-colors">
                   {data.logo ? <img src={data.logo} className="h-16 object-contain mb-2" /> : <span className="text-3xl mb-2">🏢</span>}
                   <p className="font-bold text-slate-600 text-sm">{data.logo ? 'Change Logo' : 'Upload Business Logo'}</p>
                   <input type="file" accept="image/*" onChange={handleLogo} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 </div>
                 <div className="col-span-2 md:col-span-1"><input placeholder="Business Name" value={data.business.name} onChange={e => handleObjChange('business', 'name', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-2 md:col-span-1"><input placeholder="GSTIN / Tax ID" value={data.business.taxId} onChange={e => handleObjChange('business', 'taxId', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-2 md:col-span-1"><input placeholder="Phone Number" value={data.business.phone} onChange={e => handleObjChange('business', 'phone', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-2 md:col-span-1"><input placeholder="Email Address" value={data.business.email} onChange={e => handleObjChange('business', 'email', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-2"><textarea placeholder="Full Address" value={data.business.address} onChange={e => handleObjChange('business', 'address', e.target.value)} rows={2} className="w-full p-3 border rounded-xl font-medium bg-slate-50 outline-none focus:border-blue-500 resize-none" /></div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-6">Client Info</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 md:col-span-1"><input placeholder="Client / Company Name" value={data.client.name} onChange={e => handleObjChange('client', 'name', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-2 md:col-span-1"><input placeholder="Client GSTIN / Tax ID" value={data.client.taxId} onChange={e => handleObjChange('client', 'taxId', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-2 md:col-span-1"><input placeholder="Phone Number" value={data.client.phone} onChange={e => handleObjChange('client', 'phone', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-2 md:col-span-1"><input placeholder="Email Address" value={data.client.email} onChange={e => handleObjChange('client', 'email', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-2"><textarea placeholder="Client Address" value={data.client.address} onChange={e => handleObjChange('client', 'address', e.target.value)} rows={2} className="w-full p-3 border rounded-xl font-medium bg-slate-50 outline-none focus:border-blue-500 resize-none" /></div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">Invoice Metadata</h3>
              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-3 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Invoice No</label><input type="text" value={data.meta.invoiceNo} onChange={e => handleObjChange('meta', 'invoiceNo', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-3 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Invoice Date</label><input type="text" value={data.meta.date} onChange={e => handleObjChange('meta', 'date', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500" /></div>
                 <div className="col-span-3 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Due Date</label><input type="text" value={data.meta.dueDate} onChange={e => handleObjChange('meta', 'dueDate', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none focus:border-blue-500" /></div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-2xl font-black text-slate-800">Add Items</h3>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-500">Live Total: </span>
                <span className="text-2xl font-black text-blue-600">{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>

            <div className="space-y-4">
              {data.items.map((item, index) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => removeItem(item.id)} className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-lg p-2 flex items-center justify-center font-bold text-xs transition-colors">🗑️ Remove</button>
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Item {index + 1}</span>
                  
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-6 space-y-2">
                       <input placeholder="Item Name / Service" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="w-full p-2 border rounded font-bold outline-none focus:border-blue-500" />
                       <input placeholder="Description (Optional)" value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} className="w-full p-2 border rounded text-sm font-medium outline-none focus:border-blue-500" />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Qty</label>
                       <input type="number" min="1" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} className="w-full p-2 border rounded font-bold outline-none focus:border-blue-500" />
                    </div>
                    <div className="col-span-6 md:col-span-4">
                       <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Unit Price ({data.currency})</label>
                       <input type="number" min="0" value={item.price} onChange={e => updateItem(item.id, 'price', Number(e.target.value))} className="w-full p-2 border rounded font-bold outline-none focus:border-blue-500" />
                    </div>
                    <div className="col-span-6 md:col-span-6">
                       <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Discount (%)</label>
                       <input type="number" min="0" max="100" value={item.discountPct} onChange={e => updateItem(item.id, 'discountPct', Number(e.target.value))} className="w-full p-2 border rounded text-emerald-600 font-bold outline-none focus:border-blue-500" />
                    </div>
                    <div className="col-span-6 md:col-span-6">
                       <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tax / GST (%)</label>
                       <input type="number" min="0" max="100" value={item.taxPct} onChange={e => updateItem(item.id, 'taxPct', Number(e.target.value))} className="w-full p-2 border rounded text-red-600 font-bold outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={addItem} className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 font-black tracking-widest uppercase rounded-xl hover:bg-blue-50 transition-colors">+ Add New Item</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <span className="text-6xl block mb-4">🧾</span>
            <h3 className="text-3xl font-black text-slate-800">Review & Export</h3>
            <p className="text-slate-500 font-medium">Your Invoice is calculated and ready. Please review the live preview on the right.</p>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Terms, Conditions & Notes</label>
              <textarea value={data.meta.notes} onChange={e => handleObjChange('meta', 'notes', e.target.value)} rows={3} className="w-full p-3 border rounded-xl font-medium bg-white outline-none focus:border-blue-500 resize-none" />
            </div>

            <button onClick={generatePDF} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 mt-6 flex justify-center items-center gap-2">
              {isProcessing ? 'Generating PDF...' : '📥 Download HD Invoice PDF'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Invoice Maker</h2>
        <p className="text-slate-500 mt-2 text-lg">Generate professional, auto-calculated invoices with Taxes & Discounts instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col min-h-[680px]">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Step {step + 1} of {FLOW_STEPS.length}</span>
              <span className="text-xs font-bold text-slate-400">{FLOW_STEPS[step]}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((step + 1) / FLOW_STEPS.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
            {renderFormStep()}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between gap-4 mt-auto">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={`px-6 py-3 rounded-xl font-bold transition-colors ${step === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Back</button>
            <button onClick={() => setStep(Math.min(FLOW_STEPS.length - 1, step + 1))} disabled={step === FLOW_STEPS.length - 1} className={`px-8 py-3 rounded-xl font-bold shadow-md transition-transform ${step === FLOW_STEPS.length - 1 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1'}`}>Next Step</button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE A4 PREVIEW */}
        <div className="lg:col-span-7 bg-slate-100 rounded-3xl border border-slate-200 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[680px] relative">
           <span className="absolute top-4 left-6 bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200 z-10 shadow-sm">
              Live Preview
           </span>
           <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
              <div className="origin-top scale-[0.45] sm:scale-[0.5] md:scale-[0.55] lg:scale-[0.55] xl:scale-[0.65] transition-all duration-300 flex-shrink-0" style={{ width: '794px', height: '1123px' }}>
                 <div ref={previewRef} className="w-full h-full shadow-2xl overflow-hidden">
                    {renderTemplate()}
                 </div>
              </div>
           </div>
        </div>

        {/* 🌟 HIDDEN OFF-SCREEN RENDERER FOR HD PDF DOWNLOAD 🌟 */}
        <div className="absolute top-[-9999px] left-[-9999px]">
           <div ref={printRef} className="w-[794px] h-[1123px] bg-white">
              {renderTemplate()}
           </div>
        </div>

      </div>
    </div>
  );
}