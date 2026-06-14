'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function VideoDownloaderPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState<any>(null);

  const handleFetch = async () => {
    if (!url.includes('http')) {
      setError('Bhai, sahi video link (URL) daalo!');
      return;
    }

    setLoading(true);
    setError('');
    setVideoData(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/video-downloader`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server se connect nahi ho paya!');
      }

      setVideoData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Link href="/" className="text-red-500 font-bold mb-8 inline-block">← Back to DhamakaTools</Link>
      
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2">📹 Reel & Video Downloader</h1>
        <p className="text-slate-500 mb-8 font-medium">Instagram Reels, YouTube Shorts, aur kai videos 1-Click mein download karein.</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Yahan Video ya Reel ka link Paste karein..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-6 py-4 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none text-lg font-medium"
          />
          <button 
            onClick={handleFetch}
            disabled={!url || loading}
            className={`px-8 py-4 rounded-xl font-black text-lg transition-all ${
              loading || !url ? 'bg-slate-200 text-slate-400' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-105'
            }`}
          >
            {loading ? '⏳ Fetching...' : '🚀 Get Video'}
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-4 rounded-xl font-bold mb-6 text-left">❌ {error}</div>}

        {videoData && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center text-left">
            {videoData.thumbnail && (
              <img src={videoData.thumbnail} alt="Thumbnail" className="w-full md:w-48 h-auto rounded-xl shadow-md object-cover" />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-800 mb-2">{videoData.title}</h3>
              <p className="text-sm font-bold text-slate-400 mb-4 uppercase">Platform: {videoData.platform}</p>
              
              <a 
                href={videoData.video_url} 
                target="_blank" 
                rel="noreferrer"
                download 
                className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md"
              >
                ⬇️ Download MP4 File
              </a>
              <p className="text-xs text-slate-400 mt-3 font-medium">Note: Button dabane par agar video naye tab mein khule, toh uske right-side mein 3-dots par click karke Download daba dein.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}