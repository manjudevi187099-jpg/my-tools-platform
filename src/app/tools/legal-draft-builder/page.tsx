'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import SmartUploadModal from '../../../components/tools/legal-draft-builder/SmartUploadModal';
import DeedPreview from '../../../components/tools/legal-draft-builder/DeedPreview';

interface InputFieldProps {
  label: string;
  name?: string;
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

  // 🔥 MASTER FINAL STATE (With Add More arrays & Kandika Fields)
  const [formData, setFormData] = useState({
    sellers: [{ name: '', father: '', age: '', mobile: '', aadhaar: '', pan: '', address: '' }],
    buyers: [{ name: '', father: '', age: '', mobile: '', aadhaar: '', pan: '', address: '' }],
    documentType: 'विक्रय-पत्र (SALE DEED)',
    state: 'बिहार', district: '', circle: '', policeStation: '', thanaNo: '', village: '', wardNo: '', mauza: '', khataNo: '', plotNo: '', area: '', landType: '', boundaryNorth: '', boundarySouth: '', boundaryEast: '', boundaryWest: '',
    jamabandiNo: '', ownershipHistory: '', sellingReason: 'परिवार के भरण-पोषण, आवश्यक कानूनी खर्चों एवं अन्य व्यक्तिगत कार्यों की पूर्ति हेतु',
    saleAmount: '', advanceAmount: '', remainingAmount: '', paymentMode: 'Cash', possessionDate: '', registrationDate: '',
    identifierName: '', identifierAddress: '',
    witness1Name: '', witness1Address: '', witness2Name: '', witness2Address: '',
    stampValue: '1000', deedWriterName: '', registrationOffice: '', specialConditions: ''
  });

  useEffect(() => {
    const savedData = localStorage.getItem('legalDraftFinal');
    if (savedData) setFormData(JSON.parse(savedData));
  }, []);

  useEffect(() => {
    localStorage.setItem('legalDraftFinal', JSON.stringify(formData));
  }, [formData]);

