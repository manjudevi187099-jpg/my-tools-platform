'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Loader2, Award, Building, User, GraduationCap, Briefcase } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

// 🔥 ALL 65 CATEGORIES & HEADINGS
const CERT_CATEGORIES = [
  {
    category: "शिक्षा (Education)",
    options: ["School Bonafide", "College Bonafide", "University Bonafide", "Scholarship Bonafide", "Education Loan Bonafide", "Internship Bonafide", "Training Bonafide", "Railway Concession Bonafide", "Bus Pass Bonafide", "Hostel Bonafide", "Research Scholar Bonafide", "Exam Registration Bonafide"]
  },
  {
    category: "नौकरी / रोजगार (Employment)",
    options: ["Employee Bonafide", "Government Employee Bonafide", "Private Employee Bonafide", "Contract Employee Bonafide", "Internship Employee Bonafide", "Job Verification Bonafide", "Background Verification Bonafide"]
  },
  {
    category: "बैंक / वित्त (Banking & Finance)",
    options: ["Bank Account Opening Bonafide", "Personal Loan Bonafide", "Business Loan Bonafide", "Mudra Loan Bonafide", "PMEGP Loan Bonafide", "Subsidy Claim Bonafide", "Financial Assistance Bonafide"]
  },
  {
    category: "पहचान / पता (Identity & Address)",
    options: ["Residence Bonafide", "Domicile Bonafide", "Permanent Resident Bonafide", "Temporary Resident Bonafide", "Address Proof Bonafide"]
  },
  {
    category: "सरकारी योजनाएँ (Government Schemes)",
    options: ["CSC Registration Bonafide", "RTPS Service Bonafide", "KYP Admission Bonafide", "Student Credit Card Bonafide", "Government Scholarship Bonafide", "Welfare Scheme Bonafide", "Caste-Based Scheme Bonafide", "Pension Scheme Bonafide"]
  },
  {
    category: "व्यापार (Business)",
    options: ["Startup Bonafide", "GST Registration Bonafide", "MSME/Udyam Bonafide", "Shop Establishment Bonafide", "Trade License Bonafide", "Business Address Bonafide", "Partnership Firm Bonafide", "Proprietorship Bonafide"]
  },
  {
    category: "टेंडर / कॉन्ट्रैक्ट (Tender & Contract)",
    options: ["Government Tender Bonafide", "Contractor Bonafide", "Vendor Bonafide", "Service Provider Bonafide", "Project Participation Bonafide"]
  },
  {
    category: "यात्रा / विदेश (Travel & Foreign)",
    options: ["Passport Bonafide", "Visa Bonafide", "Embassy Bonafide", "Immigration Bonafide", "Travel Concession Bonafide"]
  },
  {
    category: "अन्य (Other)",
    options: ["Library Membership Bonafide", "SIM Card Verification Bonafide", "Insurance Claim Bonafide", "Court Purpose Bonafide", "Police Verification Bonafide", "Character Verification Bonafide", "NGO/Trust Association Bonafide", "Event Participation Bonafide"]
  }
];

