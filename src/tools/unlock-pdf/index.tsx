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
      // Yahan password pass kar rahe hain
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password: password });
      
      // Password hata kar save kar rahe hain
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Unlocked_${file.name}`;
      a.click();
      setStatus("Unlocked successfully!");
    } catch (e) {
      setStatus("Error: Incorrect password or corrupted file.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Unlock PDF</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', margin: '10px 0' }} />
      <button onClick={unlockPdf} style={{ width: '100%', padding: '10px', background: '#0070f3', color: 'white', border: 'none' }}>Unlock PDF</button>
      <p>{status}</p>
    </div>
  );
}