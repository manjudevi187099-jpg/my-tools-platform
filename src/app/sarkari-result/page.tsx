import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sarkari Result & Latest Jobs Update | DhamakaTools',
  description: 'Fastest updates for Sarkari Result, Latest Government Jobs, Admit Cards, and Syllabus in India.',
};

export default function SarkariResultPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen font-sans">
      
      {/* 🔴 LIVE NOW BANNER */}
      <div className="flex justify-center mb-6 mt-4">
        <span className="bg-red-600 text-white px-4 py-1 rounded-md text-sm font-bold animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full"></span> LIVE NOW
        </span>
      </div>

      {/* 🟦 3-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1: LATEST JOBS */}
        <div className="border border-blue-300 bg-white rounded-md shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white text-center py-2 font-bold text-lg">
            Latest Jobs
          </div>
          <ul className="divide-y divide-gray-200">
            <li className="p-3 hover:bg-gray-50 transition-colors">
              <Link href="/sarkari-result/bihar-police-si-2026" className="text-blue-700 hover:text-red-600 font-medium text-sm">
                * Bihar Police BPSSC Sub Inspector SI Recruitment 2026
              </Link>
            </li>
            <li className="p-3 hover:bg-gray-50 transition-colors">
              <Link href="/sarkari-result/rrb-technician-2026" className="text-blue-700 hover:text-red-600 font-medium text-sm">
                * Railway RRB Technician Recruitment 2026 [Online Form]
              </Link>
            </li>
          </ul>
        </div>

        {/* COLUMN 2: RESULT */}
        <div className="border border-blue-300 bg-white rounded-md shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white text-center py-2 font-bold text-lg">
            Result
          </div>
          <ul className="divide-y divide-gray-200">
            <li className="p-3 hover:bg-gray-50 transition-colors">
              <Link href="/sarkari-result/bihar-deled-result-2026" className="text-blue-700 hover:text-red-600 font-medium text-sm">
                * Bihar DElEd Result 2026: Check Result Date & Scorecard
              </Link>
            </li>
            <li className="p-3 hover:bg-gray-50 transition-colors">
              <Link href="/sarkari-result/jpsc-pre-result-2026" className="text-blue-700 hover:text-red-600 font-medium text-sm">
                * JPSC Civil Services Exam CSE Pre Result 2026
              </Link>
            </li>
          </ul>
        </div>

        {/* COLUMN 3: ADMIT CARD */}
        <div className="border border-blue-300 bg-white rounded-md shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white text-center py-2 font-bold text-lg">
            Admit Card
          </div>
          <ul className="divide-y divide-gray-200">
            <li className="p-3 hover:bg-gray-50 transition-colors">
              <Link href="/sarkari-result/iaf-medical-admit-card-2026" className="text-blue-700 hover:text-red-600 font-medium text-sm">
                * Indian Air Force Medical Assistant Phase-II Admit Card
              </Link>
            </li>
            <li className="p-3 hover:bg-gray-50 transition-colors">
              <Link href="/sarkari-result/uptet-admit-card-2026" className="text-blue-700 hover:text-red-600 font-medium text-sm">
                * UPTET Admit Card 2026 Download Link
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}