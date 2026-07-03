'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import SmartUploadModal from '../../../components/tools/legal-draft-builder/SmartUploadModal';
import DeedPreview from '../../../components/tools/legal-draft-builder/DeedPreview';

// 🏆 INDUSTRY LEVEL FIX: InputField ko main function ke BAHAR nikal diya gaya hai.
// Isse React har keystroke par input ko re-render nahi karega aur focus out nahi hoga!
interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = "text", placeholder = "" }) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-sm font-bold text-gray-700">{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
    />
  </div>
);

export default function LegalDraftBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 🔥 Master State
  const [formData, setFormData] = useState({
    sellerName: '', sellerFather: '', sellerAge: '', sellerAadhaar: '', sellerPan: '', sellerMobile: '', sellerAddress: '',
    buyerName: '', buyerFather: '', buyerAge: '', buyerAadhaar: '', buyerPan: '', buyerMobile: '', buyerAddress: '',
    state: 'बिहार', district: '', circle: '', policeStation: '', village: '', wardNo: '', mauza: '', khataNo: '', plotNo: '', area: '', landType: '', boundaryNorth: '', boundarySouth: '', boundaryEast: '', boundaryWest: '',
    saleAmount: '', advanceAmount: '', remainingAmount: '', paymentMode: 'Cash', possessionDate: '', registrationDate: '',
    witness1Name: '', witness1Address: '', witness2Name: '', witness2Address: '',
    stampValue: '1000', deedWriterName: '', registrationOffice: '', specialConditions: ''
  });

  // 💾 Auto-Load
  useEffect(() => {
    const savedData = localStorage.getItem('legalDraftData');
    if (savedData) setFormData(JSON.parse(savedData));
  }, []);

  // 💾 Auto-Save
  useEffect(() => {
    localStorage.setItem('legalDraftData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAIDataExtracted = (extractedData: any) => {
    setFormData((prev) => ({ ...prev, ...extractedData }));
    alert("🔥 Success! AI ne purani Deed se data extract karke Form mein bhar diya hai!");
  };

  const nextStep = () => setCurrentStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <Head><title>Legal Draft Builder - DhamakaTools</title></Head>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header & AI Button */}
        <div className="bg-indigo-600 p-6 text-white text-center print:hidden">
          <h1 className="text-3xl font-black mb-2">Legal Draft Builder</h1>
          <p className="text-indigo-200 mb-6">Smart Document Generator for Sale Deeds</p>
          
          {!showPreview && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-black px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-transform hover:scale-105 flex items-center gap-2 mx-auto mb-4"
            >
              <span className="text-xl">🤖</span> AI Smart Scan (Upload Old Deed)
            </button>
          )}
          
          {!showPreview && (
            <div className="flex justify-between items-center mt-6 max-w-2xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step ? 'bg-white text-indigo-600' : 'bg-indigo-400 text-white'}`}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= FORM BODY ================= */}
        {showPreview ? (
          <div>
            <div className="p-4 bg-yellow-100 text-center font-bold text-yellow-800 border-b border-yellow-200 print:hidden">
              You are viewing the Live Draft. You can download it as MS Word or PDF below.
              <br/>
              <button onClick={() => setShowPreview(false)} className="mt-2 text-indigo-600 underline hover:text-indigo-800">← Back to Edit Form</button>
            </div>
            <DeedPreview formData={formData} />
          </div>
        ) : (
          <div className="p-8">
            
            {/* STEP 1: SELLER DETAILS */}
            {currentStep === 1 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 1: Seller Details (विक्रेता)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Seller Full Name" name="sellerName" value={formData.sellerName} onChange={handleInputChange} />
                  <InputField label="Father/Husband Name" name="sellerFather" value={formData.sellerFather} onChange={handleInputChange} />
                  <InputField label="Age" name="sellerAge" type="number" value={formData.sellerAge} onChange={handleInputChange} />
                  <InputField label="Mobile Number" name="sellerMobile" type="tel" value={formData.sellerMobile} onChange={handleInputChange} />
                  <InputField label="Aadhaar No. (Optional)" name="sellerAadhaar" value={formData.sellerAadhaar} onChange={handleInputChange} />
                  <InputField label="PAN (Optional)" name="sellerPan" value={formData.sellerPan} onChange={handleInputChange} />
                  <div className="col-span-1 md:col-span-2">
                    <InputField label="Full Address" name="sellerAddress" value={formData.sellerAddress} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BUYER DETAILS */}
            {currentStep === 2 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 2: Buyer Details (क्रेता)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Buyer Full Name" name="buyerName" value={formData.buyerName} onChange={handleInputChange} />
                  <InputField label="Father/Husband Name" name="buyerFather" value={formData.buyerFather} onChange={handleInputChange} />
                  <InputField label="Age" name="buyerAge" type="number" value={formData.buyerAge} onChange={handleInputChange} />
                  <InputField label="Mobile Number" name="buyerMobile" type="tel" value={formData.buyerMobile} onChange={handleInputChange} />
                  <InputField label="Aadhaar No. (Optional)" name="buyerAadhaar" value={formData.buyerAadhaar} onChange={handleInputChange} />
                  <InputField label="PAN (Optional)" name="buyerPan" value={formData.buyerPan} onChange={handleInputChange} />
                  <div className="col-span-1 md:col-span-2">
                    <InputField label="Full Address" name="buyerAddress" value={formData.buyerAddress} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PROPERTY DETAILS */}
            {currentStep === 3 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 3: Property Details (संपत्ति विवरण)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="State" name="state" value={formData.state} onChange={handleInputChange} />
                  <InputField label="District" name="district" value={formData.district} onChange={handleInputChange} />
                  <InputField label="Circle/Anchal" name="circle" value={formData.circle} onChange={handleInputChange} />
                  <InputField label="Police Station" name="policeStation" value={formData.policeStation} onChange={handleInputChange} />
                  <InputField label="Mauza" name="mauza" value={formData.mauza} onChange={handleInputChange} />
                  <InputField label="Ward No." name="wardNo" value={formData.wardNo} onChange={handleInputChange} />
                  <InputField label="Khata No." name="khataNo" value={formData.khataNo} onChange={handleInputChange} />
                  <InputField label="Khesra/Plot No." name="plotNo" value={formData.plotNo} onChange={handleInputChange} />
                  <InputField label="Rakba / Area" name="area" placeholder="e.g., 4.70 डिसमिल" value={formData.area} onChange={handleInputChange} />
                  <InputField label="Land Type" name="landType" placeholder="e.g., आवासीय रिक्त" value={formData.landType} onChange={handleInputChange} />
                </div>
                <h3 className="font-bold text-gray-700 mt-6 mb-3">Boundary (चौहद्दी)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="North (उत्तर)" name="boundaryNorth" value={formData.boundaryNorth} onChange={handleInputChange} />
                  <InputField label="South (दक्षिण)" name="boundarySouth" value={formData.boundarySouth} onChange={handleInputChange} />
                  <InputField label="East (पूरब)" name="boundaryEast" value={formData.boundaryEast} onChange={handleInputChange} />
                  <InputField label="West (पश्चिम)" name="boundaryWest" value={formData.boundaryWest} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* STEP 4: SALE DETAILS */}
            {currentStep === 4 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 4: Sale Details (बिक्री विवरण)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Total Sale Amount (₹)" name="saleAmount" type="number" value={formData.saleAmount} onChange={handleInputChange} />
                  <InputField label="Advance Amount (₹)" name="advanceAmount" type="number" value={formData.advanceAmount} onChange={handleInputChange} />
                  <InputField label="Remaining Amount (₹)" name="remainingAmount" type="number" value={formData.remainingAmount} onChange={handleInputChange} />
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-sm font-bold text-gray-700">Payment Mode</label>
                    <select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="RTGS/NEFT/UPI">RTGS / NEFT / UPI</option>
                    </select>
                  </div>
                  <InputField label="Possession Date" name="possessionDate" type="date" value={formData.possessionDate} onChange={handleInputChange} />
                  <InputField label="Registration Date" name="registrationDate" type="date" value={formData.registrationDate} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* STEP 5: WITNESS DETAILS */}
            {currentStep === 5 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 5: Witness Details (गवाह)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Witness 1 Name" name="witness1Name" value={formData.witness1Name} onChange={handleInputChange} />
                  <InputField label="Witness 1 Address" name="witness1Address" value={formData.witness1Address} onChange={handleInputChange} />
                  <InputField label="Witness 2 Name" name="witness2Name" value={formData.witness2Name} onChange={handleInputChange} />
                  <InputField label="Witness 2 Address" name="witness2Address" value={formData.witness2Address} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* STEP 6: OTHER DETAILS */}
            {currentStep === 6 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 6: Other Details (अन्य)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Stamp Value (₹)" name="stampValue" type="number" value={formData.stampValue} onChange={handleInputChange} />
                  <InputField label="Deed Writer Name" name="deedWriterName" value={formData.deedWriterName} onChange={handleInputChange} />
                  <div className="col-span-1 md:col-span-2">
                    <InputField label="Registration Office" name="registrationOffice" value={formData.registrationOffice} onChange={handleInputChange} />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1 mb-4">
                    <label className="text-sm font-bold text-gray-700">Special Conditions (Optional)</label>
                    <textarea 
                      name="specialConditions" 
                      value={formData.specialConditions} 
                      onChange={handleInputChange} 
                      rows={3} 
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" 
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer Navigation Buttons */}
        {!showPreview && (
          <div className="bg-gray-100 p-6 flex justify-between items-center border-t border-gray-200 print:hidden">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 1}
              className={`px-6 py-3 font-bold rounded-lg transition-all ${currentStep === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}
            >
              ← Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button onClick={nextStep} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">
                Next Step →
              </button>
            ) : (
              <button 
                onClick={() => setShowPreview(true)} 
                className="px-8 py-3 bg-green-600 text-white font-black rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Generate Pro Draft 🚀
              </button>
            )}
          </div>
        )}
      </div>

      {/* 🤖 MOUNT THE SMART UPLOAD MODAL */}
      <SmartUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onDataExtracted={handleAIDataExtracted} 
      />

    </div>
  );
}