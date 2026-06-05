import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 👇 Aapke database ka function
import { getSiteSettings } from '../lib/getSettings';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔥 DYNAMIC METADATA (Next.js ka official tarika SEO ke liye) 🔥
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  return {
    title: settings?.site_name || "PdfNexa - Professional Utility Engine",
    description: settings?.seo_description || "Free, secure, and blazing-fast web tools.",
    keywords: settings?.keywords || "pdf tools, online utility, format converter",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Scripts inject karne ke liye wapas data mangwaya
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* 🔥 THE MAGIC: DYNAMIC ADSENSE & ANALYTICS INJECTION 🔥 */}
        {settings?.header_scripts && (
          <script dangerouslySetInnerHTML={{ __html: settings.header_scripts }} />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}