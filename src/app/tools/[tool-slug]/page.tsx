'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { toolsRegistry } from '../../../config/siteConfig'; // Path check kar lena

// 🌟 SAARE TOOLS KA DYNAMIC IMPORT
// Sahi path: 'src/tools/...' se import ho raha hai
const ToolComponents: Record<string, React.ElementType> = {
  "pdf-merger": dynamic(() => import('@/tools/pdf-merger'), { ssr: false }),
  "split-pdf": dynamic(() => import('@/tools/split-pdf'), { ssr: false }),
  "compress-pdf": dynamic(() => import('@/tools/compress-pdf'), { ssr: false }),
  "unlock-pdf": dynamic(() => import('@/tools/unlock-pdf'), { ssr: false }),
  "protect-pdf": dynamic(() => import('@/tools/protect-pdf'), { ssr: false }),
  "image-to-pdf": dynamic(() => import('@/tools/image-to-pdf'), { ssr: false }),
  "watermark-pdf": dynamic(() => import('@/tools/watermark-pdf'), { ssr: false }),
  "invert-pdf": dynamic(() => import('@/tools/pdf-invert-colors'), { ssr: false }),
  "remove-watermark": dynamic(() => import('@/tools/remove-watermark'), { ssr: false }),
  "pdf-editor": dynamic(() => import('@/tools/pdf-editor'), { ssr: false }),
  "pdf-stamper": dynamic(() => import('@/tools/pdf-stamper'), { ssr: false }),
  "pdf-to-word": dynamic(() => import('@/tools/pdf-to-word'), { ssr: false }),
};

export default function ToolPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // 1. Loading State
  if (!slug) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 text-xl font-bold">⏳ Loading Tool...</div>;
  }

  // 2. Tool Data Fetching
  const toolMeta = toolsRegistry[slug];

  // 3. 404 Handling (Agar tool registry mein nahi hai)
  if (!toolMeta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-6xl font-black text-slate-300 mb-4">404</h1>
        <p className="text-xl font-bold text-slate-600">Tool "{slug}" nahi mila!</p>
        <a href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Wapas Home Jayein</a>
      </div>
    );
  }

  // 4. Dynamic Component Rendering
  const ActiveToolComponent = ToolComponents[slug];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-12 font-sans">
      
      {/* 🌟 Professional Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 px-4 text-center shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {toolMeta.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto text-lg">
          {toolMeta.description}
        </p>
      </div>

      {/* 🌟 TOOL RENDERING */}
      <div className="mt-8 px-4">
        {ActiveToolComponent ? (
          <ActiveToolComponent />
        ) : (
          <div className="text-center p-20 text-red-500 font-bold">
            ⚠️ Component file exist nahi karti. Check path in ToolComponents!
          </div>
        )}
      </div>
    </main>
  );
}