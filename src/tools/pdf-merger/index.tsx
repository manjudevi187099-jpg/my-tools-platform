'use client';

import React, { useState } from 'react';

export default function PdfMerger() {
  const [files, setFiles] = useState<string[]>([]);

  return (
    <div style={{ padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '0.5rem', backgroundColor: '#f8fafc', textAlign: 'center' }}>
      <p style={{ color: '#475569', fontWeight: '500' }}>
        Click to upload or drag & drop your PDF files here
      </p>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
        Supports multiple PDF files up to 50MB
      </span>
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
        <button style={{ padding: '0.6rem 1.5rem', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer' }}>
          Merge PDFs Now
        </button>
      </div>
    </div>
  );
}