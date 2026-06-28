'use client';
import { useEffect, useRef } from 'react';

export default function AdsterraBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    
    // Check if ad is already loaded
    if (bannerRef.current.firstChild) return;

    // Naya 728x90 Lamba Banner Code
    const conf = document.createElement('script');
    conf.type = 'text/javascript';
    conf.innerHTML = `
      atOptions = {
        'key' : '6ec81ae399a34ea135fed9ac7e26f20f',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/6ec81ae399a34ea135fed9ac7e26f20f/invoke.js';

    bannerRef.current.appendChild(conf);
    bannerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center items-center my-6 w-full overflow-hidden">
      {/* Is div ke andar aapka lamba fixed banner load hoga */}
      <div ref={bannerRef}></div>
    </div>
  );
}