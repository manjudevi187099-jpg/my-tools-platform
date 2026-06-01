'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// --- DATA TYPES ---
type Template = 'modern' | 'classic' | 'minimal';

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
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
  photo: string | null;
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string;
}

const FLOW_STEPS = [
  'Template', 'Personal Details', 'Education', 'Skills', 'Experience', 'Photo', 'Generate'
];

export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Initial State
  const [data, setData] = useState<ResumeData>({
    template: 'modern',
    photo: null,
    personal: { name: 'Rahul Kumar', title: 'Software Developer', email: 'rahul@example.com', phone: '+91 9876543210', address: 'New Delhi, India', summary: 'Passionate developer with 3+ years of experience building scalable web applications and learning new technologies.' },
    education: [{ id: '1', degree: 'B.Tech in Computer Science', school: 'Delhi University', year: '2018 - 2022' }],
    experience: [{ id: '1', role: 'Frontend Engineer', company: 'Tech Solutions Ltd.', year: '2022 - Present', desc: 'Developed responsive web apps using React and Next.js. Improved performance by 40%.' }],
    skills: 'JavaScript, React, Node.js, Tailwind CSS, Git',
  });

  // Handle Input Changes
  const handlePersonal = (field: string, value: string) => setData({ ...data, personal: { ...data.personal, [field]: value } });
  
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setData({ ...data, photo: url });
    }
  };

  // Add/Remove Rows
  const addEdu = () => setData({ ...data, education: [...data.education, { id: Date.now().toString(), degree: '', school: '', year: '' }] });
  const removeEdu = (id: string) => setData({ ...data, education: data.education.filter(e => e.id !== id) });
  
  const addExp = () => setData({ ...data, experience: [...data.experience, { id: Date.now().toString(), role: '', company: '', year: '', desc: '' }] });
  const removeExp = (id: string) => setData({ ...data, experience: data.experience.filter(e => e.id !== id) });

  // Update Array Rows
  const updateEdu = (id: string, field: string, value: string) => {
    setData({ ...data, education: data.education.map(e => e.id === id ? { ...e, [field]: value } : e) });
  };
  const updateExp = (id: string, field: string, value: string) => {
    setData({ ...data, experience: data.experience.map(e => e.id === id ? { ...e, [field]: value } : e) });
  };

  // 🌟 PDF GENERATION ENGINE 🌟
  const generatePDF = async () => {
    if (!previewRef.current) return;
    setIsProcessing(true);
    try {
      // Capture the A4 div accurately
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.personal.name.replace(' ', '_')}_Resume.pdf`);
    } catch (error) {
      alert("Error generating PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RESUME TEMPLATES RENDERING ---
  const renderResumeTemplate = () => {
    const { template, personal, education, experience, skills, photo } = data;

    if (template === 'modern') {
      return (
        <div className="w-[794px] h-[1123px] bg-white text-slate-800 font-sans shadow-2xl relative overflow-hidden flex flex-col box-border">
          {/* Header */}
          <div className="bg-blue-800 text-white p-10 flex items-center gap-6">
            {photo && <img src={photo} className="w-32 h-32 rounded-full border-4 border-blue-400 object-cover" />}
            <div>
              <h1 className="text-5xl font-black tracking-tight">{personal.name || 'YOUR NAME'}</h1>
              <h2 className="text-2xl text-blue-200 mt-2 font-medium">{personal.title || 'Professional Title'}</h2>
            </div>
          </div>
          {/* Contact Bar */}
          <div className="bg-blue-900 text-blue-100 px-10 py-3 flex gap-6 text-sm font-medium">
            <span>📧 {personal.email}</span>
            <span>📱 {personal.phone}</span>
            <span>📍 {personal.address}</span>
          </div>
          {/* Body */}
          <div className="p-10 flex-1 grid grid-cols-12 gap-10">
            <div className="col-span-8 space-y-8">
              <section>
                <h3 className="text-2xl font-black text-blue-800 border-b-2 border-blue-100 pb-2 mb-4 uppercase tracking-wider">Profile Summary</h3>
                <p className="text-slate-600 leading-relaxed text-justify">{personal.summary}</p>
              </section>
              <section>
                <h3 className="text-2xl font-black text-blue-800 border-b-2 border-blue-100 pb-2 mb-4 uppercase tracking-wider">Experience</h3>
                <div className="space-y-6">
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <h4 className="text-xl font-bold text-slate-800">{exp.role}</h4>
                      <div className="flex justify-between text-blue-600 font-bold text-sm mb-2">
                        <span>{exp.company}</span>
                        <span>{exp.year}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{exp.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="col-span-4 space-y-8">
              <section>
                <h3 className="text-xl font-black text-blue-800 border-b-2 border-blue-100 pb-2 mb-4 uppercase tracking-wider">Education</h3>
                <div className="space-y-4">
                  {education.map(edu => (
                    <div key={edu.id}>
                      <h4 className="font-bold text-slate-800">{edu.degree}</h4>
                      <p className="text-slate-500 text-sm">{edu.school}</p>
                      <p className="text-blue-600 font-bold text-xs">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-xl font-black text-blue-800 border-b-2 border-blue-100 pb-2 mb-4 uppercase tracking-wider">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.split(',').map((skill, i) => skill.trim() && (
                    <span key={i} className="bg-blue-50 text-blue-800 px-3 py-1 rounded font-bold text-sm border border-blue-100">{skill.trim()}</span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      );
    }

    if (template === 'minimal') {
      return (
        <div className="w-[794px] h-[1123px] bg-white text-gray-900 font-serif shadow-2xl p-16 box-border flex flex-col">
          <div className="text-center border-b-4 border-gray-900 pb-8 mb-8">
            <h1 className="text-6xl font-black tracking-widest uppercase">{personal.name || 'YOUR NAME'}</h1>
            <h2 className="text-2xl text-gray-500 mt-3 italic">{personal.title || 'Professional Title'}</h2>
            <div className="mt-4 text-sm font-sans flex justify-center gap-4 text-gray-600">
              <span>{personal.email}</span> | <span>{personal.phone}</span> | <span>{personal.address}</span>
            </div>
          </div>
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed text-lg text-justify">{personal.summary}</p>
          </section>
          <section className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-widest mb-4">Experience</h3>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-end mb-1">
                    <h4 className="text-xl font-bold">{exp.role} <span className="text-gray-500 font-normal">at {exp.company}</span></h4>
                    <span className="text-sm font-bold font-sans">{exp.year}</span>
                  </div>
                  <p className="text-gray-700 text-md leading-relaxed">{exp.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-2 gap-8">
            <section>
              <h3 className="text-2xl font-black uppercase tracking-widest mb-4">Education</h3>
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id}>
                    <h4 className="font-bold text-lg">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.school} • <span className="font-sans font-bold text-sm">{edu.year}</span></p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-2xl font-black uppercase tracking-widest mb-4">Skills</h3>
              <p className="text-gray-700 text-lg leading-relaxed">{skills}</p>
            </section>
          </div>
        </div>
      );
    }

    // Default: Classic
    return (
      <div className="w-[794px] h-[1123px] bg-white text-slate-800 font-sans shadow-2xl p-12 box-border flex flex-col border-t-8 border-emerald-600">
        <div className="flex justify-between items-center border-b-2 border-slate-200 pb-6 mb-6">
          <div>
            <h1 className="text-5xl font-black text-slate-800">{personal.name || 'YOUR NAME'}</h1>
            <h2 className="text-xl text-emerald-600 mt-1 font-bold uppercase tracking-widest">{personal.title}</h2>
          </div>
          <div className="text-right text-sm text-slate-500 space-y-1">
            <p>{personal.address}</p>
            <p>{personal.phone}</p>
            <p>{personal.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-8 flex-1">
          <div className="col-span-4 border-r-2 border-slate-100 pr-6 space-y-8">
            {photo && <img src={photo} className="w-full aspect-square object-cover rounded shadow-md" />}
            <section>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest bg-slate-100 p-2 mb-4">Education</h3>
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id}>
                    <p className="text-emerald-600 font-bold text-xs">{edu.year}</p>
                    <h4 className="font-bold text-slate-800">{edu.degree}</h4>
                    <p className="text-slate-500 text-sm">{edu.school}</p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest bg-slate-100 p-2 mb-4">Skills</h3>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {skills.split(',').map((skill, i) => skill.trim() && <li key={i}>{skill.trim()}</li>)}
              </ul>
            </section>
          </div>
          <div className="col-span-8 space-y-8">
            <section>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b-2 border-emerald-100 pb-2 mb-4">Profile</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{personal.summary}</p>
            </section>
            <section>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b-2 border-emerald-100 pb-2 mb-4">Experience</h3>
              <div className="space-y-6">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-lg font-bold text-slate-800">{exp.role}</h4>
                      <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">{exp.year}</span>
                    </div>
                    <p className="text-slate-500 font-bold text-sm mb-2">{exp.company}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  // --- FORM RENDERER ---
  const renderFormStep = () => {
    switch(step) {
      case 0: // Template
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Choose Layout</h3>
            <div className="grid grid-cols-1 gap-4">
              {['modern', 'classic', 'minimal'].map(t => (
                <button 
                  key={t} onClick={() => setData({...data, template: t as Template})}
                  className={`p-4 rounded-xl border-2 font-black uppercase tracking-widest transition-all ${data.template === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}
                >
                  {t} Template
                </button>
              ))}
            </div>
          </div>
        );
      case 1: // Personal Details
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input type="text" value={data.personal.name} onChange={e => handlePersonal('name', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Professional Title</label>
                <input type="text" value={data.personal.title} onChange={e => handlePersonal('title', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input type="email" value={data.personal.email} onChange={e => handlePersonal('email', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <input type="text" value={data.personal.phone} onChange={e => handlePersonal('phone', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Location / Address</label>
                <input type="text" value={data.personal.address} onChange={e => handlePersonal('address', e.target.value)} className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Profile Summary</label>
                <textarea value={data.personal.summary} onChange={e => handlePersonal('summary', e.target.value)} rows={3} className="w-full p-3 border rounded-xl font-medium bg-slate-50 mt-1 focus:border-blue-500 outline-none resize-none" />
              </div>
            </div>
          </div>
        );
      case 2: // Education
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800">Education</h3>
            {data.education.map((edu, i) => (
              <div key={edu.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                <button onClick={() => removeEdu(edu.id)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><input placeholder="Degree / Course" value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} className="w-full p-2 border rounded font-bold" /></div>
                  <div className="col-span-1"><input placeholder="University / School" value={edu.school} onChange={e => updateEdu(edu.id, 'school', e.target.value)} className="w-full p-2 border rounded font-medium text-sm" /></div>
                  <div className="col-span-1"><input placeholder="Year (e.g. 2020-24)" value={edu.year} onChange={e => updateEdu(edu.id, 'year', e.target.value)} className="w-full p-2 border rounded font-bold text-sm" /></div>
                </div>
              </div>
            ))}
            <button onClick={addEdu} className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-xl hover:bg-blue-50">+ Add Education</button>
          </div>
        );
      case 3: // Skills
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Skills</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Enter Skills (Comma Separated)</label>
              <textarea value={data.skills} onChange={e => setData({...data, skills: e.target.value})} rows={4} placeholder="e.g. HTML, CSS, JavaScript, Team Leadership" className="w-full p-3 border rounded-xl font-bold bg-slate-50 mt-1 focus:border-blue-500 outline-none resize-none" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {data.skills.split(',').map((s, i) => s.trim() && <span key={i} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{s.trim()}</span>)}
            </div>
          </div>
        );
      case 4: // Experience
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black text-slate-800">Experience / Projects</h3>
            {data.experience.map((exp, i) => (
              <div key={exp.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                <button onClick={() => removeExp(exp.id)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><input placeholder="Job Title / Project Name" value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} className="w-full p-2 border rounded font-bold" /></div>
                  <div className="col-span-1"><input placeholder="Company / Platform" value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} className="w-full p-2 border rounded font-medium text-sm" /></div>
                  <div className="col-span-1"><input placeholder="Duration (e.g. 2022-Present)" value={exp.year} onChange={e => updateExp(exp.id, 'year', e.target.value)} className="w-full p-2 border rounded font-bold text-sm" /></div>
                  <div className="col-span-2"><textarea placeholder="Describe your work..." value={exp.desc} onChange={e => updateExp(exp.id, 'desc', e.target.value)} rows={2} className="w-full p-2 border rounded font-medium text-sm resize-none" /></div>
                </div>
              </div>
            ))}
            <button onClick={addExp} className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-xl hover:bg-blue-50">+ Add Experience</button>
          </div>
        );
      case 5: // Photo Upload
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
            <h3 className="text-2xl font-black text-slate-800">Photo Upload (Optional)</h3>
            <div className="border-4 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center relative hover:border-blue-400 bg-slate-50 transition-colors">
              {data.photo ? (
                <img src={data.photo} className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white mb-4" />
              ) : (
                <span className="text-6xl mb-4">📸</span>
              )}
              <p className="font-bold text-slate-600 mb-2">{data.photo ? 'Change Photo' : 'Upload Profile Photo'}</p>
              <input type="file" accept="image/*" onChange={handlePhoto} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            {data.photo && <button onClick={() => setData({...data, photo: null})} className="text-red-500 font-bold text-sm hover:underline">Remove Photo</button>}
          </div>
        );
      case 6: // Generate
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <span className="text-6xl block mb-4">🎉</span>
            <h3 className="text-3xl font-black text-slate-800">Ready to Export!</h3>
            <p className="text-slate-500 font-medium">Your resume looks great. Download it as a high-quality PDF to apply for jobs.</p>
            
            <button 
              onClick={generatePDF}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 rounded-xl shadow-xl transition-transform hover:-translate-y-1 mt-4 flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Generating PDF...' : '📥 Download HD PDF'}
            </button>
            <div className="flex gap-4 mt-4">
              <button disabled className="flex-1 bg-slate-200 text-slate-400 py-3 rounded-lg font-bold cursor-not-allowed text-sm">Download DOCX (Soon)</button>
              <button disabled className="flex-1 bg-slate-200 text-slate-400 py-3 rounded-lg font-bold cursor-not-allowed text-sm">Download PSD (Soon)</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Smart Resume Builder</h2>
        <p className="text-slate-500 mt-2 text-lg">Build professional, ATS-friendly A4 resumes in minutes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col min-h-[600px]">
          
          {/* Progress Bar & Step Name */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Step {step + 1} of {FLOW_STEPS.length}</span>
              <span className="text-xs font-bold text-slate-400">{FLOW_STEPS[step]}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((step + 1) / FLOW_STEPS.length) * 100}%` }}></div>
            </div>
          </div>

          {/* Dynamic Form Area */}
          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            {renderFormStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="pt-6 border-t border-slate-100 flex justify-between gap-4 mt-auto">
            <button 
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className={`px-6 py-3 rounded-xl font-bold transition-colors ${step === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              Back
            </button>
            <button 
              onClick={() => setStep(Math.min(FLOW_STEPS.length - 1, step + 1))}
              disabled={step === FLOW_STEPS.length - 1}
              className={`px-8 py-3 rounded-xl font-bold shadow-md transition-transform ${step === FLOW_STEPS.length - 1 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1'}`}
            >
              Next Step
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE A4 PREVIEW */}
        <div className="lg:col-span-7 bg-slate-100 rounded-3xl border border-slate-200 p-8 flex items-center justify-center overflow-hidden min-h-[600px] relative">
           <span className="absolute top-4 left-6 bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200 z-10">
              Live A4 Preview
           </span>
           
           {/* 
             Scaling wrapper to fit the 794x1123 (A4 at 96dpi) inside the container 
             The origin is top center so it scales down neatly in the UI
           */}
           <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl shadow-2xl">
              <div 
                 className="origin-top scale-[0.45] md:scale-[0.55] lg:scale-[0.6] xl:scale-[0.7] transition-all duration-300 flex-shrink-0"
                 style={{ width: '794px', height: '1123px' }}
              >
                 {/* This ref points to the actual template for html2canvas */}
                 <div ref={previewRef} className="w-full h-full">
                    {renderResumeTemplate()}
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}