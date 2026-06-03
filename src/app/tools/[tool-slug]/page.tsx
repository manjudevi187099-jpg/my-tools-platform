'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

// 🌟 FIX: TOOLS_REGISTRY ko toolsRegistry (small) kar diya gaya hai!
import { toolsRegistry, ToolMetadata } from '../../../../config/siteConfig';

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
  "passport-psd-maker": dynamic(() => import('../../../tools/passport-psd-maker'), { ssr: false }),
  "smart-card-maker": dynamic(() => import('../../../tools/smart-card-maker'), { ssr: false }),
  "omr-sheet-maker": dynamic(() => import('../../../tools/omr-sheet-maker'), { ssr: false }),
  "typing-speed-test": dynamic(() => import('../../../tools/typing-speed-test'), { ssr: false }),
  "resume-builder": dynamic(() => import('../../../tools/resume-builder'), { ssr: false }),
  "biodata-maker": dynamic(() => import('../../../tools/biodata-maker'), { ssr: false }),
  "muslim-biodata-maker": dynamic(() => import('../../../tools/muslim-biodata-maker'), { ssr: false }),
  "experience-letter-maker": dynamic(() => import('../../../tools/experience-letter-maker'), { ssr: false }),
  "invoice-maker": dynamic(() => import('../../../tools/invoice-maker'), { ssr: false }),
  "certificate-maker": dynamic(() => import('../../../tools/certificate-maker'), { ssr: false }),
  "stamp-maker": dynamic(() => import('../../../tools/stamp-maker'), { ssr: false }),
  "english-to-hindi-typing": dynamic(() => import('../../../tools/english-to-hindi-typing'), { ssr: false }),
  "qr-generator": dynamic(() => import('../../../tools/qr-generator'), { ssr: false }),
  "p2p-share": dynamic(() => import('../../../tools/p2p-share'), { ssr: false }),
  
  // 🔥 FIX: timer wale path mein '/page' add kar diya gaya hai
  "timer": dynamic(() => import('../../../tools/timer'), { ssr: false }),
  "walkie-talkie": dynamic(() => import('../../../tools/walkie-talkie'), { ssr: false }),
};

export default function ToolPage() {
  const params = useParams();
  const slug = (params?.['tool-slug'] as string) || (params?.slug as string);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 font-bold text-lg flex items-center gap-2">
          <span className="text-2xl">⏳</span> Loading Tool...
        </div>
      </div>
    );
  }

  // 🌟 FIX: Yahan par bhi toolsRegistry kar diya hai
  const toolMeta = toolsRegistry[slug] as ToolMetadata;
  const ActiveToolComponent = ToolComponents[slug];

  if (!toolMeta || !toolMeta.isActive) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-slate-800">Tool Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          The tool "{slug}" is currently unavailable, under maintenance, or does not exist.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b py-10 px-4 text-center shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{toolMeta.name}</h1>
        <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm md:text-base">
          {toolMeta.description}
        </p>
      </div>
      
      <div className="mt-8 px-4">
        {ActiveToolComponent ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActiveToolComponent />
          </div>
        ) : (
          <div className="text-center p-20">
            <div className="inline-block bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 font-bold shadow-sm">
              ⚠️ Warning: Component not linked. Please check ToolComponents map for "{slug}"
            </div>
          </div>
        )}
      </div>
    </main>
  );
}