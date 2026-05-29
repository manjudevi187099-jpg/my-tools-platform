'use client';

import React from 'react';

export default function ProtectPdf() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ padding: '3rem', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
        
        <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0', fontSize: '2rem' }}>
          Encryption Engine Upgrading
        </h2>
        
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
          We are currently upgrading our security engine to provide military-grade, 100% private client-side PDF encryption. This tool will be available in the next update!
        </p>
        
        <div style={{ marginTop: '2.5rem' }}>
          <button 
            onClick={() => window.location.href = '/tools/split-pdf'}
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '600', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Try Split PDF Meanwhile ✂️
          </button>
        </div>
      </div>

    </div>
  );
}