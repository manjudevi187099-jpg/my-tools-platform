'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';

type Duration = 60 | 180 | 300; // 1 Min, 3 Min, 5 Min in seconds

// Standard English words for typing test
const WORD_BANK = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'system', 'computer', 'software', 'typing', 'speed', 'test', 'practice', 'skill', 'fast', 'keyboard'
];

export default function TypingSpeedTest() {
  const [duration, setDuration] = useState<Duration>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  const [targetText, setTargetText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Generate random text
  const generateText = () => {
    let text = [];
    for (let i = 0; i < 300; i++) { // Generate 300 words
      text.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
    }
    return text.join(' ');
  };

  useEffect(() => {
    resetTest();
  }, [duration]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      if (inputRef.current) inputRef.current.blur();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const resetTest = () => {
    setTargetText(generateText());
    setUserInput('');
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    
    const value = e.target.value;
    if (!isActive && value.length > 0) {
      setIsActive(true);
    }
    
    // Prevent typing beyond the generated text
    if (value.length <= targetText.length) {
      setUserInput(value);
    }
  };

  const focusInput = () => {
    if (inputRef.current && !isFinished) {
      inputRef.current.focus();
    }
  };

  // Calculations
  const stats = useMemo(() => {
    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === targetText[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }

    const timeElapsedInMinutes = (duration - timeLeft) / 60;
    
    // Standard WPM formula: (Correct Characters / 5) / Time in Minutes
    const wpm = timeElapsedInMinutes > 0 ? Math.round((correctChars / 5) / timeElapsedInMinutes) : 0;
    
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;

    return { wpm, accuracy, correctChars, incorrectChars, totalTyped: userInput.length };
  }, [userInput, targetText, timeLeft, duration]);

  // Text Rendering with Colors
  const renderText = () => {
    return targetText.split('').map((char, index) => {
      let colorClass = 'text-slate-400'; // Default un-typed
      let bgClass = 'bg-transparent';

      if (index < userInput.length) {
        if (userInput[index] === char) {
          colorClass = 'text-emerald-500'; // Correct
        } else {
          colorClass = 'text-red-500'; // Incorrect
          bgClass = 'bg-red-100'; // Highlight incorrect spaces
        }
      }

      // Cursor simulation
      const isCursor = index === userInput.length;
      
      return (
        <span 
          key={index} 
          className={`${colorClass} ${bgClass} ${isCursor ? 'border-l-2 border-blue-500 animate-pulse' : ''} text-2xl md:text-3xl font-mono tracking-wide`}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Typing Speed Test</h2>
        <p className="text-slate-500 mt-2 text-lg">Check your WPM (Words Per Minute) and accuracy for Govt Exams.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-10 relative overflow-hidden">
        
        {/* Top Controls & Live Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[60, 180, 300].map((t) => (
              <button
                key={t}
                onClick={() => setDuration(t as Duration)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${duration === t ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t / 60} Min
              </button>
            ))}
          </div>

          <div className="flex gap-8">
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Time Left</span>
              <span className={`text-4xl font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-700'}`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Live WPM</span>
              <span className="text-4xl font-black text-blue-600">{stats.wpm}</span>
            </div>
          </div>
          
        </div>

        {/* Typing Area */}
        <div 
          onClick={focusInput}
          className="relative bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 h-[250px] overflow-hidden cursor-text transition-colors hover:border-blue-300"
        >
          {/* Hidden Textarea for mobile/desktop keyboard capture */}
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInput}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text resize-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            disabled={isFinished}
          />
          
          <div className="absolute inset-0 p-6 z-0 select-none overflow-hidden break-words">
            {renderText()}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={resetTest}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-transform hover:-translate-y-1"
          >
            <span>🔄</span> Restart Test
          </button>
        </div>

        {/* 🌟 RESULTS OVERLAY MODAL 🌟 */}
        {isFinished && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <h3 className="text-4xl font-black text-slate-800 mb-2">Test Complete! 🎯</h3>
            <p className="text-slate-500 mb-8">Here is your typing performance report.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8 w-full max-w-4xl">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                <span className="block text-sm font-bold text-blue-500 uppercase mb-2">Typing Speed</span>
                <span className="text-5xl font-black text-blue-700">{stats.wpm} <span className="text-xl">WPM</span></span>
              </div>
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
                <span className="block text-sm font-bold text-emerald-500 uppercase mb-2">Accuracy</span>
                <span className="text-5xl font-black text-emerald-700">{stats.accuracy}%</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                <span className="block text-sm font-bold text-slate-500 uppercase mb-2">Correct Keystrokes</span>
                <span className="text-5xl font-black text-slate-700">{stats.correctChars}</span>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                <span className="block text-sm font-bold text-red-500 uppercase mb-2">Errors</span>
                <span className="text-5xl font-black text-red-700">{stats.incorrectChars}</span>
              </div>
            </div>

            <button 
              onClick={resetTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black text-xl shadow-xl transition-transform hover:scale-105"
            >
              Try Again 🚀
            </button>
          </div>
        )}

      </div>
    </div>
  );
}