'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

type Tool = {
  slug: string;
  name: string;
  category: string;
  is_active: boolean;
  views?: number;
  today?: number;
  week?: number;
  month?: number;
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  
  // 🔥 Blogs & Analytics State
  const [blogs, setBlogs] = useState<any[]>([]);
  const [analyticsReport, setAnalyticsReport] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [totalViews, setTotalViews] = useState(0);
  const [popularTool, setPopularTool] = useState({ name: 'N/A', views: 0 });
  const [activeCount, setActiveCount] = useState(0);

  const [seoData, setSeoData] = useState({
    site_name: '', tagline: '', seo_description: '', keywords: '', header_scripts: ''
  });
  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [seoMessage, setSeoMessage] = useState('');

  // BLOG EDITOR STATES
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [linkedTool, setLinkedTool] = useState(''); 
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [blogMessage, setBlogMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'Dhamaka Tools_secure_admin') {
      setIsAuthenticated(true);
      fetchRealData(); 
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Admin@2024') {
      localStorage.setItem('admin_token', 'Dhamaka Tools_secure_admin');
      setIsAuthenticated(true);
      setAuthError('');
      fetchRealData();
    } else {
      setAuthError('Galat Password Bhai! 🚫');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const [tData, aData, sData, rData, eData, bData, pData] = await Promise.all([
        supabase.from('tools_status').select('*').order('name', { ascending: true }),
        supabase.from('tool_analytics').select('*'),
        supabase.from('site_settings').select('*').eq('id', 1).single(),
        // 🔥 UPDATE 1: 'tool_ratings' ki jagah 'user_reviews' kar diya
        supabase.from('user_reviews').select('*').order('created_at', { ascending: false }), 
        supabase.from('tool_errors').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('tool_pageviews').select('tool_slug, created_at')
      ]);

      if (sData.data) setSeoData(sData.data);
      if (rData.data) setRatings(rData.data);
      if (eData.data) setErrors(eData.data);
      if (bData.data) setBlogs(bData.data);

      if (tData.data) {
        let tViews = 0, maxViews = -1, bestTool = 'N/A', aCount = 0;
        const now = new Date();

        const mergedTools = tData.data.map((tool: any) => {
          if (tool.is_active) aCount++;
          const stat = aData.data?.find((a: any) => a.tool_slug === tool.slug);
          const views = stat ? stat.total_views : 0;
          tViews += views;
          if (views > maxViews) { maxViews = views; bestTool = tool.name; }

          let today = 0, week = 0, month = 0;
          if (pData.data) {
            pData.data.forEach((pv: any) => {
              if (pv.tool_slug === tool.slug) {
                const diffTime = Math.abs(now.getTime() - new Date(pv.created_at).getTime());
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays <= 1) today++;
                if (diffDays <= 7) week++;
                if (diffDays <= 30) month++;
              }
            });
          }

          return { ...tool, views, today, week, month };
        });

        const sortedReport = [...mergedTools].sort((a, b) => (b.views || 0) - (a.views || 0));

        setTools(mergedTools);
        setAnalyticsReport(sortedReport);
        setTotalViews(tViews);
        setActiveCount(aCount);
        setPopularTool({ name: bestTool !== 'N/A' ? bestTool : 'No data yet', views: maxViews > -1 ? maxViews : 0 });
      }
    } catch (error) { 
      console.error("Data Fetch Error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggleToolStatus = async (slug: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setTools(tools.map(t => t.slug === slug ? { ...t, is_active: newStatus } : t));
    setActiveCount(prev => newStatus ? prev + 1 : prev - 1);
    await supabase.from('tools_status').update({ is_active: newStatus }).eq('slug', slug);
  };

  // 🔥 UPDATE 2: Review functions modified for 'user_reviews' and 'is_approved' boolean 🔥
  const updateReviewStatus = async (id: number, newStatus: boolean) => {
    const { error } = await supabase.from('user_reviews').update({ is_approved: newStatus }).eq('id', id);
    if (!error) {
      fetchRealData(); 
    } else {
      alert("Status update mein error aayi: " + error.message);
    }
  };

  const deleteReview = async (id: number) => {
    if(confirm("Khabardar! Kya sach mein is review ko delete karna hai? 🗑️")) {
      await supabase.from('user_reviews').delete().eq('id', id);
      fetchRealData();
    }
  };

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSeo(true);
    setSeoMessage('');
    const { error } = await supabase.from('site_settings').update(seoData).eq('id', 1);
    setIsSavingSeo(false);
    if (error) {
      setSeoMessage('❌ Error saving settings!');
    } else {
      setSeoMessage('✅ SEO & Scripts Saved Successfully!');
      setTimeout(() => setSeoMessage(''), 3000);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setBlogTitle(title);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setBlogSlug(slug);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBlog(true);
    setBlogMessage('');
    
    const { error } = await supabase.from('blog_posts').insert([
      { title: blogTitle, slug: blogSlug, content: blogContent, linked_tool: linkedTool || null }
    ]);

    setIsSavingBlog(false);
    if (error) {
      setBlogMessage('❌ Error: ' + error.message);
    } else {
      setBlogMessage('✅ Blog Published Successfully! 🎉');
      setBlogTitle(''); setBlogSlug(''); setBlogContent(''); setLinkedTool(''); 
      fetchRealData(); 
      setTimeout(() => setBlogMessage(''), 4000);
    }
  };

  const deleteBlog = async (id: number) => {
    if(confirm("Are you sure you want to delete this blog?")) {
      await supabase.from('blog_posts').delete().eq('id', id);
      fetchRealData(); 
    }
  }

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase()) || 
    tool.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <span className="text-5xl block mb-4">🛡️</span>
            <h1 className="text-2xl font-black text-white tracking-wider">ADMIN PORTAL</h1>
            <p className="text-slate-400 text-sm mt-2">Restricted Area. Enter Master Password.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="Enter Password..." value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 text-white border border-slate-700 p-4 rounded-xl focus:border-purple-500 outline-none text-center text-lg tracking-widest" />
            {authError && <p className="text-red-400 text-center text-sm font-bold animate-pulse">{authError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black py-4 rounded-xl hover:opacity-90 transition-opacity">UNLOCK DASHBOARD 🚀</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black flex items-center gap-2"><span className="text-blue-500">🛡️</span> Admin Pro</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: '📊', label: 'Analytics Dashboard' },
            { id: 'tools', icon: '⚙️', label: 'Tools Manager' },
            { id: 'seo', icon: '🔍', label: 'SEO & Scripts' },
            { id: 'ratings', icon: '⭐', label: 'Review Moderation' },
            { id: 'errors', icon: '🐞', label: 'Error Logs' },
            { id: 'blog', icon: '📝', label: 'Blog CMS' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all">Logout 🚪</button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        
        <div className="mb-8 relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-xl">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search tools by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:border-purple-500 transition-all text-lg font-bold shadow-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-lg">Syncing with Command Center...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div><h2 className="text-3xl font-black text-slate-900">Analytics Overview</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"><p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Tool Views</p><h3 className="text-4xl font-black text-slate-800 mt-2">{totalViews}</h3></div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"><p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Most Popular Tool</p><h3 className="text-2xl font-black text-purple-600 mt-2 truncate">{popularTool.name}</h3><p className="text-slate-500 text-sm font-medium mt-2">{popularTool.views} uses</p></div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"><p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Tools</p><h3 className="text-4xl font-black text-slate-800 mt-2">{activeCount} <span className="text-lg text-slate-400">/ {tools.length}</span></h3></div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"><p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Database Status</p><h3 className="text-2xl font-black text-green-600 mt-2">Connected</h3><p className="text-slate-500 text-sm font-medium mt-2">{errors.length} System Errors</p></div>
                </div>

                <div className="mt-12">
                  <h3 className="text-2xl font-black text-slate-900 mb-6">Detailed Traffic Report 📈</h3>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                        <tr>
                          <th className="p-5 font-bold">Tool Name</th>
                          <th className="p-5 font-bold text-center text-blue-600">Today (24h)</th>
                          <th className="p-5 font-bold text-center text-purple-600">Last 7 Days</th>
                          <th className="p-5 font-bold text-center text-orange-600">Last 30 Days</th>
                          <th className="p-5 font-bold text-center text-slate-800">All Time Views</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analyticsReport.map((tool) => (
                          <tr key={tool.slug} className="hover:bg-slate-50 transition-colors">
                            <td className="p-5 font-bold text-slate-800 flex items-center gap-3">
                              {tool.name}
                              {(tool.today || 0) > 10 && <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] uppercase rounded-full animate-pulse">🔥 Trending</span>}
                            </td>
                            <td className="p-5 text-center font-black text-blue-600 text-lg">{tool.today || 0}</td>
                            <td className="p-5 text-center font-bold text-purple-600">{tool.week || 0}</td>
                            <td className="p-5 text-center font-bold text-orange-600">{tool.month || 0}</td>
                            <td className="p-5 text-center font-black text-slate-800">{tool.views || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-8">
                <div><h2 className="text-3xl font-black text-slate-900">Tools Manager</h2></div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-slate-50 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-200"><th className="p-5 font-semibold">Tool Name</th><th className="p-5 font-semibold text-right">Status Control</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTools.map((tool) => (
                        <tr key={tool.slug} className={`transition-colors ${!tool.is_active ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                          <td className={`p-5 font-bold ${!tool.is_active ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{tool.name}</td>
                          <td className="p-5 text-right"><button onClick={() => toggleToolStatus(tool.slug, tool.is_active)} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${tool.is_active ? 'bg-green-500' : 'bg-slate-300'}`}><span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${tool.is_active ? 'translate-x-8' : 'translate-x-1'}`}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-8 max-w-4xl">
                <div><h2 className="text-3xl font-black text-slate-900">Global SEO & Scripts</h2></div>
                <form onSubmit={handleSaveSEO} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Website Name</label><input type="text" value={seoData.site_name || ''} onChange={(e) => setSeoData({...seoData, site_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" /></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Tagline</label><input type="text" value={seoData.tagline || ''} onChange={(e) => setSeoData({...seoData, tagline: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" /></div>
                  </div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Meta Description</label><textarea value={seoData.seo_description || ''} onChange={(e) => setSeoData({...seoData, seo_description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 min-h-[100px]" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Global Keywords</label><input type="text" value={seoData.keywords || ''} onChange={(e) => setSeoData({...seoData, keywords: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" /></div>
                  <div className="bg-slate-900 p-6 rounded-2xl shadow-inner border border-slate-800">
                    <label className="block text-sm font-bold text-slate-300 mb-2">💻 Custom Header Scripts (AdSense / Analytics)</label>
                    <textarea value={seoData.header_scripts || ''} onChange={(e) => setSeoData({...seoData, header_scripts: e.target.value})} className="w-full bg-slate-950 text-green-400 font-mono border border-slate-700 rounded-xl px-4 py-4 outline-none focus:border-green-500 min-h-[150px] text-sm" />
                  </div>
                  <div className="pt-4 flex items-center gap-4"><button type="submit" disabled={isSavingSeo} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl">{isSavingSeo ? 'Saving...' : 'Save All Settings 💾'}</button>{seoMessage && <span className="font-bold text-green-500">{seoMessage}</span>}</div>
                </form>
              </div>
            )}

            {/* 🔥 UPDATE 3: UPDATED REVIEW MODERATION TAB 🔥 */}
            {activeTab === 'ratings' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-black text-slate-900">Review Moderation</h2>
                  <div className="flex gap-2">
                    <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-lg text-sm">
                      Pending: {ratings.filter(r => !r.is_approved).length}
                    </span>
                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-lg text-sm">
                      Approved: {ratings.filter(r => r.is_approved).length}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  {ratings && ratings.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {ratings.map((r: any) => (
                        <div key={r.id} className="p-6 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col relative">
                          
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            {r.is_approved ? (
                              <span className="bg-green-100 text-green-700 text-[10px] uppercase font-black px-2 py-1 rounded-md tracking-widest border border-green-200 flex items-center gap-1">
                                ✅ Approved
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-black px-2 py-1 rounded-md tracking-widest border border-amber-200 flex items-center gap-1 animate-pulse">
                                ⏳ Pending
                              </span>
                            )}
                          </div>

                          <div className="mb-4 pr-24">
                            <h3 className="font-black text-slate-900 text-lg">{r.user_name || 'Anonymous User'}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-amber-500 text-sm tracking-widest">
                                {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                              </span>
                              <span className="text-xs font-bold text-slate-400">• {new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-100 mb-6 flex-1 shadow-inner text-sm text-slate-600 italic">
                            "{r.review_text || 'No review message provided.'}"
                          </div>

                          {/* ACTION BUTTONS (Approve / Pending / Delete) */}
                          <div className="flex gap-2 mt-auto border-t border-slate-200 pt-4">
                            {!r.is_approved ? (
                              <button onClick={() => updateReviewStatus(r.id, true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm shadow-green-200">
                                Approve ✅
                              </button>
                            ) : (
                              <button onClick={() => updateReviewStatus(r.id, false)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm shadow-amber-200">
                                Move to Pending ⏳
                              </button>
                            )}
                            
                            <button onClick={() => deleteReview(r.id)} className="px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors">
                              Delete 🗑️
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 font-bold">
                      <div className="text-4xl mb-4">📭</div>
                      No reviews found in the database.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'errors' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">System Error Logs</h2>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  {errors && errors.length > 0 ? (
                    <div className="space-y-4">
                      {errors.map((err: any) => (
                        <div key={err.id} className="p-5 bg-red-50 text-red-700 border border-red-100 rounded-2xl">
                          <div className="font-black mb-1">🐞 {err.tool_name}</div>
                          <p className="font-medium text-red-600/80">{err.error_message}</p>
                          <p className="text-xs text-red-400 mt-2">
                            {new Date(err.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 font-bold">✅ Zero errors detected.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="space-y-12 max-w-5xl">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Write a New Blog Post</h2>
                  <form onSubmit={handleSaveBlog} className="mt-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Blog Title</label>
                        <input type="text" required value={blogTitle} onChange={handleTitleChange} placeholder="e.g., How to Convert PDF" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug (Auto-generated)</label>
                        <input type="text" required readOnly value={blogSlug} className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 outline-none font-mono" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Link this blog to a specific tool? (Optional)</label>
                      <select value={linkedTool} onChange={(e) => setLinkedTool(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 font-medium text-slate-800">
                        <option value="">General Blog (No specific tool)</option>
                        {tools.map(t => (
                          <option key={t.slug} value={t.slug}>{t.name} ({t.slug})</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-2">Agar tool select kiya, toh ye blog direct us tool ke niche dikhega!</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Blog Content (Write in text or HTML)</label>
                      <textarea required value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="<h2>Introduction</h2><p>Start writing here...</p>" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:border-purple-500 focus:ring-2 font-mono min-h-[300px]" />
                    </div>
                    <div className="pt-4 flex items-center gap-4 border-t border-slate-100 pt-6">
                      <button type="submit" disabled={isSavingBlog} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-purple-600/20">{isSavingBlog ? 'Publishing...' : 'Publish Blog Post 🚀'}</button>
                      {blogMessage && <span className={`font-bold ${blogMessage.includes('❌') ? 'text-red-500' : 'text-green-500'} animate-in fade-in`}>{blogMessage}</span>}
                    </div>
                  </form>
                </div>

                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-6">Published Blogs ({blogs.length})</h2>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {blogs.length === 0 ? <p className="p-8 text-slate-500 font-medium">No blogs published yet.</p> : (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-sm">
                          <tr>
                            <th className="p-5 font-bold">Blog Title</th>
                            <th className="p-5 font-bold">Live URL</th>
                            <th className="p-5 font-bold">Linked Tool</th>
                            <th className="p-5 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {blogs.map((blog) => (
                            <tr key={blog.id} className="hover:bg-slate-50">
                              <td className="p-5 font-bold text-slate-800">{blog.title}</td>
                              <td className="p-5">
                                <a href={`/blog/${blog.slug}`} target="_blank" className="text-purple-600 hover:underline font-mono text-sm bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                                  /blog/{blog.slug} ↗
                                </a>
                              </td>
                              <td className="p-5">
                                {blog.linked_tool ? (
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{blog.linked_tool}</span>
                                ) : (
                                  <span className="text-slate-400 text-sm">General</span>
                                )}
                              </td>
                              <td className="p-5 text-right">
                                <button onClick={() => deleteBlog(blog.id)} className="text-red-500 hover:bg-red-50 px-4 py-1.5 rounded-lg font-bold transition-colors">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}