'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// --- DATA TYPES ---
type Template = 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8' | 't9' | 't10';

interface BiodataData {
  template: Template;
  border: string;
  photo: string | null;
  personal: {
    name: string;
    dob: string;
    tob: string;
    pob: string;
    height: string;
    complexion: string;
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
  'Layout & Border', 'Name & Photo', 'Personal Info', 'Education & Work', 'Family Details', 'Contact', 'Download'
];

// 🌟 BORDER OPTIONS 🌟
const BORDER_OPTIONS = [
  { id: '', name: '🚫 No Border' },
  { id: 'border-[12px] border-red-800', name: '🟥 Thick Red' },
  { id: 'border-[16px] border-double border-[#8b0000]', name: '🏛️ Classic Double' },
  { id: 'border-[12px] border-double border-[#d4af37]', name: '👑 Royal Gold' },
  { id: 'border-8 border-orange-500', name: '🟧 Solid Orange' },
  { id: 'border-[16px] border-[#580f1c] outline outline-4 outline-offset-[-20px] outline-[#d4af37]', name: '✨ Premium Inset' },
  { id: 'border-[12px] border-[#1e3c45]', name: '🟦 Thick Blue' },
  { id: 'border-8 border-dashed border-red-600', name: '✂️ Dashed Floral' },
];

export default function BiodataMaker() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<BiodataData>({
    template: 't1',
    border: 'border-[12px] border-red-800',
    photo: null,
    personal: {
      name: 'Rohan Sharma',
      dob: '25 October 1995',
      tob: '10:30 AM',
      pob: 'New Delhi, India',
      height: '5 ft 10 in',
      complexion: 'Fair',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Bharadwaj',
      manglik: 'No',
    },
    education: {
      degree: 'B.Tech in Computer Science',
      profession: 'Software Engineer',
      income: '15 Lakhs PA',
    },
    family: {
      fatherName: 'Mr. Ramesh Sharma',
      fatherStatus: 'Business',
      motherName: 'Mrs. Sunita Sharma',
      motherStatus: 'Homemaker',
      brothers: '1 Elder Brother',
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

  // 🌟 OFF-SCREEN PERFECT PDF ENGINE 🌟
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

  // --- 🌟 10 AUTHENTIC MATRIMONIAL TEMPLATES 🌟 ---
  const renderTemplate = () => {
    const { template, border, photo, personal, education, family, contact } = data;

    // Helper for key-value rows
    const Row = ({ label, value, colorClass = "text-slate-800" }: { label: string, value: string, colorClass?: string }) => (
      <div className={`flex mb-2 text-[15px] leading-relaxed ${colorClass}`}>
        <div className="w-[35%] font-bold">{label}</div>
        <div className="w-[5%] text-center">:</div>
        <div className="w-[60%] font-medium">{value}</div>
      </div>
    );

    switch(template) {
      case 't1': // Classic Red Matrimonial (RC10 vibe)
        return (
          <div className={`w-[794px] h-[1123px] bg-[#fffdf5] text-[#8b0000] font-serif shadow-2xl p-10 box-border flex flex-col ${border}`}>
            <div className="text-center mb-6">
              <span className="text-4xl text-[#8b0000]">🕉️</span>
              <h2 className="text-lg font-bold mt-2 tracking-widest">॥ श्री गणेशाय नमः ॥</h2>
            </div>
            
            <div className="flex justify-between items-start px-4 mb-6">
              <div className="flex-1 mt-4">
                <h3 className="text-2xl font-black uppercase tracking-widest border-b-2 border-[#8b0000] inline-block pb-1 mb-6">Personal Details</h3>
                <Row label="Name" value={personal.name} />
                <Row label="Date of Birth" value={personal.dob} />
                <Row label="Time of Birth" value={personal.tob} />
                <Row label="Place of Birth" value={personal.pob} />
                <Row label="Complexion" value={personal.complexion} />
                <Row label="Height" value={personal.height} />
                <Row label="Religion" value={personal.religion} />
                <Row label="Caste" value={personal.caste} />
                <Row label="Gotra" value={personal.gotra} />
                <Row label="Manglik" value={personal.manglik} />
              </div>
              <div className="w-40 h-48 border-4 border-[#8b0000] p-1 bg-white ml-8 shadow-md">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-50 flex items-center justify-center font-bold text-orange-200">PHOTO</div>}
              </div>
            </div>

            <div className="px-4 mb-6">
              <h3 className="text-2xl font-black uppercase tracking-widest border-b-2 border-[#8b0000] inline-block pb-1 mb-4">Education & Career</h3>
              <Row label="Education" value={education.degree} />
              <Row label="Occupation" value={education.profession} />
              <Row label="Income" value={education.income} />
            </div>

            <div className="px-4 mb-6">
              <h3 className="text-2xl font-black uppercase tracking-widest border-b-2 border-[#8b0000] inline-block pb-1 mb-4">Family Details</h3>
              <Row label="Father's Name" value={`${family.fatherName} (${family.fatherStatus})`} />
              <Row label="Mother's Name" value={`${family.motherName} (${family.motherStatus})`} />
              <Row label="Brothers" value={family.brothers} />
              <Row label="Sisters" value={family.sisters} />
              <Row label="Native Place" value={family.nativePlace} />
            </div>

            <div className="px-4">
              <h3 className="text-2xl font-black uppercase tracking-widest border-b-2 border-[#8b0000] inline-block pb-1 mb-4">Contact Details</h3>
              <Row label="Contact No." value={contact.phone} />
              <Row label="Address" value={contact.address} />
            </div>
          </div>
        );

      case 't2': // Split Orange & White (RC9 vibe)
        return (
          <div className={`w-[794px] h-[1123px] bg-white flex shadow-2xl overflow-hidden font-sans box-border ${border}`}>
            <div className="w-[35%] bg-[#ff5e00] text-white p-8 flex flex-col items-center">
              <div className="w-36 h-40 border-4 border-white shadow-xl mb-6 bg-white overflow-hidden">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-200"></div>}
              </div>
              <h2 className="text-xl font-black uppercase text-center mb-6 tracking-widest border-b border-white pb-2 w-full">Overview</h2>
              <div className="text-sm font-medium w-full space-y-3">
                <p><strong>Education:</strong><br/>{education.degree}</p>
                <p><strong>Profession:</strong><br/>{education.profession}</p>
                <p><strong>Income:</strong><br/>{education.income}</p>
                <p><strong>Complexion:</strong><br/>{personal.complexion}</p>
                <p><strong>Height:</strong><br/>{personal.height}</p>
              </div>
            </div>
            
            <div className="w-[65%] p-10 bg-white relative">
              <div className="text-center mb-6 relative">
                <div className="w-full h-[60px] bg-white absolute top-[-30px] rounded-b-[50px] shadow-sm"></div>
                <h1 className="text-4xl font-black text-[#ff5e00] relative z-10 pt-4">BIO DATA</h1>
                <h2 className="text-2xl font-bold text-[#8b0000] mt-2 relative z-10">{personal.name}</h2>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-black text-blue-900 uppercase mb-4 text-center border-b border-blue-900 pb-1">Personal Information</h3>
                <Row label="Date of Birth" value={personal.dob} />
                <Row label="Time of Birth" value={personal.tob} />
                <Row label="Place of Birth" value={personal.pob} />
                <Row label="Religion" value={personal.religion} />
                <Row label="Caste" value={personal.caste} />
                <Row label="Gotra" value={personal.gotra} />
                <Row label="Manglik" value={personal.manglik} />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-black text-blue-900 uppercase mb-4 text-center border-b border-blue-900 pb-1">Family Details</h3>
                <Row label="Father" value={`${family.fatherName} (${family.fatherStatus})`} />
                <Row label="Mother" value={`${family.motherName} (${family.motherStatus})`} />
                <Row label="Brothers" value={family.brothers} />
                <Row label="Sisters" value={family.sisters} />
              </div>

              <div>
                <h3 className="text-lg font-black text-blue-900 uppercase mb-4 text-center border-b border-blue-900 pb-1">Contact Details</h3>
                <Row label="Contact No." value={contact.phone} />
                <Row label="Address" value={contact.address} />
              </div>
            </div>
          </div>
        );

      case 't3': // Dark Maroon & Gold Royal (RC8 vibe)
        return (
          <div className={`w-[794px] h-[1123px] bg-[#4a0e17] text-[#f4d068] font-serif shadow-2xl p-12 box-border flex flex-col relative ${border}`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-widest mb-1">॥ श्री गणेशाय नमः ॥</h2>
              <div className="w-full h-px bg-[#f4d068] opacity-50 my-2"></div>
              <h1 className="text-4xl font-black uppercase tracking-widest mt-2">{personal.name}</h1>
            </div>

            <div className="flex justify-between items-start mb-8">
              <div className="flex-1 pr-6 space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white border-b border-[#f4d068] pb-1 mb-4">Personal Details</h3>
                <Row label="Date of Birth" value={personal.dob} colorClass="text-[#f4d068]" />
                <Row label="Time of Birth" value={personal.tob} colorClass="text-[#f4d068]" />
                <Row label="Place of Birth" value={personal.pob} colorClass="text-[#f4d068]" />
                <Row label="Complexion" value={personal.complexion} colorClass="text-[#f4d068]" />
                <Row label="Height" value={personal.height} colorClass="text-[#f4d068]" />
                <Row label="Gotra/Caste" value={`${personal.gotra} / ${personal.caste}`} colorClass="text-[#f4d068]" />
                <Row label="Manglik" value={personal.manglik} colorClass="text-[#f4d068]" />
              </div>
              <div className="w-40 h-48 border-[4px] border-[#f4d068] bg-white shadow-2xl p-1">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#3a0b12]"></div>}
              </div>
            </div>

            <div className="mb-6 space-y-2">
               <h3 className="text-xl font-bold uppercase tracking-widest text-white border-b border-[#f4d068] pb-1 mb-4">Career</h3>
               <Row label="Education" value={education.degree} colorClass="text-[#f4d068]" />
               <Row label="Occupation" value={education.profession} colorClass="text-[#f4d068]" />
               <Row label="Income" value={education.income} colorClass="text-[#f4d068]" />
            </div>

            <div className="mb-6 space-y-2">
               <h3 className="text-xl font-bold uppercase tracking-widest text-white border-b border-[#f4d068] pb-1 mb-4">Family Details</h3>
               <Row label="Father's Name" value={`${family.fatherName} (${family.fatherStatus})`} colorClass="text-[#f4d068]" />
               <Row label="Mother's Name" value={`${family.motherName} (${family.motherStatus})`} colorClass="text-[#f4d068]" />
               <Row label="Siblings" value={`${family.brothers} Brother, ${family.sisters} Sister`} colorClass="text-[#f4d068]" />
               <Row label="Native Place" value={family.nativePlace} colorClass="text-[#f4d068]" />
            </div>

            <div className="space-y-2">
               <h3 className="text-xl font-bold uppercase tracking-widest text-white border-b border-[#f4d068] pb-1 mb-4">Contact</h3>
               <Row label="Contact Person" value={family.fatherName} colorClass="text-[#f4d068]" />
               <Row label="Contact No." value={contact.phone} colorClass="text-[#f4d068]" />
               <Row label="Address" value={contact.address} colorClass="text-[#f4d068]" />
            </div>
          </div>
        );

      case 't4': // The Arch Elephant Design (RC4/RC2 vibe)
        return (
          <div className={`w-[794px] h-[1123px] bg-[#c21820] text-black font-sans shadow-2xl flex flex-col items-center pt-16 box-border ${border}`}>
            {/* The White Arch Container */}
            <div className="w-[90%] h-[95%] bg-white rounded-t-[100px] shadow-2xl p-10 flex flex-col relative">
              <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 text-4xl bg-white p-4 rounded-full shadow-md">🐘</div>
              
              <div className="text-center mt-6 mb-8">
                <h2 className="text-[#c21820] font-black text-xl mb-1">॥ 卐 ॥</h2>
                <h3 className="text-[#c21820] font-bold text-lg mb-2">ॐ श्री गणेशाय नमः</h3>
                <h4 className="text-gray-500 font-bold tracking-widest">BIO DATA</h4>
                <h1 className="text-4xl font-black text-[#c21820] uppercase mt-2">{personal.name}</h1>
              </div>

              <div className="absolute top-16 right-10 w-32 h-32 rounded-full border-4 border-[#c21820] overflow-hidden shadow-lg p-1 bg-white">
                 {photo ? <img src={photo} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-gray-200 rounded-full"></div>}
              </div>

              <div className="space-y-3 px-6 mt-4">
                <Row label="Date of Birth" value={personal.dob} />
                <Row label="Place of Birth" value={personal.pob} />
                <Row label="Religion" value={personal.religion} />
                <Row label="Caste" value={personal.caste} />
                <Row label="Gotra" value={personal.gotra} />
                <Row label="Height" value={personal.height} />
                <Row label="Complexion" value={personal.complexion} />
                <Row label="Education" value={education.degree} />
                <Row label="Occupation" value={education.profession} />
              </div>

              <div className="px-6 mt-8">
                <h3 className="text-2xl font-black text-[#c21820] mb-4">Family Details</h3>
                <div className="space-y-3">
                  <Row label="Father's Name" value={family.fatherName} />
                  <Row label="Occupation" value={family.fatherStatus} />
                  <Row label="Mother's Name" value={family.motherName} />
                  <Row label="Occupation" value={family.motherStatus} />
                  <Row label="Brothers" value={family.brothers} />
                  <Row label="Sisters" value={family.sisters} />
                </div>
              </div>

              <div className="px-6 mt-8">
                <h3 className="text-2xl font-black text-[#c21820] mb-4">Contact Details</h3>
                <div className="space-y-3">
                  <Row label="Phone No." value={contact.phone} />
                  <Row label="Address" value={contact.address} />
                </div>
              </div>
            </div>
          </div>
        );

      case 't5': // Deep Magenta/Gold Accent
        return (
          <div className={`w-[794px] h-[1123px] bg-[#750e38] text-white font-serif shadow-2xl p-10 box-border flex flex-col border-[8px] border-[#d4af37] ${border}`}>
            <div className="border-4 border-[#d4af37] p-8 flex-1 relative">
               <h1 className="text-center text-xl font-bold text-[#d4af37] tracking-widest mb-6">PERSONAL INFORMATION</h1>
               
               <div className="flex justify-between items-start mb-8">
                 <div className="flex-1 space-y-3 pr-4">
                   <Row label="Name" value={personal.name} colorClass="text-[#f8e1a8]" />
                   <Row label="Date of Birth" value={personal.dob} colorClass="text-[#f8e1a8]" />
                   <Row label="Place of Birth" value={personal.pob} colorClass="text-[#f8e1a8]" />
                   <Row label="Time of Birth" value={personal.tob} colorClass="text-[#f8e1a8]" />
                   <Row label="Religion" value={personal.religion} colorClass="text-[#f8e1a8]" />
                   <Row label="Caste" value={personal.caste} colorClass="text-[#f8e1a8]" />
                   <Row label="Height" value={personal.height} colorClass="text-[#f8e1a8]" />
                 </div>
                 <div className="w-32 h-36 border-2 border-[#d4af37] bg-white p-1">
                   {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#520926]"></div>}
                 </div>
               </div>

               <div className="space-y-3 mb-8">
                 <Row label="Qualification" value={education.degree} colorClass="text-[#f8e1a8]" />
                 <Row label="Occupation" value={education.profession} colorClass="text-[#f8e1a8]" />
                 <Row label="Annual Income" value={education.income} colorClass="text-[#f8e1a8]" />
               </div>

               <h1 className="text-center text-xl font-bold text-[#d4af37] tracking-widest mb-6 border-t border-[#d4af37] pt-4">FAMILY DETAILS</h1>
               <div className="space-y-3 mb-8">
                  <Row label="Father's Name" value={family.fatherName} colorClass="text-[#f8e1a8]" />
                  <Row label="Occupation" value={family.fatherStatus} colorClass="text-[#f8e1a8]" />
                  <Row label="Mother's Name" value={family.motherName} colorClass="text-[#f8e1a8]" />
                  <Row label="Brothers" value={family.brothers} colorClass="text-[#f8e1a8]" />
                  <Row label="Sisters" value={family.sisters} colorClass="text-[#f8e1a8]" />
               </div>

               <div className="space-y-3 pt-4 border-t border-[#d4af37]">
                  <Row label="Contact" value={contact.phone} colorClass="text-[#f8e1a8]" />
                  <Row label="Address" value={contact.address} colorClass="text-[#f8e1a8]" />
               </div>
            </div>
          </div>
        );

      case 't6': // Minimalist Navy Blue Left Bar
        return (
          <div className={`w-[794px] h-[1123px] bg-white text-slate-800 font-sans shadow-2xl flex box-border ${border}`}>
            <div className="w-[35%] bg-[#0f172a] text-white p-8 flex flex-col items-center justify-center border-r-4 border-slate-300">
               <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl mb-8 overflow-hidden">
                 {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700"></div>}
               </div>
               <h2 className="text-3xl font-black text-center uppercase tracking-widest mb-2">{personal.name}</h2>
               <p className="text-slate-400 font-bold tracking-widest mb-10">BIODATA</p>
               
               <div className="w-full text-sm space-y-4 font-medium text-slate-300 text-center">
                 <p>📞 {contact.phone}</p>
                 <p>✉️ {contact.email}</p>
                 <p>📍 {contact.address}</p>
                 <p className="pt-6 border-t border-slate-700 w-1/2 mx-auto">Height: {personal.height}</p>
                 <p>Complexion: {personal.complexion}</p>
               </div>
            </div>
            <div className="w-[65%] p-10 flex flex-col justify-center space-y-10">
               <div>
                 <h3 className="text-xl font-black uppercase text-[#0f172a] border-b-2 border-slate-200 pb-2 mb-4 tracking-widest">Personal Info</h3>
                 <div className="space-y-3">
                    <Row label="DOB" value={personal.dob} />
                    <Row label="Time" value={personal.tob} />
                    <Row label="Place" value={personal.pob} />
                    <Row label="Religion" value={personal.religion} />
                    <Row label="Caste" value={personal.caste} />
                    <Row label="Gotra" value={personal.gotra} />
                 </div>
               </div>
               <div>
                 <h3 className="text-xl font-black uppercase text-[#0f172a] border-b-2 border-slate-200 pb-2 mb-4 tracking-widest">Career</h3>
                 <div className="space-y-3">
                    <Row label="Education" value={education.degree} />
                    <Row label="Profession" value={education.profession} />
                    <Row label="Income" value={education.income} />
                 </div>
               </div>
               <div>
                 <h3 className="text-xl font-black uppercase text-[#0f172a] border-b-2 border-slate-200 pb-2 mb-4 tracking-widest">Family Background</h3>
                 <div className="space-y-3">
                    <Row label="Father" value={`${family.fatherName} (${family.fatherStatus})`} />
                    <Row label="Mother" value={`${family.motherName} (${family.motherStatus})`} />
                    <Row label="Siblings" value={`${family.brothers} Bro, ${family.sisters} Sis`} />
                    <Row label="Native Place" value={family.nativePlace} />
                 </div>
               </div>
            </div>
          </div>
        );

      case 't7': // Elegant Simple Center Aligned
        return (
          <div className={`w-[794px] h-[1123px] bg-[#fdfdfd] text-slate-900 font-serif shadow-2xl p-12 box-border flex flex-col ${border}`}>
             <div className="text-center border-b-2 border-slate-300 pb-6 mb-8">
                <h2 className="text-xl text-red-700 font-bold mb-2">ॐ श्री गणेशाय नमः</h2>
                <h1 className="text-5xl font-black uppercase tracking-widest text-slate-800">{personal.name}</h1>
             </div>
             
             <div className="flex gap-8 mb-8">
                <div className="flex-1 space-y-3 bg-white p-6 shadow-sm border border-slate-100 rounded-lg">
                   <h3 className="font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-1">Personal</h3>
                   <Row label="Born" value={`${personal.dob} at ${personal.tob}`} />
                   <Row label="Place" value={personal.pob} />
                   <Row label="Height" value={personal.height} />
                   <Row label="Religion" value={`${personal.religion} - ${personal.caste}`} />
                   <Row label="Gotra" value={personal.gotra} />
                </div>
                {photo && (
                  <div className="w-40 h-48 border-4 border-white shadow-xl bg-slate-100 flex-shrink-0">
                    <img src={photo} className="w-full h-full object-cover" />
                  </div>
                )}
             </div>

             <div className="space-y-3 bg-white p-6 shadow-sm border border-slate-100 rounded-lg mb-8">
                 <h3 className="font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-1">Career & Education</h3>
                 <Row label="Education" value={education.degree} />
                 <Row label="Occupation" value={education.profession} />
                 <Row label="Income" value={education.income} />
             </div>

             <div className="space-y-3 bg-white p-6 shadow-sm border border-slate-100 rounded-lg mb-8">
                 <h3 className="font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-1">Family</h3>
                 <Row label="Father" value={`${family.fatherName} (${family.fatherStatus})`} />
                 <Row label="Mother" value={`${family.motherName} (${family.motherStatus})`} />
                 <Row label="Siblings" value={`${family.brothers}, ${family.sisters}`} />
                 <Row label="Native Place" value={family.nativePlace} />
             </div>

             <div className="text-center mt-auto text-sm font-bold text-slate-500 bg-slate-100 py-3 rounded-lg">
                Contact: {contact.phone} | Address: {contact.address}
             </div>
          </div>
        );

      case 't8': // Royal Green & Gold
        return (
          <div className={`w-[794px] h-[1123px] bg-[#0d2b1d] text-[#e8d38e] font-serif shadow-2xl p-10 box-border flex flex-col border-[12px] border-double border-[#e8d38e] ${border}`}>
             <div className="text-center mb-6">
                <span className="text-4xl text-[#e8d38e]">🕉️</span>
             </div>
             <h1 className="text-5xl font-black uppercase text-center tracking-widest mb-10 border-b border-[#e8d38e] pb-4">{personal.name}</h1>

             <div className="flex gap-10">
               <div className="w-1/3 flex flex-col items-center">
                 <div className="w-40 h-48 border-[4px] border-[#e8d38e] p-1 bg-[#1a4a34] mb-8">
                    {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full"></div>}
                 </div>
                 <div className="w-full text-center space-y-4 font-bold border-t border-[#e8d38e] pt-4">
                    <p>📞 {contact.phone}</p>
                    <p className="text-sm px-2">📍 {contact.address}</p>
                 </div>
               </div>

               <div className="w-2/3 space-y-8 pr-4">
                  <div>
                    <h3 className="text-xl font-bold bg-[#e8d38e] text-[#0d2b1d] px-3 py-1 mb-4 uppercase inline-block">Personal Details</h3>
                    <div className="space-y-3 pl-2">
                       <Row label="Date of Birth" value={personal.dob} colorClass="text-[#e8d38e]" />
                       <Row label="Time of Birth" value={personal.tob} colorClass="text-[#e8d38e]" />
                       <Row label="Place of Birth" value={personal.pob} colorClass="text-[#e8d38e]" />
                       <Row label="Height" value={personal.height} colorClass="text-[#e8d38e]" />
                       <Row label="Caste" value={`${personal.religion} - ${personal.caste}`} colorClass="text-[#e8d38e]" />
                       <Row label="Gotra" value={personal.gotra} colorClass="text-[#e8d38e]" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold bg-[#e8d38e] text-[#0d2b1d] px-3 py-1 mb-4 uppercase inline-block">Professional</h3>
                    <div className="space-y-3 pl-2">
                       <Row label="Education" value={education.degree} colorClass="text-[#e8d38e]" />
                       <Row label="Occupation" value={education.profession} colorClass="text-[#e8d38e]" />
                       <Row label="Income" value={education.income} colorClass="text-[#e8d38e]" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold bg-[#e8d38e] text-[#0d2b1d] px-3 py-1 mb-4 uppercase inline-block">Family Background</h3>
                    <div className="space-y-3 pl-2">
                       <Row label="Father" value={`${family.fatherName} (${family.fatherStatus})`} colorClass="text-[#e8d38e]" />
                       <Row label="Mother" value={`${family.motherName} (${family.motherStatus})`} colorClass="text-[#e8d38e]" />
                       <Row label="Siblings" value={`${family.brothers}, ${family.sisters}`} colorClass="text-[#e8d38e]" />
                    </div>
                  </div>
               </div>
             </div>
          </div>
        );

      case 't9': // Rose Pink & White
        return (
          <div className={`w-[794px] h-[1123px] bg-white text-[#5c1c38] font-sans shadow-2xl p-0 box-border flex flex-col ${border}`}>
             <div className="bg-[#a8325a] text-white p-10 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-widest mb-2">{personal.name}</h1>
                  <h2 className="text-lg font-bold opacity-80 uppercase tracking-widest">Marriage Profile</h2>
                </div>
                <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-xl bg-[#5c1c38]">
                  {photo && <img src={photo} className="w-full h-full object-cover" />}
                </div>
             </div>
             
             <div className="p-12 space-y-10 flex-1 bg-[#fff5f8]">
                <section>
                   <h3 className="text-2xl font-black uppercase border-b-2 border-[#a8325a] pb-2 mb-4">Personal Info</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div><span className="font-bold">Born:</span> {personal.dob} at {personal.tob}</div>
                      <div><span className="font-bold">Place:</span> {personal.pob}</div>
                      <div><span className="font-bold">Height:</span> {personal.height}</div>
                      <div><span className="font-bold">Complexion:</span> {personal.complexion}</div>
                      <div><span className="font-bold">Religion/Caste:</span> {personal.religion}, {personal.caste}</div>
                      <div><span className="font-bold">Gotra:</span> {personal.gotra}</div>
                   </div>
                </section>

                <section>
                   <h3 className="text-2xl font-black uppercase border-b-2 border-[#a8325a] pb-2 mb-4">Education & Career</h3>
                   <div className="space-y-3">
                      <Row label="Degree" value={education.degree} colorClass="text-[#5c1c38]" />
                      <Row label="Profession" value={education.profession} colorClass="text-[#5c1c38]" />
                      <Row label="Income" value={education.income} colorClass="text-[#5c1c38]" />
                   </div>
                </section>

                <section>
                   <h3 className="text-2xl font-black uppercase border-b-2 border-[#a8325a] pb-2 mb-4">Family Info</h3>
                   <div className="space-y-3">
                      <Row label="Father" value={`${family.fatherName} (${family.fatherStatus})`} colorClass="text-[#5c1c38]" />
                      <Row label="Mother" value={`${family.motherName} (${family.motherStatus})`} colorClass="text-[#5c1c38]" />
                      <Row label="Siblings" value={`${family.brothers}, ${family.sisters}`} colorClass="text-[#5c1c38]" />
                      <Row label="Hometown" value={family.nativePlace} colorClass="text-[#5c1c38]" />
                   </div>
                </section>

                <section className="bg-[#a8325a] text-white p-4 rounded-xl mt-auto shadow-md">
                   <h3 className="text-lg font-bold uppercase mb-2">Contact Details</h3>
                   <p className="font-medium">Phone: {contact.phone} | Email: {contact.email}</p>
                   <p className="font-medium">Address: {contact.address}</p>
                </section>
             </div>
          </div>
        );

      case 't10': // Warm Cream Vintage
        return (
          <div className={`w-[794px] h-[1123px] bg-[#fbf5e9] text-[#4a3f35] font-serif shadow-2xl p-12 box-border flex flex-col border border-[#d2c4a7] ${border}`}>
             <div className="text-center mb-10">
               <h1 className="text-5xl font-black uppercase tracking-widest border-b-4 border-[#8c7a6b] inline-block pb-2 mb-4">{personal.name}</h1>
             </div>

             <div className="flex gap-8 flex-1">
               <div className="w-[30%] border-r-2 border-[#d2c4a7] pr-8">
                  {photo ? (
                    <img src={photo} className="w-full aspect-[3/4] object-cover border-4 border-white shadow-lg mb-8" />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-[#efe8d8] border-4 border-white shadow-lg mb-8"></div>
                  )}
                  
                  <h3 className="font-black text-xl mb-4 uppercase tracking-widest">Contact</h3>
                  <div className="space-y-3 text-[15px] font-bold">
                    <p>Phone:<br/><span className="font-medium text-[#7a6b5d]">{contact.phone}</span></p>
                    <p>Address:<br/><span className="font-medium text-[#7a6b5d]">{contact.address}</span></p>
                  </div>
               </div>

               <div className="w-[70%] space-y-8">
                  <div>
                    <h3 className="font-black text-2xl mb-4 uppercase tracking-widest text-[#8c7a6b]">Personal Info</h3>
                    <div className="space-y-3">
                       <Row label="Date of Birth" value={personal.dob} colorClass="text-[#4a3f35]" />
                       <Row label="Time / Place" value={`${personal.tob}, ${personal.pob}`} colorClass="text-[#4a3f35]" />
                       <Row label="Height" value={personal.height} colorClass="text-[#4a3f35]" />
                       <Row label="Religion" value={personal.religion} colorClass="text-[#4a3f35]" />
                       <Row label="Caste/Gotra" value={`${personal.caste}, ${personal.gotra}`} colorClass="text-[#4a3f35]" />
                       <Row label="Manglik" value={personal.manglik} colorClass="text-[#4a3f35]" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-2xl mb-4 uppercase tracking-widest text-[#8c7a6b]">Education & Career</h3>
                    <div className="space-y-3">
                       <Row label="Qualification" value={education.degree} colorClass="text-[#4a3f35]" />
                       <Row label="Occupation" value={education.profession} colorClass="text-[#4a3f35]" />
                       <Row label="Income" value={education.income} colorClass="text-[#4a3f35]" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-2xl mb-4 uppercase tracking-widest text-[#8c7a6b]">Family Profile</h3>
                    <div className="space-y-3">
                       <Row label="Father" value={`${family.fatherName} (${family.fatherStatus})`} colorClass="text-[#4a3f35]" />
                       <Row label="Mother" value={`${family.motherName} (${family.motherStatus})`} colorClass="text-[#4a3f35]" />
                       <Row label="Siblings" value={`${family.brothers}, ${family.sisters}`} colorClass="text-[#4a3f35]" />
                       <Row label="Native Place" value={family.nativePlace} colorClass="text-[#4a3f35]" />
                    </div>
                  </div>
               </div>
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
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-6">1. Choose Template</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  {id:'t1', name:'🕉️ Classic Red'}, {id:'t2', name:'🟠 Split Orange'}, {id:'t3', name:'👑 Royal Maroon'}, 
                  {id:'t4', name:'🐘 Elephant Arch'}, {id:'t5', name:'🌸 Deep Magenta'}, {id:'t6', name:'🟦 Modern Navy'}, 
                  {id:'t7', name:'✨ Elegant White'}, {id:'t8', name:'🌿 Green & Gold'}, {id:'t9', name:'🎀 Rose Pink'}, 
                  {id:'t10', name:'📜 Cream Vintage'}
                ].map(t => (
                  <button 
                    key={t.id} onClick={() => setData({...data, template: t.id as Template})}
                    className={`p-3 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${data.template === t.id ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md' : 'border-slate-200 text-slate-500 hover:border-orange-300'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-6">2. Choose Page Border</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BORDER_OPTIONS.map(b => (
                  <button 
                    key={b.id} onClick={() => setData({...data, border: b.id})}
                    className={`p-3 rounded-xl border-2 font-black text-xs tracking-wider transition-all ${data.border === b.id ? 'border-red-600 bg-red-50 text-red-700 shadow-md' : 'border-slate-200 text-slate-600 hover:border-red-300'}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
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
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Complexion</label><input type="text" value={data.personal.complexion} onChange={e => handlePersonal('complexion', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Religion</label><input type="text" value={data.personal.religion} onChange={e => handlePersonal('religion', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Caste</label><input type="text" value={data.personal.caste} onChange={e => handlePersonal('caste', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Gotra</label><input type="text" value={data.personal.gotra} onChange={e => handlePersonal('gotra', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Manglik Status</label><input type="text" value={data.personal.manglik} onChange={e => handlePersonal('manglik', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 outline-none" /></div>
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
        <p className="text-slate-500 mt-2 text-lg">Choose from 10 Authentic Templates & Borders to build Matrimonial Biodata.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col min-h-[650px]">
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
        <div className="lg:col-span-7 bg-[#f8f9fa] rounded-3xl border border-slate-200 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[650px] relative">
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