'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, CreditCard, Camera, Building, Calendar, User, MapPin, Clock, ShieldCheck, QrCode, BookOpen, Settings } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function MegaAdmitCardBuilder() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  
  // Tab Management for massive form
  const [activeTab, setActiveTab] = useState('org'); // org, candidate, exam, subjects, security

  // Unified Massive State
  const [formData, setFormData] = useState({
    // ORG HEADER
    orgName: 'NATIONAL TESTING AGENCY (NTA)',
    orgAddress: 'Sector-62, Block A, New Delhi - 110001',
    helpline: '+91-11-40759000',
    email: 'support@nta.ac.in',
    website: 'www.nta.ac.in',
    
    // CANDIDATE
    candidateName: 'Rahul Sharma',
    fatherName: 'Mr. Rajesh Sharma',
    motherName: 'Mrs. Sunita Sharma',
    dob: '15-Aug-2004',
    gender: 'Male',
    category: 'General',
    aadhaar: '[Aadhaar Redacted]', // Secure Placeholder
    rollNo: '2026105432',
    appNo: 'APP2026998877',
    
    // EXAM & CENTER
    examName: 'JOINT ENTRANCE EXAMINATION (JEE) - 2026',
    courseName: 'B.Tech / B.E.',
    centerName: 'TCS iON Digital Zone IDZ 1',
    centerAddress: 'Plot No 2, Industrial Area, Noida',
    centerCode: 'UP-05-102',
    
    // TIMING
    examDate: '15-Jul-2026',
    reportingTime: '07:30 AM',
    gateCloseTime: '08:30 AM',
    examStartTime: '09:00 AM',
    examEndTime: '12:00 PM',
    
    // SECURITY & RULES
    qrText: 'VERIFIED_CANDIDATE_2026',
    rules: "1. The candidate must carry a printed copy of this Admit Card along with a valid Original Photo ID.\n2. No candidate will be allowed entry after the Gate Closing Time.\n3. Electronic devices, calculators, and mobile phones are strictly prohibited inside the examination hall.\n4. Follow COVID-19 protocols: Wear a mask and carry a transparent water bottle.",
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Physics, Chemistry, Mathematics', code: 'PCM-01', date: '15-Jul-2026', start: '09:00 AM', end: '12:00 PM' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSubject = () => setSubjects([...subjects, { id: Date.now(), name: '', code: '', date: '', start: '', end: '' }]);
  const updateSubject = (id: number, field: string, value: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const removeSubject = (id: number) => {
    if(subjects.length > 1) setSubjects(subjects.filter(s => s.id !== id));
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Admit_Card_${formData.rollNo}.pdf`);
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <ShieldCheck className="w-10 h-10 text-indigo-600" />
            Mega Admit Card Builder
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Advanced Dynamic Template with Security Features</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: TABBED FORM ================= */}
          <div className="xl:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* TABS HEADER */}
            <div className="flex bg-slate-800 p-2 text-xs font-bold text-slate-400 overflow-x-auto no-scrollbar rounded-t-3xl">
              <button onClick={() => setActiveTab('org')} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeTab === 'org' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}>Header</button>
              <button onClick={() => setActiveTab('candidate')} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeTab === 'candidate' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}>Candidate</button>
              <button onClick={() => setActiveTab('exam')} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeTab === 'exam' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}>Exam & Time</button>
              <button onClick={() => setActiveTab('subjects')} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeTab === 'subjects' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}>Subjects</button>
              <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}>Rules</button>
            </div>

            {/* TAB CONTENT (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              
              {activeTab === 'org' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Building className="w-4 h-4"/> Organization Info</h3>
                  <input type="text" name="orgName" placeholder="Organization Name" value={formData.orgName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                  <input type="text" name="orgAddress" placeholder="Address" value={formData.orgAddress} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="helpline" placeholder="Helpline No." value={formData.helpline} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                    <input type="text" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                    <input type="text" name="website" placeholder="Website URL" value={formData.website} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg focus:border-indigo-600" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Org Logo</label>
                    <input type="file" onChange={(e) => handleFileUpload(e, setLogoUrl)} className="w-full text-xs border p-1.5 rounded-lg bg-slate-50" />
                  </div>
                </div>
              )}

              {activeTab === 'candidate' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><User className="w-4 h-4"/> Candidate Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="candidateName" placeholder="Candidate Name" value={formData.candidateName} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="aadhaar" placeholder="Govt ID / Aadhaar" value={formData.aadhaar} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="rollNo" placeholder="Roll Number" value={formData.rollNo} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="appNo" placeholder="Application Number" value={formData.appNo} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Candidate Photo</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setPhotoUrl)} className="w-full text-xs border p-1.5 rounded-lg bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Candidate Signature</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setSignUrl)} className="w-full text-xs border p-1.5 rounded-lg bg-slate-50" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'exam' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><MapPin className="w-4 h-4"/> Exam & Center</h3>
                  <input type="text" name="examName" placeholder="Full Exam Name" value={formData.examName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg font-bold" />
                  <input type="text" name="courseName" placeholder="Course / Program Name" value={formData.courseName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                  
                  <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase"><Building className="w-3 h-3 inline"/> Center Details</h4>
                    <input type="text" name="centerName" placeholder="Center Name" value={formData.centerName} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="centerAddress" placeholder="Center Full Address" value={formData.centerAddress} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    <input type="text" name="centerCode" placeholder="Center Code" value={formData.centerCode} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase"><Clock className="w-3 h-3 inline"/> Timings</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="examDate" placeholder="Exam Date" value={formData.examDate} onChange={handleInputChange} className="col-span-2 w-full text-sm border p-2.5 rounded-lg" />
                      <input type="text" name="reportingTime" placeholder="Reporting Time" value={formData.reportingTime} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                      <input type="text" name="gateCloseTime" placeholder="Gate Close Time" value={formData.gateCloseTime} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                      <input type="text" name="examStartTime" placeholder="Start Time" value={formData.examStartTime} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                      <input type="text" name="examEndTime" placeholder="End Time" value={formData.examEndTime} onChange={handleInputChange} className="w-full text-sm border p-2.5 rounded-lg" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'subjects' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Subjects List</h3>
                    <button onClick={addSubject} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Add Subject</button>
                  </div>
                  {subjects.map((sub) => (
                    <div key={sub.id} className="p-3 border rounded-lg bg-slate-50 space-y-2">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Subject Name" value={sub.name} onChange={(e) => updateSubject(sub.id, 'name', e.target.value)} className="flex-1 text-xs border p-2 rounded" />
                        <input type="text" placeholder="Code" value={sub.code} onChange={(e) => updateSubject(sub.id, 'code', e.target.value)} className="w-20 text-xs border p-2 rounded" />
                        <button onClick={() => removeSubject(sub.id)} className="text-red-500 font-bold px-2">X</button>
                      </div>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Date" value={sub.date} onChange={(e) => updateSubject(sub.id, 'date', e.target.value)} className="flex-1 text-xs border p-2 rounded" />
                        <input type="text" placeholder="Start" value={sub.start} onChange={(e) => updateSubject(sub.id, 'start', e.target.value)} className="w-20 text-xs border p-2 rounded" />
                        <input type="text" placeholder="End" value={sub.end} onChange={(e) => updateSubject(sub.id, 'end', e.target.value)} className="w-20 text-xs border p-2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Settings className="w-4 h-4"/> Rules & Security</h3>
                  <textarea 
                    name="rules" 
                    value={formData.rules} 
                    onChange={handleInputChange} 
                    className="w-full h-40 text-xs border p-3 rounded-lg focus:border-indigo-600"
                    placeholder="Enter exam instructions and guidelines..."
                  />
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Watermark Image (Optional)</label>
                    <input type="file" accept="image/*" className="w-full text-xs border p-1.5 rounded-lg bg-slate-50" />
                  </div>
                </div>
              )}

            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="p-4 bg-slate-50 border-t flex gap-3">
              <button onClick={downloadPDF} disabled={isDownloadingPdf} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} Download Secure PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="xl:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              
              {/* A4 CANVAS */}
              <div ref={previewRef} className="bg-white w-[794px] min-h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-sans border-2 border-slate-300">
                
                {/* --- HEADER --- */}
                <div className="border-b-[3px] border-slate-900 bg-slate-50 p-6 flex items-center justify-between">
                  <div className="w-24 h-24 flex items-center justify-center">
                    {logoUrl ? <img src={logoUrl} className="max-h-full max-w-full" alt="logo" /> : <Building className="w-16 h-16 text-slate-300"/>}
                  </div>
                  <div className="flex-1 text-center px-4">
                    <h1 className="font-black text-2xl uppercase tracking-widest text-slate-900 leading-tight">{formData.orgName}</h1>
                    <p className="text-sm font-bold text-slate-700 mt-1">{formData.orgAddress}</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Helpline: {formData.helpline} | Email: {formData.email}</p>
                    <p className="text-xs font-semibold text-slate-600">Website: {formData.website}</p>
                  </div>
                  {/* Fake Barcode for security aspect */}
                  <div className="w-24 h-16 border-l-2 border-slate-300 pl-4 flex flex-col justify-center items-center">
                    <div className="w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiPjxwYXRoIGQ9Ik0wLDBIMnYzMEgwWk00LDBINnYzMEg0Wk04LDBoMXYzMEg4Wk0xMSwwaDN2MzBIMTFaTTE2LDBoMXYzMEgxNlpNMjAsMGg0djMwSDIwWk0yNiwwaDJ2MzBIMjZaTTMwLDBoMXYzMEgzMFpNMzMsMGgzdjMwSDMzWk0zOCwwaDF2MzBIMzhaTTQxLDBoMnYzMEg0MVpNNDUsMGgxdjMwSDQ1Wk00NywwaDR2MzBINDdaIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] bg-repeat-x opacity-80"></div>
                    <p className="text-[8px] mt-1 font-mono tracking-widest">{formData.appNo}</p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white text-center py-2">
                  <h2 className="text-xl font-black uppercase tracking-widest">E-ADMIT CARD</h2>
                  <p className="text-xs font-semibold uppercase">{formData.examName} | {formData.courseName}</p>
                </div>

                {/* --- CANDIDATE & CENTER SPLIT --- */}
                <div className="p-6 grid grid-cols-12 gap-6">
                  
                  {/* Candidate Details (Left) */}
                  <div className="col-span-9 space-y-4 border-r-2 border-slate-200 pr-6">
                    <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                      <div className="font-bold text-slate-600">Roll Number</div>
                      <div className="col-span-3 font-black text-lg">{formData.rollNo}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                      <div className="font-bold text-slate-600">Candidate Name</div>
                      <div className="col-span-3 font-bold uppercase">{formData.candidateName}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                      <div className="font-bold text-slate-600">Father's Name</div>
                      <div className="col-span-3 font-bold uppercase">{formData.fatherName}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                      <div className="font-bold text-slate-600">Mother's Name</div>
                      <div className="col-span-3 font-bold uppercase">{formData.motherName}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                      <div className="font-bold text-slate-600">DOB / Gender</div>
                      <div className="col-span-3 font-bold">{formData.dob} | {formData.gender}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                      <div className="font-bold text-slate-600">Category</div>
                      <div className="col-span-3 font-bold">{formData.category}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="font-bold text-slate-600">Govt ID</div>
                      <div className="col-span-3 font-bold">{formData.aadhaar}</div>
                    </div>
                  </div>

                  {/* Photo & Sign (Right) */}
                  <div className="col-span-3 flex flex-col items-center justify-start gap-4">
                    <div className="w-[120px] h-[150px] border-2 border-slate-400 bg-slate-100 flex items-center justify-center overflow-hidden p-1 shadow-sm">
                      {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <p className="text-xs font-bold text-slate-400">PHOTOGRAPH</p>}
                    </div>
                    <div className="w-[120px] h-[50px] border-2 border-slate-400 bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                      {signUrl ? <img src={signUrl} className="w-full h-full object-contain" /> : <p className="text-[10px] font-bold text-slate-400">SIGNATURE</p>}
                    </div>
                  </div>
                </div>

                {/* --- TEST CENTER DETAILS --- */}
                <div className="mx-6 border-2 border-slate-800">
                  <div className="bg-slate-200 text-slate-900 font-bold px-4 py-1.5 border-b-2 border-slate-800 text-sm uppercase">Test Center Details</div>
                  <div className="p-4 grid grid-cols-12 gap-4 text-sm">
                    <div className="col-span-3 font-bold text-slate-600">Center No.</div>
                    <div className="col-span-9 font-black">{formData.centerCode}</div>
                    <div className="col-span-3 font-bold text-slate-600">Venue Name</div>
                    <div className="col-span-9 font-bold uppercase">{formData.centerName}</div>
                    <div className="col-span-3 font-bold text-slate-600">Address</div>
                    <div className="col-span-9 font-semibold">{formData.centerAddress}</div>
                  </div>
                </div>

                {/* --- TIMING & SUBJECTS TABLE --- */}
                <div className="mx-6 mt-6 border-2 border-slate-800">
                  <div className="bg-slate-200 text-slate-900 font-bold px-4 py-1.5 border-b-2 border-slate-800 text-sm uppercase">Subject & Timing Details</div>
                  <table className="w-full text-sm text-center">
                    <thead className="bg-slate-100 border-b-2 border-slate-800 font-bold">
                      <tr>
                        <th className="py-2 border-r border-slate-400 w-10">Sl.</th>
                        <th className="py-2 border-r border-slate-400 text-left px-3">Subject Name</th>
                        <th className="py-2 border-r border-slate-400">Code</th>
                        <th className="py-2 border-r border-slate-400">Date</th>
                        <th className="py-2 border-r border-slate-400">Start Time</th>
                        <th className="py-2">End Time</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      {subjects.map((s, i) => (
                        <tr key={s.id} className="border-b border-slate-300">
                          <td className="py-2.5 border-r border-slate-400">{i + 1}</td>
                          <td className="py-2.5 border-r border-slate-400 text-left px-3">{s.name}</td>
                          <td className="py-2.5 border-r border-slate-400">{s.code}</td>
                          <td className="py-2.5 border-r border-slate-400 text-indigo-700">{s.date}</td>
                          <td className="py-2.5 border-r border-slate-400 text-emerald-700">{s.start}</td>
                          <td className="py-2.5 text-rose-700">{s.end}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* --- TIMELINE SUMMARY --- */}
                <div className="mx-6 mt-4 flex justify-between bg-slate-50 border border-slate-300 p-3 rounded text-sm font-bold shadow-sm">
                  <p><span className="text-slate-500">Reporting Time:</span> <span className="text-indigo-700">{formData.reportingTime}</span></p>
                  <p><span className="text-slate-500">Gate Closing Time:</span> <span className="text-rose-700">{formData.gateCloseTime}</span></p>
                </div>

                {/* --- INSTRUCTIONS & SECURITY FOOTER --- */}
                <div className="flex-1 mt-6 border-t-[3px] border-slate-900 pt-6 px-6 flex flex-col">
                  <h3 className="font-black text-sm uppercase underline mb-2">Important Instructions for Candidates</h3>
                  <div className="text-xs font-semibold text-justify whitespace-pre-wrap leading-relaxed text-slate-700">
                    {formData.rules}
                  </div>

                  <div className="mt-auto pt-10 pb-6 flex justify-between items-end border-t border-slate-300">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 border-2 border-slate-900 p-1 mb-1 flex items-center justify-center">
                        <QrCode className="w-12 h-12" />
                      </div>
                      <p className="text-[8px] font-mono tracking-wider">{formData.qrText}</p>
                    </div>

                    <div className="text-center w-48">
                      <div className="h-12 border-b border-dashed border-slate-400 mb-2 flex items-end justify-center pb-1 text-slate-300 text-xs italic">Candidate Signature</div>
                      <p className="text-xs font-bold uppercase">Candidate</p>
                      <p className="text-[10px] text-slate-500">(To be signed in presence of Invigilator)</p>
                    </div>

                    <div className="text-center w-48">
                      <div className="border-b-2 border-slate-800 mb-2 h-12"></div>
                      <p className="text-xs font-bold uppercase">Controller of Examinations</p>
                      <p className="text-[10px] text-slate-500">Authorized Signatory</p>
                    </div>
                  </div>
                  
                  <div className="text-center bg-slate-900 text-white py-1.5 text-[9px] uppercase tracking-widest">
                    This is a computer-generated secure document. Verification URL: {formData.website}/verify
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