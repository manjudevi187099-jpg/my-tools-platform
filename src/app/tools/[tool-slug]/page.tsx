'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { toolsRegistry } from '../../../../config/siteConfig';

// Saare Tools ka Dynamic Import (Sahi path ke saath)
const PdfMerger = dynamic(() => import('../../../../src/tools/pdf-merger'), { ssr: false });
const SplitPdf = dynamic(() => import('../../../../src/tools/split-pdf'), { ssr: false });
const CompressPdf = dynamic(() => import('../../../../src/tools/compress-pdf'), { ssr: false });
const UnlockPdf = dynamic(() => import('../../../../src/tools/unlock-pdf'), { ssr: false });
const ProtectPdf = dynamic(() => import('../../../../src/tools/protect-pdf'), { ssr: false });
const ImageToPdf = dynamic(() => import('../../../../src/tools/image-to-pdf'), { ssr: false });
const WatermarkPdf = dynamic(() => import('../../../../src/tools/watermark-pdf'), { ssr: false });
const InvertPdf = dynamic(() => import('../../../../src/tools/pdf-invert-colors'), { ssr: false });
const RemoveWatermark = dynamic(() => import('../../../../src/tools/remove-watermark'), { ssr: false });

// Naya PDF Stamper ka Dynamic Import
const PdfStamper = dynamic(() => import('../../../../src/tools/pdf-stamper'), { ssr: false });

export default function ToolPage() {
  const params = useParams();
  const slug = (params?.['tool-slug'] as string) || (params?.slug as string);

  if (!slug) {
    return <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b', fontSize: '1.2rem' }}>⏳ Loading Tool...</div>;
  }

  const toolMeta = toolsRegistry[slug as keyof typeof toolsRegistry] || {
    name: slug.replace('-', ' '),
    description: 'Advanced, fast, and secure utility engine.'
  };

  const renderActiveTool = () => {
    if (slug === 'pdf-merger') return <PdfMerger />;
    if (slug === 'split-pdf') return <SplitPdf />;
    if (slug === 'compress-pdf') return <CompressPdf />;
    if (slug === 'unlock-pdf') return <UnlockPdf />;
    if (slug === 'protect-pdf') return <ProtectPdf />;
    if (slug === 'image-to-pdf') return <ImageToPdf />;
    if (slug === 'watermark-pdf') return <WatermarkPdf />;
    if (slug === 'invert-pdf') return <InvertPdf />;
    if (slug === 'remove-watermark') return <RemoveWatermark />;
    
    // Naya PDF Stamper ka condition
    if (slug === 'pdf-stamper') return <PdfStamper />;
    
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>⚠️ Tool not found.</div>;
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '3rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '2.2rem', fontWeight: '800', textTransform: 'capitalize' }}>
          {toolMeta.name}
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          {toolMeta.description}
        </p>
      </div>
      {renderActiveTool()}
    </main>
  );
}