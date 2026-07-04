import React from 'react';
import Link from 'next/link';

interface LinkItem {
  label: string;
  text: string;
  url: string;
  isExternal?: boolean; 
}

interface ImportantLinksTableProps {
  title?: string;
  links: LinkItem[];
}

export default function ImportantLinksTable({ title = "Important Official Links", links }: ImportantLinksTableProps) {
  if (!links || links.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 border border-gray-300 shadow-sm font-sans">
      
      {/* 🔵 Header Section (Sky Blue) */}
      <div className="bg-[#66c2ff] text-slate-900 text-center font-bold text-lg py-3 border-b border-gray-300">
        {title}
      </div>

      {/* 🟡 Links Section (Yellow) */}
      <div className="flex flex-col">
        {links.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col md:flex-row border-b border-gray-300 last:border-b-0"
          >
            {/* Left Column (Label) */}
            <div className="w-full md:w-1/2 bg-[#ffe566] p-4 text-center border-b md:border-b-0 md:border-r border-gray-300 flex items-center justify-center">
              <span className="font-bold text-slate-800 text-lg">
                {item.label}
              </span>
            </div>
            
            {/* Right Column (Clickable Link) */}
            <div className="w-full md:w-1/2 bg-[#ffe566] p-4 text-center flex items-center justify-center">
              {item.isExternal !== false ? (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-[#0033cc] text-lg hover:underline transition-all"
                >
                  {item.text}
                </a>
              ) : (
                <Link href={item.url} className="font-bold text-[#0033cc] text-lg hover:underline transition-all">
                  {item.text}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}