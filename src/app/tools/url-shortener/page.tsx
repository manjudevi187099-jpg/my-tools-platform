'use client';

import { useState } from 'react';
import Head from 'next/head';

export default function UrlShortener() {
  const [activeTab, setActiveTab] = useState<'create' | 'stats'>('create');
  
  // Create Link States
  const [longUrl, setLongUrl] = useState('');
  const [mobile, setMobile] = useState('');
  const [validity, setValidity] = useState(''); // Empty means Never Expires
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stats States
  const [statsMobile, setStatsMobile] = useState('');
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const handleCreate = async () => {
    if (!longUrl || !mobile) { alert('URL aur Mobile number dono daalein!'); return; }
    setLoading(true);
    setShortUrl(''); setCopied(false);
    try {
      const res = await fetch('/myapi/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl, mobile, expiresInDays: validity }),
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
      const res = await fetch(`/myapi/stats?mobile=${statsMobile}`);
      const data = await res.json();
      setStatsData(data.urls || []);
    } catch (error) {
      alert('Error fetching stats!');
    } finally {
      setLoadingStats(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Kya aap sach mein is link ko delete karna chahte hain?");
    if (!confirmDelete) return;

    try {
      const res = await fetch('/myapi/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, mobile: statsMobile }),
      });
      if (res.ok) {
        setStatsData(statsData.filter(item => item.id !== id));
      }
    } catch (error) {
      alert("Delete karne mein problem aayi!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Premium URL Shortener | DhamakaTools</title>
      </Head>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b cursor-pointer">
          <div onClick={() => setActiveTab('create')} className={`flex-1 text-center py-4 text-lg font-bold transition ${activeTab === 'create' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>🔗 Create Short Link</div>
          <div onClick={() => setActiveTab('stats')} className={`flex-1 text-center py-4 text-lg font-bold transition ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📊 View Analytics</div>
        </div>

        <div className="p-8">
          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Long URL (Original Link)</label>
                <input type="url" placeholder="https://example.com/very-long-link" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} className="w-full p-4 border rounded-xl focus:ring-indigo-500" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number (For tracking)</label>
                  <input type="number" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-4 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Link Validity</label>
                  <select value={validity} onChange={(e) => setValidity(e.target.value)} className="w-full p-4 border rounded-xl bg-white">
                    <option value="">Never Expires</option>
                    <option value="7">7 Days</option>
                    <option value="30">1 Month</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>
              </div>

              <button onClick={handleCreate} disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                {loading ? 'Processing... ⏳' : 'Shorten URL ✨'}
              </button>
              
              {shortUrl && (
                <div className="mt-6 p-6 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col items-center">
                  <p className="text-indigo-900 font-bold mb-4">Your Link & QR Code is ready!</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortUrl)}`} alt="QR Code" className="mb-4 rounded shadow-sm" />
                  
                  <div className="flex w-full items-center gap-2 bg-white p-2 rounded-lg border">
                    <input type="text" readOnly value={shortUrl} className="flex-1 bg-transparent px-2 outline-none text-gray-700 font-mono" />
                    <button onClick={() => copyToClipboard(shortUrl)} className={`px-6 py-2 rounded-md font-bold text-white transition ${copied ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                      {copied ? 'Copied! ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Enter Mobile Number to Manage Links</label>
                <div className="flex gap-4">
                  <input type="number" placeholder="Mobile number" value={statsMobile} onChange={(e) => setStatsMobile(e.target.value)} className="flex-1 p-4 border rounded-xl" />
                  <button onClick={handleCheckStats} disabled={loadingStats} className="px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
                    {loadingStats ? '...' : 'Check'}
                  </button>
                </div>
              </div>

              {statsData.length > 0 && (
                <div className="mt-8 space-y-4">
                  {statsData.map((url) => (
                    <div key={url.id} className="p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
                      <div className="flex-1 truncate w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-indigo-600">/s/{url.short_code}</p>
                          <button onClick={() => copyToClipboard(`${window.location.origin}/s/${url.short_code}`)} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Copy</button>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{url.long_url}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-white px-4 py-2 rounded shadow-sm border min-w-[80px]">
                          <p className="text-xl font-black text-gray-800">{url.clicks}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Clicks</p>
                        </div>
                        <button onClick={() => handleDelete(url.id)} className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg border border-red-200 transition" title="Delete Link">
                          🗑️
                        </button>
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