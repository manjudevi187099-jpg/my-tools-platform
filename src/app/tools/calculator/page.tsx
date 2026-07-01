'use client';

import { useState } from 'react';
import Head from 'next/head';

export default function StealthCalculator() {
  const [display, setDisplay] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setDisplay('');
    } else if (val === '=') {
      // 🚨 THE SECRET PIN: 8055 
      if (display === '8055') {
        setIsUnlocked(true);
        setDisplay('');
      } else {
        try {
          // eslint-disable-next-line no-eval
          setDisplay(eval(display).toString());
        } catch {
          setDisplay('Error');
        }
      }
    } else {
      setDisplay((prev) => (prev === 'Error' ? val : prev + val));
    }
  };

  const calcButtons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'];

  const handleGenerateLink = async () => {
    if (!message) { alert("Pehle message toh likho!"); return; }
    setLoading(true);
    try {
      const res = await fetch('/myapi/secret-note/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.code) {
        setGeneratedLink(`${window.location.origin}/s-msg/${data.code}`);
        setMessage(''); // Clear message after generating
      }
    } catch (error) {
      alert("Error generating link!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Head><title>Math Calculator</title></Head>

      <div className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
        {!isUnlocked ? (
          <div className="p-6">
            <div className="bg-gray-900 p-6 rounded-2xl mb-6 text-right overflow-hidden shadow-inner border border-gray-700">
              <span className="text-4xl font-mono text-green-400 tracking-widest">{display || '0'}</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {calcButtons.map((btn) => (
                <button key={btn} onClick={() => handleCalcClick(btn)}
                  className={`py-4 text-2xl font-bold rounded-xl transition shadow-lg ${
                    btn === 'C' ? 'bg-red-500 text-white' : btn === '=' ? 'bg-green-500 text-white' : 
                    ['/', '*', '-', '+'].includes(btn) ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-100'
                  }`}>
                  {btn}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-white h-full">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-black text-gray-800">🕵️‍♂️ Secret Vault</h2>
              <button onClick={() => setIsUnlocked(false)} className="text-xs bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold">Lock</button>
            </div>
            <div className="space-y-4">
              <textarea 
                rows={4} placeholder="Type secret message..." value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 border rounded-xl bg-gray-50 resize-none text-gray-800"
              />
              <button onClick={handleGenerateLink} disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl">
                {loading ? 'Encrypting...' : 'Generate Self-Destruct Link'}
              </button>
              {generatedLink && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl text-center">
                  <input type="text" readOnly value={generatedLink} className="w-full p-2 text-sm bg-white border rounded mb-2 text-center" />
                  <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="bg-gray-800 text-white px-4 py-2 rounded text-sm w-full">Copy Link</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}