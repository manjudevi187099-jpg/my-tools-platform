'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro'; // 🌟 YAHAN FIX KIYA HAI 🌟

// --- DATA TYPES ---
type Template = 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8' | 't9' | 't10';

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
  marks: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  year: string;
  desc: string;
}

interface ResumeData {
  template: Template;
  border: string; 
  photo: string | null;
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    dob: string;
    nationality: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string;
  languages: string;
  hobbies: string;
}

const FLOW_STEPS = [
  'Layout & Border', 'Personal Details', 'Education', 'Skills & Extras', 'Experience', 'Photo', 'Generate'
];

const BORDER_OPTIONS = [
  { id: '', name: '🚫 No Border' },
  { id: 'border-2 border-slate-900', name: '✏️ Thin Classic' },
  { id: 'border-[12px] border-slate-900', name: '⬛ Thick Bold' },
  { id: 'border-[12px] border-double border-slate-900', name: '🏛️ Elegant Double' },
  { id: 'border-4 border-dashed border-slate-600', name: '✂️ Dashed Creative' },
  { id: 'border-l-[24px] border-slate-900', name: '📓 Left Dark Accent' },
  { id: 'border-t-[24px] border-blue-700', name: '🧢 Top Blue Accent' },
  { id: 'border-[12px] border-double border-[#b99553]', name: '👑 Premium Gold' },
];