  const handleArrayChange = (index: number, field: string, value: string, type: 'sellers' | 'buyers') => {
    const updatedArray = [...formData[type]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    setFormData({ ...formData, [type]: updatedArray });
  };

  const addPerson = (type: 'sellers' | 'buyers') => {
    setFormData({ ...formData, [type]: [...formData[type], { name: '', father: '', age: '', mobile: '', aadhaar: '', pan: '', address: '' }] });
  };

  const removePerson = (index: number, type: 'sellers' | 'buyers') => {
    if (formData[type].length > 1) {
      const updatedArray = formData[type].filter((_, i) => i !== index);
      setFormData({ ...formData, [type]: updatedArray });
    }
  };

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
        
        <div className="bg-indigo-600 p-6 text-white text-center print:hidden">
          <h1 className="text-3xl font-black mb-2">Legal Draft Builder (Pro)</h1>
          <p className="text-indigo-200 mb-6">Court-Approved Format with Complete Formatting</p>
          
          {!showPreview && (
            <button onClick={() => setIsModalOpen(true)} className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-black px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-transform hover:scale-105 flex items-center gap-2 mx-auto mb-4">
              <span className="text-xl">🤖</span> AI Smart Scan (Upload Old Deed)
            </button>
          )}
          
          {!showPreview && (
            <div className="flex justify-between items-center mt-6 max-w-2xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step ? 'bg-white text-indigo-600' : 'bg-indigo-400 text-white'}`}>{step}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showPreview ? (
          <div>
            <div className="p-4 bg-yellow-100 text-center font-bold text-yellow-800 border-b border-yellow-200 print:hidden">
              You are viewing the Live Draft. <br/>
              <button onClick={() => setShowPreview(false)} className="mt-2 text-indigo-600 underline hover:text-indigo-800">← Back to Edit Form</button>
            </div>
            <DeedPreview formData={formData} />
          </div>
        ) : (
          <div className="p-8">
            
            {/* STEP 1: SELLERS DETAILS (ADD MORE) */}
            {currentStep === 1 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-4 border-b pb-2">1st: Seller Details (विक्रेता)</h2>
                {formData.sellers.map((seller, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 relative">
                    <h3 className="font-bold text-indigo-600 mb-4">Seller {index + 1}</h3>
                    {index > 0 && <button onClick={() => removePerson(index, 'sellers')} className="absolute top-4 right-4 text-red-500 font-bold text-sm">Remove</button>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Name (नाम)" value={seller.name} onChange={(e:any) => handleArrayChange(index, 'name', e.target.value, 'sellers')} />
                      <InputField label="Father/Husband (पिता/पति)" value={seller.father} onChange={(e:any) => handleArrayChange(index, 'father', e.target.value, 'sellers')} />
                      <InputField label="Age (उम्र)" type="number" value={seller.age} onChange={(e:any) => handleArrayChange(index, 'age', e.target.value, 'sellers')} />
                      <InputField label="Mobile (मोबाईल)" type="tel" value={seller.mobile} onChange={(e:any) => handleArrayChange(index, 'mobile', e.target.value, 'sellers')} />
                      <InputField label="Aadhaar (आधार)" value={seller.aadhaar} onChange={(e:any) => handleArrayChange(index, 'aadhaar', e.target.value, 'sellers')} />
                      <div className="col-span-1 md:col-span-2"><InputField label="Full Address (पूर्ण पता)" value={seller.address} onChange={(e:any) => handleArrayChange(index, 'address', e.target.value, 'sellers')} /></div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addPerson('sellers')} className="w-full py-3 border-2 border-dashed border-indigo-400 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50">+ Add More Seller</button>
              </div>
            )}

            {/* STEP 2: BUYERS DETAILS (ADD MORE) */}
            {currentStep === 2 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-4 border-b pb-2">2nd: Buyer Details (क्रेता)</h2>
                {formData.buyers.map((buyer, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 relative">
                    <h3 className="font-bold text-green-600 mb-4">Buyer {index + 1}</h3>
                    {index > 0 && <button onClick={() => removePerson(index, 'buyers')} className="absolute top-4 right-4 text-red-500 font-bold text-sm">Remove</button>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Name (नाम)" value={buyer.name} onChange={(e:any) => handleArrayChange(index, 'name', e.target.value, 'buyers')} />
                      <InputField label="Father/Husband (पिता/पति)" value={buyer.father} onChange={(e:any) => handleArrayChange(index, 'father', e.target.value, 'buyers')} />
                      <InputField label="Age (उम्र)" type="number" value={buyer.age} onChange={(e:any) => handleArrayChange(index, 'age', e.target.value, 'buyers')} />
                      <InputField label="Mobile (मोबाईल)" type="tel" value={buyer.mobile} onChange={(e:any) => handleArrayChange(index, 'mobile', e.target.value, 'buyers')} />
                      <InputField label="Aadhaar (आधार)" value={buyer.aadhaar} onChange={(e:any) => handleArrayChange(index, 'aadhaar', e.target.value, 'buyers')} />
                      <div className="col-span-1 md:col-span-2"><InputField label="Full Address (पूर्ण पता)" value={buyer.address} onChange={(e:any) => handleArrayChange(index, 'address', e.target.value, 'buyers')} /></div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addPerson('buyers')} className="w-full py-3 border-2 border-dashed border-green-400 text-green-600 font-bold rounded-xl hover:bg-green-50">+ Add More Buyer</button>
              </div>
            )}

            {/* STEP 3: DOCUMENT TYPE & AMOUNT */}
            {currentStep === 3 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">3rd & 4th: Doc Type & Amount</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-sm font-bold text-gray-700">विलेख का प्रकार (Document Type)</label>
                    <input name="documentType" value={formData.documentType} onChange={handleInputChange} className="p-3 border border-gray-300 rounded-lg outline-none font-bold text-indigo-700 bg-indigo-50 shadow-sm" />
                  </div>
                  <InputField label="कुल बिक्री मूल्य (Total Sale Amount ₹)" name="saleAmount" type="number" value={formData.saleAmount} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* STEP 4: PROPERTY, HISTORY & REASON */}
            {currentStep === 4 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">5th & 6th: Property & Boundary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1 md:col-span-3">
                    <label className="text-sm font-bold text-gray-700 block mb-1">सम्पत्ति का पुराना इतिहास (Old Ownership Details - Kandika 5)</label>
                    <textarea name="ownershipHistory" value={formData.ownershipHistory} onChange={handleInputChange} rows={2} placeholder="e.g., बजरिये खरीदगी केवाला मरकुमा..." className="w-full p-3 border border-gray-300 rounded-lg outline-none shadow-sm" />
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <label className="text-sm font-bold text-gray-700 block mb-1">जमीन क्यों बेच रहे हैं? (Reason for Selling - Kandika 4)</label>
                    <textarea name="sellingReason" value={formData.sellingReason} onChange={handleInputChange} rows={2} placeholder="e.g., परिवार के भरण-पोषण हेतु..." className="w-full p-3 border border-gray-300 rounded-lg outline-none shadow-sm" />
                  </div>
                  
                  <InputField label="District (जिला)" name="district" value={formData.district} onChange={handleInputChange} />
                  <InputField label="Circle/Anchal (अंचल)" name="circle" value={formData.circle} onChange={handleInputChange} />
                  <InputField label="Police Station (थाना)" name="policeStation" value={formData.policeStation} onChange={handleInputChange} />
                  <InputField label="Thana No. (थाना नं०)" name="thanaNo" value={formData.thanaNo} onChange={handleInputChange} />
                  <InputField label="Mauza (मौजा)" name="mauza" value={formData.mauza} onChange={handleInputChange} />
                  <InputField label="Khata No. (खाता नं०)" name="khataNo" value={formData.khataNo} onChange={handleInputChange} />
                  <InputField label="Plot No. (खेसरा नं०)" name="plotNo" value={formData.plotNo} onChange={handleInputChange} />
                  <InputField label="Jamabandi No. (जमाबन्दी नं०)" name="jamabandiNo" value={formData.jamabandiNo} onChange={handleInputChange} />
                  <InputField label="Area (रकबा)" name="area" value={formData.area} onChange={handleInputChange} />
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

            {/* STEP 5: PAHCHAN & GAWAH */}
            {currentStep === 5 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Pahchan & Gawah</h2>
                
                <h3 className="font-bold text-indigo-700 mb-2 border-l-4 border-indigo-600 pl-2">पहचानकर्ता (Identifier)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <InputField label="Identifier Name" name="identifierName" value={formData.identifierName} onChange={handleInputChange} />
                  <InputField label="Identifier Address" name="identifierAddress" value={formData.identifierAddress} onChange={handleInputChange} />
                </div>

                <h3 className="font-bold text-green-700 mb-2 border-l-4 border-green-600 pl-2">गवाह (Witnesses)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Witness 1 Name" name="witness1Name" value={formData.witness1Name} onChange={handleInputChange} />
                  <InputField label="Witness 1 Address" name="witness1Address" value={formData.witness1Address} onChange={handleInputChange} />
                  <InputField label="Witness 2 Name" name="witness2Name" value={formData.witness2Name} onChange={handleInputChange} />
                  <InputField label="Witness 2 Address" name="witness2Address" value={formData.witness2Address} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* STEP 6: MISC */}
            {currentStep === 6 && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-2">Final Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Registration Date" name="registrationDate" type="date" value={formData.registrationDate} onChange={handleInputChange} />
                  <InputField label="Registration Office" name="registrationOffice" value={formData.registrationOffice} onChange={handleInputChange} />
                  <InputField label="Stamp Value (₹)" name="stampValue" value={formData.stampValue} onChange={handleInputChange} />
                  <InputField label="Deed Writer Name" name="deedWriterName" value={formData.deedWriterName} onChange={handleInputChange} />
                </div>
              </div>
            )}

          </div>
        )}

        {!showPreview && (
          <div className="bg-gray-100 p-6 flex justify-between items-center border-t border-gray-200 print:hidden">
            <button onClick={prevStep} disabled={currentStep === 1} className={`px-6 py-3 font-bold rounded-lg transition-all ${currentStep === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}>← Previous</button>
            {currentStep < totalSteps ? (
              <button onClick={nextStep} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg">Next Step →</button>
            ) : (
              <button onClick={() => setShowPreview(true)} className="px-8 py-3 bg-green-600 text-white font-black rounded-lg hover:bg-green-700 shadow-lg">Generate Pro Draft 🚀</button>
            )}
          </div>
        )}
      </div>
      <SmartUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onDataExtracted={handleAIDataExtracted} />
    </div>
  );
}