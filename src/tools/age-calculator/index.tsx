'use client';
import React, { useState, useEffect } from 'react';

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  // Default target date ko aaj ki date set karna
  const [targetDate, setTargetDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [result, setResult] = useState<{ years: number; months: number; days: number } | null>(null);

  const calculateAge = () => {
    if (!dob || !targetDate) return;

    const d1 = new Date(dob);
    const d2 = new Date(targetDate);

    if (d1 > d2) {
      alert("Date of Birth (DOB) aage ki date nahi ho sakti!");
      return;
    }

    let y1 = d1.getFullYear();
    let m1 = d1.getMonth();
    let day1 = d1.getDate();

    let y2 = d2.getFullYear();
    let m2 = d2.getMonth();
    let day2 = d2.getDate();

    let y = y2 - y1;
    let m = m2 - m1;
    let d = day2 - day1;

    // Agar days negative hain, toh pichle mahine se borrow karein
    if (d < 0) {
      m--;
      // Pichle mahine ke total days nikalna
      const daysInLastMonth = new Date(y2, m2, 0).getDate();
      d += daysInLastMonth;
    }

    // Agar months negative hain, toh saal se borrow karein
    if (m < 0) {
      y--;
      m += 12;
    }

    setResult({ years: y, months: m, days: d });
  };

  // Jab bhi date change ho, auto-calculate karein
  useEffect(() => {
    if (dob && targetDate) {
      calculateAge();
    }
  }, [dob, targetDate]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 dark:text-white">Age Calculator</h2>
        <p className="text-slate-500 mt-2 font-medium">Form bharne ke liye apni exact age (Years, Months, Days) mein nikalein.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DOB Input */}
          <div className="flex flex-col">
            <label className="font-bold text-slate-700 dark:text-slate-300 mb-2">Date of Birth (DOB)</label>
            <input 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)} 
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-lg font-semibold focus:border-blue-500 outline-none transition" 
            />
          </div>

          {/* Target Date Input */}
          <div className="flex flex-col">
            <label className="font-bold text-slate-700 dark:text-slate-300 mb-2">Calculate age as of</label>
            <input 
              type="date" 
              value={targetDate} 
              onChange={(e) => setTargetDate(e.target.value)} 
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-lg font-semibold focus:border-blue-500 outline-none transition" 
            />
          </div>
        </div>

        {/* Result Box */}
        {result ? (
          <div className="mt-8 bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-4">Your Exact Age is</h3>
            <div className="flex justify-center items-center gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-blue-600 dark:text-blue-400">{result.years}</span>
                <span className="text-slate-500 font-bold mt-1">Years</span>
              </div>
              <span className="text-4xl text-slate-300">,</span>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-blue-600 dark:text-blue-400">{result.months}</span>
                <span className="text-slate-500 font-bold mt-1">Months</span>
              </div>
              <span className="text-4xl text-slate-300">,</span>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-blue-600 dark:text-blue-400">{result.days}</span>
                <span className="text-slate-500 font-bold mt-1">Days</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <span className="text-4xl mb-4 block">📅</span>
            <p className="text-slate-400 font-bold text-lg">Select Date of Birth to see result</p>
          </div>
        )}
      </div>
    </div>
  );
}