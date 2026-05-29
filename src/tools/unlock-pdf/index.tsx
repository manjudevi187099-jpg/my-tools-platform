'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Worker setup for pdf.js (Fallback engine ke liye)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Upload a protected PDF");
  const [isProcessing, setIsProcessing] = useState(false);

  const unlockPdf = async () => {
    if (!file || !password) {
      setStatus("⚠️ Please select a file and enter the password.");
      return;
    }
    
    setIsProcessing(true);
    setStatus("Verifying password and unlocking...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // ATTEMPT 1: Native Unlock (For standard encrypted PDFs)
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer, { password: password } as any);
        const pdfBytes = await pdfDoc.save();
        triggerDownload(pdfBytes, file.name);
        setStatus("✅ Unlocked successfully (Native)!");
      } 
      catch (nativeError) {
        // ATTEMPT 2: Fallback Engine (For High-Security AES PDFs like Aadhar/Bank)
        console.log("Native unlock failed, switching to fallback engine...");
        
        const typedArray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray, password: password }).promise;
        const newPdf = await PDFDocument.create();
        
        for (let i = 1; i <= pdf.numPages; i++) {
          setStatus(`Unlocking page ${i} of ${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          
          // 🚀 FIX: Scale ko 4.0 kar diya (Ultra HD Quality)
          const viewport = page.getViewport({ scale: 4.0 }); 
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width; 
          canvas.height = viewport.height;
          
          await page.render({ canvasContext: ctx!, viewport }).promise;
          
          // 🚀 FIX: Quality ko 1.0 (100%) kar diya
          const imgData = canvas.toDataURL('image/jpeg', 1.0); 
          
          const jpg = await newPdf.embedJpg(imgData);
          const p = newPdf.addPage([viewport.width, viewport.height]);
          p.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }
        
        const pdfBytes = await newPdf.save();
        triggerDownload(pdfBytes, file.name);
        setStatus("✅ PDF Unlocked & Reconstructed successfully!");
      }
    } catch (e: any) {
      console.error(e);
      setStatus("❌ Error: Incorrect password or heavily corrupted file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = (pdfBytes: Uint8Array, originalName: string) => {
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Unlocked_${originalName}`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      
      {/* Status Banner */}
      <div style={{ padding: '12px', background: status.includes('✅') ? '#dcfce7' : status.includes('❌') ? '#fee2e2' : '#f8fafc', color: status.includes('❌') ? '#dc2626' : '#0f172a', textAlign: 'center', marginBottom: '25px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        {status}
      </div>

      {/* Upload Box UI */}
      {!file ? (
        <label style={{ border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '40px 20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          <span style={{ fontSize: '30px', marginBottom: '10px' }}>🔒</span>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#475569' }}>Click to Upload Protected PDF</span>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>Max file size: 50MB</span>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
        </label>
      ) : (
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', background: '#f8fafc' }}>
          
          {/* File Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>📄</span>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{file.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPassword(""); setStatus("Upload a protected PDF"); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Change</button>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Enter PDF Password:</label>
            <input 
              type="password" 
              placeholder="e.g. SURB1234" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' }} 
            />
          </div>

          {/* Action Button */}
          <button 
            onClick={unlockPdf} 
            disabled={isProcessing}
            style={{ width: '100%', padding: '14px', background: isProcessing ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {isProcessing ? 'Unlocking...' : '🔓 Unlock PDF Now'}
          </button>
        </div>
      )}
    </div>
  );
}