// src/app/page.tsx
import Link from "next/link";
import { toolsRegistry } from "@/config/siteConfig";

export default function DashboardHome() {
  const toolsList = Object.entries(toolsRegistry);

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
      </header>

      {/* Dynamic Tools Grid Panel */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 4rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {toolsList.map(([slug, metadata]) => (
            <div 
              key={slug}
              style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '1rem', 
                padding: '2rem', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
              }}
            >
              <div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  color: '#4f46e5', 
                  backgroundColor: '#e0e7ff', 
                  padding: '0.25rem 0.6rem', 
                  borderRadius: '0.375rem' 
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
                  display: 'block', 
                  textAlign: 'center', 
                  padding: '0.75rem 1rem', 
                  backgroundColor: '#0f172a', 
                  color: '#ffffff', 
                  fontWeight: '600', 
                  borderRadius: '0.5rem', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Launch Tool →
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}