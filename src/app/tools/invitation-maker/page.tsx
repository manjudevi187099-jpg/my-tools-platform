'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, CalendarHeart, Cake, Briefcase, Flower2, 
  Languages, Image as ImageIcon, MapPin, Clock, Calendar as CalIcon,
  Palette, Type
} from 'lucide-react';
import { toPng } from 'html-to-image';

// --- CONFIGURATION ---
const EVENT_TYPES = [
  { id: 'wedding', name: 'Wedding', icon: CalendarHeart, defaultColor: 'text-rose-700', bg: 'bg-rose-50' },
  { id: 'birthday', name: 'Birthday', icon: Cake, defaultColor: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'seminar', name: 'Seminar', icon: Briefcase, defaultColor: 'text-slate-800', bg: 'bg-slate-100' },
  { id: 'condolence', name: 'Condolence', icon: Flower2, defaultColor: 'text-stone-600', bg: 'bg-stone-100' },
];

const FONTS = [
  { name: 'Elegant (Serif)', class: 'font-serif' },
  { name: 'Modern (Sans)', class: 'font-sans' },
];

// Default Data Templates (Bilingual)
const DEFAULT_DATA = {
  english: {
    wedding: { title: 'You are invited to the wedding of', honoree: 'Rahul & Asmita', date: '24th November 2026', time: '7:00 PM Onwards', venue: 'The Grand Palace, Sector 62, Gurugram', message: 'Join us to celebrate our new beginning.', host: 'RSVP: Sharma Family' },
    birthday: { title: 'Join us for a Birthday Celebration!', honoree: 'Aarav turns 5', date: '15th August 2026', time: '5:00 PM - 8:00 PM', venue: 'FunZone Arena, New Delhi', message: 'There will be cake, games, and lots of fun!', host: 'Hosted by: Rahul & Neha' },
    seminar: { title: 'Annual Tech Leadership Summit', honoree: 'Future of AI in SaaS', date: '10th October 2026', time: '10:00 AM - 4:00 PM', venue: 'Cyber Hub Auditorium, Gurugram', message: 'Keynote speakers from top tech giants. Don\'t miss out!', host: 'Organized by: Dhamaka Enterprises' },
    condolence: { title: 'In Loving Memory Of', honoree: 'Late Sh. Ram Prasad Ji', date: 'Prayer Meeting: 12th May 2026', time: '4:00 PM - 5:00 PM', venue: 'Community Hall, Sector 15, Noida', message: 'With profound grief, we inform the sad demise of our beloved.', host: 'In Grief: Entire Family' }
  },
  hindi: {
    wedding: { title: 'आपको विवाह समारोह में सादर आमंत्रित किया जाता है', honoree: 'राहुल संग अस्मिता', date: '२४ नवंबर २०२६', time: 'शाम ७:०० बजे से', venue: 'द ग्रैंड पैलेस, सेक्टर ६२, गुरुग्राम', message: 'हमारे नए जीवन की शुरुआत में शामिल होकर हमें आशीर्वाद दें।', host: 'विनीत: शर्मा परिवार' },
    birthday: { title: 'जन्मदिन की पार्टी में आपका स्वागत है!', honoree: 'आरव का ५वां जन्मदिन', date: '१५ अगस्त २०२६', time: 'शाम ५:०० से ८:०० बजे तक', venue: 'फनज़ोन एरिना, नई दिल्ली', message: 'आइए, मिलकर जश्न मनाएं!', host: 'आयोजक: राहुल और नेहा' },
    seminar: { title: 'वार्षिक तकनीकी नेतृत्व शिखर सम्मेलन', honoree: 'SaaS में AI का भविष्य', date: '१० अक्टूबर २०२६', time: 'सुबह १०:०० से शाम ४:०० बजे तक', venue: 'साइबर हब ऑडिटोरियम, गुरुग्राम', message: 'तकनीकी जगत के दिग्गजों द्वारा मुख्य भाषण।', host: 'आयोजक: धमाका एंटरप्राइजेज' },
    condolence: { title: 'भावपूर्ण श्रद्धांजलि', honoree: 'स्व. श्री राम प्रसाद जी', date: 'प्रार्थना सभा: १२ मई २०२६', time: 'शाम ४:०० से ५:०० बजे तक', venue: 'सामुदायिक भवन, सेक्टर १५, नोएडा', message: 'अत्यंत दुःख के साथ सूचित करना पड़ रहा है कि हमारे पूजनीय पिताजी का स्वर्गवास हो गया है।', host: 'शोकाकुल: समस्त परिवार' }
  }
};

