'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// --- DATA TYPES ---
type Template = 'traditional' | 'modern' | 'royal' | 'minimal';

interface BiodataData {
  template: Template;
  photo: string | null;
  personal: {
    name: string;
    dob: string;
    tob: string; // Time of birth
    pob: string; // Place of birth
    height: string;
    religion: string;
    caste: string;
    gotra: string;
    manglik: string;
  };
  education: {
    degree: string;
    profession: string;
    income: string;
  };
  family: {
    fatherName: string;
    fatherStatus: string;
    motherName: string;
    motherStatus: string;
    brothers: string;
    sisters: string;
    nativePlace: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

const FLOW_STEPS = [
  'Template', 'Name & Photo', 'Personal Info', 'Education & Work', 'Family Details', 'Contact', 'Download'
];

export default function BiodataMaker() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs for Preview and Hidden Print
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Initial Dummy Data
  const [data, setData] = useState<BiodataData>({
    template: 'traditional',
    photo: null,
    personal: {
      name: 'Rohan Sharma',
      dob: '25 October 1995',
      tob: '10:30 AM',
      pob: 'New Delhi, India',
      height: '5 ft 10 in (178 cm)',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Bharadwaj',
      manglik: 'No',
    },
    education: {
      degree: 'B.Tech in Computer Science, IIT Delhi',
      profession: 'Software Engineer at Google India',
      income: '24 LPA',
    },
    family: {
      fatherName: 'Mr. Ramesh Sharma',
      fatherStatus: 'Govt. Employee (Retired)',
      motherName: 'Mrs. Sunita Sharma',
      motherStatus: 'Homemaker',
      brothers: '1 Elder Brother (Married)',
      sisters: '1 Younger Sister',
      nativePlace: 'Jaipur, Rajasthan',
    },
    contact: {
      phone: '+91 9876543210',
      email: 'rohan.sharma@example.com',
      address: 'Sector 15, Rohini, New Delhi - 110085',
    }
  });

  const handlePersonal = (field: string, value: string) => setData({ ...data, personal: { ...data.personal, [field]: value } });
  const handleEdu = (field: string, value: string) => setData({ ...data, education: { ...data.education, [field]: value } });
  const handleFamily = (field: string, value: string) => setData({ ...data, family: { ...data.family, [field]: value } });
  const handleContact = (field: string, value: string) => setData({ ...data, contact: { ...data.contact, [field]: value } });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setData({ ...data, photo: URL.createObjectURL(file) });
  };

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
      
