import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from '../lib/getSettings';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🌟 DYNAMIC SEO (Next.js ka official aur safe tareeka) 🌟
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  return {
    title: settings?.site_name || "PdfNexa - Professional Utility Engine",
    description: settings?.seo_description || "Free, secure, and blazing-fast web tools built for developers, designers, and power users.",
    keywords: settings?.keywords || "pdf tools, online utility, format converter",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Database se settings aur scripts lana
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* 🚫 Dhyan dein: Yahan manual <head> tag NAHI lagana hai, Next.js khud CSS yahan daalega */}
      
      <body className="min-h-full flex flex-col">
        {children}

        {/* 🔥 SAFE SCRIPT INJECTION: Ab script ki wajah se CSS kabhi break nahi hogi 🔥 */}
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