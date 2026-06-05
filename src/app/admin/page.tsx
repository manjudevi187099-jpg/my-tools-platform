'use client';

import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Page load par check karo ki kya admin pehle se login hai?
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'pdfnexa_secure_admin') {
      setIsAuthenticated(true);
    }
  }, []);

  // Login Handle Function
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 🛑 Yahan apna manpasand password set karein (Mera example: Admin@2024)
    if (password === 'Admin@2024') {
      localStorage.setItem('admin_token', 'pdfnexa_secure_admin');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Galat Password Bhai! 🚫');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  // ==========================================
  // 🚫 LOGIN SCREEN UI (Agar login nahi hai)
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
            <div>
              <input
                type="password"
                placeholder="Enter Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 p-4 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-center text-lg tracking-widest"
              />
            </div>
            {error && <p className="text-red-400 text-center text-sm font-bold animate-pulse">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30"
            >
              UNLOCK DASHBOARD 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // ✅ PROFESSIONAL ADMIN DASHBOARD UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Admin Pro</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            Logout🚪
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Page Title */}
        <div>
          <h2 className="text-3xl font-black text-slate-900">Analytics Overview</h2>
          <p className="text-slate-500 mt-1">Track your platform's performance and user activity.</p>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">👀</div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Tool Views</p>
            <h3 className="text-4xl font-black text-slate-800 mt-2">1,204</h3>
            <p className="text-green-500 text-sm font-bold mt-2">↑ 12% from last week</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🔥</div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Most Popular Tool</p>
            <h3 className="text-2xl font-black text-purple-600 mt-2 truncate">PDF to Excel</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">450 uses today</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🛠️</div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Tools</p>
            <h3 className="text-4xl font-black text-slate-800 mt-2">35 <span className="text-lg text-slate-400">/ 35</span></h3>
            <p className="text-slate-500 text-sm font-medium mt-2">100% Tools Live</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">⚡</div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Database Status</p>
            <h3 className="text-2xl font-black text-green-600 mt-2">Connected</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">Supabase Responding</p>
          </div>
        </div>

        {/* Detailed Tracking Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Top Performing Tools</h3>
            <button className="text-purple-600 font-bold text-sm hover:underline">View All Report →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Tool Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold text-right">Total Uses</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700 flex items-center gap-3">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📄</span> PDF to Excel
                  </td>
                  <td className="p-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">PDF</span></td>
                  <td className="p-4 font-bold text-slate-800 text-right">450</td>
                  <td className="p-4"><span className="text-green-500 font-bold text-sm">Active</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700 flex items-center gap-3">
                    <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">🎨</span> Mega Photo Studio
                  </td>
                  <td className="p-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">DESIGN</span></td>
                  <td className="p-4 font-bold text-slate-800 text-right">312</td>
                  <td className="p-4"><span className="text-green-500 font-bold text-sm">Active</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700 flex items-center gap-3">
                    <span className="p-2 bg-orange-50 text-orange-600 rounded-lg">🛠️</span> Smart Card Maker
                  </td>
                  <td className="p-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">UTILITY</span></td>
                  <td className="p-4 font-bold text-slate-800 text-right">280</td>
                  <td className="p-4"><span className="text-green-500 font-bold text-sm">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}