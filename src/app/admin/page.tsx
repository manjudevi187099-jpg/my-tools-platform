'use client';

import React, { useState, useEffect } from 'react';
// 🌟 FIX: Apna Supabase ka sahi path check karein (Agar error aaye toh '@/' ya '../../' use karein)
import { supabase } from '../lib/supabase';

// Data Types
type Tool = {
  id: number;
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
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- METRICS STATE ---
  const [totalViews, setTotalViews] = useState(0);
  const [popularTool, setPopularTool] = useState({ name: 'N/A', views: 0 });
  const [activeCount, setActiveCount] = useState(0);

  // 1. Check Login
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'pdfnexa_secure_admin') {
      setIsAuthenticated(true);
      fetchRealData(); // Login hote hi data laao
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

  // 2. 🌟 FETCH REAL DATA FROM SUPABASE 🌟
  const fetchRealData = async () => {
    setLoading(true);
    try {
      // Tools status le aao
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools_status')
        .select('*')
        .order('id', { ascending: true });

      // Analytics le aao
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('tool_analytics')
        .select('*');

      if (toolsData) {
        let tViews = 0;
        let maxViews = -1;
        let bestTool = 'N/A';
        let aCount = 0;

        // Dono tables ko merge kar rahe hain
        const mergedTools = toolsData.map((tool) => {
          if (tool.is_active) aCount++;

          const stat = analyticsData?.find((a) => a.tool_slug === tool.slug);
          const views = stat ? stat.total_views : 0;
          
          tViews += views;
          if (views > maxViews) {
            maxViews = views;
            bestTool = tool.name;
          }

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

  // 3. 🌟 TOGGLE TOOL STATUS (ON / OFF) 🌟
  const toggleToolStatus = async (slug: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // UI mein turant update dikhane ke liye
    setTools(tools.map(t => t.slug === slug ? { ...t, is_active: newStatus } : t));
    setActiveCount(prev => newStatus ? prev + 1 : prev - 1);

    // Database mein update bhejna
    const { error } = await supabase
      .from('tools_status')
      .update({ is_active: newStatus })
      .eq('slug', slug);

    if (error) {
      alert("Status update fail ho gaya!");
      fetchRealData(); // Error aaya toh purana data wapas le aao
    }
  };

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
            <input
              type="password"
              placeholder="Enter Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-700 p-4 rounded-xl focus:border-purple-500 outline-none text-center text-lg tracking-widest"
            />
            {authError && <p className="text-red-400 text-center text-sm font-bold animate-pulse">{authError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black py-4 rounded-xl hover:opacity-90 transition-opacity">
              UNLOCK DASHBOARD 🚀
            </button>
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
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black flex items-center gap-2"><span className="text-blue-500">🛡️</span> Admin Pro</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            📊 Analytics Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('tools')} 
            className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'tools' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            ⚙️ Tools Manager
          </button>
          <button 
            onClick={() => setActiveTab('seo')} 
            className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'seo' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            🔍 SEO & Settings
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all">
            Logout 🚪
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="font-bold">Syncing with Supabase...</p>
          </div>
        ) : (
          <>
            {/* 🟢 TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Analytics Overview</h2>
                  <p className="text-slate-500 mt-1">Real-time data synced from Supabase.</p>
                </div>

                {/* METRICS CARDS */}
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
                    <p className="text-slate-500 text-sm font-medium mt-2">Real-time sync active</p>
                  </div>
                </div>

                {/* TOP TOOLS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">All Tools Performance</h3>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-slate-400 text-sm uppercase tracking-wider border-b">
                        <th className="p-4 font-semibold">Tool Name</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold text-right">Total Uses</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* Views ke hisaab se sort karke dikha rahe hain */}
                      {tools.sort((a,b) => (b.views || 0) - (a.views || 0)).map((tool) => (
                        <tr key={tool.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-700">{tool.name}</td>
                          <td className="p-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">{tool.category}</span></td>
                          <td className="p-4 font-bold text-purple-600 text-right">{tool.views || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 🔴 TAB 2: TOOLS MANAGER (ON/OFF) */}
            {activeTab === 'tools' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Tools Manager</h2>
                  <p className="text-slate-500 mt-1">Turn tools ON or OFF instantly. Changes reflect live on the homepage.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-slate-400 text-sm uppercase tracking-wider border-b">
                        <th className="p-4 font-semibold">Tool Name</th>
                        <th className="p-4 font-semibold">Slug (URL)</th>
                        <th className="p-4 font-semibold text-right">Status Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tools.map((tool) => (
                        <tr key={tool.id} className={`transition-colors ${!tool.is_active ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                          <td className={`p-4 font-bold ${!tool.is_active ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {tool.name}
                          </td>
                          <td className="p-4 text-slate-500 text-sm">{tool.slug}</td>
                          <td className="p-4 text-right">
                            {/* 🔥 THE MAGIC TOGGLE BUTTON 🔥 */}
                            <button 
                              onClick={() => toggleToolStatus(tool.slug, tool.is_active)}
                              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                tool.is_active ? 'bg-green-500' : 'bg-slate-300'
                              }`}
                            >
                              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                                tool.is_active ? 'translate-x-8' : 'translate-x-1'
                              }`}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 🔵 TAB 3: SEO & SETTINGS */}
            {activeTab === 'seo' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">SEO & Site Settings</h2>
                  <p className="text-slate-500 mt-1">Manage Meta tags, descriptions, and site configurations.</p>
                </div>
                <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                  <span className="text-6xl">🚧</span>
                  <h3 className="text-2xl font-bold text-slate-800 mt-4">Under Construction</h3>
                  <p className="text-slate-500 mt-2">SEO Module Database se connect hona baaki hai. (Coming Soon)</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}