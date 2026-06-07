'use client';

import React, { useState, useRef, useEffect } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { Client } from "@gradio/client"; 

export default function MegaPhotoStudio() {
  // 🔥 TypeScript ke hisaab se States ko update kiya gaya hai
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [hdUpgrade, setHdUpgrade] = useState<boolean>(false);
  const [enhance, setEnhance] = useState<boolean>(false);
  const [photoSize, setPhotoSize] = useState<string>('passport');
  const [quantity, setQuantity] = useState<number>(42);
  const [addBorder, setAddBorder] = useState<boolean>(false);
  
  const [aiPreviewBlob, setAiPreviewBlob] = useState<Blob | null>(null);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Cropper ke type ko define kiya
  const cropperRef = useRef<ReactCropperElement>(null);

  // 1. UPLOAD PHOTO (Event type add kiya)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImageSrc(URL.createObjectURL(selectedFile));
      setCroppedImage(null); 
      setAiPreviewUrl(null); 
    }
  };

  // 2. CROP PHOTO 
  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      setCroppedImage(cropper.getCroppedCanvas().toDataURL());
    }
  };

  // 3. 🚀 AUTO-SYNC LIVE PREVIEW 
  useEffect(() => {
    const fetchLivePreview = async () => {
      if (!croppedImage) return;
      
      setPreviewLoading(true);
      try {
        const base64Response = await fetch(croppedImage);
        const imageBlob = await base64Response.blob();

        const client = await Client.connect("dhamakatools/bg-remover");
        const result = await client.predict("/predict", {
            input_image: imageBlob,
            bg_color: bgColor,
            hd_upgrade: hdUpgrade,
            enhance: enhance
        });

        // Error fix: 'unknown' data type ko bataya ki yeh array hai
        const cleanImageUrl = (result.data as any[])[0].url;
        
        const hfResponse = await fetch(cleanImageUrl);
        const hfBlob = await hfResponse.blob();

        setAiPreviewBlob(hfBlob);
        setAiPreviewUrl(cleanImageUrl);

      } catch (err: any) { // Error ko 'any' type diya
        console.error("Hugging Face API Error:", err);
        alert("Bhai, AI Engine connect nahi ho paya!");
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchLivePreview();
  }, [croppedImage, bgColor, hdUpgrade, enhance]); 

  // 4. FINAL: GENERATE & DOWNLOAD .PSD FILE
  const handleGenerate = async () => {
    if (!aiPreviewBlob) {
      alert('Pehli photo ko crop karke OK kariye!');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('processed_image', aiPreviewBlob, 'processed.png');
    formData.append('photo_size', photoSize);
    formData.append('quantity', quantity.toString());
    formData.append('add_border', addBorder.toString());

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/photo-studio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `A4_Photo_Sheet_${quantity}pcs.psd`; 
      document.body.appendChild(a);
      a.click();
      a.remove();
      
    } catch (err: any) { // Error ko 'any' type diya
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans text-slate-800">
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css" />

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR - CONTROLS */}
        <div className="w-full md:w-1/3 bg-slate-50 p-6 border-r border-slate-200 overflow-y-auto" style={{ maxHeight: '90vh' }}>
          <h1 className="text-2xl font-black text-blue-700 mb-6 flex items-center gap-2">
            📸 Mega Studio
          </h1>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">1. Upload Photo (JPG/PNG)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm p-2 border rounded-lg bg-white" />
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">2. Change Background</label>
              <select value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full p-2 border rounded-lg bg-white font-semibold">
                <option value="transparent">🏁 Transparent</option>
                <option value="white">⚪ White</option>
                <option value="blue">🔵 Blue</option>
                <option value="red">🔴 Red</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
              <span className="font-bold text-sm">3. HD Upgrade (Upscale)</span>
              <input type="checkbox" checked={hdUpgrade} onChange={(e) => setHdUpgrade(e.target.checked)} className="w-5 h-5 accent-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
              <span className="font-bold text-sm">4. Photo Enhance (Face/Color)</span>
              <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} className="w-5 h-5 accent-blue-600" />
            </div>
          </div>

          <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-sm font-bold text-blue-900 mb-3">📄 Photo Sheet Builder</label>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-blue-800">Select Size:</span>
                <select value={photoSize} onChange={(e) => setPhotoSize(e.target.value)} className="w-full mt-1 p-2 border rounded-lg bg-white text-sm">
                  <option value="passport">Passport Size (35x45mm)</option>
                  <option value="6x7">6x7 (Stamp Size)</option>
                </select>
              </div>

              <div>
                <span className="text-xs font-bold text-blue-800">Set Quantity (1 - 42):</span>
                <input type="number" min="1" max="42" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg bg-white text-sm" />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={addBorder} onChange={(e) => setAddBorder(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-bold text-blue-800">Add Stroke / Border</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!croppedImage || loading || previewLoading}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
              !croppedImage || loading || previewLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
            }`}
          >
            {loading ? '⚙️ Processing .PSD...' : '💾 Generate .PSD File'}
          </button>
        </div>

        {/* RIGHT SIDE - LIVE PREVIEW & CROPPER */}
        <div className="w-full md:w-2/3 p-6 bg-slate-200 flex flex-col items-center justify-center relative min-h-[500px]">
          
          {!imageSrc && (
            <div className="text-slate-400 font-bold text-xl text-center">
              🖼️ <br/> Upload Photo to Start Magic
            </div>
          )}

          {/* CROPPER VIEW */}
          {imageSrc && !croppedImage && (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4 bg-yellow-300 px-4 py-1 rounded-full">✂️ User Crop Area</h2>
              <div className="w-full max-w-lg bg-white p-2 rounded-xl shadow-md overflow-hidden">
                <Cropper
                  src={imageSrc}
                  style={{ height: 400, width: "100%" }}
                  initialAspectRatio={35 / 45} 
                  guides={true}
                  ref={cropperRef}
                  viewMode={1}
                />
              </div>
              <button onClick={handleCrop} className="mt-6 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">
                ✅ Done Cropping (Next Step)
              </button>
            </div>
          )}

          {/* TRUE LIVE PREVIEW VIEW */}
          {croppedImage && (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4 bg-blue-200 text-blue-800 px-4 py-1 rounded-full">👀 True Live AI Preview</h2>
              
              <div className="bg-white p-4 rounded-xl shadow-xl border-4 border-dashed border-slate-300 flex items-center justify-center relative min-w-[250px] min-h-[300px]">
                {previewLoading ? (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                    <span className="font-bold text-blue-600 animate-pulse">Applying Magic...</span>
                  </div>
                ) : null}

                {aiPreviewUrl ? (
                  <img src={aiPreviewUrl} alt="AI Processed" className="max-h-64 object-contain" />
                ) : (
                  <img src={croppedImage} alt="Cropped" className="max-h-64 object-contain opacity-50" />
                )}
              </div>
              
              <p className="mt-4 text-sm font-bold text-slate-500 text-center">
                Ye AI Processed photo ab Backend mein jayegi aur A4 sheet par {quantity} baar arrange hokar .PSD banegi!
              </p>
              
              <button onClick={() => setCroppedImage(null)} className="mt-4 text-red-500 font-bold hover:underline text-sm">
                🔄 Edit Crop
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}