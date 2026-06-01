'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';

type Language = 'en' | 'hi';
type Mode = 'time' | 'lesson';
type Duration = 60 | 180 | 300;
type LessonType = 'words' | 'quotes' | 'paragraph';
type Theme = 'light' | 'dark' | 'midnight';

// --- DATA BANKS ---
const WORD_BANK_EN = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'system', 'computer', 'software', 'typing', 'speed', 'test', 'practice', 'skill', 'fast', 'keyboard'];
const QUOTES_EN = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts in the long run.",
  "Life is what happens when you're busy making other plans. So make sure you are living it to the fullest."
];
const PARAGRAPHS_EN = [
  "The Quick Brown Fox Jumps Over The Lazy Dog. This pangram contains every letter of the English alphabet at least once. It is commonly used to test typewriters, computer keyboards, and to display fonts. Practicing with this sentence helps improve your typing speed and muscle memory across the entire keyboard layout.",
  "Global warming is the long-term heating of Earth's climate system observed since the pre-industrial period. This is primarily due to human activities, primarily fossil fuel burning, which increases heat-trapping greenhouse gas levels in Earth's atmosphere."
];

const WORD_BANK_HI = ['और', 'है', 'कि', 'में', 'का', 'को', 'से', 'एक', 'यह', 'पर', 'नहीं', 'लिए', 'हो', 'कर', 'अपने', 'तो', 'साथ', 'क्या', 'भी', 'था', 'जो', 'गया', 'ही', 'हम', 'हैं', 'करते', 'कुछ', 'करना', 'जैसे', 'होता', 'कोई', 'आप', 'भारत', 'समय', 'काम', 'अब', 'बात', 'उन', 'तथा', 'दिन', 'तक', 'कारण', 'बहुत', 'तरह', 'लोग', 'जब', 'कहा', 'जाता', 'अधिक', 'अन्य', 'बार', 'सरकार', 'जीवन', 'नाम', 'बाद', 'देश', 'पहले', 'दिया', 'वाले', 'गए', 'हुए', 'किया', 'जा', 'दो', 'रहा', 'इन', 'उसके', 'रूप', 'नीचे', 'आ', 'मुख्य', 'वाली', 'बीच', 'आई', 'उनसे', 'कई', 'कम', 'मानव', 'स्थान', 'ऐसा', 'रख', 'वहाँ', 'आज', 'फिर', 'गई', 'देख', 'पास', 'कभी', 'यहाँ', 'तकनीक', 'सकते'];
const QUOTES_HI = [
  "सफलता अंतिम नहीं है, विफलता घातक नहीं है: यह जारी रखने का साहस है जो मायने रखता है।",
  "यदि आप वही करते हैं जो आप हमेशा करते आए हैं, तो आपको वही मिलेगा जो आपको हमेशा से मिलता आया है।"
];
const PARAGRAPHS_HI = [
  "हिंदी भारत की सबसे अधिक बोली जाने वाली भाषा है और यह देवनागरी लिपि में लिखी जाती है। यह न केवल हमारी संस्कृति का अभिन्न अंग है, बल्कि देश भर में करोड़ों लोगों के संवाद का मुख्य माध्यम भी है। हिंदी टाइपिंग का अभ्यास करने से न केवल आपकी गति बढ़ती है, बल्कि सरकारी नौकरी की परीक्षाओं में भी यह एक अनिवार्य कौशल माना जाता है।",
  "कंप्यूटर आज के युग की सबसे बड़ी जरूरत बन गया है। शिक्षा, चिकित्सा, व्यापार और मनोरंजन सहित हर क्षेत्र में कंप्यूटर का उपयोग हो रहा है। इंटरनेट के माध्यम से दुनिया के किसी भी कोने में बैठे व्यक्ति से संपर्क किया जा सकता है।"
];