export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ResumeData>({
    template: 't10',
    border: '',
    photo: null,
    personal: { 
      name: 'RAHUL KUMAR', 
      title: 'Computer Science Engineer', 
      email: 'rahul@example.com', 
      phone: '+91 9876543210', 
      address: 'New Delhi, India', 
      summary: 'Motivated and enthusiastic professional seeking a challenging position to leverage academic knowledge, technical skills, and experience to contribute meaningfully to a forward-thinking organization.',
      dob: '15 August 1999',
      nationality: 'Indian'
    },
    education: [
      { id: '1', degree: 'B.Tech in Computer Science', school: 'XYZ University, New Delhi', year: '2018 - 2022', marks: '85%' },
      { id: '2', degree: 'Class 12th (Intermediate)', school: 'ABC Public School', year: '2016 - 2018', marks: '90%' }
    ],
    experience: [
      { id: '1', role: 'Software Developer', company: 'Tech Solutions Pvt Ltd', year: '2022 - Present', desc: 'Developed responsive web applications. Assisted with backend APIs and database management. Improved system efficiency by 30%.' },
      { id: '2', role: 'Frontend Intern', company: 'Innovate Labs', year: '2021 - 2022', desc: 'Designed user interfaces using React and Tailwind CSS. Collaborated with the design team.' }
    ],
    skills: 'HTML, CSS, JavaScript, React, Node.js, Problem Solving, Leadership',
    languages: 'English, Hindi',
    hobbies: 'Coding, Reading Tech Blogs, Playing Cricket',
  });

  const handlePersonal = (field: string, value: string) => setData({ ...data, personal: { ...data.personal, [field]: value } });
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setData({ ...data, photo: URL.createObjectURL(file) });
  };

  const addEdu = () => setData({ ...data, education: [...data.education, { id: Date.now().toString(), degree: '', school: '', year: '', marks: '' }] });
  const removeEdu = (id: string) => setData({ ...data, education: data.education.filter(e => e.id !== id) });
  const addExp = () => setData({ ...data, experience: [...data.experience, { id: Date.now().toString(), role: '', company: '', year: '', desc: '' }] });
  const removeExp = (id: string) => setData({ ...data, experience: data.experience.filter(e => e.id !== id) });

  const updateEdu = (id: string, field: string, value: string) => setData({ ...data, education: data.education.map(e => e.id === id ? { ...e, [field]: value } : e) });
  const updateExp = (id: string, field: string, value: string) => setData({ ...data, experience: data.experience.map(e => e.id === id ? { ...e, [field]: value } : e) });

  // 🌟 PRO PDF GENERATION ENGINE 🌟
  const generatePDF = async () => {
    if (!previewRef.current) return;
    setIsProcessing(true);
    try {
      // Ab html2canvas-pro modern CSS colors (lab, oklch) ko easily handle kar lega
      const canvas = await html2canvas(previewRef.current, { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true, 
        scrollY: -window.scrollY, 
        backgroundColor: '#ffffff' 
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const safeName = data.personal.name ? data.personal.name.replace(/\s+/g, '_') : 'My';
      pdf.save(`${safeName}_Resume.pdf`);
    } catch (error: any) {
      console.error("PDF Engine Crash Report:", error);
      alert(`Oops! PDF Generate nahi ho paya. Reason: ${error.message || "Image Format Issue"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderResumeTemplate = () => {
    const { template, border, personal, education, experience, skills, languages, hobbies, photo } = data;
    const skillList = skills.split(',').filter(s => s.trim());
    const langList = languages.split(',').filter(s => s.trim());
    const hobbyList = hobbies.split(',').filter(s => s.trim());

    switch(template) {
      case 't1': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white text-black font-serif shadow-2xl p-10 box-border flex flex-col ${border}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-black uppercase">{personal.name}</h1>
                <div className="mt-4 text-sm space-y-1">
                  <p><strong>Phone:</strong> {personal.phone}</p>
                  <p><strong>Email:</strong> {personal.email}</p>
                  <p><strong>Address:</strong> {personal.address}</p>
                </div>
              </div>
              <div className="w-32 h-32 bg-blue-500 p-1">
                 {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-100"></div>}
              </div>
            </div>
            
            <div className="bg-gray-200 border-y-2 border-gray-400 font-bold uppercase p-1 mb-3 text-sm">Personal Information</div>
            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
              <div className="font-bold">Date of Birth</div><div className="col-span-2">: {personal.dob}</div>
              <div className="font-bold">Nationality</div><div className="col-span-2">: {personal.nationality}</div>
            </div>

            <div className="bg-gray-200 border-y-2 border-gray-400 font-bold uppercase p-1 mb-3 text-sm">Objective</div>
            <p className="text-sm mb-4 text-justify">{personal.summary}</p>

            <div className="bg-gray-200 border-y-2 border-gray-400 font-bold uppercase p-1 mb-3 text-sm">Education</div>
            <table className="w-full text-sm border-collapse border border-gray-400 mb-4 text-center">
              <thead><tr className="bg-gray-100"><th className="border border-gray-400 p-1">Degree</th><th className="border border-gray-400 p-1">Institution</th><th className="border border-gray-400 p-1">Year</th><th className="border border-gray-400 p-1">Marks</th></tr></thead>
              <tbody>
                {education.map(edu => <tr key={edu.id}><td className="border border-gray-400 p-1">{edu.degree}</td><td className="border border-gray-400 p-1">{edu.school}</td><td className="border border-gray-400 p-1">{edu.year}</td><td className="border border-gray-400 p-1">{edu.marks}</td></tr>)}
              </tbody>
            </table>

            <div className="bg-gray-200 border-y-2 border-gray-400 font-bold uppercase p-1 mb-3 text-sm">Skills & Languages</div>
            <ul className="list-disc list-inside text-sm mb-4">
              {skillList.map((s,i)=><li key={i}>{s}</li>)}
            </ul>
          </div>
        );

      case 't2': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white text-black font-serif shadow-2xl p-12 box-border flex flex-col ${border}`}>
            <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold uppercase">RESUME</h1>
                <h2 className="text-xl font-bold mt-4">{personal.name}</h2>
                <p className="text-sm mt-2 w-64">{personal.address}<br/>{personal.phone}<br/>{personal.email}</p>
              </div>
              {photo && <img src={photo} className="w-28 h-32 object-cover border border-black p-1" />}
            </div>
            
            <h3 className="font-bold text-md mb-2 uppercase">Personal Data</h3>
            <div className="grid grid-cols-4 text-sm mb-6 gap-y-1">
              <div className="col-span-1">Date of Birth</div><div className="col-span-3">: {personal.dob}</div>
              <div className="col-span-1">Nationality</div><div className="col-span-3">: {personal.nationality}</div>
              <div className="col-span-1">Languages</div><div className="col-span-3">: {languages}</div>
            </div>

            <h3 className="font-bold text-md mb-2 uppercase">Skills & Interests</h3>
            <p className="text-sm mb-6 leading-relaxed">{skills}<br/>{hobbies}</p>

            <h3 className="font-bold text-md mb-2 uppercase">Education</h3>
            <div className="space-y-4 mb-6">
              {education.map(edu => (
                <div key={edu.id} className="grid grid-cols-4 text-sm">
                  <div className="col-span-1 font-bold">{edu.year}</div>
                  <div className="col-span-3">{edu.degree}<br/>{edu.school}<br/>Marks: {edu.marks}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 't3': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white text-black font-sans shadow-2xl p-12 box-border ${border}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-black uppercase border-b-2 border-black pb-1 mb-4">Curriculum Vitae (CV)</h1>
                <h3 className="font-bold uppercase text-md mb-2 border-b border-black inline-block">Personal Data</h3>
                <div className="grid grid-cols-4 text-sm gap-y-1 w-[450px]">
                  <div className="col-span-1">Name</div><div className="col-span-3">: {personal.name}</div>
                  <div className="col-span-1">Address</div><div className="col-span-3">: {personal.address}</div>
                  <div className="col-span-1">Phone</div><div className="col-span-3">: {personal.phone}</div>
                  <div className="col-span-1">Email</div><div className="col-span-3">: {personal.email}</div>
                </div>
              </div>
              <div className="bg-red-600 p-2">
                {photo && <img src={photo} className="w-32 h-40 object-cover border border-white" />}
              </div>
            </div>

            <h3 className="font-bold uppercase text-md mb-2 border-b border-black inline-block">Educational Background</h3>
            <table className="w-full text-sm border-collapse border border-black mb-6 text-center">
              <thead><tr><th className="border border-black p-1">Period</th><th className="border border-black p-1">School / Institution</th><th className="border border-black p-1">Major / Degree</th></tr></thead>
              <tbody>
                {education.map(edu => <tr key={edu.id}><td className="border border-black p-1">{edu.year}</td><td className="border border-black p-1">{edu.school}</td><td className="border border-black p-1">{edu.degree}</td></tr>)}
              </tbody>
            </table>

            <h3 className="font-bold uppercase text-md mb-2 border-b border-black inline-block">Abilities</h3>
            <div className="text-sm space-y-1 mb-6">
              <p><strong>Technology Skill:</strong> {skills}</p>
              <p><strong>Language Skill:</strong> {languages}</p>
            </div>

            <h3 className="font-bold uppercase text-md mb-2 border-b border-black inline-block">Work Experience</h3>
            <div className="text-sm space-y-2">
              {experience.map(exp => (
                <p key={exp.id}><strong>{exp.year}</strong> - {exp.role} at {exp.company}</p>
              ))}
            </div>
          </div>
        );

      case 't4': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white text-black font-sans shadow-2xl p-10 box-border flex flex-col ${border}`}>
            <h1 className="text-2xl font-bold border-b-2 border-red-900 pb-2 mb-4 text-center uppercase tracking-widest">Curriculum Vitae</h1>
            
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 bg-gray-100 p-4 border-r border-gray-300">
                {photo && <img src={photo} className="w-full h-auto object-cover border-2 border-gray-300 mb-4" />}
                <h4 className="font-bold border-b border-gray-400 mb-2">Contact Address :</h4>
                <p className="text-sm mb-4 leading-relaxed">{personal.name}<br/>{personal.address}<br/>Mob: {personal.phone}<br/>Email: {personal.email}</p>
                
                <h4 className="font-bold border-b border-gray-400 mb-2">Personal Information :</h4>
                <p className="text-sm leading-relaxed mb-4">DOB: {personal.dob}<br/>Nationality: {personal.nationality}</p>
              </div>

              <div className="col-span-8">
                <h4 className="font-bold text-md mb-1 underline">Objective :</h4>
                <p className="text-sm text-justify mb-4 p-2 border border-gray-300 bg-gray-50">{personal.summary}</p>

                <h4 className="font-bold text-md mb-2 underline">Work Experience :</h4>
                <ul className="list-disc list-inside text-sm mb-4 space-y-2">
                  {experience.map(exp => <li key={exp.id}>Worked as <strong>{exp.role}</strong> in {exp.company} ({exp.year}).<br/><span className="pl-5 text-gray-600 block">{exp.desc}</span></li>)}
                </ul>

                <h4 className="font-bold text-md mb-2 bg-gray-200 p-1">Education :</h4>
                <ul className="list-disc list-inside text-sm mb-4 space-y-1">
                  {education.map(edu => <li key={edu.id}>{edu.degree} from {edu.school} ({edu.year}) - {edu.marks}</li>)}
                </ul>

                <h4 className="font-bold text-md mb-2 bg-gray-200 p-1">IT Skills :</h4>
                <div className="text-sm flex flex-wrap gap-2">
                   {skillList.map((s,i)=><span key={i}>• {s}</span>)}
                </div>
              </div>
            </div>
          </div>
        );

      case 't5': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white flex shadow-2xl overflow-hidden font-sans box-border ${border}`}>
            <div className="w-1/3 bg-[#1e3c45] text-white p-8 flex flex-col">
              {photo && <img src={photo} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#b99553] mb-6" />}
              
              <div className="text-sm space-y-3 mb-8">
                <p className="flex items-center gap-2">📞 {personal.phone}</p>
                <p className="flex items-center gap-2">✉️ {personal.email}</p>
                <p className="flex items-center gap-2">📍 {personal.address}</p>
              </div>

              <h3 className="bg-transparent border border-[#b99553] text-[#b99553] text-center font-bold py-1 rounded-full mb-4 uppercase tracking-widest text-sm">Skills</h3>
              <ul className="list-disc list-inside text-sm space-y-1 mb-8 text-gray-300">
                {skillList.map((s,i)=><li key={i}>{s}</li>)}
              </ul>

              <h3 className="bg-transparent border border-[#b99553] text-[#b99553] text-center font-bold py-1 rounded-full mb-4 uppercase tracking-widest text-sm">Languages</h3>
              <ul className="list-disc list-inside text-sm space-y-1 mb-8 text-gray-300">
                {langList.map((s,i)=><li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="w-2/3 p-8 bg-white relative">
              <div className="absolute top-0 right-0 w-full h-32 bg-[#1e3c45]"></div>
              <div className="relative z-10 pt-4 mb-8">
                <h1 className="text-4xl font-black text-[#b99553] uppercase">{personal.name.split(' ')[0]} <span className="text-white">{personal.name.split(' ').slice(1).join(' ')}</span></h1>
                <h2 className="text-xl text-gray-300 uppercase tracking-widest mt-1">{personal.title}</h2>
                <p className="text-sm mt-4 text-gray-700 leading-relaxed text-justify bg-white/90 p-3 rounded">{personal.summary}</p>
              </div>

              <h3 className="bg-[#c2a36b] text-white font-bold py-1 px-4 rounded-full mb-4 uppercase tracking-widest text-center w-max mx-auto text-sm">Experience</h3>
              <div className="space-y-6 mb-8">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <h4 className="font-bold text-[#1e3c45]">{exp.role}</h4>
                    <p className="text-sm text-gray-500 mb-2">{exp.company} | {exp.year}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>

              <h3 className="bg-[#c2a36b] text-white font-bold py-1 px-4 rounded-full mb-4 uppercase tracking-widest text-center w-max mx-auto text-sm">Education</h3>
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id}>
                    <h4 className="font-bold text-[#1e3c45]">{edu.degree}</h4>
                    <p className="text-sm text-gray-500">{edu.school}</p>
                    <p className="text-sm text-gray-400 font-bold">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 't6': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white flex shadow-2xl font-sans box-border ${border}`}>
            <div className="w-[35%] bg-gray-100 p-8 flex flex-col items-center border-r border-gray-300">
              {photo && <img src={photo} className="w-40 h-40 rounded-full object-cover mb-6 border-4 border-white shadow-md" />}
              
              <div className="bg-[#3e3d38] w-full text-white text-center py-2 font-bold mb-4 uppercase text-sm">Contact</div>
              <div className="text-xs w-full space-y-2 mb-8 text-gray-700">
                <p>📞 {personal.phone}</p>
                <p>✉️ {personal.email}</p>
                <p>📍 {personal.address}</p>
              </div>

              <div className="bg-[#3e3d38] w-full text-white text-center py-2 font-bold mb-4 uppercase text-sm">Education</div>
              <div className="w-full space-y-4 mb-8">
                {education.map(edu => (
                  <div key={edu.id} className="text-xs">
                    <p className="font-bold text-gray-800">{edu.degree}</p>
                    <p className="text-gray-600">{edu.school}</p>
                    <p className="text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#3e3d38] w-full text-white text-center py-2 font-bold mb-4 uppercase text-sm">Skills</div>
              <div className="w-full text-xs font-bold text-gray-700 space-y-2">
                {skillList.map((s,i)=><p key={i}>{s}</p>)}
              </div>
            </div>

            <div className="w-[65%] p-10">
              <h1 className="text-5xl font-black text-[#3e3d38] uppercase leading-none mb-2">{personal.name.split(' ')[0]}<br/>{personal.name.split(' ').slice(1).join(' ')}</h1>
              <h2 className="text-xl text-gray-500 uppercase tracking-widest mb-10">{personal.title}</h2>

              <div className="bg-[#3e3d38] text-white py-2 px-4 font-bold mb-6 uppercase text-sm w-max">Work Experience</div>
              <div className="space-y-6">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-md text-[#3e3d38] uppercase">{exp.role}</h4>
                      <span className="text-sm font-bold text-gray-500">{exp.year}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-2">{exp.company}</p>
                    <p className="text-xs text-gray-600 leading-relaxed text-justify">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 't7': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white text-black font-sans shadow-2xl p-12 box-border flex flex-col ${border}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-black text-[#1e61b0] uppercase">{personal.name}</h1>
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-widest mt-2">{personal.title}</h2>
                <p className="text-sm text-gray-600 mt-2">{personal.address} | {personal.phone} | {personal.email}</p>
              </div>
              {photo && <img src={photo} className="w-24 h-28 object-cover rounded bg-gray-100" />}
            </div>

            <div className="border-b-2 border-[#1e61b0] mb-2"><h3 className="font-bold text-[#1e61b0] uppercase text-sm">Summary</h3></div>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">{personal.summary}</p>

            <div className="border-b-2 border-[#1e61b0] mb-2"><h3 className="font-bold text-[#1e61b0] uppercase text-sm">Professional Experience</h3></div>
            <div className="space-y-4 mb-6">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between font-bold text-sm text-gray-800"><span>{exp.role}, {exp.company}</span><span>{exp.year}</span></div>
                  <p className="text-sm text-gray-600 mt-1">• {exp.desc}</p>
                </div>
              ))}
            </div>

            <div className="border-b-2 border-[#1e61b0] mb-2"><h3 className="font-bold text-[#1e61b0] uppercase text-sm">Education</h3></div>
            <div className="space-y-3 mb-6">
              {education.map(edu => (
                <div key={edu.id} className="flex justify-between text-sm">
                  <div><span className="font-bold text-gray-800">{edu.degree}</span><br/><span className="text-gray-600">{edu.school}</span></div>
                  <div className="font-bold text-gray-800">{edu.year}</div>
                </div>
              ))}
            </div>

            <div className="border-b-2 border-[#1e61b0] mb-2"><h3 className="font-bold text-[#1e61b0] uppercase text-sm">Technical Skills</h3></div>
            <p className="text-sm text-gray-700">{skills}</p>
          </div>
        );

      case 't8': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white font-sans shadow-2xl box-border flex flex-col ${border}`}>
            <div className="bg-[#2c3e50] text-white p-10 flex items-center gap-6">
              {photo && <img src={photo} className="w-32 h-32 rounded-full object-cover border-4 border-gray-400" />}
              <div>
                <h1 className="text-4xl font-black uppercase tracking-wider">{personal.name}</h1>
                <h2 className="text-xl text-[#73a839] mt-1 mb-3">{personal.title}</h2>
                <p className="text-sm text-gray-300 leading-relaxed">{personal.summary}</p>
              </div>
            </div>
            
            <div className="bg-[#1e2a36] text-gray-300 text-xs py-2 px-10 flex justify-between">
              <span>📞 {personal.phone}</span><span>✉️ {personal.email}</span><span>📍 {personal.address}</span>
            </div>

            <div className="grid grid-cols-3 p-10 gap-8 h-full">
              <div className="col-span-2 space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#73a839] mb-4">Work Experience</h3>
                  <div className="space-y-6">
                    {experience.map(exp => (
                      <div key={exp.id}>
                        <h4 className="font-bold text-gray-800 text-lg">{exp.role}</h4>
                        <div className="flex justify-between text-sm text-gray-500 mb-2 italic"><span>{exp.company}</span><span>{exp.year}</span></div>
                        <p className="text-sm text-gray-600 leading-relaxed">{exp.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#73a839] mb-4">Education</h3>
                  <div className="space-y-4">
                    {education.map(edu => (
                      <div key={edu.id} className="flex justify-between items-start">
                        <div><h4 className="font-bold text-gray-800">{edu.degree}</h4><p className="text-sm text-gray-500 italic">{edu.school}</p></div>
                        <span className="text-sm text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-1 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-[#73a839] mb-4">Skills</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    {skillList.map((s,i)=><li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#73a839] mb-4">Languages</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    {langList.map((s,i)=><li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 't9': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white text-gray-800 font-sans shadow-2xl p-8 box-border flex flex-col ${border}`}>
            <div className="flex items-center gap-6 mb-6">
               <div className="w-32 h-32 rounded-full border-4 border-[#185b9d] overflow-hidden flex-shrink-0 p-1">
                 {photo ? <img src={photo} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-blue-100 rounded-full"></div>}
               </div>
               <div className="flex-1">
                 <h1 className="text-4xl font-black text-[#185b9d] uppercase mb-1">{personal.name}</h1>
                 <h2 className="text-lg text-gray-500 font-bold">{personal.title}</h2>
               </div>
               <div className="text-xs text-right space-y-1 text-gray-600">
                 <p>📞 {personal.phone}</p><p>✉️ {personal.email}</p><p>📍 {personal.address}</p>
               </div>
            </div>

            <div className="bg-[#185b9d] text-white text-center font-bold py-1 uppercase text-sm mb-3">Career Objective</div>
            <p className="text-sm text-center italic text-gray-600 px-10 mb-6">{personal.summary}</p>

            <div className="bg-[#185b9d] text-white text-center font-bold py-1 uppercase text-sm mb-3">Education</div>
            <div className="space-y-3 mb-6 px-4">
              {education.map(edu => (
                <div key={edu.id} className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <div><span className="font-bold text-gray-800">{edu.degree}</span> || {edu.school} <br/><span className="text-gray-500">Marks: {edu.marks}</span></div>
                  <div className="font-bold">{edu.year}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
               <div>
                 <div className="bg-[#185b9d] text-white text-center font-bold py-1 uppercase text-sm mb-3">Key Skills</div>
                 <ul className="list-disc list-inside text-sm space-y-2 px-2">
                   {skillList.map((s,i)=><li key={i} className="bg-gray-100 px-2 py-1 rounded inline-block w-full">{s}</li>)}
                 </ul>
               </div>
               <div>
                 <div className="bg-[#185b9d] text-white text-center font-bold py-1 uppercase text-sm mb-3">Experience</div>
                 <div className="text-sm space-y-3 px-2 border-l-2 border-dashed border-gray-300 pl-4">
                   {experience.map(exp => (
                     <div key={exp.id}>
                       <p className="font-bold text-gray-800">• {exp.role} || {exp.company}</p>
                       <p className="text-gray-500 italic mb-1">{exp.year}</p>
                       <p className="text-gray-600 leading-tight">{exp.desc}</p>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            <div className="bg-[#185b9d] text-white text-center font-bold py-1 uppercase text-sm mb-3">Additional Information</div>
            <div className="text-sm px-4 space-y-2">
              <p><strong>Languages:</strong> {languages}</p>
              <p><strong>Date of Birth:</strong> {personal.dob}</p>
            </div>
          </div>
        );

      case 't10': 
        return (
          <div className={`w-[794px] h-[1123px] bg-white flex shadow-2xl overflow-hidden font-sans box-border ${border}`}>
            <div className="w-[30%] bg-[#f4f4f6] p-8 flex flex-col items-center text-center">
              {photo ? <img src={photo} className="w-32 h-32 rounded-full object-cover shadow-md mb-6 border-4 border-white" /> : <div className="w-32 h-32 rounded-full bg-gray-300 mb-6 border-4 border-white"></div>}
              
              <div className="text-xs text-left w-full space-y-3 mb-8 text-gray-700">
                <p className="break-words">✉️ {personal.email}</p>
                <p>📞 {personal.phone}</p>
                <p>📍 {personal.address}</p>
              </div>

              <h3 className="w-full text-left font-black text-[#513c8b] text-lg uppercase mb-3 border-b-2 border-[#513c8b]">Skills</h3>
              <div className="w-full text-left text-sm text-gray-700 space-y-2 mb-8">
                {skillList.map((s,i)=><p key={i}>{s}</p>)}
              </div>

              <h3 className="w-full text-left font-black text-[#513c8b] text-lg uppercase mb-3 border-b-2 border-[#513c8b]">Languages</h3>
              <div className="w-full text-left text-sm text-gray-700 space-y-2 mb-8">
                {langList.map((s,i)=><p key={i}>{s}</p>)}
              </div>
            </div>

            <div className="w-[70%] bg-white flex flex-col">
              <div className="bg-[#513c8b] text-white p-10">
                <h1 className="text-5xl font-black mb-2">{personal.name}</h1>
                <h2 className="text-xl font-bold text-gray-200 mb-4">{personal.title}</h2>
                <p className="text-sm leading-relaxed">{personal.summary}</p>
              </div>

              <div className="p-10 space-y-8 relative">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <div className="w-64 h-64 border-8 border-[#513c8b] rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>

                <section>
                  <h3 className="text-2xl font-black text-[#513c8b] uppercase border-b-2 border-[#513c8b] pb-1 mb-4">Education</h3>
                  <div className="space-y-4">
                    {education.map(edu => (
                      <div key={edu.id}>
                        <h4 className="font-bold text-[#513c8b] text-lg">{edu.degree}</h4>
                        <h5 className="text-gray-700 font-medium">{edu.school}</h5>
                        <div className="flex justify-between text-sm text-gray-500 italic mt-1">
                          <span>{edu.year}</span><span>Marks: {edu.marks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-[#513c8b] uppercase border-b-2 border-[#513c8b] pb-1 mb-4">Experience</h3>
                  <div className="space-y-6">
                    {experience.map(exp => (
                      <div key={exp.id}>
                        <h4 className="font-bold text-[#513c8b] text-lg">{exp.role}</h4>
                        <h5 className="text-gray-700 font-medium">{exp.company}</h5>
                        <p className="text-sm text-gray-500 italic mb-2">{exp.year}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">• {exp.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
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
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-6">1. Choose Template</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  {id:'t1', name:'Fresher Basic'}, {id:'t2', name:'Classic B&W'}, {id:'t3', name:'Standard Red'}, 
                  {id:'t4', name:'Detailed Pro'}, {id:'t5', name:'Modern Sidebar'}, {id:'t6', name:'Creative Dark'}, 
                  {id:'t7', name:'Corporate Blue'}, {id:'t8', name:'Pro Green'}, {id:'t9', name:'Blocky Fresher'}, 
                  {id:'t10', name:'Modern Purple'}
                ].map(t => (
                  <button 
                    key={t.id} onClick={() => setData({...data, template: t.id as Template})}
                    className={`p-3 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${data.template === t.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 🌟 NEW BORDER SELECTION UI 🌟 */}
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-6">2. Choose Page Border</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BORDER_OPTIONS.map(b => (
                  <button 
                    key={b.id} onClick={() => setData({...data, border: b.id})}
                    className={`p-3 rounded-xl border-2 font-black text-xs tracking-wider transition-all ${data.border === b.id ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
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
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Full Name</label><input type="text" value={data.personal.name} onChange={e => handlePersonal('name', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Professional Title</label><input type="text" value={data.personal.title} onChange={e => handlePersonal('title', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Email Address</label><input type="email" value={data.personal.email} onChange={e => handlePersonal('email', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label><input type="text" value={data.personal.phone} onChange={e => handlePersonal('phone', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label><input type="text" value={data.personal.dob} onChange={e => handlePersonal('dob', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Nationality</label><input type="text" value={data.personal.nationality} onChange={e => handlePersonal('nationality', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Location / Address</label><input type="text" value={data.personal.address} onChange={e => handlePersonal('address', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Profile Summary / Objective</label><textarea value={data.personal.summary} onChange={e => handlePersonal('summary', e.target.value)} rows={3} className="w-full p-3 border rounded-xl font-medium bg-slate-50 mt-1 focus:border-blue-500 outline-none resize-none" /></div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800">Education</h3>
            {data.education.map(edu => (
              <div key={edu.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                <button onClick={() => removeEdu(edu.id)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><input placeholder="Degree / Course" value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} className="w-full p-2 border rounded font-bold outline-none" /></div>
                  <div className="col-span-2"><input placeholder="University / School / Board" value={edu.school} onChange={e => updateEdu(edu.id, 'school', e.target.value)} className="w-full p-2 border rounded font-medium text-sm outline-none" /></div>
                  <div className="col-span-1"><input placeholder="Year (e.g. 2020-24)" value={edu.year} onChange={e => updateEdu(edu.id, 'year', e.target.value)} className="w-full p-2 border rounded font-bold text-sm outline-none" /></div>
                  <div className="col-span-1"><input placeholder="Marks/Percentage" value={edu.marks} onChange={e => updateEdu(edu.id, 'marks', e.target.value)} className="w-full p-2 border rounded font-bold text-sm outline-none" /></div>
                </div>
              </div>
            ))}
            <button onClick={addEdu} className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-xl hover:bg-blue-50">+ Add Education</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800">Skills, Languages & Hobbies</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Skills (Comma Separated)</label>
              <textarea value={data.skills} onChange={e => setData({...data, skills: e.target.value})} rows={2} placeholder="e.g. HTML, CSS, JavaScript" className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Languages (Comma Separated)</label>
              <input type="text" value={data.languages} onChange={e => setData({...data, languages: e.target.value})} placeholder="e.g. English, Hindi" className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Hobbies / Interests (Comma Separated)</label>
              <input type="text" value={data.hobbies} onChange={e => setData({...data, hobbies: e.target.value})} placeholder="e.g. Cricket, Reading" className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800">Experience / Projects</h3>
            {data.experience.map(exp => (
              <div key={exp.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                <button onClick={() => removeExp(exp.id)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><input placeholder="Job Title / Project Name" value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} className="w-full p-2 border rounded font-bold outline-none" /></div>
                  <div className="col-span-1"><input placeholder="Company / Platform" value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} className="w-full p-2 border rounded font-medium text-sm outline-none" /></div>
                  <div className="col-span-1"><input placeholder="Duration (e.g. 2022-Present)" value={exp.year} onChange={e => updateExp(exp.id, 'year', e.target.value)} className="w-full p-2 border rounded font-bold text-sm outline-none" /></div>
                  <div className="col-span-2"><textarea placeholder="Describe your work..." value={exp.desc} onChange={e => updateExp(exp.id, 'desc', e.target.value)} rows={2} className="w-full p-2 border rounded font-medium text-sm resize-none outline-none" /></div>
                </div>
              </div>
            ))}
            <button onClick={addExp} className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-xl hover:bg-blue-50">+ Add Experience</button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
            <h3 className="text-2xl font-black text-slate-800">Photo Upload (Optional)</h3>
            <div className="border-4 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center relative hover:border-blue-400 bg-slate-50 transition-colors">
              {data.photo ? <img src={data.photo} className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white mb-4" /> : <span className="text-6xl mb-4">📸</span>}
              <p className="font-bold text-slate-600 mb-2">{data.photo ? 'Change Photo' : 'Upload Profile Photo'}</p>
              <input type="file" accept="image/*" onChange={handlePhoto} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            {data.photo && <button onClick={() => setData({...data, photo: null})} className="text-red-500 font-bold text-sm hover:underline">Remove Photo</button>}
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <span className="text-6xl block mb-4">🎉</span>
            <h3 className="text-3xl font-black text-slate-800">Ready to Export!</h3>
            <p className="text-slate-500 font-medium">Your resume looks great. Download it as a high-quality PDF to apply for jobs.</p>
            <button onClick={generatePDF} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 mt-4 flex justify-center items-center gap-2">
              {isProcessing ? 'Generating PDF...' : '📥 Download HD PDF'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Smart Resume Builder</h2>
        <p className="text-slate-500 mt-2 text-lg">Choose from 10 Premium Templates and build ATS-friendly A4 resumes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col min-h-[600px]">
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
        <div className="lg:col-span-7 bg-slate-100 rounded-3xl border border-slate-200 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[600px] relative">
           <span className="absolute top-4 left-6 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200 z-10 shadow-sm">
              Live Preview: {data.template.toUpperCase()}
           </span>
           <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
              <div className="origin-top scale-[0.45] sm:scale-[0.5] md:scale-[0.55] lg:scale-[0.55] xl:scale-[0.65] transition-all duration-300 flex-shrink-0" style={{ width: '794px', height: '1123px' }}>
                 <div ref={previewRef} className="w-full h-full shadow-2xl overflow-hidden">
                    {renderResumeTemplate()}
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}