      const safeName = data.personal.name ? data.personal.name.replace(/\s+/g, '_') : 'Biodata';
      pdf.save(`${safeName}_Biodata.pdf`);
    } catch (error: any) {
      console.error("PDF Engine Crash:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- TEMPLATES RENDERER ---
  const renderTemplate = () => {
    const { template, photo, personal, education, family, contact } = data;

    const Row = ({ label, value }: { label: string, value: string }) => (
      <div className="flex mb-3 text-lg leading-relaxed">
        <div className="w-1/3 font-bold">{label}</div>
        <div className="w-8 text-center">:</div>
        <div className="w-2/3 font-medium">{value}</div>
      </div>
    );

    switch(template) {
      case 'traditional':
        return (
          <div className="w-[794px] h-[1123px] bg-[#fffdf5] text-[#5c1c1c] font-serif shadow-2xl p-12 box-border border-[16px] border-double border-[#8b0000] relative flex flex-col">
            <div className="text-center mb-6">
              <span className="text-4xl text-[#8b0000]">🕉️</span>
              <h1 className="text-5xl font-black uppercase mt-4 mb-2 tracking-widest border-b-2 border-[#8b0000] pb-2 inline-block">Biodata</h1>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="w-36 h-40 border-4 border-[#8b0000] p-1 bg-white shadow-lg">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-50 flex items-center justify-center text-sm font-bold text-orange-200">PHOTO</div>}
              </div>
            </div>

            <div className="flex-1 space-y-6 px-8">
              <div>
                <h2 className="text-2xl font-bold bg-[#8b0000] text-white px-4 py-1 mb-4 uppercase tracking-wider text-center">Personal Details</h2>
                <Row label="Full Name" value={personal.name} />
                <Row label="Date of Birth" value={personal.dob} />
                <Row label="Time & Place" value={`${personal.tob}, ${personal.pob}`} />
                <Row label="Height" value={personal.height} />
                <Row label="Religion/Caste" value={`${personal.religion}, ${personal.caste}`} />
                <Row label="Gotra" value={personal.gotra} />
                <Row label="Manglik" value={personal.manglik} />
              </div>

              <div>
                <h2 className="text-2xl font-bold bg-[#8b0000] text-white px-4 py-1 mb-4 uppercase tracking-wider text-center">Education & Profession</h2>
                <Row label="Education" value={education.degree} />
                <Row label="Profession" value={education.profession} />
                <Row label="Annual Income" value={education.income} />
              </div>

              <div>
                <h2 className="text-2xl font-bold bg-[#8b0000] text-white px-4 py-1 mb-4 uppercase tracking-wider text-center">Family Details</h2>
                <Row label="Father's Name" value={`${family.fatherName} (${family.fatherStatus})`} />
                <Row label="Mother's Name" value={`${family.motherName} (${family.motherStatus})`} />
                <Row label="Siblings" value={`${family.brothers}, ${family.sisters}`} />
                <Row label="Native Place" value={family.nativePlace} />
              </div>

              <div>
                <h2 className="text-2xl font-bold bg-[#8b0000] text-white px-4 py-1 mb-4 uppercase tracking-wider text-center">Contact Details</h2>
                <Row label="Contact No." value={contact.phone} />
                <Row label="Email" value={contact.email} />
                <Row label="Address" value={contact.address} />
              </div>
            </div>
          </div>
        );

      case 'modern':
        return (
          <div className="w-[794px] h-[1123px] bg-white text-slate-800 font-sans shadow-2xl flex box-border border border-slate-200">
            <div className="w-[35%] bg-blue-900 text-white p-10 flex flex-col items-center border-r-4 border-blue-600">
              <div className="w-48 h-48 rounded-full border-4 border-white overflow-hidden shadow-xl mb-8">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-800"></div>}
              </div>
              
              <h2 className="text-3xl font-black text-center mb-8 uppercase leading-tight tracking-wider">{personal.name}</h2>
              
              <div className="w-full space-y-8">
                <div>
                  <h3 className="text-blue-300 font-bold uppercase tracking-widest text-sm mb-3 border-b border-blue-700 pb-1">Contact Info</h3>
                  <div className="text-sm space-y-3 font-medium">
                    <p>📞 {contact.phone}</p>
                    <p>✉️ {contact.email}</p>
                    <p>📍 {contact.address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-blue-300 font-bold uppercase tracking-widest text-sm mb-3 border-b border-blue-700 pb-1">Astrological</h3>
                  <div className="text-sm space-y-2 font-medium">
                    <p>Religion: {personal.religion}</p>
                    <p>Caste: {personal.caste}</p>
                    <p>Gotra: {personal.gotra}</p>
                    <p>Manglik: {personal.manglik}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[65%] p-10 space-y-10">
              <div className="text-center bg-blue-50 py-4 rounded-xl border border-blue-100 mb-8">
                <h1 className="text-4xl font-black text-blue-900 tracking-widest uppercase">Marriage Biodata</h1>
              </div>

              <div>
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-200 pb-2 mb-6">Personal Details</h3>
                <div className="space-y-4 text-slate-700">
                  <div className="grid grid-cols-2"><span className="font-bold">Date of Birth:</span> <span>{personal.dob}</span></div>
                  <div className="grid grid-cols-2"><span className="font-bold">Time of Birth:</span> <span>{personal.tob}</span></div>
                  <div className="grid grid-cols-2"><span className="font-bold">Place of Birth:</span> <span>{personal.pob}</span></div>
                  <div className="grid grid-cols-2"><span className="font-bold">Height:</span> <span>{personal.height}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-200 pb-2 mb-6">Career & Education</h3>
                <div className="space-y-4 text-slate-700">
                  <div className="grid grid-cols-3"><span className="font-bold col-span-1">Education:</span> <span className="col-span-2">{education.degree}</span></div>
                  <div className="grid grid-cols-3"><span className="font-bold col-span-1">Profession:</span> <span className="col-span-2">{education.profession}</span></div>
                  <div className="grid grid-cols-3"><span className="font-bold col-span-1">Income:</span> <span className="col-span-2">{education.income}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-200 pb-2 mb-6">Family Background</h3>
                <div className="space-y-4 text-slate-700">
                  <div className="grid grid-cols-3"><span className="font-bold col-span-1">Father:</span> <span className="col-span-2">{family.fatherName} ({family.fatherStatus})</span></div>
                  <div className="grid grid-cols-3"><span className="font-bold col-span-1">Mother:</span> <span className="col-span-2">{family.motherName} ({family.motherStatus})</span></div>
                  <div className="grid grid-cols-3"><span className="font-bold col-span-1">Siblings:</span> <span className="col-span-2">{family.brothers}, {family.sisters}</span></div>
                  <div className="grid grid-cols-3"><span className="font-bold col-span-1">Native Place:</span> <span className="col-span-2">{family.nativePlace}</span></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'royal':
        return (
          <div className="w-[794px] h-[1123px] bg-white text-[#1a3622] font-serif shadow-2xl p-12 box-border relative flex flex-col border-[20px] border-[#1a3622]">
            <div className="absolute inset-4 border-2 border-dashed border-[#d4af37]"></div>
            
            <div className="relative z-10 flex flex-col items-center h-full">
              <h1 className="text-5xl font-black uppercase text-[#d4af37] tracking-widest mb-6 border-b-4 border-[#d4af37] pb-2 text-center bg-[#1a3622] px-8 py-2 w-full">Biodata</h1>
              
              <div className="flex justify-center mb-8 w-full">
                <div className="w-36 h-36 rounded-full border-[6px] border-[#d4af37] overflow-hidden shadow-xl p-1">
                  {photo ? <img src={photo} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-[#f4f0e6] rounded-full"></div>}
                </div>
              </div>

              <h2 className="text-4xl font-black uppercase tracking-wider mb-8 border-b-2 border-[#1a3622] inline-block pb-1">{personal.name}</h2>

              <div className="w-full px-8 space-y-6">
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="font-bold">Date of Birth</div><div>: {personal.dob}</div>
                  <div className="font-bold">Time & Place</div><div>: {personal.tob}, {personal.pob}</div>
                  <div className="font-bold">Height</div><div>: {personal.height}</div>
                  <div className="font-bold">Religion & Caste</div><div>: {personal.religion}, {personal.caste}</div>
                  <div className="font-bold">Gotra & Manglik</div><div>: {personal.gotra} | Manglik: {personal.manglik}</div>
                </div>

                <div className="w-full h-px bg-[#d4af37] my-4"></div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="font-bold">Education</div><div>: {education.degree}</div>
                  <div className="font-bold">Occupation</div><div>: {education.profession}</div>
                  <div className="font-bold">Annual Income</div><div>: {education.income}</div>
                </div>

                <div className="w-full h-px bg-[#d4af37] my-4"></div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="font-bold">Father's Name</div><div>: {family.fatherName} ({family.fatherStatus})</div>
                  <div className="font-bold">Mother's Name</div><div>: {family.motherName} ({family.motherStatus})</div>
                  <div className="font-bold">Siblings</div><div>: {family.brothers}, {family.sisters}</div>
                  <div className="font-bold">Native Place</div><div>: {family.nativePlace}</div>
                </div>

                <div className="w-full h-px bg-[#d4af37] my-4"></div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="font-bold">Contact No.</div><div>: {contact.phone}</div>
                  <div className="font-bold">Email ID</div><div>: {contact.email}</div>
                  <div className="font-bold">Address</div><div>: {contact.address}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="w-[794px] h-[1123px] bg-white text-gray-900 font-sans shadow-2xl p-16 box-border flex flex-col">
            <div className="flex justify-between items-center border-b-4 border-gray-900 pb-8 mb-10">
              <div>
                <h1 className="text-6xl font-black uppercase tracking-widest leading-none mb-2">{personal.name.split(' ')[0]}<br/>{personal.name.split(' ').slice(1).join(' ')}</h1>
                <p className="text-xl text-gray-500 uppercase tracking-widest">Marriage Profile</p>
              </div>
              <div className="w-32 h-40 border border-gray-300">
                {photo ? <img src={photo} className="w-full h-full object-cover grayscale" /> : <div className="w-full h-full bg-gray-100"></div>}
              </div>
            </div>

            <div className="space-y-10 flex-1">
              <section>
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-y-4 text-lg">
                  <div><strong>DOB:</strong> {personal.dob}</div>
                  <div><strong>Time:</strong> {personal.tob}</div>
                  <div><strong>Place:</strong> {personal.pob}</div>
                  <div><strong>Height:</strong> {personal.height}</div>
                  <div><strong>Religion/Caste:</strong> {personal.religion}, {personal.caste}</div>
                  <div><strong>Gotra:</strong> {personal.gotra}</div>
                  <div><strong>Manglik:</strong> {personal.manglik}</div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-4">Education & Career</h3>
                <div className="space-y-2 text-lg">
                  <p><strong>Education:</strong> {education.degree}</p>
                  <p><strong>Profession:</strong> {education.profession}</p>
                  <p><strong>Income:</strong> {education.income}</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-4">Family Background</h3>
                <div className="space-y-2 text-lg">
                  <p><strong>Father:</strong> {family.fatherName} ({family.fatherStatus})</p>
                  <p><strong>Mother:</strong> {family.motherName} ({family.motherStatus})</p>
                  <p><strong>Siblings:</strong> {family.brothers} & {family.sisters}</p>
                  <p><strong>Native Place:</strong> {family.nativePlace}</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-4">Contact Details</h3>
                <div className="space-y-2 text-lg">
                  <p><strong>Phone:</strong> {contact.phone}</p>
                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Address:</strong> {contact.address}</p>
                </div>
              </section>
            </div>
          </div>
        );
    }
  };

  // --- FORM RENDERER ---
  const renderFormStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 mb-2">1. Choose Template</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {id:'traditional', name:'🕉️ Traditional', desc:'Red & Gold Classic'}, 
                {id:'modern', name:'🏙️ Modern', desc:'Blue Sidebar Design'}, 
                {id:'royal', name:'👑 Royal', desc:'Green & Gold Elegant'}, 
                {id:'minimal', name:'✨ Minimalist', desc:'Clean Black & White'}
              ].map(t => (
                <button 
                  key={t.id} onClick={() => setData({...data, template: t.id as Template})}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${data.template === t.id ? 'border-orange-500 bg-orange-50 shadow-md transform scale-[1.02]' : 'border-slate-200 hover:border-orange-300'}`}
                >
                  <div className="font-black text-lg">{t.name}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800">Basic Details & Photo</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <input type="text" value={data.personal.name} onChange={e => handlePersonal('name', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-orange-500 outline-none" />
            </div>
            <div className="border-4 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center relative hover:border-orange-400 bg-slate-50 transition-colors">
              {data.photo ? <img src={data.photo} className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-white mb-2" /> : <span className="text-4xl mb-2">📸</span>}
              <p className="font-bold text-slate-600 text-sm">{data.photo ? 'Change Photo' : 'Upload Profile Photo'}</p>
              <input type="file" accept="image/*" onChange={handlePhoto} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Personal Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label><input type="text" value={data.personal.dob} onChange={e => handlePersonal('dob', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Time of Birth</label><input type="text" value={data.personal.tob} onChange={e => handlePersonal('tob', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Place of Birth</label><input type="text" value={data.personal.pob} onChange={e => handlePersonal('pob', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Height</label><input type="text" value={data.personal.height} onChange={e => handlePersonal('height', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Religion</label><input type="text" value={data.personal.religion} onChange={e => handlePersonal('religion', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Caste</label><input type="text" value={data.personal.caste} onChange={e => handlePersonal('caste', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Gotra</label><input type="text" value={data.personal.gotra} onChange={e => handlePersonal('gotra', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Manglik Status</label><input type="text" value={data.personal.manglik} onChange={e => handlePersonal('manglik', e.target.value)} placeholder="Yes / No / Partial" className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Education & Career</h3>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Highest Education Degree</label><input type="text" value={data.education.degree} onChange={e => handleEdu('degree', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Profession / Job Title & Company</label><input type="text" value={data.education.profession} onChange={e => handleEdu('profession', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Annual Income</label><input type="text" value={data.education.income} onChange={e => handleEdu('income', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Family Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Father's Name</label><input type="text" value={data.family.fatherName} onChange={e => handleFamily('fatherName', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Father's Occupation</label><input type="text" value={data.family.fatherStatus} onChange={e => handleFamily('fatherStatus', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Mother's Name</label><input type="text" value={data.family.motherName} onChange={e => handleFamily('motherName', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Mother's Occupation</label><input type="text" value={data.family.motherStatus} onChange={e => handleFamily('motherStatus', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Brothers</label><input type="text" value={data.family.brothers} onChange={e => handleFamily('brothers', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Sisters</label><input type="text" value={data.family.sisters} onChange={e => handleFamily('sisters', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Native Place / Hometown</label><input type="text" value={data.family.nativePlace} onChange={e => handleFamily('nativePlace', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Contact Info</h3>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Contact Number</label><input type="text" value={data.contact.phone} onChange={e => handleContact('phone', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Email Address (Optional)</label><input type="text" value={data.contact.email} onChange={e => handleContact('email', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Residential Address</label><textarea value={data.contact.address} onChange={e => handleContact('address', e.target.value)} rows={3} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none resize-none" /></div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <span className="text-6xl block mb-4">💍</span>
            <h3 className="text-3xl font-black text-slate-800">Ready to Share!</h3>
            <p className="text-slate-500 font-medium">Your Marriage Biodata is complete. Download it as a high-quality PDF to share on WhatsApp or Email.</p>
            <button onClick={generatePDF} disabled={isProcessing} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xl py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 mt-4">
              {isProcessing ? 'Generating PDF...' : '📥 Download HD Biodata'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Marriage Biodata Maker</h2>
        <p className="text-slate-500 mt-2 text-lg">Create beautiful, professional biodata for marriage proposals in minutes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col min-h-[600px]">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-orange-600 uppercase tracking-wider">Step {step + 1} of {FLOW_STEPS.length}</span>
              <span className="text-xs font-bold text-slate-400">{FLOW_STEPS[step]}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${((step + 1) / FLOW_STEPS.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
            {renderFormStep()}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between gap-4 mt-auto">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={`px-6 py-3 rounded-xl font-bold transition-colors ${step === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Back</button>
            <button onClick={() => setStep(Math.min(FLOW_STEPS.length - 1, step + 1))} disabled={step === FLOW_STEPS.length - 1} className={`px-8 py-3 rounded-xl font-bold shadow-md transition-transform ${step === FLOW_STEPS.length - 1 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white hover:-translate-y-1'}`}>Next Step</button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE A4 PREVIEW */}
        <div className="lg:col-span-7 bg-[#f8f9fa] rounded-3xl border border-slate-200 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[600px] relative">
           <span className="absolute top-4 left-6 bg-orange-100 text-orange-800 text-xs font-black px-3 py-1 rounded-full border border-orange-200 z-10 shadow-sm">
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