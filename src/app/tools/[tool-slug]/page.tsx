'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
// 🌟 Config aur Supabase Imports
import { toolsRegistry, ToolMetadata } from '../../../../config/siteConfig';
import { supabase } from '../../../lib/supabase';

// 🔥 MASTER TOOL COMPONENTS REGISTRY
const ToolComponents: Record<string, React.ElementType> = {
  
  // ==========================================
  // 📁 CATEGORY 1: PURANE TOOLS (src/tools/ folder wale)
  // ==========================================
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


  // ==========================================
  // 📁 CATEGORY 2: NAYE TOOLS (src/app/tools/ folder wale)
  // ==========================================
  "pro-suit-changer": dynamic(() => import('../pro-suit-changer/page'), { ssr: false }),
  "remove-bg": dynamic(() => import('../remove-bg/page'), { ssr: false }),
  
  "pdf-to-word": dynamic(() => import('../pdf-to-word/page'), { ssr: false }),
  "pdf-to-excel": dynamic(() => import('../pdf-to-excel/page'), { ssr: false }),
  "photo-studio": dynamic(() => import('../photo-studio/page'), { ssr: false }),
  "photo-enhancer": dynamic(() => import('../photo-enhancer/page'), { ssr: false }),
  "logo-maker": dynamic(() => import('../logo-maker/page'), { ssr: false }),
  
  "event-invite": dynamic(() => import('../invitation-maker/page'), { ssr: false }),
  "assignment-cover": dynamic(() => import('../assignment-cover-page-maker/page'), { ssr: false }),
  "id-card": dynamic(() => import('../id-card-generator/page'), { ssr: false }),
  "bonafide-cert": dynamic(() => import('../bonafide-certificate-generator/page'), { ssr: false }),
  "image-masker": dynamic(() => import('../masking-tool/page'), { ssr: false }),
 
  "handwriting-pdf": dynamic(() => import('../handwriting-pdf-generator/page'), { ssr: false }),
  "tc-generator": dynamic(() => import('../tc-generator/page'), { ssr: false }),
  "marksheet-designer": dynamic(() => import('../marksheet-designer/page'), { ssr: false }),
  "admit-card": dynamic(() => import('../admit-card-designer/page'), { ssr: false }),
  "affidavit-gen": dynamic(() => import('../affidavit-generator/page'), { ssr: false }),
  "receipt-maker": dynamic(() => import('../receipt-generator/page'), { ssr: false }),
  "cover-letter": dynamic(() => import('../cover-letter-generator/page'), { ssr: false }),
  "quotation-maker": dynamic(() => import('../quotation-maker/page'), { ssr: false }),
  "letterhead-maker": dynamic(() => import('../letterhead-maker/page'), { ssr: false }),
  "visiting-card": dynamic(() => import('../visiting-card-maker/page'), { ssr: false }),
  "business-profile": dynamic(() => import('../business-profile-generator/page'), { ssr: false }),
  "salary-slip": dynamic(() => import('../salary-slip/page'), { ssr: false }),
  "email-signature": dynamic(() => import('../email-signature/page'), { ssr: false }),
  
  "balance-sheet": dynamic(() => import('../balance-sheet/page'), { ssr: false }),
  "profit-loss": dynamic(() => import('../profit-loss/page'), { ssr: false }),
  "project-report": dynamic(() => import('../project-report/page'), { ssr: false }),
  "loan-emi-calculator": dynamic(() => import('../loan-emi-calculator/page'), { ssr: false }),
  "investment-calculator": dynamic(() => import('../investment-calculator/page'), { ssr: false }),

  // 🔥 NAYE 9 TOOLS ADDED YAHAN 🔥
  "cgpa-to-percentage": dynamic(() => import('../cgpa-to-percentage/page'), { ssr: false }),
  "whatsapp-link-generator": dynamic(() => import('../whatsapp-link-generator/page'), { ssr: false }),
  "webp-to-jpg-converter": dynamic(() => import('../webp-to-jpg-converter/page'), { ssr: false }),
  "url-shortener": dynamic(() => import('../url-shortener/page'), { ssr: false }),
  "secret-message": dynamic(() => import('../secret-message/page'), { ssr: false }),
  "calculator": dynamic(() => import('../calculator/page'), { ssr: false }),
  "svg-to-jsx-png-converter": dynamic(() => import('../svg-to-jsx-png-converter/page'), { ssr: false }),
  "image-to-svg-converter": dynamic(() => import('../image-to-svg-converter/page'), { ssr: false }),
  "master-zip-converter": dynamic(() => import('../master-zip-converter/page'), { ssr: false }),
};

export default function ToolPage() {
  const params = useParams();
  const slug = (params?.['tool-slug'] as string) || (params?.slug as string);

  const [toolBlog, setToolBlog] = useState<any>(null);

  useEffect(() => {
    const trackToolViewAndFetchBlog = async () => {
      if (!slug) return;
      
      try {
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

        await supabase
          .from('tool_pageviews')
          .insert({ tool_slug: slug });

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
      <div className="bg-white border-b py-10 px-4 text-center shadow-sm">
        <div className="flex justify-center items-center gap-3 mb-3">
          <span className="text-4xl">{toolMeta.icon}</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{toolMeta.name}</h1>
        </div>
        <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm md:text-base">
          {toolMeta.description}
        </p>
      </div>
      
      <div className="mt-8 px-4">
        {ActiveToolComponent ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <ActiveToolComponent />

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

            {toolBlog && (
              <div className="mt-16 max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-200">
                <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">
                  {toolBlog.title || `How to Use ${toolMeta.name}`}
                </h2>
                <div className="w-20 h-1 bg-purple-500 mx-auto rounded-full mb-10"></div>
                
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