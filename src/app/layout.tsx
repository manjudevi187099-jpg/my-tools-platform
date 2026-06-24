import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from '../lib/getSettings';
import Script from 'next/script';
import dynamic from 'next/dynamic';

// 🔥 DYNAMIC IMPORT: Isse server crash nahi hoga aur white screen kabhi nahi aayegi!
const OneSignalSetup = dynamic(() => import('../components/OneSignalSetup'), { ssr: false });

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
    title: settings?.site_name || "Dhamaka Tools - Professional Utility Engine",
    description: settings?.seo_description || "Free, secure, and blazing-fast web tools built for developers, designers, and power users.",
    keywords: settings?.keywords || "pdf tools, online utility, format converter",
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

        {/* MAIN CONTENT (Homepage aur baaki pages yahan aayenge) */}
        {children}

        {/* 🔥 NOTIFICATION BANNER (Har page ke liye ek hi jagah lagega) 🔥 */}
        <OneSignalSetup />

        {/* HEADER SCRIPTS */}
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