'use client';
import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function MegaQRStudio() {
  // Navigation State
  const [qrType, setQrType] = useState('url'); // 'url', 'wifi', 'vcard', 'email', 'sms'
  
  // 1. URL / Text
  const [text, setText] = useState('https://pdfnexa.com');
  
  // 2. WiFi
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  
  // 3. VCard (Contact)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  
  // 4. Email 📧 (NEW)
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // 5. SMS 💬 (NEW)
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Customization (Colors & Logo)
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logo, setLogo] = useState<string | null>(null); // 🖼️ Logo State

  const qrRef = useRef<SVGSVGElement>(null);

  // Logo Upload Handler (Converts image to Base64 to prevent download issues)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Logic to generate the correct string based on type
  const getQRValue = () => {
    if (qrType === 'wifi') {
      return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
    }
    if (qrType === 'vcard') {
      return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nTEL:${phone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
    }
    if (qrType === 'email') {
      return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    }
    if (qrType === 'sms') {
      return `sms:${smsPhone}?body=${encodeURIComponent(smsMessage)}`;
    }
    return text; // Default URL or Text
  };

  // High-Quality Canvas Download Logic
  const downloadQR = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1024; // High Quality Export
      canvas.height = 1024;
      if (ctx) {
          // Fill Background
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Draw SVG
          ctx.drawImage(img, 0, 0, 1024, 1024);
      }
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `MegaQR_${Date.now()}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex flex-col items-center font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-blue-600 mb-2">Mega QR Studio</h1>
        <p className="text-slate-500">Generate Custom QR Codes with Logos Instantly 🚀</p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Controls & Forms */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          
          {/* Navigation Tabs (Scrollable on small screens) */}
          <div className="flex overflow-x-auto space-x-2 mb-6 bg-slate-100 p-1.5 rounded-xl hide-scrollbar">
            {[
              { id: 'url', icon: '🔗', label: 'Link / Text' },
              { id: 'wifi', icon: '📶', label: 'WiFi' },
              { id: 'vcard', icon: '👤', label: 'Contact' },
              { id: 'email', icon: '📧', label: 'Email' },
              { id: 'sms', icon: '💬', label: 'SMS' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setQrType(tab.id)}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${qrType === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                <span className="mr-1">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* DYNAMIC INPUTS SECTION */}
          <div className="space-y-4 mb-6 min-h-[220px]">
            {/* 1. URL / TEXT */}
            {qrType === 'url' && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-1">Enter URL or Text</label>
                <textarea 
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 bg-slate-50 transition-all"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* 2. WIFI */}
            {qrType === 'wifi' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Network Name (SSID)</label>
                  <input type="text" value={ssid} onChange={(e) => setSsid(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="My Home WiFi" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Secret123" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Security</label>
                    <select value={encryption} onChange={(e) => setEncryption(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. VCARD (CONTACT) */}
            {qrType === 'vcard' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@email.com" />
                  </div>
                </div>
              </div>
            )}

            {/* 4. EMAIL 📧 */}
            {qrType === 'email' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Send To (Email Address)</label>
                  <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="support@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                  <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Need Help with Order" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message Body</label>
                  <textarea rows={2} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Hello, I would like to..." />
                </div>
              </div>
            )}

            {/* 5. SMS 💬 */}
            {qrType === 'sms' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Text Message</label>
                  <textarea rows={3} value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Hi, I am interested in your services." />
                </div>
              </div>
            )}
          </div>

          <hr className="my-6 border-slate-200" />

          {/* CUSTOMIZATION: Colors & Logo */}
          <div>
            <h3 className="text-sm font-black text-slate-800 mb-4 tracking-wider flex items-center gap-2">
              🎨 DESIGN & CUSTOMIZATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Foreground Color */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 mb-2">QR Color</label>
                <div className="flex items-center space-x-2">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <span className="text-sm font-mono text-slate-600">{fgColor}</span>
                </div>
              </div>

              {/* Background Color */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 mb-2">Background</label>
                <div className="flex items-center space-x-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <span className="text-sm font-mono text-slate-600">{bgColor}</span>
                </div>
              </div>

              {/* Upload Logo 🖼️ */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
                <label className="block text-xs font-bold text-slate-500 mb-2">Center Logo</label>
                {logo ? (
                  <button onClick={() => setLogo(null)} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-200 transition">
                    Remove Logo 🗑️
                  </button>
                ) : (
                  <label className="cursor-pointer text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition text-center">
                    Upload Image 🖼️
                    <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoUpload} />
                  </label>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview & Download */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          
          <div className="bg-slate-100 rounded-3xl p-4 mb-6 shadow-inner relative group border border-slate-200">
             {/* The Actual QR Code Component */}
            <div className="p-4 bg-white rounded-2xl shadow-sm transition-all duration-300" style={{ backgroundColor: bgColor }}>
              <QRCodeSVG 
                value={getQRValue()} 
                size={260} 
                fgColor={fgColor}
                bgColor="transparent" 
                level="H" // Set to High Error Correction so logo doesn't break it
                includeMargin={false}
                ref={qrRef}
                imageSettings={logo ? {
                  src: logo,
                  height: 60,
                  width: 60,
                  excavate: true, // This cuts out the center for the logo!
                } : undefined}
              />
            </div>
          </div>

          <p className="text-sm font-medium text-slate-500 mb-8 text-center px-4">
            {qrType === 'wifi' ? "Scan to connect to WiFi instantly! 📱" : 
             qrType === 'vcard' ? "Scan to save to Phonebook! 📇" : 
             qrType === 'email' ? "Scan to draft Email automatically! 📧" : 
             qrType === 'sms' ? "Scan to open SMS! 💬" : 
             "Point your phone camera here to scan 📷"}
          </p>

          <button 
            onClick={downloadQR}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center space-x-2 text-lg"
          >
            <span>Download High-Res .PNG</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          
        </div>
      </div>
    </div>
  );
}