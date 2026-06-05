'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

type Tool = {
  slug: string;
  name: string;
  category: string;
  is_active: boolean;
  views?: number;
};

export default function AdminDashboard() {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- METRICS STATE ---
  const [totalViews, setTotalViews] = useState(0);
  const [popularTool, setPopularTool] = useState({ name: 'N/A', views: 0 });
  const [activeCount, setActiveCount] = useState(0);

  // 🔥 SEO STATE WITH SCRIPT BOX 🔥
  const [seoData, setSeoData] = useState({
    site_name: '', tagline: '', seo_description: '', keywords: '', header_scripts: ''
  });
  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [seoMessage, setSeoMessage] = useState('');

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'pdfnexa_secure_admin') {
      setIsAuthenticated(true);
      fetchRealData(); 
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Admin@2024') {
      localStorage.setItem('admin_token', 'pdfnexa_secure_admin');
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

  // 2. 🌟 FETCH ALL DATA (Tools, Analytics, SEO, Ratings, Errors) 🌟
  const fetchRealData = async () => {
    setLoading(true);
    try {
      const [tData, aData, sData, rData, eData] = await Promise.all([
        supabase.from('tools_status').select('*').order('name', { ascending: true }),
        supabase.from('tool_analytics').select('*'),
        supabase.from('site_settings').select('*').eq('id', 1).single(),
        supabase.from('tool_ratings').select('*').order('created_at', { ascending: false }),
        supabase.from('error_logs').select('*').order('created_at', { ascending: false })
      ]);

      if (sData.data) setSeoData(sData.data);
      if (rData.data) setRatings(rData.data);
      if (eData.data) setErrors(eData.data);

      if (tData.data) {
        let tViews = 0, maxViews = -1, bestTool = 'N/A', aCount = 0;
        const mergedTools = tData.data.map((tool: any) => {
          if (tool.is_active) aCount++;
          const stat = aData.data?.find((a: any) => a.tool_slug === tool.slug);
          const views = stat ? stat.total_views : 0;
          
          tViews += views;
          if (views > maxViews) { maxViews = views; bestTool = tool.name; }
          return { ...tool, views };
        });

        setTools(mergedTools);
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

  // 3. 🌟 ACTIONS 🌟
  const toggleToolStatus = async (slug: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setTools(tools.map(t => t.slug === slug ? { ...t, is_active: newStatus } : t));
    setActiveCount(prev => newStatus ? prev + 1 : prev - 1);
    await supabase.from('tools_status').update({ is_active: newStatus }).eq('slug', slug);
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

  // 🔥 FILTER TOOLS FOR SEARCH BOX 🔥
  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase()) || 
    tool.slug.toLowerCase().includes(search.toLowerCase())
  );

  // ==========================================
  // 🚫 LOGIN SCREEN UI
  // ==========================================
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

  // ==========================================
  // ✅ DYNAMIC DASHBOARD UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* 🚀 SIDEBAR (Upgraded with 6 Tabs) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black flex items-center gap-2"><span className="text-blue-500">🛡️</span> Admin Pro</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: '📊', label: 'Analytics Dashboard' },
            { id: 'tools', icon: '⚙️', label: 'Tools Manager' },
            { id: 'seo', icon: '🔍', label: 'SEO & Scripts' },
            { id: 'ratings', icon: '⭐', label: 'User Ratings' },
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

      {/* 🚀 MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8">
        
        {/* 🔥 GLOBAL SEARCH BAR 🔥 */}
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
            
            {/* 🟢 TAB 1: DASHBOARD (Beautiful UI Restored) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div><h2 className="text-3xl font-black text-slate-900">Analytics Overview</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Tool Views</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-2">{totalViews}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Most Popular Tool</p>
                    <h3 className="text-2xl font-black text-purple-600 mt-2 truncate">{popularTool.name}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-2">{popularTool.views} uses</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Tools</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-2">{activeCount} <span className="text-lg text-slate-400">/ {tools.length}</span></h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Database Status</p>
                    <h3 className="text-2xl font-black text-green-600 mt-2">Connected</h3>
                    <p className="text-slate-500 text-sm font-medium mt-2">{errors.length} System Errors Logged</p>
                  </div>
                </div>
              </div>
            )}

            {/* 🟢 TAB 2: TOOLS MANAGER (With Search Filtering) */}
            {activeTab === 'tools' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Tools Manager</h2>
                  <p className="text-slate-500 mt-1">Turn tools ON or OFF instantly. Showing {filteredTools.length} tools.</p>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-200">
                        <th className="p-5 font-semibold">Tool Name</th>
                        <th className="p-5 font-semibold">Category</th>
                        <th className="p-5 font-semibold text-right">Status Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTools.map((tool) => (
                        <tr key={tool.slug} className={`transition-colors ${!tool.is_active ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                          <td className={`p-5 font-bold ${!tool.is_active ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{tool.name}</td>
                          <td className="p-5"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">{tool.category}</span></td>
                          <td className="p-5 text-right">
                            <button onClick={() => toggleToolStatus(tool.slug, tool.is_active)} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${tool.is_active ? 'bg-green-500 shadow-md shadow-green-500/20' : 'bg-slate-300'}`}>
                              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${tool.is_active ? 'translate-x-8' : 'translate-x-1'}`}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredTools.length === 0 && (
                        <tr><td colSpan={3} className="p-10 text-center text-slate-500 font-bold">No tools found matching "{search}"</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 🟢 TAB 3: SEO & SCRIPTS (AdSense Ready) */}
            {activeTab === 'seo' && (
              <div className="space-y-8 max-w-4xl">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Global SEO & Scripts</h2>
                  <p className="text-slate-500 mt-1">Manage how your website appears on Google, and inject AdSense/Analytics codes.</p>
                </div>
                
                <form onSubmit={handleSaveSEO} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Website Name</label><input type="text" value={seoData.site_name || ''} onChange={(e) => setSeoData({...seoData, site_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 transition-all font-medium" /></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Tagline (Hero Section)</label><input type="text" value={seoData.tagline || ''} onChange={(e) => setSeoData({...seoData, tagline: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 transition-all font-medium" /></div>
                  </div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Meta Description (For Google Search)</label><textarea value={seoData.seo_description || ''} onChange={(e) => setSeoData({...seoData, seo_description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 transition-all font-medium min-h-[100px]" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Global Keywords</label><input type="text" value={seoData.keywords || ''} onChange={(e) => setSeoData({...seoData, keywords: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 transition-all font-medium" /></div>

                  {/* 🔥 ADSENSE / ANALYTICS SCRIPT BOX 🔥 */}
                  <div className="bg-slate-900 p-6 rounded-2xl shadow-inner border border-slate-800">
                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2"><span>💻</span> Custom Header Scripts (AdSense / Analytics)</label>
                    <textarea value={seoData.header_scripts || ''} onChange={(e) => setSeoData({...seoData, header_scripts: e.target.value})} className="w-full bg-slate-950 text-green-400 font-mono border border-slate-700 rounded-xl px-4 py-4 outline-none focus:border-green-500 focus:ring-1 transition-all min-h-[150px] text-sm" placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'></script>" />
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button type="submit" disabled={isSavingSeo} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                      {isSavingSeo ? 'Saving Changes...' : 'Save All Settings 💾'}
                    </button>
                    {seoMessage && <span className={`font-bold ${seoMessage.includes('❌') ? 'text-red-500' : 'text-green-500'} animate-in fade-in`}>{seoMessage}</span>}
                  </div>
                </form>
              </div>
            )}

            {/* 🟢 TAB 4: USER RATINGS */}
            {activeTab === 'ratings' && (
              <div className="space-y-8">
                <div><h2 className="text-3xl font-black text-slate-900">User Ratings Feedback</h2></div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
                  {ratings && ratings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ratings.map((r: any) => (
                        <div key={r.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col justify-between">
                          <span className="font-bold text-slate-800 text-lg">{r.tool_slug}</span> 
                          <span className="text-orange-500 font-black text-2xl mt-2">{'⭐'.repeat(r.rating)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-10"><span className="text-4xl">⭐</span><p className="text-slate-500 font-bold mt-4">No ratings submitted yet.</p></div>
                  )}
                </div>
              </div>
            )}

            {/* 🟢 TAB 5: ERROR LOGS */}
            {activeTab === 'errors' && (
              <div className="space-y-8">
                <div><h2 className="text-3xl font-black text-slate-900">System Error Logs</h2></div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
                  {errors && errors.length > 0 ? (
                    <div className="space-y-4">
                      {errors.map((err: any) => (
                        <div key={err.id} className="p-5 bg-red-50 text-red-700 border border-red-100 rounded-2xl">
                          <div className="font-black flex items-center gap-2 mb-1"><span className="text-xl">🐞</span> {err.tool_slug}</div>
                          <p className="font-medium text-red-600/80">{err.error_message}</p>
                          <p className="text-xs text-red-400 mt-2 uppercase tracking-wider">{new Date(err.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-10"><span className="text-4xl">✅</span><p className="text-green-600 font-bold mt-4">Zero errors detected. System is running flawlessly!</p></div>
                  )}
                </div>
              </div>
            )}

            {/* 🟢 TAB 6: BLOG CMS */}
            {activeTab === 'blog' && (
              <div className="space-y-8">
                <div><h2 className="text-3xl font-black text-slate-900">Blog Content Manager</h2></div>
                <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-sm">
                  <span className="text-6xl">📝</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-6">Blog Engine Setup Required</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">The database table is ready. Frontend blog pages will be added in the next deployment update.</p>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}