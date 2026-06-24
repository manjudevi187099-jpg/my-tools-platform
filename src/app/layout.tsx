'use client';

import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalSetup() {
  const [showZiddiBanner, setShowZiddiBanner] = useState(false);

  useEffect(() => {
    const initOneSignal = async () => {
      if (typeof window !== 'undefined') {
        await OneSignal.init({
          appId: "c1b0448b-df16-4b7c-8f51-e1dee813237b", 
          allowLocalhostAsSecureOrigin: true,
        });

        if (Notification.permission === 'default') {
          setShowZiddiBanner(true);
        }
      }
    };
    initOneSignal();
  }, []);

  const handleAllowClick = async () => {
    try {
      await OneSignal.Notifications.requestPermission();
      if (Notification.permission === 'granted') {
        setShowZiddiBanner(false);
      }
    } catch (err) {
      console.error("Notification trigger error:", err);
    }
  };

  if (!showZiddiBanner) return null;

  return (
    <div className="fixed z-[9999] animate-in fade-in duration-500
      /* Mobile: Bottom Floating Card */
      inset-x-0 bottom-0 p-4 slide-in-from-bottom-8
      /* Desktop: Sabse Top Lamba Banner */
      md:top-0 md:bottom-auto md:p-0 md:slide-in-from-top-8
    ">
      <div className="
        bg-white shadow-[0_20px_50px_rgba(59,130,246,0.3)] relative overflow-hidden
        /* Mobile Styling */
        rounded-3xl p-6 border-2 border-blue-500 text-center
        /* Desktop Styling (Lamba & Seedha) */
        md:rounded-none md:border-b-2 md:border-t-0 md:border-l-0 md:border-r-0 md:p-3 md:flex md:items-center md:justify-center md:gap-4
      ">
        {/* Mobile wala background glow (Desktop pe hide kiya) */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-100 rounded-full blur-xl opacity-50 md:hidden"></div>
        
        {/* Icon & Text Section */}
        <div className="md:flex md:items-center md:gap-3">
          <div className="text-center md:text-left">
            <span className="text-5xl block mb-3 animate-bounce md:text-2xl md:mb-0 md:inline-block">🔔</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight md:text-base md:inline-block md:mr-2">
              Notification ON Karein!
            </h3>
            <p className="text-slate-500 text-sm mt-1 mb-5 font-medium md:mt-0 md:mb-0 md:inline-block md:text-sm">
              Dhamaka Tools ke naye features aur updates sabse pehle paane ke liye permission on karein.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAllowClick}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-lg
          /* Desktop Button Style (Chota aur Line me) */
          md:w-auto md:py-2 md:px-6 md:rounded-xl md:text-sm md:whitespace-nowrap md:ml-4"
        >
          Allow Notifications 🚀
        </button>
      </div>
    </div>
  );
}