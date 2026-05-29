'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation'; // 👈 Naya hook import kiya
import { toolsRegistry } from '../../../config/siteConfig';

const PdfMerger = dynamic(() => import('../../../src/tools/pdf-merger'), { ssr: false });
const SplitPdf = dynamic(() => import('../../../src/tools/split-pdf'), { ssr: false });
const ProtectPdf = dynamic(() => import('../../../src/tools/protect-pdf'), { ssr: false });

export default function ToolPage() {
  const params = useParams(); // 👈 Hook se params nikalenge
  
  // URL se exact tool ka naam nikalenge
  const slug = (params?.['tool-slug'] as string) || (params?.slug as string);

  // Jab tak URL theek se load na ho jaye, loading dikhayenge taaki galat tool na khule
  if (!slug) {
    return <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b', fontSize: '1.2rem' }}>⏳ Loading Tool...</div>;
  }

  // Sahi title aur description nikalenge
  const toolMeta = toolsRegistry[slug] || {
    name: slug.replace('-', ' '),
    description: 'Advanced, fast, and secure utility engine.'
  };

  // Exact wahi tool load karenge jo URL me hai
  const renderActiveTool = () => {
    if (slug === 'pdf-merger') return <PdfMerger />;
    if (slug === 'split-pdf') return <SplitPdf />;
    if (slug === 'protect-pdf') return <ProtectPdf />;
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>⚠️ Tool not found or still loading...</div>;
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