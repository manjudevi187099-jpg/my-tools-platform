'use client';

import { useState, use } from 'react';
import Head from 'next/head';

export default function ReadSecretMessage({ params }: { params: Promise<{ code: string }> }) {
  const unwrappedParams = use(params); // Next.js 15 way to unwrap params
  const [secretMessage, setSecretMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);

  const revealMessage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/myapi/secret-note/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: unwrappedParams.code }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSecretMessage(data.message);
        setOpened(true);
      } else {
        setErrorMsg(data.error);
        setOpened(true);
      }
    } catch (err) {
      setErrorMsg("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Head><title>Secret Message</title></Head>

      <div className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700 p-8 text-center">
        {!opened ? (
          <>
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">You have a Secret Message</h1>
            <p className="text-gray-400 mb-8 text-sm">Warning: This message will self-destruct forever as soon as you read it.</p>
            <button onClick={revealMessage} disabled={loading} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition">
              {loading ? 'Decrypting...' : 'Tap to Reveal & Destroy'}
            </button>
          </>
        ) : secretMessage ? (
          <>
            <div className="text-6xl mb-6 text-green-400">✅</div>
            <h2 className="text-lg font-bold text-gray-300 mb-4">Message Decrypted:</h2>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <p className="text-white text-lg break-words">{secretMessage}</p>
            </div>
            <p className="text-red-400 mt-6 text-sm font-bold animate-pulse">💥 Message destroyed from servers.</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6 text-red-500">❌</div>
            <h2 className="text-xl font-bold text-white mb-2">Too Late!</h2>
            <p className="text-gray-400">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}