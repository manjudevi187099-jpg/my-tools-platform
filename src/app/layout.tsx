import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from '../lib/getSettings';
import Script from 'next/script';

import AdsterraBanner from '../components/AdsterraBanner';
import AdsterraNative from '../components/AdsterraNative';
import OneSignalSetup from '../components/OneSignalSetup';
import TrafficTracker from '../components/TrafficTracker';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: "DhamakaTools - Professional Utility Engine",
    description: settings?.seo_description || "Free, secure, and blazing-fast web tools built for developers, designers, and power users.",
    keywords: settings?.keywords || "pdf tools, online utility, format converter",
    icons: {
      icon: '/logo-icon.png', 
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        
        <TrafficTracker />
        
        {/* GOOGLE ANALYTICS */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-B4M8VQ16P2" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B4M8VQ16P2');
          `}
        </Script>

        {/* 🔥 ADSTERRA: Main content ke upar 🔥 */}
        <div className="w-full flex justify-center pt-4">
           <AdsterraBanner />
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 🔥 ADSTERRA: Main content ke niche 🔥 */}
        <div className="w-full flex justify-center pb-8">
           <AdsterraNative />
        </div>

        {/* NOTIFICATIONS & MONETAG PUSH/POP ADS */}
        <OneSignalSetup />
        
        <Script id="monetag-in-page" strategy="afterInteractive">
          {`(function(s){s.dataset.zone='11207749',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script'))) `}
        </Script>

        <Script id="monetag-vignette" strategy="afterInteractive">
          {`(function(s){s.dataset.zone='11210332',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script'))) `}
        </Script>

        <Script 
          src="https://5gvci.com/act/files/tag.min.js?z=11210333" 
          strategy="afterInteractive" 
          async 
          data-cfasync="false"
        />

        {settings?.header_scripts && (
          <div 
            dangerouslySetInnerHTML={{ __html: settings.header_scripts }} 
            style={{ display: 'none' }}
          />
        )}
      </body>
    </html>
  );
}