'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { TOOLS_REGISTRY, ToolMetadata } from '../../../config/tools-registry';

// Dynamic Tool Imports
const ToolComponents: Record<string, React.ElementType> = {
  "pdf-editor": dynamic(() => import('../../../tools/pdf-editor'), { ssr: false }),
  "pdf-to-word": dynamic(() => import('../../../tools/pdf-to-word'), { ssr: false }),
  "pdf-merger": dynamic(() => import('../../../tools/pdf-merger'), { ssr: false }),
  "split-pdf": dynamic(() => import('../../../tools/split-pdf'), { ssr: false }),
  "compress-pdf": dynamic(() => import('../../../tools/compress-pdf'), { ssr: false }),
  "unlock-pdf": dynamic(() => import('../../../tools/unlock-pdf'), { ssr: false }),
  "protect-pdf": dynamic(() => import('../../../tools/protect-pdf'), { ssr: false }),
  "image-to-pdf": dynamic(() => import('../../../tools/image-to-pdf'), { ssr: false }),
  "watermark-pdf": dynamic(() => import('../../../tools/watermark-pdf'), { ssr: false }),
  "invert-pdf": dynamic(() => import('../../../tools/pdf-invert-colors'), { ssr: false }),
  "remove-watermark": dynamic(() => import('../../../tools/remove-watermark'), { ssr: false }),
  "pdf-stamper": dynamic(() => import('../../../tools/pdf-stamper'), { ssr: false }),
};

export default function ToolPage() {
  const params = useParams();
  const slug = (params?.['tool-slug'] as string) || (params?.slug as string);

  if (!slug) return <div className="p-20 text-center">⏳ Loading...</div>;

  // Type safe access to registry with isActive check
  const toolMeta = TOOLS_REGISTRY[slug as keyof typeof TOOLS_REGISTRY] as unknown as ToolMetadata;
  const ActiveToolComponent = ToolComponents[slug];

  // 🌟 NAYA: Check if tool exists and is Active
  if (!toolMeta || !toolMeta.isActive) {
    return (
      <div className="p-20 text-center text-red-500 font-bold text-lg">
        ⚠️ Tool "{slug}" abhi available nahi hai!
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* 🌟 Professional Header */}
      <div className="bg-white border-b py-10 px-4 text-center shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">{toolMeta.name}</h1>
        <p className="text-slate-500 mt-2">{toolMeta.description}</p>
      </div>
      
      {/* 🌟 Active Tool Container */}
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