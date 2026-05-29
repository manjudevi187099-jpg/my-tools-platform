'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function ProtectPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setPassword(''); 
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleProtect = async () => {
    if (!file || !password) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // 🔒 PDF ko encrypt karein
      pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: { printing: 'highResolution', modifying: false, copying: false },
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Protected_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Encryption error:", error);
      alert('Failed to protect the PDF. It might already be encrypted or corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setPassword('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      {!file && (
        <div onClick={() => fileInputRef.current?.click()} style={{ padding: '4rem 2rem', border: '2px dashed #10b981', borderRadius: '1rem', backgroundColor: '#ecfdf5', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#059669', margin: '0 0 0.5rem 0' }}>Select PDF to Protect</h2>
          <p style={{ color: '#10b981', margin: 0 }}>Add a secure password to your document locally</p>
        </div>
      )}

      <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

      {file && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>{file.name}</h3>
            <button onClick={resetTool} style={{ padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>❌ Close</button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Set a strong password:</label>
            <input type="text" placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>⚠️ This process happens entirely in your browser. We never see your password.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={handleProtect} disabled={isProcessing || !password} style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: '700', backgroundColor: !password ? '#cbd5e1' : '#10b981', color: '#ffffff', border: 'none', borderRadius: '0.5rem', cursor: !password ? 'not-allowed' : 'pointer', boxShadow: password ? '0 4px 6px rgba(16, 185, 129, 0.25)' : 'none', transition: 'all 0.2s' }}>
              {isProcessing ? 'Encrypting...' : '🔒 Protect & Download PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}