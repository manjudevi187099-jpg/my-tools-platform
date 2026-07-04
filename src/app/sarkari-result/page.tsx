import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sarkari Result & Latest Jobs Update | DhamakaTools',
  description: 'Fastest updates for Sarkari Result, Latest Government Jobs, Admit Cards, and Syllabus in India.',
};

export default function SarkariResultPage() {
  return (
    <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
      
      {/* 🟦 HEADER SECTION */}
      <header className="bg-blue-600 text-white shadow-md">
        {/* Top Logo Area */}
        <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col items-center justify-center">
          <Link href="/sarkari-result" className="flex flex-col items-center hover:scale-105 transition-transform">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider text-center drop-shadow-lg">
              DHAMAKA <span className="text-yellow-400">RESULT</span>
            </h1>
            <p className="mt-2 text-lg font-semibold bg-yellow-400 text-blue-900 px-4 py-1 rounded-full shadow-inner">
              सबसे तेज़ Update !
            </p>
          </Link>
        </div>

        {/* 🟥 Navigation Bar */}
        <nav className="bg-red-600 border-b-4 border-red-800">
          <div className="max-w-7xl mx-auto">
            <ul className="flex flex-wrap justify-center font-bold text-sm md:text-base divide-x divide-red-500">
              <li><Link href="/sarkari-result" className="block px-4 py-3 hover:bg-red-700 transition">Home</Link></li>
              <li><Link href="#latest-jobs" className="block px-4 py-3 hover:bg-red-700 transition">Latest Jobs</Link></li>
              <li><Link href="#admit-card" className="block px-4 py-3 hover:bg-red-700 transition">Admit Card</Link></li>
              <li><Link href="#result" className="block px-4 py-3 hover:bg-red-700 transition">Result</Link></li>
              <li><Link href="/sarkari-result" className="block px-4 py-3 hover:bg-red-700 transition">Sarkari Yojana</Link></li>
              <li><Link href="/" className="block px-4 py-3 bg-yellow-400 text-red-700 hover:bg-yellow-300 transition">Utility Tools</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* 🟨 MARQUEE / TICKER (Scrolling Latest Updates) */}
      <div className="bg-yellow-300 border-b-2 border-yellow-500 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="bg-red-600 text-white font-bold px-4 py-2 shrink-0">
            LATEST
          </div>
          {/* Note: <marquee> tag purana hai par in websites par sabse best kaam karta hai bina heavy JS ke */}
          <marquee className="text-red-700 font-bold py-2 text-sm md:text-base font-serif tracking-wide">
            Bihar Police SI Online Form 2026 | Railway RRB Technician Recruitment 2026 | Bihar DElEd Result Declared - Check Now! | JPSC Civil Services Pre Result Out
          </marquee>
        </div>
      </div>

      {/* 🔍 HERO / SEARCH SECTION */}
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex border-2 border-blue-600 rounded-full overflow-hidden shadow-lg bg-white">
          <input 
            type="text" 
            placeholder="Search Latest Jobs, Results, Admit Cards..." 
            className="w-full px-6 py-3 outline-none text-gray-700 font-medium"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-bold transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* 📑 MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 pb-12 flex-grow w-full">
        
        {/* 🔴 LIVE NOW BANNER */}
        <div className="flex justify-center mb-6">
          <span className="bg-red-600 border border-red-800 text-white px-6 py-1.5 rounded-md text-sm font-black animate-pulse flex items-center gap-2 shadow-md">
            <span className="w-2.5 h-2.5 bg-white rounded-full"></span> LIVE NOW
          </span>
        </div>

        {/* 🟦 3-COLUMN GRID LAYOUT (Apna purana solid code) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* COLUMN 1: LATEST JOBS */}
          <div id="latest-jobs" className="border border-blue-300 bg-white rounded-md shadow-sm overflow-hidden">
            <div className="bg-blue-600 text-white text-center py-2.5 font-bold text-lg tracking-wide">
              Latest Jobs
            </div>
            <ul className="divide-y divide-gray-200">
              <li className="p-3 hover:bg-blue-50 transition-colors">
                <Link href="/sarkari-result/bihar-police-si-2026" className="text-blue-700 hover:text-red-600 font-medium text-[15px] leading-tight flex gap-1">
                  <span className="text-red-500 shrink-0">➤</span> Bihar Police BPSSC Sub Inspector SI Recruitment 2026
                </Link>
              </li>
              <li className="p-3 hover:bg-blue-50 transition-colors">
                <Link href="/sarkari-result/rrb-technician-2026" className="text-blue-700 hover:text-red-600 font-medium text-[15px] leading-tight flex gap-1">
                  <span className="text-red-500 shrink-0">➤</span> Railway RRB Technician Recruitment 2026 [Online Form]
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: RESULT */}
          <div id="result" className="border border-blue-300 bg-white rounded-md shadow-sm overflow-hidden">
            <div className="bg-blue-600 text-white text-center py-2.5 font-bold text-lg tracking-wide">
              Result
            </div>
            <ul className="divide-y divide-gray-200">
              <li className="p-3 hover:bg-blue-50 transition-colors">
                <Link href="/sarkari-result/bihar-deled-result-2026" className="text-blue-700 hover:text-red-600 font-medium text-[15px] leading-tight flex gap-1">
                  <span className="text-red-500 shrink-0">➤</span> Bihar DElEd Result 2026: Check Result Date & Scorecard
                </Link>
              </li>
              <li className="p-3 hover:bg-blue-50 transition-colors">
                <Link href="/sarkari-result/jpsc-pre-result-2026" className="text-blue-700 hover:text-red-600 font-medium text-[15px] leading-tight flex gap-1">
                  <span className="text-red-500 shrink-0">➤</span> JPSC Civil Services Exam CSE Pre Result 2026
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: ADMIT CARD */}
          <div id="admit-card" className="border border-blue-300 bg-white rounded-md shadow-sm overflow-hidden">
            <div className="bg-blue-600 text-white text-center py-2.5 font-bold text-lg tracking-wide">
              Admit Card
            </div>
            <ul className="divide-y divide-gray-200">
              <li className="p-3 hover:bg-blue-50 transition-colors">
                <Link href="/sarkari-result/iaf-medical-admit-card-2026" className="text-blue-700 hover:text-red-600 font-medium text-[15px] leading-tight flex gap-1">
                  <span className="text-red-500 shrink-0">➤</span> Indian Air Force Medical Assistant Phase-II Admit Card
                </Link>
              </li>
              <li className="p-3 hover:bg-blue-50 transition-colors">
                <Link href="/sarkari-result/uptet-admit-card-2026" className="text-blue-700 hover:text-red-600 font-medium text-[15px] leading-tight flex gap-1">
                  <span className="text-red-500 shrink-0">➤</span> UPTET Admit Card 2026 Download Link
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </main>

      {/* ⬛ SEO FOOTER SECTION */}
      <footer className="bg-slate-900 text-slate-300 py-10 mt-auto border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 border-b border-slate-700 pb-2">About Dhamaka Result</h3>
            <p className="leading-relaxed">
              Dhamaka Result (part of DhamakaTools) is your most trusted one-stop platform for Sarkari Results, Government Jobs, Admit Cards, and latest employment updates across India. We ensure students get verified and accurate information instantly.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 border-b border-slate-700 pb-2">Important Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-yellow-400 transition">Free Utility Tools</Link></li>
              <li><Link href="/tools/image-resizer" className="hover:text-yellow-400 transition">Photo & Signature Resizer</Link></li>
              <li><Link href="/tools/pdf-merger" className="hover:text-yellow-400 transition">PDF Tools</Link></li>
              <li><Link href="/sarkari-result" className="hover:text-yellow-400 transition">Latest Government Jobs</Link></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 border-b border-slate-700 pb-2">Disclaimer</h3>
            <p className="leading-relaxed text-xs">
              The information provided on this website is for educational and informational purposes only. While we strive to keep the information accurate and up-to-date, we strongly advise candidates to verify all details from the official government websites before applying for any post.
            </p>
            <p className="mt-4 font-bold text-white">© 2026 DhamakaTools. All Rights Reserved.</p>
          </div>

        </div>
      </footer>
    </div>
  );
}