'use client';
import React, { useState } from 'react';
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';

export default function HindiTypingTool() {
  const [text, setText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Word and Character count logic
  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all text?')) {
      setText('');
    }
  };

  const handleDownload = () => {
    if (!text) return;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Hindi_Typing_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen font-sans">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">English to Hindi Typing</h2>
        <p className="text-slate-500 mt-2 text-lg">Type in English (Hinglish) and it will automatically convert to Hindi. (e.g., mera naam {'->'} मेरा नाम)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MAIN TYPING AREA */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-lg transition-colors text-sm"
              >
                {isCopied ? '✅ Copied!' : '📋 Copy Text'}
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition-colors text-sm"
              >
                📥 Save as TXT
              </button>
            </div>
            <div>
              <button 
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors text-sm"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          {/* Typing Container */}
          <div className="flex-1 p-6 relative">
            <ReactTransliterate
              value={text}
              onChangeText={(newText) => setText(newText)}
              lang="hi"
              containerClassName="w-full h-full"
              className="w-full h-full min-h-[450px] p-4 text-2xl leading-relaxed text-slate-800 outline-none resize-none border-2 border-dashed border-slate-200 rounded-xl focus:border-blue-400 transition-colors"
              placeholder="यहाँ टाइप करना शुरू करें... (Start typing here in English...)"
            />
          </div>

          {/* Status Bar */}
          <div className="bg-slate-800 text-white p-3 flex justify-between items-center text-sm font-medium">
            <span>Powered by Google Phonetic Transliteration</span>
            <div className="flex gap-6">
              <span>Words: <strong className="text-blue-300">{wordCount}</strong></span>
              <span>Characters: <strong className="text-blue-300">{charCount}</strong></span>
            </div>
          </div>
        </div>

        {/* SIDEBAR INSTRUCTIONS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
            <h3 className="text-xl font-black text-slate-800 border-b-2 border-blue-100 pb-2 mb-6">💡 How to use?</h3>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex gap-3 items-start">
                <span className="text-xl">⌨️</span>
                <p>Type any word in English letters. For example, type <strong>"Bharat"</strong>.</p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-xl">␣</span>
                <p>Press the <strong>Space Bar</strong> and it will instantly convert to <strong>"भारत"</strong>.</p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-xl">⌫</span>
                <p>If the spelling is wrong, press <strong>Backspace</strong> to see a dropdown menu with more Hindi word suggestions.</p>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-3xl shadow-sm border border-blue-100 p-8">
            <h3 className="text-lg font-black text-blue-900 mb-4">Example Typing</h3>
            <div className="bg-white p-4 rounded-xl border border-blue-200 text-slate-700 font-medium space-y-2">
              <p>Type: <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded">namaste dosto</span></p>
              <p>Result: <span className="text-2xl text-slate-900">नमस्ते दोस्तों</span></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}