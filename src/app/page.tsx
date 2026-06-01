'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { TOOLS_REGISTRY } from '../config/tools-registry';

export default function DashboardHome() {
  const [search, setSearch] = useState("");

  // Saare tools ko array mein convert karke filter karein
  const toolsList = Object.entries(TOOLS_REGISTRY).filter(
    ([_, meta]) => meta.isActive
  );

  // Search filter logic
  const filteredTools = toolsList.filter(([_, meta]) =>
    meta.name.toLowerCase().includes(search.toLowerCase()) ||
    meta.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Premium Navbar */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5', letterSpacing: '-0.05em' }}>
            🛠️ MultiTools.io
          </span>
          <span style={{ fontSize: '0.875rem', backgroundColor: '#edf2f7', padding: '0.4rem 0.8rem', borderRadius: '9999px', fontWeight: '500', color: '#4a5568' }}>
            Production Live
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem 2rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '1rem' }}>
          All-In-One Professional <span style={{ color: '#4f46e5' }}>Utility Engine</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
          Free, secure, and blazing-fast web tools built for developers, designers, and power users.
        </p>

        {/* Search Bar */}
        <div style={{ marginTop: '2.5rem' }}>
          <input 
            type="text" 
            placeholder="Search for tools (e.g., Invoice, Stamp, Hindi...)" 
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              padding: '1rem 1.5rem', 
              borderRadius: '9999px', 
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
        </div>
      </header>

      {/* Dynamic Tools Grid Panel */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 4rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredTools.length > 0 ? (
            filteredTools.map(([slug, metadata]) => (
              <div 
                key={slug}
                style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '1rem', 
                  padding: '2rem', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', 
                    color: '#4f46e5', backgroundColor: '#e0e7ff', 
                    padding: '0.25rem 0.6rem', borderRadius: '0.375rem' 
                  }}>
                    {metadata.category}
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1e293b', marginTop: '1rem', marginBottom: '0.5rem' }}>
                    {metadata.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                    {metadata.description}
                  </p>
                </div>

                <Link 
                  href={`/tools/${slug}`}
                  style={{ 
                    display: 'block', textAlign: 'center', padding: '0.75rem 1rem', 
                    backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', 
                    borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem' 
                  }}
                >
                  Launch Tool →
                </Link>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <p>No tools found matching your search. Try a different keyword!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}