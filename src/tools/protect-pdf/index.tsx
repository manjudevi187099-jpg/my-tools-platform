'use client';

import React, { useState } from 'react';
import { PDFDocument } from '@cantoo/pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';

export default function ProtectPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("Upload a PDF to lock");
  const [isProcessing, setIsProcessing] = useState(false);

  const protectPdf = async () => {
    if (!file) {
      setStatus("⚠️ Please upload a PDF first.");
      return;
    }
    if (!password || password.length < 4) {
      setStatus("⚠️ Password must be at least 4 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("⚠️ Passwords do not match!");
      return;
    }

    setIsProcessing(true);
    setStatus("Encrypting PDF with military-grade security...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalBytes = new Uint8Array(arrayBuffer);
      
      // Step 1: Sirf check karte hain ki file pehle se lock toh nahi hai
      try {
        await PDFDocument.load(originalBytes);
      } catch (e) {
        setStatus("❌ Error: This PDF is already protected or corrupted.");
        setIsProcessing(false);
        return;
      }
      
      // 🚀 THE FIX: Hum directly original kachhe data (originalBytes) par lock laga rahe hain
      // Isse aapka Hindi text ya koi bhi format bilkul nahi fategi!
      const encryptedBytes = await encryptPDF(originalBytes, password);

      const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Protected_${file.name}`;
      a.click();
      
      setStatus("✅ PDF Protected & Downloaded Successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      console.error(e);
      setStatus("❌ Error: Something went wrong during encryption.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      
      {/* Status Banner */}
      <div style={{ padding: '12px', background: status.includes('✅') ? '#dcfce7' : status.includes('❌') || status.includes('⚠️') ? '#fee2e2' : '#f8fafc', color: status.includes('❌') || status.includes('⚠️') ? '#dc2626' : '#0f172a', textAlign: 'center', marginBottom: '25px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        {status}
      </div>

      {/* Upload Box UI */}
      {!file ? (
        <label style={{ border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '40px 20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          <span style={{ fontSize: '30px', marginBottom: '10px' }}>🔐</span>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#475569' }}>Click to Upload PDF</span>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>Your file stays 100% private in your browser</span>
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
            <button onClick={() => { setFile(null); setPassword(""); setConfirmPassword(""); setStatus("Upload a PDF to lock"); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Change</button>
          </div>

          {/* Password Inputs */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Create Password:</label>
            <input 
              type="password" 
              placeholder="Enter a strong password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' }} 
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Confirm Password:</label>
            <input 
              type="password" 
              placeholder="Re-enter password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' }} 
            />
          </div>

          {/* Action Button */}
          <button 
            onClick={protectPdf} 
            disabled={isProcessing}
            style={{ width: '100%', padding: '14px', background: isProcessing ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {isProcessing ? 'Encrypting...' : '🔒 Protect PDF Now'}
          </button>
        </div>
      )}
    </div>
  );
}