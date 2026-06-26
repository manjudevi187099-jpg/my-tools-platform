'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Apna supabase path check kar lein

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllBlogs = async () => {
      try {
        // Supabase se saare blogs fetch kar rahe hain
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching blogs:", error);
        } else if (data) {
          setBlogs(data);
        }
      } catch (error) {
        console.error("Execution error:", error);
      }
      setIsLoading(false);
    };

    fetchAllBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          DhamakaTools <span className="text-purple-600">Blog</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Read our latest articles, guides, and tips to maximize your productivity.
        </p>
      </div>

      {/* BLOGS GRID */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-bold mt-4">Loading articles... ⏳</p>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="block group">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="bg-purple-100 text-purple-700 font-bold text-xs px-3 py-1 rounded-full uppercase inline-block mb-4 shadow-sm">
                      Article
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-purple-600 leading-snug transition-colors">
                      {blog.title}
                    </h3>
                  </div>
                  <div className="mt-8 text-sm text-slate-400 font-bold uppercase tracking-widest">
                    {new Date(blog.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Articles Yet</h3>
            <p className="text-slate-500 font-medium">We are currently writing some amazing content for you. Check back soon!</p>
          </div>
        )}
      </div>
      
    </div>
  );
}