'use client';

import React, { useState } from 'react';
import { 
  MessageCircle, Copy, ExternalLink, QrCode, 
  RefreshCw, CheckCircle2, Smartphone, AlignLeft
} from 'lucide-react';

export default function WhatsAppLinkGenerator() {
  const [countryCode, setCountryCode] = useState('91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // --- LINK GENERATION LOGIC ---
  const cleanPhone = phoneNumber.replace(/\D/g, ''); // Removes any non-numeric characters
  
  const generatedLink = cleanPhone 
    ? `https://wa.me/${countryCode}${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`
    : '';

  const qrCodeUrl = generatedLink 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatedLink)}`
    : '';

  // --- HANDLERS ---
  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setCountryCode('91');
    setPhoneNumber('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4 shadow-sm">
            <MessageCircle size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">WhatsApp Direct Link Generator</h1>
          <p className="text-slate-500 font-medium">Create direct WhatsApp chat links and QR codes instantly, without saving numbers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- INPUT CONTROLS --- */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Smartphone className="text-green-600" size={20} /> Contact Details
            </h2>

            <div className="space-y-6">
              
              {/* Phone Input */}
              <div>
                <label className="block text-sm font-bold uppercase text-slate-500 tracking-widest mb-2">WhatsApp Number</label>
                <div className="flex gap-3">
                  <div className="relative w-1/3 md:w-1/4">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">+</span>
                    <input 
                      type="number"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full pl-7 pr-3 py-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-green-500 transition-all font-bold text-slate-800 text-lg"
                      placeholder="91"
                    />
                  </div>
                  <input 
                    type="number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-green-500 transition-all font-bold text-slate-800 text-lg placeholder:text-slate-300 placeholder:font-normal"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Pre-filled Message Input */}
              <div>
                <label className="block text-sm font-bold uppercase text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                  <AlignLeft size={16} /> Pre-filled Message (Optional)
                </label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-green-500 transition-all font-medium text-slate-800 resize-none placeholder:text-slate-300"
                  placeholder="e.g. Hello, I need to make an inquiry for Management Baba services..."
                />
                <p className="text-xs font-bold text-slate-400 mt-2 text-right">
                  {message.length} characters
                </p>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={18} /> Reset Fields
                </button>
              </div>

            </div>
          </div>

          {/* --- LIVE RESULT CARD --- */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className={`p-8 rounded-3xl border-2 shadow-lg flex-1 flex flex-col transition-all duration-300 ${cleanPhone ? 'bg-green-600 border-green-700 shadow-green-200' : 'bg-white border-slate-200'}`}>
              
              {!cleanPhone ? (
                <div className="text-slate-400 text-center flex-1 flex flex-col items-center justify-center">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold text-lg">Enter a phone number<br/>to generate your link</p>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-300 flex-1 flex flex-col">
                  <h3 className="text-green-200 font-bold uppercase tracking-widest text-xs mb-4 text-center">Your Custom Link is Ready</h3>
                  
                  {/* Generated Link Display */}
                  <div className="bg-green-700/50 p-4 rounded-2xl mb-6 border border-green-500/50 break-all">
                    <p className="text-white font-mono text-sm leading-relaxed">
                      {generatedLink}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-3 mt-auto">
                    <button 
                      onClick={handleCopy}
                      className="w-full py-4 bg-white text-green-700 rounded-xl font-black text-sm flex justify-center items-center gap-2 hover:bg-green-50 transition-colors shadow-md"
                    >
                      {isCopied ? <><CheckCircle2 size={18}/> COPIED TO CLIPBOARD!</> : <><Copy size={18}/> COPY LINK</>}
                    </button>
                    
                    <a 
                      href={generatedLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-green-800 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-green-900 transition-colors"
                    >
                      <ExternalLink size={18}/> TEST LINK
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* QR CODE SECTION */}
            {cleanPhone && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 animate-in slide-in-from-bottom-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shrink-0">
                  <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-24 h-24 rounded-lg" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 flex items-center gap-1"><QrCode size={16}/> Scan & Chat</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">Download or scan this QR code to open the chat directly on any device.</p>
                  <a 
                    href={qrCodeUrl} 
                    download="WhatsApp_QR.png" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-wide"
                  >
                    Open Image ↗
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}