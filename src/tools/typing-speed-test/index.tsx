'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';

type Language = 'en' | 'hi';
type Mode = 'time' | 'lesson';
type Duration = 60 | 180 | 300;
type LessonType = 'words' | 'quotes' | 'paragraph';

// --- DATA BANKS (ENGLISH & HINDI) ---
const WORD_BANK_EN = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'system', 'computer', 'software', 'typing', 'speed', 'test', 'practice', 'skill', 'fast', 'keyboard'];

const QUOTES_EN = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts in the long run.",
  "Life is what happens when you're busy making other plans. So make sure you are living it to the fullest.",
  "In the end, it's not the years in your life that count. It's the life in your years.",
  "You miss 100% of the shots you don't take. Take risks and embrace the challenges that come your way."
];

const PARAGRAPHS_EN = [
  "The Quick Brown Fox Jumps Over The Lazy Dog. This pangram contains every letter of the English alphabet at least once. It is commonly used to test typewriters, computer keyboards, and to display fonts. Practicing with this sentence helps improve your typing speed and muscle memory across the entire keyboard layout.",
  "Global warming is the long-term heating of Earth's climate system observed since the pre-industrial period. This is primarily due to human activities, primarily fossil fuel burning, which increases heat-trapping greenhouse gas levels in Earth's atmosphere."
];

const WORD_BANK_HI = ['और', 'है', 'कि', 'में', 'का', 'को', 'से', 'एक', 'यह', 'पर', 'नहीं', 'लिए', 'हो', 'कर', 'अपने', 'तो', 'साथ', 'क्या', 'भी', 'था', 'जो', 'गया', 'ही', 'हम', 'हैं', 'करते', 'कुछ', 'करना', 'जैसे', 'होता', 'कोई', 'आप', 'भारत', 'समय', 'काम', 'अब', 'बात', 'उन', 'तथा', 'दिन', 'तक', 'कारण', 'बहुत', 'तरह', 'लोग', 'जब', 'कहा', 'जाता', 'अधिक', 'अन्य', 'बार', 'सरकार', 'जीवन', 'नाम', 'बाद', 'देश', 'पहले', 'दिया', 'वाले', 'गए', 'हुए', 'किया', 'जा', 'दो', 'रहा', 'इन', 'उसके', 'रूप', 'नीचे', 'आ', 'मुख्य', 'वाली', 'बीच', 'आई', 'उनसे', 'कई', 'कम', 'मानव', 'स्थान', 'ऐसा', 'रख', 'वहाँ', 'आज', 'फिर', 'गई', 'देख', 'पास', 'कभी', 'यहाँ', 'तकनीक', 'सकते'];

const QUOTES_HI = [
  "सफलता अंतिम नहीं है, विफलता घातक नहीं है: यह जारी रखने का साहस है जो मायने रखता है।",
  "यदि आप वही करते हैं जो आप हमेशा करते आए हैं, तो आपको वही मिलेगा जो आपको हमेशा से मिलता आया है।",
  "अपने सपनों को सच करने का सबसे अच्छा तरीका है कि आप जाग जाएं और मेहनत करें।",
  "समय ही धन है, जो इसे बर्बाद करता है वह अंततः खुद को बर्बाद कर लेता है।"
];

const PARAGRAPHS_HI = [
  "हिंदी भारत की सबसे अधिक बोली जाने वाली भाषा है और यह देवनागरी लिपि में लिखी जाती है। यह न केवल हमारी संस्कृति का अभिन्न अंग है, बल्कि देश भर में करोड़ों लोगों के संवाद का मुख्य माध्यम भी है। हिंदी टाइपिंग का अभ्यास करने से न केवल आपकी गति बढ़ती है, बल्कि सरकारी नौकरी की परीक्षाओं में भी यह एक अनिवार्य कौशल माना जाता है।",
  "कंप्यूटर आज के युग की सबसे बड़ी जरूरत बन गया है। शिक्षा, चिकित्सा, व्यापार और मनोरंजन सहित हर क्षेत्र में कंप्यूटर का उपयोग हो रहा है। इंटरनेट के माध्यम से दुनिया के किसी भी कोने में बैठे व्यक्ति से संपर्क किया जा सकता है। इसलिए कंप्यूटर और टाइपिंग का ज्ञान होना आज की पीढ़ी के लिए अत्यंत आवश्यक है।"
];

