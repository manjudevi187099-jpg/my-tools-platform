'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
// Yahan ensure karo ki import path wahi hai jahan aapki registry file hai
import { TOOLS_REGISTRY, ToolMetadata } from '../../../config/tools-registry';

// Dynamic Tool Components Map
const ToolComponents: Record<string, React.ElementType> = {
  "pdf-merger": dynamic(() => import('../../../tools/pdf-merger'), { ssr: false }),
  "image-to-pdf": dynamic(() => import('../../../tools/image-to-pdf'), { ssr: false }),
  "split-pdf": dynamic(() => import('../../../tools/split-pdf'), { ssr: false }),
  "watermark-pdf": dynamic(() => import('../../../tools/watermark-pdf'), { ssr: false }),
  "pdf-editor": dynamic(() => import('../../../tools/pdf-editor'), { ssr: false }),
  "pdf-to-word": dynamic(() => import('../../../tools/pdf-to-word'), { ssr: false }),
  "compress-pdf": dynamic(() => import('../../../tools/compress-pdf'), { ssr: false }),
  "unlock-pdf": dynamic(() => import('../../../tools/unlock-pdf'), { ssr: false }),
  "protect-pdf": dynamic(() => import('../../../tools/protect-pdf'), { ssr: false }),
  "invert-pdf": dynamic(() => import('../../../tools/pdf-invert-colors'), { ssr: false }),
  "remove-watermark": dynamic(() => import('../../../tools/remove-watermark'), { ssr: false }),
  "pdf-stamper": dynamic(() => import('../../../tools/pdf-stamper'), { ssr: false }),
  "add-name-date": dynamic(() => import('../../../tools/add-name-date'), { ssr: false }),
  "photo-signature-joiner": dynamic(() => import('../../../tools/photo-signature-joiner'), { ssr: false }),
  "age-calculator": dynamic(() => import('../../../tools/age-calculator'), { ssr: false }),
  "signature-on-photo": dynamic(() => import('../../../tools/signature-on-photo'), { ssr: false }),
  "image-resizer": dynamic(() => import('../../../tools/image-resizer'), { ssr: false }),
  "remove-background": dynamic(() => import('../../../tools/remove-background'), { ssr: false }),
  "passport-psd-maker": dynamic(() => import('../../../tools/passport-psd-maker'), { ssr: false }),
  "smart-card-maker": dynamic(() => import('../../../tools/smart-card-maker'), { ssr: false }),
  "omr-sheet-maker": dynamic(() => import('../../../tools/omr-sheet-maker'), { ssr: false }),
  "typing-speed-test": dynamic(() => import('../../../tools/typing-speed-test'), { ssr: false }),
  "resume-builder": dynamic(() => import('../../../tools/resume-builder'), { ssr: false }),
  "biodata-maker": dynamic(() => import('../../../tools/biodata-maker'), { ssr: false }),
};

export default function ToolPage() {
  const params = useParams();
  const slug = (params?.['tool-slug'] as string) || (params?.slug as string);

  if (!slug) return <div className="p-20 text-center">⏳ Loading...</div>;

  // Registry se metadata aur component fetch karein
  const toolMeta = TOOLS_REGISTRY[slug] as ToolMetadata;
  const ActiveToolComponent = ToolComponents[slug];

  // Agar tool registry mein nahi hai ya isActive: false hai, toh error dikhayein
  if (!toolMeta || !toolMeta.isActive) {
    return (
      <div className="p-20 text-center text-red-500 font-bold text-lg">
        ⚠️ Tool "{slug}" abhi available nahi hai!
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b py-10 px-4 text-center shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">{toolMeta.name}</h1>
        <p className="text-slate-500 mt-2">{toolMeta.description}</p>
      </div>
      
      <div className="mt-8 px-4">
        {ActiveToolComponent ? (
          <ActiveToolComponent />
        ) : (
          <div className="text-center p-20 font-bold text-red-500">
            ⚠️ Component linked nahi hai. Check ToolComponents map in page.tsx!
          </div>
        )}
      </div>
    </main>
  );
}