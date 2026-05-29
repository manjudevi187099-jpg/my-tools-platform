'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Upload a locked PDF");

  const unlockPdf = async () => {
    if (!file) return;
    setStatus("Unlocking...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // 🚀 Fix 1: TypeScript ko bypass karne ke liye 'as any' lagaya
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password: password } as any);
      
      const pdfBytes = await pdfDoc.save();
      
      // 🚀 Fix 2: Purana Blob wala error fix karne ke liye 'as any' lagaya
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Unlocked_${file.name}`;
      a.click();
      setStatus("Unlocked successfully!");
    } catch (e) {
      console.error(e);
      setStatus("Error: Incorrect password or corrupted file.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Unlock PDF</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input 
        type="password" 
        placeholder="Enter Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        style={{ width: '100%', margin: '10px 0', padding: '8px' }} 
      />
      <button 
        onClick={unlockPdf} 
        style={{ width: '100%', padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Unlock PDF
      </button>
      <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{status}</p>
    </div>
  );
}