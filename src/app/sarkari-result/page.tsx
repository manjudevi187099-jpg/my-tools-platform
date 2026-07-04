import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sarkari Result & Latest Jobs Update | DhamakaTools',
  description: 'Fastest updates for Sarkari Result, Latest Government Jobs, Admit Cards, and Syllabus in India.',
};

// 🗄️ DUMMY DATA FOR 9 BOXES (Database se connect hone par ye hat jayega)
const boxCategories = [
  { id: 'latest-news', title: 'Latest News', links: ['UP Anganwadi Worker Bharti Online Form 2026', 'Bihar Police BPSSC Sub Inspector SI Recruitment', 'Bihar DElEd Result 2026: Check Result Date', 'AIIMS BSc Nursing Result Date 2026 (4 July)'] },
  { id: 'result', title: 'Result', links: ['Bihar DElEd Result 2026: Check Scorecard', 'JPSC Civil Services Exam CSE Pre Result 2026', 'RRB Group D Result / Score Card 2026 - Out', 'LIC HFL Junior Assistant Result 2026 Download'] },
  { id: 'jobs', title: 'Jobs', links: ['UP Anganwadi Worker Bharti Online Form 2026', 'Railway RRB Technician Recruitment 2026', 'SSC CGL Vacancy 2026 Online Form 12,250 Posts', 'Bihar ITI Counselling 2026 Online Choice Filling'] },
  { id: 'admit-card', title: 'Admit Card', links: ['Indian Air Force Medical Assistant Phase-II Admit Card', 'SSB Head Constable Ministerial HCM Admit Card', 'UPTET Admit Card 2026 Download Link', 'MP PNST Admit Card 2026 Download (Released)'] },
  { id: 'answer-key', title: 'Answer Key', links: ['Bihar DElEd Answer Key 2026 Download', 'RRB NTPC UG Answer Key 2026', 'RE-NEET Answer Key 2026 (Out) LIVE', 'SSC GD Answer Key 2026, Response Sheet PDF'] },
  { id: 'scholarship', title: 'Scholarship', links: ['Bihar Post Matric Scholarship 2026-27 Apply Online', 'Bihar Inter Scholarship Payment Status Check', 'Vidyadhan Scholarship Bihar 2026 Apply Online', 'Bihar Board 10th Pass Scholarship 2026'] },
  { id: 'sarkari-yojana', title: 'Sarkari Yojana', links: ['Annapurna Bhandar Status Check 2026: ₹3000', 'Ration Card 2.0 App | Ration card me naam kaise jode', 'Bihar Udyami Yojana Selection List 2026 (Out)', 'Bihar Labour Card New Portal Launch 2026'] },
  { id: 'sarkari-kam', title: 'Sarkari Kam', links: ['बैंक से आधार लिंक करें (NPCI)', 'आधार कार्ड डाउनलोड', 'पैन कार्ड ऑनलाइन अप्लाई', 'PM किसान सम्मान निधि स्टेटस चेक'] },
  { id: 'tools', title: 'Tool', links: ['Photo Signature Joiner', 'Photo Name Date Joiner', 'Image to PDF Convert', 'Resize Image to 20kb (NEW)'] }
];

