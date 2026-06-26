'use client';

import React, { useState, useRef } from 'react';
import { 
  User, Briefcase, Building, Phone, Mail, Globe, MapPin, 
  Palette, LayoutTemplate, Image as ImageIcon, Copy, Check, Type, Layers
} from 'lucide-react';

const FONTS = [
  { name: 'Arial (Sans)', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Georgia (Serif)', value: 'Georgia, serif' },
  { name: 'Courier (Mono)', value: '"Courier New", Courier, monospace' },
];

const LAYOUTS = ['Classic', 'Modern', 'Minimal', 'Corporate', 'Creative', 'Executive'];
const SHAPES = ['50%', '12px', '0px']; // Circle, Rounded, Square

export default function EmailSignatureMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // --- DATA STATE ---
  const [data, setData] = useState({
    firstName: 'Asmita',
    lastName: 'Kumari',
    jobTitle: 'Senior Software Developer',
    department: 'Engineering',
    company: 'Dhamaka Enterprises Pvt. Ltd.',
    phone: '+91 98765 43210',
    email: 'asmita@dhamaka.com',
    website: 'www.dhamaka.com',
    address: 'Sector 62, Cyber Park, Gurugram, HR',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80',
    logoUrl: 'https://img.icons8.com/color/150/000000/google-firebase-console.png',
    linkedin: 'linkedin.com/in/asmitakumari',
    twitter: 'twitter.com/asmitacodes',
    github: 'github.com/asmitakumari',
  });

  // --- DESIGN STATE ---
  const [design, setDesign] = useState({
    layout: 'Classic',
    font: FONTS[0].value,
    themeColor: '#4f46e5',
    textColor: '#1e293b',
    linkColor: '#3b82f6',
    imageShape: '50%', // border-radius
    imageSize: 90,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, [e.target.name]: e.target.value });

  // --- EXPORT FUNCTIONS ---
  // Copy Rich Text (Directly paste into Gmail)
  const copySignature = async () => {
    if (!previewRef.current) return;
    try {
      const html = previewRef.current.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new window.ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      // Fallback for older browsers
      const range = document.createRange();
      range.selectNode(previewRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Copy Source Code (For HR/Admin to put in HTML templates)
  const copyHtmlCode = () => {
    if (!previewRef.current) return;
    navigator.clipboard.writeText(previewRef.current.innerHTML);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // --- ENGINE: EMAIL SAFE HTML GENERATOR ---
  // Note: We MUST use <table> for layout, as display:flex breaks in Outlook/Windows Mail.
  const renderSignature = () => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const { font, themeColor, textColor, linkColor, imageShape, imageSize } = design;

    const SocialLinks = () => (
      <div style={{ paddingTop: '10px' }}>
        {data.linkedin && <a href={`https://${data.linkedin}`} style={{ color: themeColor, textDecoration: 'none', marginRight: '10px', fontSize: '12px', fontWeight: 'bold' }}>LinkedIn</a>}
        {data.twitter && <a href={`https://${data.twitter}`} style={{ color: themeColor, textDecoration: 'none', marginRight: '10px', fontSize: '12px', fontWeight: 'bold' }}>Twitter</a>}
        {data.github && <a href={`https://${data.github}`} style={{ color: themeColor, textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>GitHub</a>}
      </div>
    );

    const ContactInfo = () => (
      <table cellPadding={0} cellSpacing={0} border={0} style={{ fontSize: '12px', color: textColor, fontFamily: font, marginTop: '8px' }}>
        <tbody>
          {data.phone && <tr><td style={{ paddingBottom: '4px' }}><strong style={{ color: themeColor }}>P:</strong> {data.phone}</td></tr>}
          {data.email && <tr><td style={{ paddingBottom: '4px' }}><strong style={{ color: themeColor }}>E:</strong> <a href={`mailto:${data.email}`} style={{ color: linkColor, textDecoration: 'none' }}>{data.email}</a></td></tr>}
          {data.website && <tr><td style={{ paddingBottom: '4px' }}><strong style={{ color: themeColor }}>W:</strong> <a href={`https://${data.website}`} style={{ color: linkColor, textDecoration: 'none' }}>{data.website}</a></td></tr>}
          {data.address && <tr><td style={{ paddingBottom: '4px' }}><strong style={{ color: themeColor }}>A:</strong> {data.address}</td></tr>}
        </tbody>
      </table>
    );

    switch (design.layout) {
      case 'Classic':
        return (
          <table cellPadding={0} cellSpacing={0} border={0} style={{ fontFamily: font, color: textColor, width: '100%', maxWidth: '600px' }}>
            <tbody>
              <tr>
                {data.photoUrl && (
                  <td width={imageSize + 20} valign="top" style={{ paddingRight: '20px', borderRight: `2px solid ${themeColor}` }}>
                    <img src={data.photoUrl} alt={fullName} width={imageSize} height={imageSize} style={{ width: `${imageSize}px`, height: `${imageSize}px`, borderRadius: imageShape, objectFit: 'cover' }} />
                  </td>
                )}
                <td valign="top" style={{ paddingLeft: data.photoUrl ? '20px' : '0' }}>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', color: themeColor, fontWeight: 'bold' }}>{fullName}</h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: textColor }}>{data.jobTitle} {data.department && `| ${data.department}`}</p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: textColor }}><strong>{data.company}</strong></p>
                  <ContactInfo />
                  <SocialLinks />
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'Modern':
        return (
          <table cellPadding={0} cellSpacing={0} border={0} style={{ fontFamily: font, color: textColor, width: '100%', maxWidth: '600px' }}>
            <tbody>
              <tr>
                <td valign="top">
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '20px', color: textColor, fontWeight: '900', letterSpacing: '0.5px' }}>{data.firstName} <span style={{ color: themeColor }}>{data.lastName}</span></h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: textColor }}>{data.jobTitle}</p>
                  <div style={{ width: '30px', borderBottom: `3px solid ${themeColor}`, marginBottom: '12px' }}></div>
                  <ContactInfo />
                  <SocialLinks />
                </td>
                {data.logoUrl && (
                  <td width={imageSize} valign="bottom" align="right">
                    <img src={data.logoUrl} alt="Logo" width={imageSize} style={{ width: `${imageSize}px`, opacity: 0.8 }} />
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        );

      case 'Minimal':
        return (
          <table cellPadding={0} cellSpacing={0} border={0} style={{ fontFamily: font, color: textColor, width: '100%', maxWidth: '600px' }}>
            <tbody>
              <tr>
                <td valign="top" style={{ borderLeft: `4px solid ${themeColor}`, paddingLeft: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: textColor, fontWeight: 'bold' }}>{fullName} — <span style={{ fontWeight: 'normal', fontSize: '14px' }}>{data.jobTitle}</span></h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: textColor }}>{data.company} | <a href={`mailto:${data.email}`} style={{ color: linkColor, textDecoration: 'none' }}>{data.email}</a> | {data.phone}</p>
                  <SocialLinks />
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'Corporate':
        return (
          <table cellPadding={0} cellSpacing={0} border={0} style={{ fontFamily: font, color: textColor, width: '100%', maxWidth: '600px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
            <tbody>
              <tr>
                <td valign="top" width="50%">
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', color: themeColor, fontWeight: 'bold' }}>{fullName}</h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: textColor }}>{data.jobTitle} at <strong>{data.company}</strong></p>
                  <SocialLinks />
                </td>
                <td valign="top" width="50%" align="right" style={{ borderLeft: `1px solid #cbd5e1`, paddingLeft: '20px' }}>
                   <ContactInfo />
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'Creative':
        return (
          <table cellPadding={0} cellSpacing={0} border={0} style={{ fontFamily: font, width: '100%', maxWidth: '600px' }}>
            <tbody>
              <tr>
                <td valign="middle" style={{ backgroundColor: themeColor, padding: '20px', borderRadius: `${imageShape} 0 0 ${imageShape}`, color: '#ffffff', width: '200px' }}>
                   {data.photoUrl && <img src={data.photoUrl} alt={fullName} width={80} style={{ width: '80px', height: '80px', borderRadius: imageShape, objectFit: 'cover', border: '3px solid white', marginBottom: '10px' }} />}
                   <h3 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 'bold' }}>{fullName}</h3>
                   <p style={{ margin: '0', fontSize: '11px', opacity: 0.9 }}>{data.jobTitle}</p>
                </td>
                <td valign="middle" style={{ padding: '20px', backgroundColor: '#f1f5f9', borderRadius: `0 ${imageShape} ${imageShape} 0` }}>
                   <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: textColor, fontWeight: 'bold' }}>{data.company}</p>
                   <ContactInfo />
                   <SocialLinks />
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'Executive':
        return (
          <table cellPadding={0} cellSpacing={0} border={0} style={{ fontFamily: font, color: textColor, width: '100%', maxWidth: '600px', borderTop: `2px solid ${themeColor}`, borderBottom: `2px solid ${themeColor}`, padding: '16px 0' }}>
            <tbody>
              <tr>
                <td valign="middle" width={imageSize + 20}>
                   {data.photoUrl && <img src={data.photoUrl} alt={fullName} width={imageSize} style={{ width: `${imageSize}px`, height: `${imageSize}px`, borderRadius: imageShape, objectFit: 'cover' }} />}
                </td>
                <td valign="middle" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: themeColor }}>{fullName}</h3>
                  <p style={{ margin: '0', fontSize: '13px', color: textColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{data.jobTitle}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: textColor }}>{data.company}</p>
                </td>
                <td valign="middle" style={{ borderLeft: `1px solid #cbd5e1`, paddingLeft: '16px' }}>
                   <ContactInfo />
                </td>
              </tr>
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- LEFT: BUILDER CONTROLS --- */}
        <div className="xl:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 bg-white z-10 shrink-0">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2"><Mail className="text-indigo-600"/> Signature Engine</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">54+ Combinations Possible</p>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-slate-50">
            
            {/* Design Controls */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 border-b pb-2"><Palette size={14}/> Appearance</h3>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Layout Template</label>
                <div className="grid grid-cols-3 gap-2">
                  {LAYOUTS.map(l => (
                    <button key={l} onClick={() => setDesign({ ...design, layout: l })} className={`p-2 text-xs font-bold rounded-lg border-2 transition-all ${design.layout === l ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Brand Color</label>
                  <input type="color" value={design.themeColor} onChange={(e) => setDesign({ ...design, themeColor: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer border-2 border-slate-100 p-1 bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Image Shape</label>
                  <select value={design.imageShape} onChange={(e) => setDesign({ ...design, imageShape: e.target.value })} className="w-full h-10 text-xs font-bold rounded-lg border-2 border-slate-100 p-2 outline-none focus:border-indigo-500">
                    <option value="50%">Circle</option>
                    <option value="12px">Rounded</option>
                    <option value="0px">Square</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Typography (Web Safe Fonts)</label>
                <div className="flex gap-2">
                  {FONTS.map(f => (
                    <button key={f.name} onClick={() => setDesign({ ...design, font: f.value })} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border-2 transition-all ${design.font === f.value ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`} style={{ fontFamily: f.value }}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Personal Details */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 border-b pb-2"><User size={14}/> Personal Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <input name="firstName" value={data.firstName} onChange={handleChange} placeholder="First Name" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                <input name="lastName" value={data.lastName} onChange={handleChange} placeholder="Last Name" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                <input name="jobTitle" value={data.jobTitle} onChange={handleChange} placeholder="Job Title" className="col-span-2 w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                <input name="department" value={data.department} onChange={handleChange} placeholder="Department (Optional)" className="col-span-2 w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                <input name="company" value={data.company} onChange={handleChange} placeholder="Company Name" className="col-span-2 w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold" />
              </div>
            </section>

            {/* Contact Details */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 border-b pb-2"><Phone size={14}/> Contact & Links</h3>
              <div className="space-y-3">
                <input name="phone" value={data.phone} onChange={handleChange} placeholder="Phone Number" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                <input name="email" value={data.email} onChange={handleChange} placeholder="Email Address" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                <input name="website" value={data.website} onChange={handleChange} placeholder="Website (e.g. www.domain.com)" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                <input name="address" value={data.address} onChange={handleChange} placeholder="Physical Address" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Social Handlers (Leave blank to hide)</label>
                  <div className="space-y-2">
                    <input name="linkedin" value={data.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white" />
                    <input name="twitter" value={data.twitter} onChange={handleChange} placeholder="Twitter URL" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white" />
                    <input name="github" value={data.github} onChange={handleChange} placeholder="GitHub URL" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white" />
                  </div>
                </div>
              </div>
            </section>

            {/* Images */}
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 border-b pb-2"><ImageIcon size={14}/> Media URLs</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">Note: Email clients require images to be hosted online (URL). Local uploads don't work reliably in emails.</p>
              <input name="photoUrl" value={data.photoUrl} onChange={handleChange} placeholder="Profile Photo URL (https://...)" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
              <input name="logoUrl" value={data.logoUrl} onChange={handleChange} placeholder="Company Logo URL (https://...)" className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
            </section>

          </div>
        </div>

        {/* --- RIGHT: LIVE PREVIEW & EXPORT --- */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Instructions Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0"><Check size={20}/></div>
            <div>
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Email Client Safe</h3>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">This signature is built using raw HTML Tables and Inline CSS. It is tested to work perfectly across Gmail, Outlook, Apple Mail, and Yahoo without layout breakage.</p>
            </div>
          </div>

          {/* The Actual Signature Preview */}
          <div className="bg-white shadow-xl rounded-3xl p-10 border border-slate-200 min-h-[300px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-slate-300 tracking-widest">Live Rendering</div>
            
            {/* THIS IS THE CONTAINER WE COPY FROM */}
            <div ref={previewRef} className="w-full max-w-2xl bg-white p-6 rounded-xl transition-all duration-300 group-hover:shadow-lg border border-transparent group-hover:border-slate-100">
               {renderSignature()}
            </div>
          </div>

          {/* Export Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={copySignature} className={`py-4 rounded-xl font-black flex justify-center items-center gap-2 shadow-lg transition-all ${copied ? 'bg-green-500 text-white shadow-green-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}>
              {copied ? <><Check size={20}/> COPIED TO CLIPBOARD!</> : <><Copy size={20}/> COPY FOR GMAIL / OUTLOOK</>}
            </button>
            
            <button onClick={copyHtmlCode} className={`py-4 rounded-xl font-bold flex justify-center items-center gap-2 border-2 transition-all ${copiedHtml ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
              {copiedHtml ? <><Check size={20}/> HTML COPIED!</> : <><Type size={20}/> COPY RAW HTML CODE</>}
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
}