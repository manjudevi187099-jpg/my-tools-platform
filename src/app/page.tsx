'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toolsRegistry } from '../../config/siteConfig';
import { supabase } from '../lib/supabase';

const siteInfo = {
  name: "PdfNexa",
  tagline: "All-In-One Professional Utility Engine",
  description: "Free, secure, and blazing-fast web tools built for developers, designers, and power users.",
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // States
  const [activeSlugs, setActiveSlugs] = useState<string[]>([]);
  const [trendingTools, setTrendingTools] = useState<any[]>([]);
  const [platformViews, setPlatformViews] = useState(0); 
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1. 🔥 Fetch Tools & Analytics (Alag se)
      try {
        const { data: statusData } = await supabase.from('tools_status').select('slug').eq('is_active', true);
        const { data: analyticsData } = await supabase.from('tool_analytics').select('tool_slug, total_views');

        if (statusData) {
          const active = statusData.map(t => t.slug);
          setActiveSlugs(active);

          if (analyticsData) {
            const totalViews = analyticsData.reduce((sum, item) => sum + (item.total_views || 0), 0);
            setPlatformViews(totalViews + 15420); 

            const toolsWithViews = active.map(slug => {
              const toolData = toolsRegistry[slug];
              const viewData = analyticsData.find(a => a.tool_slug === slug);
              return {
                slug,
                ...toolData,
                views: viewData ? viewData.total_views : 0
              };
            }).filter(t => t.name); 

            setTrendingTools(toolsWithViews.sort((a, b) => b.views - a.views).slice(0, 6));
          }
        }
      } catch (error) {
        console.error("Tools Fetch Error:", error);
      }

      // 2. 🔥 Fetch Blogs (Ekdum fail-safe, agar tools fail bhi hon toh ye chalega)
      try {
        const { data: blogData, error: blogError } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (blogError) {
          console.error("Blog Fetching Error:", blogError);
        } else if (blogData) {
          setLatestBlogs(blogData);
        }
      } catch (error) {
        console.error("Blog Execution Error:", error);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const toolsList = Object.entries(toolsRegistry)
    .filter(([slug]) => activeSlugs.includes(slug))
    .map(([slug, tool]) => ({
      slug,
      title: tool.name,
      description: tool.description,
      category: (tool.category || 'utility').toUpperCase(),
      icon: tool.category === 'pdf' ? '📄' : tool.category === 'design' ? '🎨' : tool.category === 'business' ? '💼' : '🛠️'
    }));

  const filteredTools = toolsList.filter((tool) =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTools = filteredTools.reduce((acc: Record<string, typeof toolsList>, tool) => {
    const cat = tool.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* 🌟 HEADER (Aapka original) 🌟 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-3xl bg-slate-100 p-2 rounded-xl border border-slate-200 shadow-sm">🛠️</span>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-none">
                {siteInfo.name}
              </h1>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pro Tools</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-bold text-slate-600">
            <Link href="/" className="text-purple-600">Home</Link>
            <a href="#tools" className="hover:text-purple-600 transition-colors">Tools Library</a>
            <a href="#trending" className="hover:text-purple-600 transition-colors">Trending</a>
            <Link href="/contact" className="hover:text-purple-600 transition-colors">Support</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/admin" className="bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-black transition-colors shadow-md hover:shadow-lg">
              Admin Area 🛡️
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* 🌟 HERO SECTION 🌟 */}
        <section className="bg-white border-b border-slate-200 pt-24 pb-20 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-purple-50/50 to-transparent -z-10"></div>
          
          <div className="max-w-4xl mx-auto text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-bold mb-6">
              <span className="animate-pulse">✨</span> {siteInfo.tagline}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
              Work Smarter with <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Powerful Tools</span>
            </h1>
            
            <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              {siteInfo.description} No registration, no watermarks, just pure productivity.
            </p>
            
            <div className="mt-10 max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xl">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search tools (e.g., PDF, Invoice, Photo...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-5 rounded-3xl border-2 border-slate-200 bg-white focus:border-purple-500 transition-all text-lg font-bold shadow-lg shadow-slate-200/50 outline-none hover:shadow-xl"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-5 py-2.5 rounded-full font-black text-sm shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> 
                {platformViews.toLocaleString()}+ Tools Processed
              </div>
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-5 py-2.5 rounded-full font-black text-sm shadow-sm">
                🛡️ 100% Free & Secure
              </div>
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 px-5 py-2.5 rounded-full font-black text-sm shadow-sm">
                ⚡ No Sign-up Required
              </div>
            </div>
          </div>
        </section>

        {/* 🌟 TOOLS SECTION 🌟 */}
        <section id="tools" className="py-20 px-4 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
               <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
               <p className="text-slate-500 font-bold">Syncing live tools... ⏳</p>
            </div>
          ) : (
            <>
              {/* TRENDING TOOLS */}
              {!searchQuery && trendingTools.length > 0 && (
                <div id="trending" className="mb-20 scroll-mt-24">
                  <div className="mb-8 border-b border-slate-200 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">🔥</span> Trending Now
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {trendingTools.map((tool) => (
                      <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group flex items-start gap-4 p-6 bg-gradient-to-br from-white to-orange-50/20 border-2 border-orange-100 rounded-3xl hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-2xl z-10 shadow-sm">{tool.views} Uses</div>
                        <div className="text-4xl bg-white p-4 rounded-2xl shadow-sm border border-orange-100 group-hover:scale-110 transition-transform">
                          {tool.category === 'pdf' ? '📄' : tool.category === 'design' ? '🎨' : tool.category === 'business' ? '💼' : '🛠️'}
                        </div>
                        <div className="flex-1 pt-1 z-10">
                          <h3 className="font-black text-slate-800 text-xl leading-tight group-hover:text-orange-600 transition-colors">{tool.name}</h3>
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed font-medium">{tool.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ALL CATEGORIES */}
              <div className="space-y-20">
                {Object.entries(groupedTools).map(([category, tools]) => (
                  <div key={category} className="scroll-mt-24">
                    <div className="mb-8 border-b border-slate-200 pb-4">
                      <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-slate-100 text-slate-600 rounded-xl">⚡</span> {category} Utilities
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {tools.map((tool) => (
                         <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-3xl hover:border-purple-600 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                            <div className="text-4xl bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-purple-50 group-hover:scale-110 transition-all">{tool.icon}</div>
                            <div className="flex-1 pt-1">
                              <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-purple-700 transition-colors">{tool.title}</h3>
                              <p className="text-sm text-slate-500 mt-2 line-clamp-2 font-medium">{tool.description}</p>
                            </div>
                         </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* 🚀 BLOG SECTION (Ab 100% Guaranteed Dikhega) 🚀 */}
        {!isLoading && !searchQuery && (
          <section className="py-20 px-4 max-w-7xl mx-auto border-t border-slate-200 bg-white rounded-t-[3rem]">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-black text-slate-900">Latest from our Blog</h2>
              <p className="text-slate-500 mt-3 text-lg font-medium">Tips, tricks, and guides to work smarter.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestBlogs && latestBlogs.length > 0 ? (
                latestBlogs.map((blog) => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`} className="block group">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-400 hover:bg-white transition-all duration-300 h-full flex flex-col justify-between">
                      <div>
                        <div className="bg-purple-100 text-purple-700 font-bold text-xs px-3 py-1 rounded-full uppercase inline-block mb-4 shadow-sm">Article</div>
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors leading-snug">
                          {blog.title}
                        </h3>
                      </div>
                      <div className="mt-8 text-sm text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-slate-500 font-bold text-lg bg-slate-100 inline-block px-6 py-3 rounded-2xl">📝 Coming soon! We are writing awesome content.</p>
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      {/* 🌟 FOOTER (Aapka original bada wala) 🌟 */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t-4 border-purple-600 font-sans">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-slate-800 pb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity inline-block">
              <span className="text-3xl">🛠️</span>
              <h1 className="text-2xl font-black text-white">{siteInfo.name}</h1>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">{siteInfo.tagline}. We build high-performance, browser-based tools that respect your privacy and save your time.</p>
            <div className="flex items-center gap-2">
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> All Systems Operational
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-wider mb-6">Popular Tools</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/tools/pdf-to-word" className="hover:text-purple-400 transition-colors flex items-center gap-2">📄 PDF to Word Converter</Link></li>
              <li><Link href="/tools/pdf-to-excel" className="hover:text-purple-400 transition-colors flex items-center gap-2">📊 PDF to Excel Spreadsheet</Link></li>
              <li><Link href="/tools/photo-studio" className="hover:text-purple-400 transition-colors flex items-center gap-2">🎨 Mega Photo Studio</Link></li>
              <li><Link href="/tools/resume-builder" className="hover:text-purple-400 transition-colors flex items-center gap-2">💼 Smart Resume Builder</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-wider mb-6">Explore</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#tools" className="hover:text-purple-400 transition-colors">All PDF Tools</a></li>
              <li><a href="#tools" className="hover:text-purple-400 transition-colors">Image & Design Editors</a></li>
              <li><a href="#tools" className="hover:text-purple-400 transition-colors">Business Generators</a></li>
              <li><a href="#tools" className="hover:text-purple-400 transition-colors">Daily Utilities</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-wider mb-6">Company & Legal</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} {siteInfo.name}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ for Creators & Developers</p>
        </div>
      </footer>
      
    </div>
  );
}