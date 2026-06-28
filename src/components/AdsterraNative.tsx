'use client';
import { useEffect } from 'react';

export default function AdsterraNative() {
  useEffect(() => {
    const scriptId = 'adsterra-native-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = 'https://pl30107299.effectivecpmnetwork.com/8b2a193b0cbbf2dda791e6f8f8528dc7/invoke.js';
    document.body.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center items-center my-6 w-full overflow-hidden">
      <div id="container-8b2a193b0cbbf2dda791e6f8f8528dc7"></div>
    </div>
  );
}