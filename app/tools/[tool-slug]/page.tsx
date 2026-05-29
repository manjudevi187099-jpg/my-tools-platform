'use client';

import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { toolsRegistry } from '../../../config/siteConfig';

// 🚀 Sirf wahi tools load karenge jo ban chuke hain
const PdfMerger = dynamic(() => import('../../../src/tools/pdf-merger'), { ssr: false });
const SplitPdf = dynamic(() => import('../../../src/tools/split-pdf'), { ssr: false });

export default function ToolPage({ params }: { params: { 'tool-slug': string } }) {
  const slug = params['tool-slug'];
  const toolMeta = toolsRegistry[slug];

  if (!toolMeta) {
    return notFound();
  }

  // URL ke hisaab se sahi tool dikhayega
  const renderActiveTool = () => {
    switch (slug) {
      case 'pdf-merger': return <PdfMerger />;
      case 'split-pdf': return <SplitPdf />;
      default: return <div style={{ padding: '3rem', textAlign: 'center' }}>Tool engine loading...</div>;
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '3rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Universal Premium Header */}
      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '2.2rem', fontWeight: '800' }}>{toolMeta.name}</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem' }}>{toolMeta.description}</p>
      </div>

      {/* Asli tool yahan load hoga (Client side par) */}
      {renderActiveTool()}
      
    </main>
  );
}