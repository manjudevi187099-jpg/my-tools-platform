'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toolsRegistry } from '../../config/siteConfig';
// 🌟 FIX 1: Supabase ko import kar rahe hain
import { supabase } from '../lib/supabase';

const siteInfo = {
  name: "PdfNexa",
  tagline: "All-In-One Professional Utility Engine",
  description: "Free, secure, and blazing-fast web tools built for developers, designers, and power users.",
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🌟 FIX 2: Naye states database ke data aur loading status ke liye
  const [activeSlugs, setActiveSlugs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 FIX 3: Jaise hi page khule, Database se check karo ki kaun se tools ON hain
  useEffect(() => {
    const fetchActiveTools = async () => {
      const { data, error } = await supabase
        .from('tools_status')
        .select('slug, is_active');
        
      if (data) {
        // Sirf un tools ke 'slug' nikal lo jinki is_active true hai
        const active = data.filter(t => t.is_active).map(t => t.slug);
        setActiveSlugs(active);
      } else {
        console.error("Database fetch error:", error);
      }
      setIsLoading(false); // Data aane ke baad loading band kar do
    };

    fetchActiveTools();
  }, []);

  // 🌟 FIX 4: Ab hum 'toolsRegistry' ko Database ke status ('activeSlugs') se filter kar rahe hain
  const toolsList = Object.entries(toolsRegistry)
    .filter(([slug]) => activeSlugs.includes(slug)) // Pura khel is ek line ka hai! 🔥
    .map(([slug, tool]) => ({
      slug,
      title: tool.name,
      description: tool.description,
      category: (tool.category || 'utility').toUpperCase(),
      icon: tool.category === 'pdf' ? '📄' : tool.category === 'design' ? '🎨' : tool.category === 'business' ? '💼' : '🛠️'
    }));

  // Search filter
  const filteredTools = toolsList.filter((tool) =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouping
  const groupedTools = filteredTools.reduce((acc: Record<string, typeof toolsList>, tool) => {
    const cat = tool.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {});

  const categoryDetails: Record<string, { title: string, icon: string, desc: string }> = {
    'PDF': { title: 'PDF & Document Tools', icon: '📄', desc: 'Edit, convert, merge, and secure your PDF files instantly.' },
    'UTILITY': { title: 'Daily Utility & Forms', icon: '🛠️', desc: 'Handy tools for form filling, signatures, and quick tasks.' },
    'DESIGN': { title: 'Design & Creators', icon: '🎨', desc: 'Create smart cards, stamps, and studio-quality photo grids.' },
    'BUSINESS': { title: 'Business & Office', icon: '💼', desc: 'Generate professional invoices, letters, and certificates.' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {siteInfo.name}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 font-semibold text-slate-600">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <a href="#tools" className="hover:text-purple-600 transition-colors">All Tools</a>
            <Link href="/admin" className="hover:text-purple-600 transition-colors">Admin Panel</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full uppercase tracking-wider border border-green-200">
              ● Live DB
            </span>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="bg-white border-b border-slate-200 pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              All-In-One Professional <span className="text-purple-600">Utility Engine</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
              {siteInfo.description} No installation required.
            </p>

            <div className="mt-10 max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xl">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search for tools (e.g., Invoice, PDF, Stamp...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-lg font-medium shadow-sm outline-none"
              />
            </div>
          </div>
        </section>

        {/* CATEGORIZED TOOLS SECTION */}
        <section id="tools" className="py-16 px-4 max-w-7xl mx-auto">
          
          {/* 🌟 FIX 5: Jab tak database se data aa raha hai, tab tak Loader dikhao */}
          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
               <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
               <p className="text-slate-500 font-bold">Loading tools from Database... ⏳</p>
            </div>
          ) : Object.keys(groupedTools).length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl">🕵️‍♂️</span>
              <h3 className="mt-4 text-2xl font-bold text-slate-700">No tools found</h3>
              <p className="text-slate-500 mt-2">Try searching with a different keyword.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedTools).map(([category, tools]) => {
                const meta = categoryDetails[category] || { title: category, icon: '⚡', desc: 'Explore our powerful tools.' };
                
                return (
                  <div key={category} className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 border-b border-slate-200 pb-4">
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-purple-100 text-purple-600 rounded-xl">{meta.icon}</span>
                        {meta.title}
                      </h2>
                      <p className="text-slate-500 mt-2 ml-14">{meta.desc}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tools.map((tool) => (
                        <Link 
                          key={tool.slug} 
                          href={`/tools/${tool.slug}`} 
                          className="group flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-purple-600 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="text-3xl bg-slate-50 p-3.5 rounded-xl group-hover:bg-purple-50 group-hover:-translate-y-1 transition-transform border border-slate-100 group-hover:border-purple-100">
                            {tool.icon}
                          </div>
                          <div className="flex-1 pt-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors text-lg leading-tight">
                              {tool.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-slate-300 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <span className="text-2xl">🛠️</span>
              <span className="text-xl font-black">{siteInfo.name}</span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              {siteInfo.tagline}. Making developers and designers more productive every day.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Top Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#tools" className="hover:text-purple-400 transition-colors">PDF Tools</a></li>
              <li><a href="#tools" className="hover:text-purple-400 transition-colors">Utility Tools</a></li>
              <li><a href="#tools" className="hover:text-purple-400 transition-colors">Business Generators</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} {siteInfo.name}. All rights reserved.
        </div>
      </footer>
      
    </div>
  );
}

// triggering fresh vercel build