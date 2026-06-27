'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Apne supabase file ka path check kar lena

export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackView = async () => {
      // Sirf tabhi track karo jab user kisi specific tool par ho (e.g. /tools/logo-maker)
      if (pathname && pathname.startsWith('/tools/')) {
        const slug = pathname.split('/').pop();

        if (slug && slug !== 'tools') {
          try {
            // 1. "Today / 7 Days / 30 Days" ke liye pageviews table me entry dalo
            await supabase.from('tool_pageviews').insert([{ tool_slug: slug }]);

            // 2. "All Time Views" (tool_analytics) update karo
            const { data } = await supabase
              .from('tool_analytics')
              .select('total_views')
              .eq('tool_slug', slug)
              .single();

            if (data) {
              // Purane tool par view +1 kar do
              await supabase
                .from('tool_analytics')
                .update({ total_views: data.total_views + 1 })
                .eq('tool_slug', slug);
            } else {
              // Agar koi bilkul naya tool hai toh uski pehli entry bana do
              await supabase
                .from('tool_analytics')
                .insert([{ tool_slug: slug, total_views: 1 }]);
            }
          } catch (err) {
            console.error("Tracking Error:", err);
          }
        }
      }
    };

    trackView();
  }, [pathname]); // Jab bhi URL change hoga, ye chalega

  // Ye component UI mein kuch nahi dikhayega, sirf background me apna kaam karega
  return null; 
}