export default function InvitationMaker() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // States
  const [eventType, setEventType] = useState('wedding');
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');
  const [font, setFont] = useState(FONTS[0].class);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Form Data State
  const [formData, setFormData] = useState(DEFAULT_DATA.english.wedding);

  // Handle Event Type / Language Change
  const handleConfigChange = (type: string, lang: 'english' | 'hindi') => {
    setEventType(type);
    setLanguage(lang);
    setFormData(DEFAULT_DATA[lang][type as keyof typeof DEFAULT_DATA.english]);
    // Reset image if changing from condolence
    if (type !== 'condolence' && type !== 'wedding') setUploadedImage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const downloadCard = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      // 4x resolution for premium print quality
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 4, cacheBust: true });
      const link = document.createElement('a');
      link.download = `${eventType}_invitation_card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
    setIsDownloading(false);
  };

  // --- RENDER ENGINES ---
  const renderCardTemplate = () => {
    switch (eventType) {
      case 'wedding':
        return (
          <div className={`w-full h-full bg-[#fdfbf7] p-12 flex flex-col items-center text-center relative border-[16px] border-double border-rose-200 ${font}`}>
            <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-rose-300 m-4 rounded-tl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-rose-300 m-4 rounded-br-3xl"></div>
            
            {uploadedImage ? (
               <img src={uploadedImage} alt="Couple" className="w-32 h-32 rounded-full object-cover border-4 border-rose-200 mb-6 shadow-md" />
            ) : (
               <Flower2 className="w-16 h-16 text-rose-400 mb-8 mt-4" strokeWidth={1} />
            )}
            
            <p className="text-rose-800/80 font-semibold tracking-widest uppercase text-sm mb-6">{formData.title}</p>
            <h1 className="text-5xl font-bold text-rose-900 mb-8 leading-tight">{formData.honoree}</h1>
            
            <div className="w-24 border-b-2 border-rose-200 mb-8"></div>
            
            <div className="space-y-4 text-rose-900 mb-8">
              <p className="flex items-center justify-center gap-2 font-semibold"><CalIcon size={16}/> {formData.date}</p>
              <p className="flex items-center justify-center gap-2"><Clock size={16}/> {formData.time}</p>
              <p className="flex items-center justify-center gap-2"><MapPin size={16}/> {formData.venue}</p>
            </div>
            
            <p className="text-sm italic text-rose-700 max-w-md mx-auto leading-relaxed">{formData.message}</p>
            <p className="mt-auto pt-8 text-xs font-bold uppercase tracking-widest text-rose-800">{formData.host}</p>
          </div>
        );

      case 'birthday':
        return (
          <div className={`w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-12 flex flex-col items-center text-center relative overflow-hidden ${font}`}>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            
            <Cake className="w-20 h-20 text-indigo-600 mb-6 relative z-10" />
            <p className="text-indigo-600 font-black tracking-widest uppercase text-sm mb-4 relative z-10">{formData.title}</p>
            <h1 className="text-6xl font-black text-slate-800 mb-6 relative z-10 drop-shadow-sm">{formData.honoree}</h1>
            
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-md relative z-10 border border-white space-y-4">
              <div className="bg-indigo-50 p-3 rounded-xl flex items-center justify-center gap-3 text-indigo-900 font-bold">
                <CalIcon size={20}/> {formData.date}
              </div>
              <div className="bg-purple-50 p-3 rounded-xl flex items-center justify-center gap-3 text-purple-900 font-bold">
                <Clock size={20}/> {formData.time}
              </div>
              <div className="bg-pink-50 p-3 rounded-xl flex items-center justify-center gap-3 text-pink-900 font-bold">
                <MapPin size={20}/> {formData.venue}
              </div>
            </div>
            
            <p className="mt-8 text-lg font-bold text-slate-700 relative z-10">{formData.message}</p>
            <p className="mt-auto pt-6 text-sm font-black uppercase text-indigo-800 relative z-10">{formData.host}</p>
          </div>
        );

      case 'seminar':
        return (
          <div className={`w-full h-full bg-slate-900 text-white p-12 flex flex-col relative border-l-8 border-blue-500 ${font}`}>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/50 clip-path-polygon"></div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-16">
                <Briefcase className="w-16 h-16 text-blue-400" strokeWidth={1.5}/>
                <p className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-4 py-2 rounded-full">{formData.title}</p>
              </div>
              
              <h1 className="text-5xl font-black text-white mb-6 leading-tight max-w-lg">{formData.honoree}</h1>
              <p className="text-blue-300 text-lg mb-12 max-w-md leading-relaxed">{formData.message}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-6 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">Date & Time</p>
                  <p className="font-bold text-sm">{formData.date}</p>
                  <p className="font-bold text-sm text-blue-400">{formData.time}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">Venue</p>
                  <p className="font-bold text-sm">{formData.venue}</p>
                </div>
              </div>
              
              <p className="mt-8 text-xs font-bold text-slate-500 tracking-widest">{formData.host}</p>
            </div>
          </div>
        );

      case 'condolence':
        return (
          <div className={`w-full h-full bg-white p-12 flex flex-col items-center text-center relative border-[20px] border-stone-100 ${font}`}>
            <div className="w-full border-b border-stone-300 pb-6 mb-8 flex flex-col items-center">
              <p className="text-stone-500 font-bold tracking-widest uppercase text-sm">{formData.title}</p>
            </div>
            
            <div className="w-40 h-40 rounded-full border-4 border-stone-200 bg-stone-50 overflow-hidden mb-6 flex items-center justify-center shadow-inner">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Honoree" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-stone-300" />
              )}
            </div>
            
            <h1 className="text-4xl font-black text-stone-800 mb-4">{formData.honoree}</h1>
            <p className="text-stone-600 font-medium max-w-sm mx-auto leading-relaxed mb-10">{formData.message}</p>
            
            <div className="bg-stone-50 w-full p-6 rounded-xl border border-stone-200 space-y-3 text-stone-700">
              <p className="flex items-center justify-center gap-2 font-bold"><CalIcon size={18}/> {formData.date}</p>
              <p className="flex items-center justify-center gap-2 font-medium"><Clock size={18}/> {formData.time}</p>
              <p className="flex items-center justify-center gap-2 font-medium"><MapPin size={18}/> {formData.venue}</p>
            </div>
            
            <p className="mt-auto pt-8 text-sm font-bold text-stone-500">{formData.host}</p>
          </div>
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
          
          <div className="p-6 border-b border-slate-100 bg-white z-10 shrink-0 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Card Builder</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Digital Invitation Engine</p>
            </div>
            
            {/* Language Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button onClick={() => handleConfigChange(eventType, 'english')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === 'english' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>ENG</button>
              <button onClick={() => handleConfigChange(eventType, 'hindi')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === 'hindi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>हिंदी</button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-slate-50">
            
            {/* 1. Event Type Selection */}
            <section>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">1. Select Event Type</label>
              <div className="grid grid-cols-2 gap-3">
                {EVENT_TYPES.map(type => (
                  <button 
                    key={type.id} 
                    onClick={() => handleConfigChange(type.id, language)}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${eventType === type.id ? `border-indigo-600 bg-indigo-50 text-indigo-700` : `border-slate-200 bg-white text-slate-500 hover:border-indigo-300`}`}
                  >
                    <type.icon size={24} />
                    <span className="text-sm font-bold">{type.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Photo Upload (Only for Wedding & Condolence) */}
            {(eventType === 'condolence' || eventType === 'wedding') && (
              <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-3"><ImageIcon size={14}/> Add Photo (Optional)</label>
                 <label className={`w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed font-bold rounded-xl cursor-pointer transition-all ${uploadedImage ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-400'}`}>
                  {uploadedImage ? 'Photo Uploaded (Click to Change)' : 'Upload Portrait Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </section>
            )}

            {/* 3. Text Details Form */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2 border-b pb-2"><Type size={14}/> Event Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Header / Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} className="w-full text-sm font-semibold p-2.5 rounded-lg border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Main Name / Subject</label>
                  <input name="honoree" value={formData.honoree} onChange={handleInputChange} className="w-full text-lg font-black p-2.5 rounded-lg border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-900" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                    <input name="date" value={formData.date} onChange={handleInputChange} className="w-full text-sm font-semibold p-2.5 rounded-lg border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Time</label>
                    <input name="time" value={formData.time} onChange={handleInputChange} className="w-full text-sm font-semibold p-2.5 rounded-lg border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Venue / Location</label>
                  <input name="venue" value={formData.venue} onChange={handleInputChange} className="w-full text-sm font-semibold p-2.5 rounded-lg border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Message / Description</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows={3} className="w-full text-sm p-2.5 rounded-lg border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Footer / Hosted By</label>
                  <input name="host" value={formData.host} onChange={handleInputChange} className="w-full text-sm font-semibold p-2.5 rounded-lg border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </section>

          </div>

          <div className="p-6 bg-white border-t border-slate-100">
             <button onClick={downloadCard} disabled={isDownloading} className="w-full bg-slate-900 hover:bg-black transition-colors text-white py-4 rounded-xl font-black flex justify-center items-center gap-2 shadow-lg">
              {isDownloading ? <span className="animate-pulse">RENDERING HD CARD...</span> : <><Download size={20}/> EXPORT E-CARD (PNG)</>}
            </button>
          </div>
        </div>

        {/* --- RIGHT: LIVE PREVIEW CANVAS --- */}
        <div className="xl:col-span-7 flex justify-center items-center bg-slate-200/50 rounded-3xl p-4 md:p-10 border border-slate-200 min-h-[600px] relative overflow-hidden">
          
          <div className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm z-20">
            <Palette size={14}/> Live Canvas Rendering
          </div>

          {/* THE CARD CONTAINER (Fixed Aspect Ratio for standard mobile sharing 4:5 or 1:1 depending on design, here using a standard portrait layout) */}
          <div 
            ref={previewRef} 
            className="w-[500px] h-[700px] shadow-2xl transition-all duration-500 overflow-hidden"
          >
             {renderCardTemplate()}
          </div>

        </div>

      </div>
    </div>
  );
}