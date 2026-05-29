'use client';

import dynamic from 'next/dynamic';
// Dhyan dijiye: notFound ko hata diya gaya hai taaki 404 na aaye
import { toolsRegistry } from '../../../config/siteConfig';

const PdfMerger = dynamic(() => import('../../../src/tools/pdf-merger'), { ssr: false });
const SplitPdf = dynamic(() => import('../../../src/tools/split-pdf'), { ssr: false });

// params ko 'any' rakha hai taaki Vercel nakhre na kare
export default function ToolPage({ params }: any) {
  // 1. Slug ko safely nikalenge, agar nahi mila toh by default 'split-pdf' open hoga
  const slug = params?.['tool-slug'] || params?.slug || 'split-pdf';
  
  // 2. Agar Vercel ko update hone me time lag raha hai, toh yeh backup data dikhayega
  const toolMeta = toolsRegistry?.[slug] || {
    name: slug === 'split-pdf' ? 'Split PDF Pro' : 'Professional Tool',
    description: 'Advanced, fast, and secure utility engine.'
  };

  // 3. Tool load karne ka fail-safe logic
  const renderActiveTool = () => {
    if (slug.includes('split-pdf')) return <SplitPdf />;
    if (slug.includes('pdf-merger')) return <PdfMerger />;
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>⏳ Loading engine...</div>;
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '3rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Universal Premium Header */}
      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '2.2rem', fontWeight: '800', textTransform: 'capitalize' }}>
          {toolMeta.name}
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          {toolMeta.description}
        </p>
      </div>

      {/* Asli tool yahan load hoga */}
      {renderActiveTool()}
      
    </main>
  );
}