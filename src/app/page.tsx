'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toolsRegistry } from '../../config/siteConfig';
import { supabase } from '../lib/supabase';

// 🔥 NAYA BRAND NAME
const siteInfo = {
  name: "DhamakaTools",
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

      // 1. Fetch Tools & Analytics
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

      // 2. Fetch Blogs (Sirf 3 dikhayenge home page pe)
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
      icon: tool.icon || '🛠️'
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
      
      {/* 🌟 HEADER 🌟 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo-icon.png" alt="DhamakaTools Icon" className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-none tracking-tight">
                DhamakaTools
              </span>
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Pro Tools
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-bold text-slate-600">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            
            {/* 🔥 MEGA MENU (ALL TOOLS) 🔥 */}
            <div className="relative group py-6">
              <button className="flex items-center gap-1 hover:text-purple-600 transition-colors focus:outline-none">
                All Tools <span className="text-xs">▼</span>
              </button>
              {/* Dropdown Box */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                <div className="p-4 flex flex-col gap-2">
                  <a href="#pdf-tools" className="p-3 hover:bg-purple-50 rounded-xl text-slate-700 hover:text-purple-700 transition-colors">📄 PDF Tools</a>
                  <a href="#image-tools" className="p-3 hover:bg-purple-50 rounded-xl text-slate-700 hover:text-purple-700 transition-colors">🎨 Image & Design</a>
                  <a href="#business-tools" className="p-3 hover:bg-purple-50 rounded-xl text-slate-700 hover:text-purple-700 transition-colors">💼 Business Tools</a>
                  <a href="#utility-tools" className="p-3 hover:bg-purple-50 rounded-xl text-slate-700 hover:text-purple-700 transition-colors">🛠️ Daily Utilities</a>
                </div>
              </div>
            </div>

            <a href="#trending" className="hover:text-purple-600 transition-colors">Trending</a>
            <Link href="/contact" className="hover:text-purple-600 transition-colors">Support</Link>
          </nav>
          
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
          </div>
        </section>

        {/* 🌟 TOOLS SECTION 🌟 */}
        <section id="tools" className="py-20 px-4 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20">
               <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
               <p className="text-slate-500 font-bold mt-4">Syncing live tools... ⏳</p>
            </div>
          ) : (
            <>
              {/* TRENDING TOOLS */}
              {!searchQuery && trendingTools.length > 0 && (
                <div id="trending" className="mb-20 scroll-mt-24">
                  <div className="mb-8 border-b border-slate-200 pb-4">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                      <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">🔥</span> Trending Now
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {trendingTools.map((tool) => (
                      <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group flex items-start gap-4 p-6 bg-gradient-to-br from-white to-orange-50/20 border-2 border-orange-100 rounded-3xl hover:border-orange-500 hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="text-4xl bg-white p-4 rounded-2xl shadow-sm border border-orange-100 group-hover:scale-110 transition-transform">
                          {tool.icon || '🛠️'}
                        </div>
                        <div className="flex-1 pt-1 z-10">
                          <h3 className="font-black text-slate-800 text-xl leading-tight group-hover:text-orange-600">{tool.name}</h3>
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{tool.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ALL CATEGORIES */}
              <div className="space-y-20">
                {Object.entries(groupedTools).map(([category, tools]) => (
                  <div key={category} id={`${category.toLowerCase()}-tools`} className="scroll-mt-24">
                    <div className="mb-8 border-b border-slate-200 pb-4">
                      <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-slate-100 text-slate-600 rounded-xl">⚡</span> {category} Utilities
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {tools.map((tool) => (
                         <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-3xl hover:border-purple-600 hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-purple-50 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-5 transition-colors">
                              <span className="group-hover:scale-110 transition-transform">{tool.icon}</span>
                            </div>
                            <div className="flex-1 pt-1">
                              <h3 className="font-black text-slate-800 text-lg group-hover:text-purple-700">{tool.title}</h3>
                              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{tool.description}</p>
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

        {/* 🌟 TESTIMONIALS SECTION (NEW) 🌟 */}
        {!isLoading && !searchQuery && (
          <section className="py-20 px-4 bg-slate-100 border-t border-slate-200">
            <div className="max-w-7xl mx-auto">
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-black text-slate-900">Loved by Thousands</h2>
                <p className="text-slate-500 mt-3 text-lg font-medium">See what our users are saying about DhamakaTools.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { text: "Amazing website.", author: "Rajesh K." },
                  { text: "Best PDF Tool.", author: "Sarah M." },
                  { text: "Super Fast.", author: "Amit S." },
                  { text: "Love AI Tools.", author: "John D." }
                ].map((testimonial, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <div className="text-yellow-400 text-xl mb-3">⭐⭐⭐⭐⭐</div>
                    <p className="text-slate-700 font-bold text-lg leading-snug">"{testimonial.text}"</p>
                    <p className="text-slate-400 text-sm mt-4 uppercase tracking-widest font-bold">- {testimonial.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 🚀 BLOG SECTION */}
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
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-400 hover:bg-white transition-all h-full flex flex-col justify-between">
                      <div>
                        <div className="bg-purple-100 text-purple-700 font-bold text-xs px-3 py-1 rounded-full uppercase inline-block mb-4 shadow-sm">Article</div>
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 leading-snug">
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
                  <p className="text-slate-500 font-bold text-lg">📝 Coming soon!</p>
                </div>
              )}
            </div>
            
            {/* 🔥 VIEW ALL BLOGS BUTTON 🔥 */}
            <div className="mt-12 text-center">
              <Link href="/blog" className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-purple-700 hover:shadow-purple-500/30 transition-all hover:-translate-y-1">
                View All Articles <span className="text-xl">→</span>
              </Link>
            </div>
          </section>
        )}

      </main>

      {/* 🌟 FOOTER 🌟 */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t-4 border-purple-600 font-sans">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-slate-800 pb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity inline-block">
              <img src="/logo-icon.png" alt="DhamakaTools" className="w-8 h-8 object-contain inline-block mr-2" />
              <h1 className="text-2xl font-black text-white inline-block align-middle">{siteInfo.name}</h1>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">{siteInfo.tagline}. We build high-performance, browser-based tools that respect your privacy and save your time.</p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-wider mb-6">Popular Tools</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/tools/pdf-to-word" className="hover:text-purple-400 transition-colors flex items-center gap-2">📄 PDF to Word Converter</Link></li>
              <li><Link href="/tools/pdf-to-excel" className="hover:text-purple-400 transition-colors flex items-center gap-2">📊 PDF to Excel Spreadsheet</Link></li>
              <li><Link href="/tools/photo-studio" className="hover:text-purple-400 transition-colors flex items-center gap-2">🎨 Mega Photo Studio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-wider mb-6">Explore</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#pdf-tools" className="hover:text-purple-400 transition-colors">All PDF Tools</a></li>
              <li><a href="#image-tools" className="hover:text-purple-400 transition-colors">Image & Design Editors</a></li>
              <li><a href="#business-tools" className="hover:text-purple-400 transition-colors">Business Generators</a></li>
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