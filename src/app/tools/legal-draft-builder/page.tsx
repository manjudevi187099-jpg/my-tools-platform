'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
// 👇 Apne naye components yahan import kar rahe hain
import SmartUploadModal from '../../../components/tools/legal-draft-builder/SmartUploadModal';
import DeedPreview from '../../../components/tools/legal-draft-builder/DeedPreview';

export default function LegalDraftBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 🔥 Master State for all fields
  const [formData, setFormData] = useState({
    sellerName: '', sellerFather: '', sellerAge: '', sellerAadhaar: '', sellerPan: '', sellerMobile: '', sellerAddress: '',
    buyerName: '', buyerFather: '', buyerAge: '', buyerAadhaar: '', buyerPan: '', buyerMobile: '', buyerAddress: '',
    state: 'बिहार', district: '', circle: '', policeStation: '', village: '', wardNo: '', mauza: '', khataNo: '', plotNo: '', area: '', landType: '', boundaryNorth: '', boundarySouth: '', boundaryEast: '', boundaryWest: '',
    saleAmount: '', advanceAmount: '', remainingAmount: '', paymentMode: 'Cash', possessionDate: '', registrationDate: '',
    witness1Name: '', witness1Address: '', witness2Name: '', witness2Address: '',
    stampValue: '1000', deedWriterName: '', registrationOffice: '', specialConditions: ''
  });

  // 💾 Auto-Load from Local Storage
  useEffect(() => {
    const savedData = localStorage.getItem('legalDraftData');
    if (savedData) setFormData(JSON.parse(savedData));
  }, []);

  // 💾 Auto-Save to Local Storage
  useEffect(() => {
    localStorage.setItem('legalDraftData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🤖 AI Data Receiver
  const handleAIDataExtracted = (extractedData: any) => {
    setFormData((prev) => ({ ...prev, ...extractedData }));
    alert("🔥 Success! AI ne purani Deed se data extract karke Form mein bhar diya hai!");
  };

  const nextStep = () => setCurrentStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));

  // 🎨 Reusable Input Component
  const InputField = ({ label, name, type = "text", placeholder = "" }: { label: string, name: string, type?: string, placeholder?: string }) => (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      <input 
        type={type} name={name} value={formData[name as keyof typeof formData]} onChange={handleInputChange} placeholder={placeholder}
        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <Head><title>Legal Draft Builder - DhamakaTools</title></Head>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header & AI Button */}
        <div className="bg-indigo-600 p-6 text-white text-center print:hidden">
          <h1 className="text-3xl font-black mb-2">Legal Draft Builder</h1>
          <p className="text-indigo-200 mb-6">Smart Document Generator for Sale Deeds</p>
          
          {/* 🔥 BRAHMASTRA BUTTON 🔥 */}
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

        {/* ================= FORM BODY OR PREVIEW ================= */}
        {showPreview ? (
          <div>
            <div className="p-4 bg-yellow-100 text-center font-bold text-yellow-800 border-b border-yellow-200 print:hidden">
              You are viewing the Live Draft. You can download it as MS Word or PDF below.
              <br/>
              <button onClick={() => setShowPreview(false)} className="mt-2 text-indigo-600 underline">← Back to Edit Form</button>
            </div>
            {/* 📄 RENDER THE PRO PREVIEW */}
            <DeedPreview formData={formData} />
          </div>
        ) : (
          <div className="p-8">
            
            {/* STEP 1: SELLER DETAILS */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 1: Seller Details (विक्रेता)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Seller Full Name" name="sellerName" />
                  <InputField label="Father/Husband Name" name="sellerFather" />
                  <InputField label="Age" name="sellerAge" type="number" />
                  <InputField label="Mobile Number" name="sellerMobile" type="tel" />
                  <InputField label="Aadhaar No. (Optional)" name="sellerAadhaar" />
                  <InputField label="PAN (Optional)" name="sellerPan" />
                  <div className="col-span-1 md:col-span-2">
                    <InputField label="Full Address" name="sellerAddress" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BUYER DETAILS */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 2: Buyer Details (क्रेता)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Buyer Full Name" name="buyerName" />
                  <InputField label="Father/Husband Name" name="buyerFather" />
                  <InputField label="Age" name="buyerAge" type="number" />
                  <InputField label="Mobile Number" name="buyerMobile" type="tel" />
                  <InputField label="Aadhaar No. (Optional)" name="buyerAadhaar" />
                  <InputField label="PAN (Optional)" name="buyerPan" />
                  <div className="col-span-1 md:col-span-2">
                    <InputField label="Full Address" name="buyerAddress" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PROPERTY DETAILS */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 3: Property Details (संपत्ति विवरण)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="State" name="state" />
                  <InputField label="District" name="district" />
                  <InputField label="Circle/Anchal" name="circle" />
                  <InputField label="Police Station" name="policeStation" />
                  <InputField label="Mauza" name="mauza" />
                  <InputField label="Ward No." name="wardNo" />
                  <InputField label="Khata No." name="khataNo" />
                  <InputField label="Khesra/Plot No." name="plotNo" />
                  <InputField label="Rakba / Area" name="area" placeholder="e.g., 4.70 डिसमिल" />
                  <InputField label="Land Type" name="landType" placeholder="e.g., आवासीय रिक्त" />
                </div>
                <h3 className="font-bold text-gray-700 mt-6 mb-3">Boundary (चौहद्दी)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="North (उत्तर)" name="boundaryNorth" />
                  <InputField label="South (दक्षिण)" name="boundarySouth" />
                  <InputField label="East (पूरब)" name="boundaryEast" />
                  <InputField label="West (पश्चिम)" name="boundaryWest" />
                </div>
              </div>
            )}

            {/* STEP 4: SALE DETAILS */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 4: Sale Details (बिक्री विवरण)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Total Sale Amount (₹)" name="saleAmount" type="number" />
                  <InputField label="Advance Amount (₹)" name="advanceAmount" type="number" />
                  <InputField label="Remaining Amount (₹)" name="remainingAmount" type="number" />
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-sm font-bold text-gray-700">Payment Mode</label>
                    <select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="RTGS/NEFT/UPI">RTGS / NEFT / UPI</option>
                    </select>
                  </div>
                  <InputField label="Possession Date" name="possessionDate" type="date" />
                  <InputField label="Registration Date" name="registrationDate" type="date" />
                </div>
              </div>
            )}

            {/* STEP 5: WITNESS DETAILS */}
            {currentStep === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 5: Witness Details (गवाह)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Witness 1 Name" name="witness1Name" />
                  <InputField label="Witness 1 Address" name="witness1Address" />
                  <InputField label="Witness 2 Name" name="witness2Name" />
                  <InputField label="Witness 2 Address" name="witness2Address" />
                </div>
              </div>
            )}

            {/* STEP 6: OTHER DETAILS */}
            {currentStep === 6 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Step 6: Other Details (अन्य)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Stamp Value (₹)" name="stampValue" type="number" />
                  <InputField label="Deed Writer Name" name="deedWriterName" />
                  <div className="col-span-1 md:col-span-2">
                    <InputField label="Registration Office" name="registrationOffice" />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1 mb-4">
                    <label className="text-sm font-bold text-gray-700">Special Conditions (Optional)</label>
                    <textarea name="specialConditions" value={formData.specialConditions} onChange={handleInputChange} rows={3} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
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