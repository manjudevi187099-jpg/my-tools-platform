'use client';

import { useState } from 'react';
import Head from 'next/head';

export default function UrlShortener() {
  const [activeTab, setActiveTab] = useState<'create' | 'stats'>('create');
  
  // Create Link States
  const [longUrl, setLongUrl] = useState('');
  const [mobile, setMobile] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Stats States
  const [statsMobile, setStatsMobile] = useState('');
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const handleCreate = async () => {
    if (!longUrl || !mobile) { alert('URL aur Mobile number dono daalein!'); return; }
    setLoading(true);
    try {
      const res = await fetch('/myapi/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl, mobile }),
      });
      const data = await res.json();
      if (data.shortCode) {
        setShortUrl(`${window.location.origin}/s/${data.shortCode}`);
      }
    } catch (error) {
      alert('Error aa gaya bhai!');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStats = async () => {
    if (!statsMobile) { alert('Mobile number daalein!'); return; }
    setLoadingStats(true);
    try {
      // YAHAN CHANGE KIYA HAI: /api/stats se /myapi/stats kar diya hai
      const res = await fetch(`/myapi/stats?mobile=${statsMobile}`);
      const data = await res.json();
      setStatsData(data.urls || []);
    } catch (error) {
      alert('Error fetching stats!');
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Pro URL Shortener & Analytics</title>
      </Head>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 text-lg font-bold ${activeTab === 'create' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            🔗 Create Short Link
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-4 text-lg font-bold ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            📊 View Analytics
          </button>
        </div>

        <div className="p-8">
          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Long URL (Original Link)</label>
                <input type="url" placeholder="https://example.com/very-long-link" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} className="w-full p-4 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Mobile Number (For tracking)</label>
                <input type="number" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-4 border rounded-xl" />
              </div>
              <button onClick={handleCreate} disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
                {loading ? 'Creating... ⏳' : 'Shorten URL ✨'}
              </button>
              
              {shortUrl && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <p className="text-green-800 font-bold mb-2">Your Short URL is ready!</p>
                  <a href={shortUrl} target="_blank" className="text-xl text-indigo-600 underline font-mono break-all">{shortUrl}</a>
                </div>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Enter Mobile Number to view clicks</label>
                <div className="flex gap-4">
                  <input type="number" placeholder="Mobile number" value={statsMobile} onChange={(e) => setStatsMobile(e.target.value)} className="flex-1 p-4 border rounded-xl" />
                  <button onClick={handleCheckStats} disabled={loadingStats} className="px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
                    {loadingStats ? 'Wait...' : 'Check'}
                  </button>
                </div>
              </div>

              {statsData.length > 0 && (
                <div className="mt-8 space-y-4">
                  {statsData.map((url, i) => (
                    <div key={i} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50">
                      <div className="truncate pr-4 max-w-[70%]">
                        <p className="font-bold text-indigo-600">/s/{url.short_code}</p>
                        <p className="text-xs text-gray-500 truncate">{url.long_url}</p>
                      </div>
                      <div className="text-center bg-white p-2 rounded shadow-sm border">
                        <p className="text-2xl font-black text-gray-800">{url.clicks}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}