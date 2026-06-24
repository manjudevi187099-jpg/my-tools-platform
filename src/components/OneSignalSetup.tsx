'use client';

import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalSetup() {
  const [showZiddiBanner, setShowZiddiBanner] = useState(false);

  useEffect(() => {
    const initOneSignal = async () => {
      if (typeof window !== 'undefined') {
        // Aapka asli App ID lag gaya! 🔥
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
    <div className="fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto z-50 p-4 md:max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(59,130,246,0.3)] border-2 border-blue-500 text-center relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-100 rounded-full blur-xl opacity-50"></div>
        <span className="text-5xl block mb-3 animate-bounce">🔔</span>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Notification ON Karein!</h3>
        <p className="text-slate-500 text-sm mt-2 mb-5 font-medium">
          Dhamaka Tools ke naye features aur important updates ka alert sabse pehle paane ke liye permission on karein.
        </p>
        <button 
          onClick={handleAllowClick}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
        >
          Allow Notifications 🚀
        </button>
      </div>
    </div>
  );
}