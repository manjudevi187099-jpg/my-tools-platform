'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// 🌟 Humara Supabase Connection import kar rahe hain
import { supabase } from '../../lib/supabase'; 

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 1. Jaise hi page khule, Database se saare tools le aao
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tools_status')
      .select('*')
      .order('name', { ascending: true }); // A to Z sort
      
    if (data) {
      setTools(data);
    }
    setLoading(false);
  };

  // 🌟 2. Jab koi Toggle button dabaye, toh Database mein ON/OFF save karo
  const toggleToolStatus = async (slug: string, currentStatus: boolean) => {
    // UI ko turant update karte hain (Fast lagne ke liye)
    setTools(tools.map(tool => 
      tool.slug === slug ? { ...tool, is_active: !currentStatus } : tool
    ));

    // Database mein update bhej rahe hain
    const { error } = await supabase
      .from('tools_status')
      .update({ is_active: !currentStatus })
      .eq('slug', slug);

    if (error) {
      console.error("Update Error:", error);
      fetchTools(); // Agar error aaye toh wapas purana state load kar lo
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans text-slate-800">
      
      {/* 🌟 SIDEBAR */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl z-20">
        <div className="h-16 flex items-center px-6 bg-[#0b1121] border-b border-slate-800">
          <span className="text-2xl mr-2">🛡️</span>
          <span className="text-xl font-black text-white tracking-wider">Admin Pro</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
            <span>📊</span> Analytics Dashboard
          </button>
          
          <button onClick={() => setActiveTab('tools')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'tools' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
            <span>🎛️</span> Tools Manager
          </button>

          <button onClick={() => setActiveTab('seo')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'seo' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
            <span>🔍</span> SEO & Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-bold text-sm">
            <span>🌐</span> Go to Live Website
          </Link>
        </div>
      </aside>

      {/* 🌟 MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-black text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">Database Connected 🟢</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="text-slate-500 text-sm font-bold mb-1">Active Tools</div>
                  <div className="text-4xl font-black text-purple-600">
                    {loading ? '...' : tools.filter(t => t.is_active).length} / {tools.length}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="text-slate-500 text-sm font-bold mb-1">Database Status</div>
                  <div className="text-2xl font-black text-green-600 mt-2">Supabase Online 🟢</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOOLS MANAGER (REAL DATABASE CONNECTED) */}
          {activeTab === 'tools' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-black text-slate-800">Manage Tools Visibility</h2>
                <p className="text-sm text-slate-500 font-medium">Changes here will save directly to Supabase!</p>
              </div>
              
              {loading ? (
                <div className="p-10 text-center text-slate-500 font-bold">Loading tools from database... ⏳</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                        <th className="p-4 font-bold border-b border-slate-200">Tool Name</th>
                        <th className="p-4 font-bold border-b border-slate-200">Category</th>
                        <th className="p-4 font-bold border-b border-slate-200">Status</th>
                        <th className="p-4 font-bold border-b border-slate-200 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tools.map((tool) => (
                        <tr key={tool.slug} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{tool.name}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-md uppercase">
                              {tool.category}
                            </span>
                          </td>
                          <td className="p-4">
                            {tool.is_active ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full border border-green-200">ACTIVE</span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full border border-red-200">INACTIVE</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {/* 🌟 REAL DATABASE TOGGLE BUTTON */}
                            <button 
                              onClick={() => toggleToolStatus(tool.slug, tool.is_active)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${tool.is_active ? 'bg-purple-600' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tool.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEO */}
          {activeTab === 'seo' && (
            <div className="max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-black text-slate-800 mb-6">Global SEO Settings</h2>
              <p className="text-slate-500">Database connection successful. SEO fields can be connected in the future.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}