export default function SarkariResultPage() {
  // TypeScript error bypass for classic marquee tag
  const Marquee = 'marquee' as any;

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
      
      {/* 🟦 HEADER SECTION */}
      <header className="bg-blue-600 text-white shadow-md">
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
              <li><Link href="#jobs" className="block px-4 py-3 hover:bg-red-700 transition">Jobs</Link></li>
              <li><Link href="#admit-card" className="block px-4 py-3 hover:bg-red-700 transition">Admit Card</Link></li>
              <li><Link href="#result" className="block px-4 py-3 hover:bg-red-700 transition">Result</Link></li>
              <li><Link href="#sarkari-yojana" className="block px-4 py-3 hover:bg-red-700 transition">Sarkari Yojana</Link></li>
              <li><Link href="/" className="block px-4 py-3 bg-yellow-400 text-red-700 hover:bg-yellow-300 transition">Utility Tools</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* 🟨 MARQUEE / TICKER */}
      <div className="bg-yellow-300 border-b-2 border-yellow-500 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="bg-red-600 text-white font-bold px-4 py-2 shrink-0">LATEST</div>
          <Marquee className="text-red-700 font-bold py-2 text-sm md:text-base font-serif tracking-wide">
            Bihar Police SI Online Form 2026 | Railway RRB Technician Recruitment 2026 | Bihar DElEd Result Declared - Check Now! | JPSC Civil Services Pre Result Out
          </Marquee>
        </div>
      </div>

      {/* 🔍 SEARCH SECTION */}
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex border-2 border-blue-600 rounded-full overflow-hidden shadow-lg bg-white">
          <input type="text" placeholder="Search Latest Jobs, Results, Admit Cards..." className="w-full px-6 py-3 outline-none text-gray-700 font-medium" />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-bold transition-colors">Search</button>
        </div>
      </div>

      {/* 📑 MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 pb-12 flex-grow w-full">
        
        {/* 🔴 LIVE NOW BANNER */}
        <div className="flex justify-center mb-8">
          <span className="bg-red-600 border border-red-800 text-white px-6 py-1.5 rounded-md text-sm font-black animate-pulse flex items-center gap-2 shadow-md">
            <span className="w-2.5 h-2.5 bg-white rounded-full"></span> LIVE NOW
          </span>
        </div>

        {/* 🟦 THE MEGA 9-BOX GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {boxCategories.map((category) => (
            <div key={category.id} id={category.id} className="border border-blue-400 bg-white rounded-sm shadow-sm flex flex-col overflow-hidden">
              
              {/* Box Header */}
              <div className="bg-blue-600 text-white text-center py-2 font-bold text-lg tracking-wide border-b border-blue-700">
                {category.title}
              </div>
              
              {/* Box Links (10th post tak yahan aayega) */}
              <ul className="flex-1 divide-y divide-gray-300">
                {category.links.map((linkText, idx) => (
                  <li key={idx} className="p-3 hover:bg-blue-50 transition-colors">
                    <Link href={`/sarkari-result/${linkText.toLowerCase().replace(/ /g, '-')}`} className="text-blue-700 hover:text-red-600 font-medium text-[14px] leading-snug flex gap-1.5">
                      <span className="text-red-500 shrink-0 mt-0.5">➤</span> 
                      {linkText}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Load More / View More Option at bottom */}
              <div className="bg-gray-100 border-t border-gray-300 text-center py-2.5 mt-auto">
                <Link href={`/sarkari-result/category/${category.id}`} className="text-blue-800 hover:text-red-600 font-bold text-sm tracking-wide">
                  « View More / Next »
                </Link>
              </div>

            </div>
          ))}

        </div>
      </main>

      {/* ⬛ SEO FOOTER SECTION */}
      <footer className="bg-slate-900 text-slate-300 py-10 mt-auto border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="text-white text-lg font-bold mb-4 border-b border-slate-700 pb-2">About Dhamaka Result</h3>
            <p className="leading-relaxed">Dhamaka Result (part of DhamakaTools) is your most trusted one-stop platform for Sarkari Results, Government Jobs, Admit Cards, and latest employment updates across India.</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4 border-b border-slate-700 pb-2">Important Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-yellow-400 transition">Free Utility Tools</Link></li>
              <li><Link href="/tools/image-resizer" className="hover:text-yellow-400 transition">Photo & Signature Resizer</Link></li>
              <li><Link href="/sarkari-result" className="hover:text-yellow-400 transition">Latest Government Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4 border-b border-slate-700 pb-2">Disclaimer</h3>
            <p className="leading-relaxed text-xs">The information provided on this website is for educational purposes only. Verify details from official government websites before applying.</p>
            <p className="mt-4 font-bold text-white">© 2026 DhamakaTools. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}