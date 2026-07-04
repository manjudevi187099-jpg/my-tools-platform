'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Apna supabase path check kar lein

// 💀 1. SKELETON LOADER COMPONENT (Professional Loading)
const BlogSkeleton = () => (
  <div className="animate-pulse flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden h-[420px] shadow-sm">
    <div className="h-48 bg-slate-200"></div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="h-6 bg-slate-200 rounded w-full mb-3"></div>
      <div className="h-6 bg-slate-200 rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-4/5"></div>
      <div className="mt-auto pt-6 flex justify-between items-center">
        <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔍 2. SEARCH & FILTER STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = ['All', 'Technology', 'Legal', 'Business', 'Updates', 'Tips'];

  // 📚 3. PAGINATION (LOAD MORE) STATES
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const ITEMS_PER_PAGE = 6;

  // Supabase Fetch Function (With Search, Filter & Pagination)
  const fetchBlogs = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setIsLoading(true);
      setPage(0);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' });

      // Apply Search Filter
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      // Apply Category Filter
      if (category !== 'All') {
        query = query.eq('category', category);
      }

      // Pagination & Ordering
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (isLoadMore) {
          setBlogs((prev) => [...prev, ...data]);
          setPage(page + 1);
        } else {
          setBlogs(data);
        }
        // Check if more items exist
        setHasMore(count ? from + data.length < count : false);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Re-fetch when Search or Category changes
  useEffect(() => {
    // Debounce search slightly to avoid too many requests
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, category]);


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER SECTION (SEO Optimized Text) */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Explore Our <span className="text-purple-600">Articles</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Discover the latest insights, tools, and tips to boost your legal & technical workflows.
        </p>

        {/* 🔍 SEARCH BAR & CATEGORIES */}
        <div className="max-w-4xl mx-auto mt-10">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Search for articles, guides, or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-lg font-medium shadow-sm"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto mt-6 pb-2 no-scrollbar justify-start md:justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  category === cat 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🖼️ BLOGS GRID & RICH UI CARDS */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
        {isLoading ? (
          // Show 6 Skeletons while loading
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => <BlogSkeleton key={n} />)}
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="block group h-full">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-purple-400 transition-all duration-300 h-full flex flex-col overflow-hidden">
                    
                    {/* Card Thumbnail */}
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      {blog.image_url ? (
                        <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black text-purple-700 shadow-sm uppercase tracking-wider">
                        {blog.category || 'Article'}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-black text-slate-800 group-hover:text-purple-600 leading-snug transition-colors line-clamp-2 mb-3">
                        {blog.title}
                      </h3>
                      
                      <p className="text-slate-500 font-medium line-clamp-2 mb-6">
                        {blog.excerpt || "Click to read more about this insightful topic and boost your productivity."}
                      </p>
                      
                      {/* 📈 Stats & Meta (Views, Likes, Author) */}
                      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-400 font-bold uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-lg">
                            👨‍💻
                          </div>
                          <span className="text-slate-600">{blog.author_name || 'Admin'}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span title="Views" className="flex items-center gap-1">👁️ {blog.views || 0}</span>
                          <span title="Reading Time" className="flex items-center gap-1">⏱️ {blog.reading_time || 5}m</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 📚 LOAD MORE BUTTON */}
            {hasMore && (
              <div className="text-center mt-16">
                <button 
                  onClick={() => fetchBlogs(true)}
                  disabled={isFetchingMore}
                  className="bg-white border-2 border-purple-200 text-purple-700 font-black px-10 py-4 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm disabled:opacity-50 flex items-center gap-3 mx-auto"
                >
                  {isFetchingMore ? (
                    <><span className="animate-spin text-xl">⏳</span> Loading...</>
                  ) : (
                    <>Load More Articles ↓</>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Articles Found</h3>
            <p className="text-slate-500 font-medium mb-6">We couldn't find any articles matching your search or category.</p>
            <button onClick={() => {setSearchQuery(''); setCategory('All');}} className="text-purple-600 font-bold hover:underline">
              Clear Filters
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
}