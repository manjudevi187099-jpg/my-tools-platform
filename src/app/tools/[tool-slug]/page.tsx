'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

// 🌟 Config aur Supabase Imports
import { toolsRegistry, ToolMetadata } from '../../../../config/siteConfig';
import { supabase } from '../../../lib/supabase'; // Apna supabase path check kar lein

const ToolComponents: Record<string, React.ElementType> = {
  "pdf-merger": dynamic(() => import('../../../tools/pdf-merger'), { ssr: false }),
  "image-to-pdf": dynamic(() => import('../../../tools/image-to-pdf'), { ssr: false }),
  "split-pdf": dynamic(() => import('../../../tools/split-pdf'), { ssr: false }),
  "watermark-pdf": dynamic(() => import('../../../tools/watermark-pdf'), { ssr: false }),
  "pdf-editor": dynamic(() => import('../../../tools/pdf-editor'), { ssr: false }),
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
  "timer": dynamic(() => import('../../../tools/timer'), { ssr: false }),
  "walkie-talkie": dynamic(() => import('../../../tools/walkie-talkie'), { ssr: false }),
};

export default function ToolPage() {
  const params = useParams();
  const slug = (params?.['tool-slug'] as string) || (params?.slug as string);

  // 🔥 NAYA STATE: Tool ka specific blog store karne ke liye
  const [toolBlog, setToolBlog] = useState<any>(null);

  // 🔥 YAHAN LAGA HAI HIDDEN TRACKER AUR BLOG FETCHER 🔥
  useEffect(() => {
    const trackToolViewAndFetchBlog = async () => {
      if (!slug) return;
      
      try {
        // 1. Purana logic: Total views me +1 karna
        const { data } = await supabase
          .from('tool_analytics')
          .select('total_views')
          .eq('tool_slug', slug)
          .single();

        if (data) {
          await supabase
            .from('tool_analytics')
            .update({ 
              total_views: data.total_views + 1, 
              last_used: new Date().toISOString() 
            })
            .eq('tool_slug', slug);
        } else {
          await supabase
            .from('tool_analytics')
            .insert({ tool_slug: slug, total_views: 1 });
        }

        // 2. 'tool_pageviews' table mein time ke sath entry karna
        await supabase
          .from('tool_pageviews')
          .insert({ tool_slug: slug });

        // 3. 🔥 FETCH TOOL SPECIFIC BLOG
        const { data: blogData } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('linked_tool', slug)
          .single();
          
        if (blogData) {
          setToolBlog(blogData);
        }

      } catch (error) {
        console.error("Tracking Error:", error);
      }
    };

    trackToolViewAndFetchBlog();
  }, [slug]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 font-bold text-lg flex items-center gap-2">
          <span className="text-2xl">⏳</span> Loading Tool...
        </div>
      </div>
    );
  }

  const toolMeta = toolsRegistry[slug] as ToolMetadata;
  const ActiveToolComponent = ToolComponents[slug];

  if (!toolMeta || !toolMeta.isActive) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-slate-800">Tool Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          The tool "{slug}" is currently unavailable or under maintenance.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* TOOL HEADER */}
      <div className="bg-white border-b py-10 px-4 text-center shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{toolMeta.name}</h1>
        <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm md:text-base">
          {toolMeta.description}
        </p>
      </div>
      
      <div className="mt-8 px-4">
        {ActiveToolComponent ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. ASLI TOOL */}
            <ActiveToolComponent />

            {/* 2. SOCIAL MEDIA LINKS (Tool ke theek niche) */}
            <div className="mt-16 max-w-5xl mx-auto border-t border-slate-200 pt-10">
              <h3 className="text-center text-slate-500 font-bold uppercase tracking-wider mb-6 text-sm">
                Join Our Community
              </h3>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a href="https://whatsapp.com/channel/0029VbD1pyt3LdQTNaRDD121" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="text-xl">💬</span> Join WhatsApp
                </a>
                <a href="https://www.facebook.com/share/1DZdEzXwRf/" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#1877F2] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="text-xl">📘</span> Facebook Page
                </a>
                <a href="https://www.instagram.com/dhamakatools?igsh=MWtoeWltajRmOWtpaw==" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="text-xl">📸</span> Instagram
                </a>
              </div>
            </div>

            {/* 3. HOW TO USE / BLOG SECTION (Social media ke niche) */}
            {toolBlog && (
              <div className="mt-16 max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-200">
                <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">
                  {toolBlog.title || `How to Use ${toolMeta.name}`}
                </h2>
                <div className="w-20 h-1 bg-purple-500 mx-auto rounded-full mb-10"></div>
                
                {/* Asli Blog Content jo aap admin se likhenge */}
                <div 
                  className="prose prose-lg max-w-none text-slate-700 leading-relaxed marker:text-purple-500 prose-h2:text-slate-800 prose-h2:font-black prose-a:text-purple-600 prose-img:rounded-xl" 
                  dangerouslySetInnerHTML={{ __html: toolBlog.content }} 
                />
              </div>
            )}

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