export default function TypingSpeedTest() {
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<Mode>('time');
  const [duration, setDuration] = useState<Duration>(60);
  const [lessonType, setLessonType] = useState<LessonType>('words');
  const [theme, setTheme] = useState<Theme>('light');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  const [timer, setTimer] = useState<number>(60); 
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  const [targetText, setTargetText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  
  const [capsLockActive, setCapsLockActive] = useState<boolean>(false);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio API for Mechanical Keyboard Sound
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtxRef.current = new AudioContextClass();
    }
  }, []);

  const playClickSound = () => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.log('Audio error ignored');
    }
  };

  const generateText = () => {
    const dbWords = language === 'en' ? WORD_BANK_EN : WORD_BANK_HI;
    const dbQuotes = language === 'en' ? QUOTES_EN : QUOTES_HI;
    const dbParas = language === 'en' ? PARAGRAPHS_EN : PARAGRAPHS_HI;

    if (mode === 'lesson') {
      if (lessonType === 'quotes') return dbQuotes[Math.floor(Math.random() * dbQuotes.length)];
      if (lessonType === 'paragraph') return dbParas[Math.floor(Math.random() * dbParas.length)];
    }

    let textArray = [];
    for (let i = 0; i < 150; i++) {
      textArray.push(dbWords[Math.floor(Math.random() * dbWords.length)]);
    }
    return textArray.join(' ');
  };

  useEffect(() => {
    resetTest();
  }, [language, mode, duration, lessonType]);

  // Main Timer & Live History Tracking
  useEffect(() => {
    let interval: any = null;
    
    if (isActive && !isFinished) {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          // Track WPM history every second for the chart
          setWpmHistory(prev => {
             const timeElapsedMins = (mode === 'time' ? (duration - (prevTime - 1)) : (prevTime + 1)) / 60;
             const correctChars = userInput.split('').filter((c, i) => c === targetText[i]).length;
             const currentWpm = timeElapsedMins > 0 ? Math.round((correctChars / 5) / timeElapsedMins) : 0;
             return [...prev, currentWpm];
          });

          if (mode === 'time') {
            if (prevTime <= 1) {
              setIsFinished(true);
              setIsActive(false);
              return 0;
            }
            return prevTime - 1;
          } else {
            return prevTime + 1;
          }
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isFinished, mode, userInput, targetText, duration]);

  const resetTest = () => {
    setTargetText(generateText());
    setUserInput('');
    setTimer(mode === 'time' ? duration : 0);
    setIsActive(false);
    setIsFinished(false);
    setWpmHistory([]);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setCapsLockActive(e.getModifierState('CapsLock'));
    if (e.key.length === 1 || e.key === 'Backspace') {
      playClickSound();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    
    const value = e.target.value;
    if (!isActive && value.length > 0) {
      setIsActive(true);
      // Auto-start Audio context on first user interaction
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
    
    if (value.length <= targetText.length) {
      setUserInput(value);
      
      if (mode === 'lesson' && value.length === targetText.length) {
        setIsFinished(true);
        setIsActive(false);
      }
    }
  };

  const focusInput = () => {
    if (inputRef.current && !isFinished) inputRef.current.focus();
  };

  // Advanced Stats Calculation
  const stats = useMemo(() => {
    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === targetText[i]) correctChars++;
      else incorrectChars++;
    }

    const timeElapsedInSeconds = mode === 'time' ? (duration - timer) : timer;
    const timeElapsedInMinutes = timeElapsedInSeconds / 60;
    
    // NET WPM (Standard)
    const netWpm = timeElapsedInMinutes > 0 ? Math.round((correctChars / 5) / timeElapsedInMinutes) : 0;
    // RAW WPM (Speed ignoring errors)
    const rawWpm = timeElapsedInMinutes > 0 ? Math.round((userInput.length / 5) / timeElapsedInMinutes) : 0;
    
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
    
    // Consistency Calculation (Variance in WPM history)
    let consistency = 100;
    if (wpmHistory.length > 5) {
       const avg = wpmHistory.reduce((a,b) => a+b, 0) / wpmHistory.length;
       const variance = wpmHistory.reduce((a,b) => a + Math.pow(b - avg, 2), 0) / wpmHistory.length;
       const stdDev = Math.sqrt(variance);
       consistency = Math.max(0, Math.round(100 - (stdDev / (avg || 1)) * 100));
    }

    return { netWpm, rawWpm, accuracy, consistency, correctChars, incorrectChars, timeTaken: timeElapsedInSeconds };
  }, [userInput, targetText, timer, duration, mode, wpmHistory]);

  const renderText = () => {
    return targetText.split('').map((char, index) => {
      let colorClass = theme === 'light' ? 'text-slate-400' : 'text-slate-500';
      let bgClass = 'bg-transparent';

      if (index < userInput.length) {
        if (userInput[index] === char) {
          colorClass = theme === 'light' ? 'text-emerald-500' : 'text-emerald-400';
        } else {
          colorClass = 'text-red-500';
          bgClass = theme === 'light' ? 'bg-red-100' : 'bg-red-900/40'; 
        }
      }

      const isCursor = index === userInput.length;
      const cursorColor = theme === 'light' ? 'border-blue-600' : 'border-blue-400';
      
      return (
        <span 
          key={index} 
          className={`${colorClass} ${bgClass} ${isCursor ? `border-l-[3px] ${cursorColor} animate-pulse shadow-sm` : ''} text-[26px] md:text-3xl leading-relaxed tracking-wide ${language === 'hi' ? 'font-sans' : 'font-mono'}`}
        >
          {char}
        </span>
      );
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Theme configuration objects
  const themeClasses = {
    light: 'bg-slate-50 text-slate-800',
    dark: 'bg-[#121212] text-slate-200',
    midnight: 'bg-[#0f172a] text-slate-200'
  };
  
  const cardClasses = {
    light: 'bg-white border-slate-200',
    dark: 'bg-[#1e1e1e] border-[#333]',
    midnight: 'bg-[#1e293b] border-slate-700'
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses[theme]} p-4 md:p-6`}>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & SETTINGS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
              ⌨️ ProType Engine
            </h2>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-2 rounded-lg text-sm font-bold border transition-colors ${soundEnabled ? 'border-emerald-500 text-emerald-500' : 'border-slate-500 text-slate-500'}`}>
              {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
            <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)} className={`p-2 rounded-lg text-sm font-bold border outline-none ${cardClasses[theme]}`}>
              <option value="light">☀️ Light Theme</option>
              <option value="dark">🌙 Dark Theme</option>
              <option value="midnight">🌌 Midnight</option>
            </select>
          </div>
        </div>

        <div className={`rounded-3xl shadow-2xl border p-6 md:p-8 relative overflow-hidden transition-colors duration-500 ${cardClasses[theme]}`}>
          
          {/* ADVANCED TOP CONTROLS */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
            
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className={`flex p-1 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-black/20'}`}>
                <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg font-bold transition-all ${language === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-400'}`}>EN</button>
                <button onClick={() => setLanguage('hi')} className={`px-4 py-2 rounded-lg font-bold transition-all ${language === 'hi' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-400'}`}>HI</button>
              </div>
              
              <div className="h-8 w-px bg-slate-500/30 hidden lg:block"></div>

              <div className={`flex p-1 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-black/20'}`}>
                <button onClick={() => setMode('time')} className={`px-4 py-2 rounded-lg font-bold transition-all ${mode === 'time' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-400'}`}>⏱️ Time</button>
                <button onClick={() => setMode('lesson')} className={`px-4 py-2 rounded-lg font-bold transition-all ${mode === 'lesson' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-400'}`}>📚 Lesson</button>
              </div>

              <div className="h-8 w-px bg-slate-500/30 hidden lg:block"></div>

              {mode === 'time' ? (
                <div className={`flex p-1 rounded-xl border ${theme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/20 border-blue-800'}`}>
                  {[60, 180, 300].map((t) => (
                    <button key={t} onClick={() => setDuration(t as Duration)} className={`px-4 py-2 rounded-lg font-bold transition-all ${duration === t ? 'bg-blue-600 text-white shadow' : 'text-blue-500 hover:bg-blue-500/10'}`}>
                      {t / 60} Min
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`flex p-1 rounded-xl border ${theme === 'light' ? 'bg-purple-50 border-purple-100' : 'bg-purple-900/20 border-purple-800'}`}>
                  {['words', 'quotes', 'paragraph'].map((l) => (
                    <button key={l} onClick={() => setLessonType(l as LessonType)} className={`px-4 py-2 rounded-lg font-bold capitalize transition-all ${lessonType === l ? 'bg-purple-600 text-white shadow' : 'text-purple-500 hover:bg-purple-500/10'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={`flex gap-8 px-6 py-3 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-slate-700'}`}>
              <div className="text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{mode === 'time' ? 'Time Left' : 'Elapsed'}</span>
                <span className={`text-4xl font-black ${mode === 'time' && timer <= 10 ? 'text-red-500 animate-pulse' : ''}`}>{formatTime(timer)}</span>
              </div>
              <div className="w-px bg-slate-500/30"></div>
              <div className="text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Live WPM</span>
                <span className="text-4xl font-black text-blue-500">{stats.netWpm}</span>
              </div>
            </div>
          </div>

          {/* CAPS LOCK WARNING */}
          {capsLockActive && (
            <div className="absolute top-[100px] left-1/2 transform -translate-x-1/2 z-20 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
              ⚠️ Caps Lock is ON
            </div>
          )}

          {/* 🌟 TYPING AREA 🌟 */}
          <div 
            onClick={focusInput}
            className={`relative border-2 rounded-2xl p-6 h-[260px] overflow-y-auto cursor-text transition-colors shadow-inner ${theme === 'light' ? 'bg-white border-slate-200 hover:border-blue-400' : 'bg-[#121212]/50 border-slate-700 hover:border-blue-500'}`}
          >
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text resize-none"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              disabled={isFinished}
            />
            
            <div className="z-0 select-none break-words whitespace-pre-wrap font-medium">
              {renderText()}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={resetTest}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-transform hover:-translate-y-1 ${theme === 'light' ? 'bg-slate-800 hover:bg-slate-900 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
            >
              <span>🔄</span> Restart Test
            </button>
          </div>

          {/* 🌟 RESULTS OVERLAY MODAL (INDUSTRY LEVEL) 🌟 */}
          {isFinished && (
            <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300 ${theme === 'light' ? 'bg-white/95' : 'bg-[#1e1e1e]/95'} backdrop-blur-md`}>
              <h3 className="text-4xl font-black mb-2">Test Complete! 🎯</h3>
              <p className="text-slate-500 mb-8 font-medium">Advanced Performance Analytics</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 w-full max-w-4xl">
                <div className={`p-6 rounded-2xl border text-center shadow-sm ${theme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/20 border-blue-800'}`}>
                  <span className="block text-xs font-bold text-blue-500 uppercase mb-1">Net WPM</span>
                  <span className="text-5xl font-black text-blue-600">{stats.netWpm}</span>
                  <span className="block text-xs text-blue-400 mt-1 font-medium">Raw: {stats.rawWpm}</span>
                </div>
                
                <div className={`p-6 rounded-2xl border text-center shadow-sm ${theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-900/20 border-emerald-800'}`}>
                  <span className="block text-xs font-bold text-emerald-500 uppercase mb-2">Accuracy</span>
                  <span className="text-5xl font-black text-emerald-600">{stats.accuracy}%</span>
                </div>
                
                <div className={`p-6 rounded-2xl border text-center shadow-sm ${theme === 'light' ? 'bg-purple-50 border-purple-100' : 'bg-purple-900/20 border-purple-800'}`}>
                  <span className="block text-xs font-bold text-purple-500 uppercase mb-2">Consistency</span>
                  <span className="text-5xl font-black text-purple-600">{stats.consistency}%</span>
                </div>
                
                <div className={`p-6 rounded-2xl border text-center shadow-sm ${theme === 'light' ? 'bg-red-50 border-red-100' : 'bg-red-900/20 border-red-800'}`}>
                  <span className="block text-xs font-bold text-red-500 uppercase mb-1">Keystrokes</span>
                  <span className="text-3xl font-black text-red-500 mt-2">
                    <span className="text-emerald-500">{stats.correctChars}</span> | {stats.incorrectChars}
                  </span>
                  <span className="block text-xs text-red-400 mt-1 font-medium">Correct | Errors</span>
                </div>
              </div>

              {/* LIVE WPM SPARKLINE CHART */}
              {wpmHistory.length > 0 && (
                <div className={`w-full max-w-4xl p-4 rounded-xl border mb-8 flex items-end justify-between h-32 gap-1 ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-slate-800'}`}>
                  {wpmHistory.map((wpm, i) => {
                    const maxWpm = Math.max(...wpmHistory, 50); // Minimum scale 50
                    const heightPercent = Math.max(5, (wpm / maxWpm) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded rounded-b-none transition-opacity z-10 whitespace-nowrap">
                          {wpm} wpm
                        </div>
                        <div 
                          className="w-full bg-blue-500/80 rounded-t-sm hover:bg-blue-400 transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button 
                onClick={resetTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black text-xl shadow-xl transition-transform hover:-translate-y-1"
              >
                Start New Test 🚀
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}