export default function TypingSpeedTest() {
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<Mode>('time');
  const [duration, setDuration] = useState<Duration>(60);
  const [lessonType, setLessonType] = useState<LessonType>('words');
  
  const [timer, setTimer] = useState<number>(60); // Acts as Time Left (Time mode) OR Time Elapsed (Lesson mode)
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  const [targetText, setTargetText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Generate appropriate text based on mode and language
  const generateText = () => {
    const dbWords = language === 'en' ? WORD_BANK_EN : WORD_BANK_HI;
    const dbQuotes = language === 'en' ? QUOTES_EN : QUOTES_HI;
    const dbParas = language === 'en' ? PARAGRAPHS_EN : PARAGRAPHS_HI;

    if (mode === 'lesson') {
      if (lessonType === 'quotes') return dbQuotes[Math.floor(Math.random() * dbQuotes.length)];
      if (lessonType === 'paragraph') return dbParas[Math.floor(Math.random() * dbParas.length)];
    }

    // Default: Time mode or Words lesson generates 100-200 random words
    let textArray = [];
    for (let i = 0; i < 150; i++) {
      textArray.push(dbWords[Math.floor(Math.random() * dbWords.length)]);
    }
    return textArray.join(' ');
  };

  useEffect(() => {
    resetTest();
  }, [language, mode, duration, lessonType]);

  // Main Timer Logic (Handles both Time countdown & Lesson countup)
  useEffect(() => {
    let interval: any = null;
    
    if (isActive && !isFinished) {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          if (mode === 'time') {
            if (prevTime <= 1) {
              setIsFinished(true);
              setIsActive(false);
              return 0;
            }
            return prevTime - 1;
          } else {
            // Lesson Mode: count UP
            return prevTime + 1;
          }
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isFinished, mode]);

  const resetTest = () => {
    setTargetText(generateText());
    setUserInput('');
    setTimer(mode === 'time' ? duration : 0);
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
    
    if (value.length <= targetText.length) {
      setUserInput(value);
      
      // If Lesson mode and user typed everything, Finish the test!
      if (mode === 'lesson' && value.length === targetText.length) {
        setIsFinished(true);
        setIsActive(false);
      }
    }
  };

  const focusInput = () => {
    if (inputRef.current && !isFinished) {
      inputRef.current.focus();
    }
  };

  // Live Performance Stats
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

    const timeElapsedInSeconds = mode === 'time' ? (duration - timer) : timer;
    const timeElapsedInMinutes = timeElapsedInSeconds / 60;
    
    // Standard Exam Formula: (Correct Keystrokes / 5) / Time Taken
    const wpm = timeElapsedInMinutes > 0 ? Math.round((correctChars / 5) / timeElapsedInMinutes) : 0;
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;

    return { wpm, accuracy, correctChars, incorrectChars, timeTaken: timeElapsedInSeconds };
  }, [userInput, targetText, timer, duration, mode]);

  // Visual Text Rendering
  const renderText = () => {
    return targetText.split('').map((char, index) => {
      let colorClass = 'text-slate-400';
      let bgClass = 'bg-transparent';

      if (index < userInput.length) {
        if (userInput[index] === char) {
          colorClass = 'text-emerald-500 font-medium';
        } else {
          colorClass = 'text-red-500 font-medium';
          bgClass = 'bg-red-100'; 
        }
      }

      const isCursor = index === userInput.length;
      
      return (
        <span 
          key={index} 
          className={`${colorClass} ${bgClass} ${isCursor ? 'border-l-[3px] border-blue-600 animate-pulse' : ''} text-[26px] md:text-3xl leading-relaxed tracking-wide ${language === 'hi' ? 'font-sans' : 'font-mono'}`}
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro Typing Speed Engine</h2>
        <p className="text-slate-500 mt-2 text-lg">Master your speed in English & Hindi for SSC, Railway & State Govt Exams.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8 relative overflow-hidden">
        
        {/* 🌟 ADVANCED TOP CONTROLS 🌟 */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
          
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {/* Language Switch */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg font-bold transition-all ${language === 'en' ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>🇺🇸 EN</button>
              <button onClick={() => setLanguage('hi')} className={`px-4 py-2 rounded-lg font-bold transition-all ${language === 'hi' ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>🇮🇳 HI</button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>

            {/* Mode Switch */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setMode('time')} className={`px-4 py-2 rounded-lg font-bold transition-all ${mode === 'time' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>⏱️ Time</button>
              <button onClick={() => setMode('lesson')} className={`px-4 py-2 rounded-lg font-bold transition-all ${mode === 'lesson' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>📚 Lesson</button>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>

            {/* Sub-Options Switch */}
            {mode === 'time' ? (
              <div className="flex bg-blue-50 p-1 rounded-xl border border-blue-100">
                {[60, 180, 300].map((t) => (
                  <button key={t} onClick={() => setDuration(t as Duration)} className={`px-4 py-2 rounded-lg font-bold transition-all ${duration === t ? 'bg-blue-600 text-white shadow' : 'text-blue-600/70 hover:bg-blue-100'}`}>
                    {t / 60} Min
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex bg-purple-50 p-1 rounded-xl border border-purple-100">
                {['words', 'quotes', 'paragraph'].map((l) => (
                  <button key={l} onClick={() => setLessonType(l as LessonType)} className={`px-4 py-2 rounded-lg font-bold capitalize transition-all ${lessonType === l ? 'bg-purple-600 text-white shadow' : 'text-purple-600/70 hover:bg-purple-100'}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-8 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-200">
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{mode === 'time' ? 'Time Left' : 'Elapsed'}</span>
              <span className={`text-4xl font-black ${mode === 'time' && timer <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>{formatTime(timer)}</span>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Live WPM</span>
              <span className="text-4xl font-black text-blue-600">{stats.wpm}</span>
            </div>
          </div>
          
        </div>

        {/* 🌟 TYPING AREA 🌟 */}
        <div 
          onClick={focusInput}
          className="relative bg-white border-2 border-slate-200 rounded-2xl p-6 h-[260px] overflow-y-auto cursor-text transition-colors hover:border-blue-400 shadow-inner"
        >
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
          
          <div className="z-0 select-none break-words whitespace-pre-wrap">
            {renderText()}
          </div>
        </div>

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
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300">
            <h3 className="text-4xl font-black text-slate-800 mb-2">Test Complete! 🎯</h3>
            <p className="text-slate-500 mb-8 font-medium">Here is your detailed typing performance report.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 w-full max-w-4xl">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center shadow-sm">
                <span className="block text-xs font-bold text-blue-500 uppercase mb-2">Final Speed</span>
                <span className="text-5xl font-black text-blue-700">{stats.wpm} <span className="text-xl">WPM</span></span>
              </div>
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center shadow-sm">
                <span className="block text-xs font-bold text-emerald-500 uppercase mb-2">Accuracy</span>
                <span className="text-5xl font-black text-emerald-700">{stats.accuracy}%</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
                <span className="block text-xs font-bold text-slate-500 uppercase mb-2">Correct Keystrokes</span>
                <span className="text-5xl font-black text-slate-700">{stats.correctChars}</span>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center shadow-sm">
                <span className="block text-xs font-bold text-red-500 uppercase mb-2">Errors</span>
                <span className="text-5xl font-black text-red-700">{stats.incorrectChars}</span>
              </div>
            </div>

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
  );
}