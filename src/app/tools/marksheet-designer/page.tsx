'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Download, FileText, Loader2, GraduationCap, Building, User, BookOpen, Plus, Trash2, Calculator } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export default function MarksheetDesigner() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Form State for Details
  const [formData, setFormData] = useState({
    orgName: 'DHAMAKA BOARD OF EDUCATION',
    orgAddress: 'New Delhi, India',
    examName: 'HIGHER SECONDARY EXAMINATION - 2026',
    studentName: 'Rahul Sharma',
    fatherName: 'Mr. Rajesh Sharma',
    motherName: 'Mrs. Sunita Sharma',
    rollNo: '1029384756',
    enrollmentNo: 'EN-2024/8899',
    dob: '15-Aug-2008',
    schoolName: 'Dhamaka International Public School, Sector-62',
    issueDate: new Date().toLocaleDateString('en-GB'),
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Dynamic Subjects State
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'English Core', maxMarks: '100', passMarks: '33', obtained: '85' },
    { id: 2, name: 'Physics', maxMarks: '100', passMarks: '33', obtained: '78' },
    { id: 3, name: 'Chemistry', maxMarks: '100', passMarks: '33', obtained: '82' },
    { id: 4, name: 'Mathematics', maxMarks: '100', passMarks: '33', obtained: '95' },
    { id: 5, name: 'Computer Science', maxMarks: '100', passMarks: '33', obtained: '90' },
  ]);

  // 🔥 SMART AUTO-CALCULATOR
  const calculation = useMemo(() => {
    let totalMax = 0;
    let totalObtained = 0;
    let isFail = false;

    subjects.forEach(sub => {
      const max = Number(sub.maxMarks) || 0;
      const pass = Number(sub.passMarks) || 0;
      const obt = Number(sub.obtained) || 0;

      totalMax += max;
      totalObtained += obt;
      if (obt < pass) isFail = true;
    });

    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : '0.00';
    let grade = 'F';
    
    if (!isFail) {
      const p = Number(percentage);
      if (p >= 90) grade = 'A+';
      else if (p >= 80) grade = 'A';
      else if (p >= 70) grade = 'B+';
      else if (p >= 60) grade = 'B';
      else if (p >= 50) grade = 'C';
      else if (p >= 33) grade = 'D';
    }

    return { totalMax, totalObtained, percentage, grade, result: isFail ? 'FAIL' : 'PASS' };
  }, [subjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Subject Handlers
  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: '', maxMarks: '100', passMarks: '33', obtained: '' }]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const handleSubjectChange = (id: number, field: string, value: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Download Handlers
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Marksheet_${formData.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadImage = async () => {
    if (!previewRef.current) return;
    setIsDownloadingJpg(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `Marksheet_${formData.studentName.replace(/\s+/g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <GraduationCap className="w-10 h-10 text-blue-600" />
            Smart Marksheet Designer
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Auto-Calculates Total, Percentage, and Grades!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* ORGANIZATION DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Building className="w-3 h-3"/> Board / University Info</h3>
              <div className="space-y-3">
                <input type="text" name="orgName" placeholder="Board / University Name" value={formData.orgName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                <input type="text" name="orgAddress" placeholder="Address / Region" value={formData.orgAddress} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                <input type="text" name="examName" placeholder="Examination Name (e.g. Class 12th Board)" value={formData.examName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 font-bold text-blue-800" />
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Board Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-blue-50 file:text-blue-700 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* STUDENT DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Student Details</h3>
              <div className="space-y-3">
                <input type="text" name="studentName" placeholder="Student Name" value={formData.studentName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                  <input type="text" name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                  <input type="text" name="rollNo" placeholder="Roll No" value={formData.rollNo} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                  <input type="text" name="enrollmentNo" placeholder="Enrollment No" value={formData.enrollmentNo} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                  <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                  <input type="text" name="issueDate" placeholder="Date of Issue" value={formData.issueDate} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
                </div>
                <input type="text" name="schoolName" placeholder="School / College Name" value={formData.schoolName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500" />
              </div>
            </div>

            {/* DYNAMIC SUBJECTS & MARKS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-1"><BookOpen className="w-3 h-3"/> Subjects & Marks</h3>
                <button onClick={addSubject} className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1">
                  <Plus className="w-3 h-3"/> Add Subject
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase text-center">
                  <div className="col-span-5 text-left">Subject</div>
                  <div className="col-span-2">Max</div>
                  <div className="col-span-2">Pass</div>
                  <div className="col-span-2">Obt</div>
                  <div className="col-span-1"></div>
                </div>
                
                {subjects.map((sub, index) => (
                  <div key={sub.id} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" value={sub.name} onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)} placeholder={`Subject ${index + 1}`} className="col-span-5 w-full text-xs border border-slate-300 rounded p-1.5 focus:border-blue-500" />
                    <input type="number" value={sub.maxMarks} onChange={(e) => handleSubjectChange(sub.id, 'maxMarks', e.target.value)} className="col-span-2 w-full text-xs border border-slate-300 rounded p-1.5 focus:border-blue-500 text-center" />
                    <input type="number" value={sub.passMarks} onChange={(e) => handleSubjectChange(sub.id, 'passMarks', e.target.value)} className="col-span-2 w-full text-xs border border-slate-300 rounded p-1.5 focus:border-blue-500 text-center" />
                    <input type="number" value={sub.obtained} onChange={(e) => handleSubjectChange(sub.id, 'obtained', e.target.value)} className="col-span-2 w-full text-xs border border-slate-300 rounded p-1.5 focus:border-blue-500 text-center font-bold text-blue-700" />
                    <button onClick={() => removeSubject(sub.id)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* LIVE CALCULATION WIDGET */}
              <div className="mt-4 p-3 bg-blue-600 text-white rounded-lg flex justify-between items-center shadow-inner">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Calculator className="w-4 h-4" /> Smart Calc:
                </div>
                <div className="text-right text-xs font-medium space-x-3">
                  <span>Total: <strong>{calculation.totalObtained}/{calculation.totalMax}</strong></span>
                  <span>|</span>
                  <span>% : <strong>{calculation.percentage}%</strong></span>
                  <span>|</span>
                  <span className={`px-1.5 py-0.5 rounded font-black ${calculation.result === 'FAIL' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {calculation.result} ({calculation.grade})
                  </span>
                </div>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="pt-4 grid grid-cols-2 gap-3 mt-auto">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              
              <div ref={previewRef} className="bg-white w-[794px] h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-serif border-[14px] border-double border-slate-900 p-8">
                
                {/* WATERMARK */}
                {logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                    <img src={logoUrl} alt="Watermark" className="w-[400px] h-[400px] object-contain grayscale" />
                  </div>
                )}

                {/* --- HEADER --- */}
                <div className="w-full pb-6 border-b-2 border-slate-800 z-10 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-6 w-full mb-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-2 border-slate-800 flex items-center justify-center">
                        <Building className="w-12 h-12 text-slate-800" />
                      </div>
                    )}
                    <div>
                      <h1 className="font-black text-3xl uppercase tracking-wider text-slate-900">{formData.orgName}</h1>
                      <p className="text-slate-800 font-bold text-sm mt-1 uppercase">{formData.orgAddress}</p>
                    </div>
                  </div>
                  <div className="mt-2 bg-slate-800 text-white px-6 py-1.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-md">
                    STATEMENT OF MARKS
                  </div>
                  <h2 className="font-black text-xl uppercase tracking-wide text-slate-900 mt-4">{formData.examName}</h2>
                </div>

                {/* --- STUDENT INFO --- */}
                <div className="w-full py-6 z-10">
                  <table className="w-full text-base font-medium">
                    <tbody>
                      <tr>
                        <td className="py-1 w-40 text-slate-600 font-bold">Candidate's Name</td>
                        <td className="py-1 w-5 font-bold">:</td>
                        <td className="py-1 font-bold uppercase">{formData.studentName}</td>
                        <td className="py-1 w-32 text-slate-600 font-bold">Roll No.</td>
                        <td className="py-1 w-5 font-bold">:</td>
                        <td className="py-1 font-bold">{formData.rollNo}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600 font-bold">Mother's Name</td>
                        <td className="py-1 font-bold">:</td>
                        <td className="py-1 font-bold uppercase">{formData.motherName}</td>
                        <td className="py-1 text-slate-600 font-bold">Enrollment No.</td>
                        <td className="py-1 font-bold">:</td>
                        <td className="py-1 font-bold">{formData.enrollmentNo}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600 font-bold">Father's Name</td>
                        <td className="py-1 font-bold">:</td>
                        <td className="py-1 font-bold uppercase">{formData.fatherName}</td>
                        <td className="py-1 text-slate-600 font-bold">Date of Birth</td>
                        <td className="py-1 font-bold">:</td>
                        <td className="py-1 font-bold">{formData.dob}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600 font-bold">School / College</td>
                        <td className="py-1 font-bold">:</td>
                        <td colSpan={4} className="py-1 font-bold uppercase">{formData.schoolName}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* --- MARKS TABLE --- */}
                <div className="flex-1 z-10 w-full mt-4">
                  <table className="w-full border-collapse border-2 border-slate-800 text-center">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-800 uppercase text-sm">
                        <th className="border-r-2 border-slate-800 py-3 px-4 text-left w-1/2">Subject Name</th>
                        <th className="border-r border-slate-400 py-3 px-2">Max Marks</th>
                        <th className="border-r border-slate-400 py-3 px-2">Pass Marks</th>
                        <th className="border-r border-slate-400 py-3 px-2">Marks Obtained</th>
                        <th className="py-3 px-2">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="text-base font-bold text-slate-800">
                      {subjects.map((sub, i) => {
                        const isSubFail = Number(sub.obtained) < Number(sub.passMarks);
                        return (
                          <tr key={i} className="border-b border-slate-400">
                            <td className="border-r-2 border-slate-800 py-2.5 px-4 text-left uppercase">{sub.name || '-'}</td>
                            <td className="border-r border-slate-400 py-2.5">{sub.maxMarks}</td>
                            <td className="border-r border-slate-400 py-2.5">{sub.passMarks}</td>
                            <td className={`border-r border-slate-400 py-2.5 ${isSubFail ? 'text-red-600' : ''}`}>{sub.obtained || '-'}</td>
                            <td className={`py-2.5 ${isSubFail ? 'text-red-600' : ''}`}>{isSubFail ? 'F' : 'P'}</td>
                          </tr>
                        );
                      })}
                      {/* Empty rows filler if needed */}
                      {[...Array(Math.max(0, 8 - subjects.length))].map((_, i) => (
                        <tr key={`empty-${i}`} className="border-b border-slate-400 h-10">
                          <td className="border-r-2 border-slate-800"></td><td className="border-r border-slate-400"></td><td className="border-r border-slate-400"></td><td className="border-r border-slate-400"></td><td></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-4 border-slate-800 bg-slate-50 uppercase text-lg">
                        <th className="border-r-2 border-slate-800 py-4 px-4 text-right">Grand Total</th>
                        <th className="border-r border-slate-400 py-4">{calculation.totalMax}</th>
                        <th className="border-r border-slate-400 py-4"></th>
                        <th className="border-r border-slate-400 py-4 text-blue-800">{calculation.totalObtained}</th>
                        <th className="py-4 text-blue-800">{calculation.grade}</th>
                      </tr>
                    </tfoot>
                  </table>
                  
                  {/* Result Summary Box */}
                  <div className="mt-8 flex justify-between items-center border-2 border-slate-800 p-4 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold">
                      Result: <span className={`uppercase ml-2 font-black ${calculation.result === 'FAIL' ? 'text-red-600' : 'text-emerald-600'}`}>{calculation.result}</span>
                    </div>
                    <div className="text-lg font-bold">
                      Percentage: <span className="ml-2 font-black text-blue-800">{calculation.percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* --- FOOTER / SIGNATURES --- */}
                <div className="mt-auto pt-10 flex justify-between items-end z-10 w-full px-4">
                  <div className="text-left w-40">
                    <p className="font-bold text-slate-800 text-sm mb-1">Date: {formData.issueDate}</p>
                    <p className="text-slate-600 text-xs mt-8">System Generated Document</p>
                  </div>
                  
                  <div className="text-center w-40">
                    <div className="w-24 h-24 border-2 border-dashed border-slate-400 rounded-full mx-auto flex items-center justify-center text-xs text-slate-400 font-sans mb-2">
                      Board Seal
                    </div>
                  </div>

                  <div className="text-center w-48">
                    <div className="border-b-2 border-slate-800 mb-2"></div>
                    <p className="font-bold text-slate-900 text-sm">Controller of Examinations</p>
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