export default function BonafideCertificateGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  // Unified Form State (Works for Student, Employee, and Business)
  const [formData, setFormData] = useState({
    // Letterhead
    orgName: 'DHAMAKA UNIVERSITY / TECH PVT LTD',
    orgAddress: 'Sector-62, Knowledge Park, New Delhi - 110001',
    orgContact: 'Phone: +91-9876543210 | Email: info@dhamaka.com',
    
    // Core
    heading: 'College Bonafide', 
    date: new Date().toLocaleDateString('en-GB'),
    
    // Universal Details (Used dynamically)
    applicantName: 'Rahul Sharma',
    regIdNo: '2023CS105 / EMP-402',
    designationCourse: 'B.Tech / Software Engineer',
    departmentType: 'Computer Science / IT',
    durationYear: '2025-2026 / 3 Years',
    
    // Additional Records
    dob: '15-Aug-2002',
    careOfName: 'Mr. Rajesh Sharma', // Father / Partner Name
    address: 'Flat 402, Green Valley, New Delhi',
    admissionJoiningDate: '10-Jul-2023',
    completionValidity: '2027',

    // Signatory
    authName: 'Dr. A.K. Verma',
    authDesignation: 'Registrar / Director',
    authMobile: '+91-9876543210',
    authEmail: 'admin@dhamaka.com',
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (previewRef.current.offsetHeight * pdfWidth) / previewRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.heading.replace(/\s+/g, '_')}_${formData.applicantName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      alert("Download failed. Please try again.");
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
      link.download = `${formData.heading.replace(/\s+/g, '_')}_${formData.applicantName.replace(/\s+/g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  // 🔥 65-in-1 SMART PARAGRAPH ENGINE
  const renderDynamicContent = () => {
    const { heading, applicantName, regIdNo, designationCourse, departmentType, durationYear, address, orgName } = formData;
    const h = heading.toLowerCase();

    // 1. BUSINESS, TENDER, STARTUP, GST
    if (h.includes('business') || h.includes('gst') || h.includes('startup') || h.includes('msme') || h.includes('tender') || h.includes('contractor') || h.includes('proprietorship') || h.includes('firm')) {
      return (
        <div className="text-lg text-justify leading-loose font-medium mb-8">
          This is to certify that M/s <span className="font-bold border-b border-dashed border-slate-500 px-2">{applicantName}</span>, 
          bearing Registration/GST No. <span className="font-bold border-b border-dashed border-slate-500 px-2">{regIdNo}</span>, 
          is a Bonafide business entity functioning as <span className="font-bold border-b border-dashed border-slate-500 px-2">{designationCourse}</span> 
          in the domain of <span className="font-bold border-b border-dashed border-slate-500 px-2">{departmentType}</span>.
          <br/><br/>
          The entity is officially registered and operating at <span className="font-bold border-b border-dashed border-slate-500 px-2">{address}</span>. 
          This <strong>{heading.toUpperCase()}</strong> is being issued upon their request for official processing and verification purposes.
        </div>
      );
    }
    // 2. EMPLOYMENT, GOVERNMENT JOB, VERIFICATION
    else if (h.includes('employee') || h.includes('job') || h.includes('background') || h.includes('police')) {
      return (
        <div className="text-lg text-justify leading-loose font-medium mb-8">
          This is to certify that Mr/Ms <span className="font-bold border-b border-dashed border-slate-500 px-2">{applicantName}</span>, 
          Employee/ID No. <span className="font-bold border-b border-dashed border-slate-500 px-2">{regIdNo}</span>, 
          is a Bonafide employee of <strong>{orgName}</strong>. 
          <br/><br/>
          He/She is currently working as <span className="font-bold border-b border-dashed border-slate-500 px-2">{designationCourse}</span> 
          in the <span className="font-bold border-b border-dashed border-slate-500 px-2">{departmentType}</span> department, 
          and has been associated with us for the period of <span className="font-bold border-b border-dashed border-slate-500 px-2">{durationYear}</span>. 
          During this tenure, we have found his/her professional conduct to be highly satisfactory.
        </div>
      );
    }
    // 3. BANKING, LOAN, SUBSIDY
    else if (h.includes('loan') || h.includes('bank') || h.includes('subsidy') || h.includes('finance') || h.includes('credit')) {
      return (
        <div className="text-lg text-justify leading-loose font-medium mb-8">
          This is to certify that Mr/Ms <span className="font-bold border-b border-dashed border-slate-500 px-2">{applicantName}</span>, 
          Registration/ID No. <span className="font-bold border-b border-dashed border-slate-500 px-2">{regIdNo}</span>, 
          maintains a Bonafide association with our institution/organization.
          <br/><br/>
          He/She is applying for financial assistance under the <strong>{heading.toUpperCase()}</strong> category. 
          We verify that he/she is a legitimate candidate belonging to <span className="font-bold border-b border-dashed border-slate-500 px-2">{departmentType}</span> 
          and holds a good financial and moral track record with us.
        </div>
      );
    }
    // 4. TRAVEL, VISA, PASSPORT
    else if (h.includes('visa') || h.includes('passport') || h.includes('embassy') || h.includes('travel') || h.includes('immigration')) {
      return (
        <div className="text-lg text-justify leading-loose font-medium mb-8">
          This is to certify that Mr/Ms <span className="font-bold border-b border-dashed border-slate-500 px-2">{applicantName}</span>, 
          bearing ID/Reg No. <span className="font-bold border-b border-dashed border-slate-500 px-2">{regIdNo}</span>, 
          is a Bonafide member/student/employee of our institution.
          <br/><br/>
          This certificate is issued specifically for the purpose of <strong>{heading.toUpperCase()}</strong>. 
          The institution has No Objection to his/her travel plans. He/She will resume their respective duties/studies upon return.
        </div>
      );
    }
    // 5. RESIDENCE, IDENTITY, DOMICILE
    else if (h.includes('residence') || h.includes('domicile') || h.includes('address') || h.includes('sim')) {
      return (
        <div className="text-lg text-justify leading-loose font-medium mb-8">
          This is to certify that Mr/Ms <span className="font-bold border-b border-dashed border-slate-500 px-2">{applicantName}</span>, 
          bearing ID No. <span className="font-bold border-b border-dashed border-slate-500 px-2">{regIdNo}</span>, 
          is known to our institution.
          <br/><br/>
          As per our official records, his/her Bonafide permanent/temporary address is documented as: 
          <br/><strong>{address}</strong>.<br/>
          This certificate is issued to serve as a valid proof for <strong>{heading.toUpperCase()}</strong> processing.
        </div>
      );
    }
    // 6. EDUCATION (DEFAULT / CATCH-ALL)
    else {
      return (
        <div className="text-lg text-justify leading-loose font-medium mb-8">
          This is to certify that Mr/Ms <span className="font-bold border-b border-dashed border-slate-500 px-2">{applicantName}</span>, 
          bearing Registration No. <span className="font-bold border-b border-dashed border-slate-500 px-2">{regIdNo}</span> is a 
          Bonafide applicant of this institute/organization, currently associated as <span className="font-bold border-b border-dashed border-slate-500 px-2">{designationCourse}</span> 
          in <span className="font-bold border-b border-dashed border-slate-500 px-2">{departmentType}</span> during the period of 
          <span className="font-bold border-b border-dashed border-slate-500 px-2">{durationYear}</span>.
          <br/><br/>
          This <strong>{heading.toUpperCase()}</strong> is issued at the request of the applicant for their official use.
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3">
            <Award className="w-10 h-10 text-emerald-600" />
            Mega Bonafide Generator (65-in-1)
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Education, Employment, Business, Visa, Bank Loans & More</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* 🔥 MEGA HEADING SELECTOR WITH 65 OPTIONS */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Select Certificate Category (65 Types)</label>
              <select 
                name="heading" 
                value={formData.heading} 
                onChange={handleInputChange} 
                className="w-full text-sm border-2 border-emerald-300 rounded-lg px-3 py-2 focus:border-emerald-600 font-bold text-slate-800 bg-white"
              >
                {CERT_CATEGORIES.map((cat, idx) => (
                  <optgroup key={idx} label={cat.category} className="bg-slate-100 font-bold text-emerald-700">
                    {cat.options.map((opt, i) => (
                      <option key={i} value={opt} className="bg-white text-slate-800 font-medium">{opt}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* UNIVERSAL DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Briefcase className="w-3 h-3"/> Core Details (Adapts to selection)</h3>
              <div className="space-y-3">
                <input type="text" name="applicantName" placeholder="Applicant / Business Name" value={formData.applicantName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                <input type="text" name="regIdNo" placeholder="Reg No / Emp ID / GST No" value={formData.regIdNo} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                <input type="text" name="designationCourse" placeholder="Course / Designation / Business Type" value={formData.designationCourse} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                <input type="text" name="departmentType" placeholder="Department / Branch / Sector" value={formData.departmentType} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                <input type="text" name="durationYear" placeholder="Academic Year / Tenure / Validity" value={formData.durationYear} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
              </div>
            </div>

            {/* RECORDS / ADDRESS LIST */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><User className="w-3 h-3"/> Master Records & Info</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="admissionJoiningDate" placeholder="Admission / Joining Date" value={formData.admissionJoiningDate} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="careOfName" placeholder="C/o (Father / Partner Name)" value={formData.careOfName} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="address" placeholder="Full Address" value={formData.address} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                  <input type="text" name="completionValidity" placeholder="Expected Completion / Expiry" value={formData.completionValidity} onChange={handleInputChange} className="col-span-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500" />
                </div>
              </div>
            </div>

            {/* LETTERHEAD DETAILS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-1"><Building className="w-3 h-3"/> Organization Letterhead</h3>
              <div className="space-y-3">
                <input type="text" name="orgName" placeholder="Company / College Name" value={formData.orgName} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                <input type="text" name="orgAddress" placeholder="Address" value={formData.orgAddress} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                <input type="text" name="orgContact" placeholder="Phone & Email" value={formData.orgContact} onChange={handleInputChange} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none" />
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Seal/Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-emerald-50 file:text-emerald-700 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-slate-200 mt-auto">
              <button onClick={downloadImage} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save JPG
              </button>
              <button onClick={downloadPDF} disabled={isDownloadingJpg || isDownloadingPdf} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Print PDF
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex justify-center bg-slate-200 rounded-3xl p-4 md:p-8 overflow-x-auto shadow-inner">
            <div className="flex-shrink-0" style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <div ref={previewRef} className="bg-white w-[794px] h-[1123px] relative flex flex-col shadow-2xl mx-auto overflow-hidden font-serif">
                
                {logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                    <img src={logoUrl} alt="Watermark" className="w-96 h-96 object-contain grayscale" />
                  </div>
                )}

                {/* --- HEADER --- */}
                <div className="w-full px-12 pt-12 pb-6 border-b-4 border-slate-800 z-10 bg-white/90">
                  <div className="flex items-center gap-6">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300">
                        <Building className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 text-center pr-12">
                      <h1 className="font-black text-3xl uppercase tracking-wider text-emerald-900">{formData.orgName}</h1>
                      <p className="text-slate-800 font-semibold text-sm mt-2">{formData.orgAddress}</p>
                      <p className="text-slate-700 font-medium text-sm mt-1">{formData.orgContact}</p>
                    </div>
                  </div>
                </div>

                {/* --- BODY --- */}
                <div className="flex-1 px-16 py-10 z-10 flex flex-col text-slate-900">
                  <div className="text-right text-base font-bold mb-8">
                    Date: <span className="underline underline-offset-4 decoration-slate-400 font-medium">{formData.date}</span>
                  </div>

                  <div className="text-center mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-widest border-b-[3px] border-slate-800 inline-block pb-2">
                      {formData.heading.replace(' Bonafide', '')} BONAFIDE CERTIFICATE
                    </h2>
                  </div>

                  {/* 🔥 SMART PARAGRAPH */}
                  {renderDynamicContent()}

                  {/* Master Records Data */}
                  <div className="text-lg font-bold mb-4">Master Records verified by Organization:</div>
                  <div className="pl-6 space-y-3 text-lg font-medium">
                    <div className="grid grid-cols-[300px_auto]"><span>Date of Birth / Est.</span><span className="font-bold">: {formData.dob}</span></div>
                    <div className="grid grid-cols-[300px_auto]"><span>C/o (Father/Partner)</span><span className="font-bold">: {formData.careOfName}</span></div>
                    <div className="grid grid-cols-[300px_auto]"><span>Admission/Joining Date</span><span className="font-bold">: {formData.admissionJoiningDate}</span></div>
                    <div className="grid grid-cols-[300px_auto]"><span>Registered Address</span><span className="font-bold">: {formData.address}</span></div>
                    <div className="grid grid-cols-[300px_auto]"><span>Validity / Completion</span><span className="font-bold">: {formData.completionValidity}</span></div>
                  </div>

                  {/* --- FOOTER --- */}
                  <div className="mt-auto pt-16 flex justify-between items-end">
                    <div className="text-center w-40">
                      <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-full mx-auto flex items-center justify-center text-sm text-slate-400 font-sans mb-2">
                        Official Stamp
                      </div>
                    </div>
                    
                    <div className="text-left w-72">
                      <div className="border-b-2 border-slate-800 mb-3 w-48"></div>
                      <p className="font-bold text-slate-900 text-base mb-1">Authorized Signature</p>
                      <p className="text-slate-800 font-medium">Name: <span className="font-bold">{formData.authName}</span></p>
                      <p className="text-slate-800 font-medium">Designation: <span className="font-bold">{formData.authDesignation}</span></p>
                    </div>
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