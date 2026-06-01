'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';

type Language = 'en' | 'hi';
type View = 'dashboard' | 'typing';
type Category = 'beginner' | 'intermediate' | 'advanced' | 'timetest';
type Theme = 'light' | 'dark';

interface Lesson {
  id: string;
  title: string;
  text: string;
}

interface Section {
  title: string;
  lessons: Lesson[];
}

// 🌟 HELPER FUNCTION: To fill the box by repeating text 🌟
const rep = (text: string, count: number) => Array(count).fill(text).join(' ');

// --- CURRICULUM DATA (ENGLISH) - FULL BOX TEXT ---
const EN_CURRICULUM: Record<string, Section[]> = {
  beginner: [
    {
      title: "Getting Started (Home Row)",
      lessons: [
        { id: 'en_b1', title: '1. J, F, and Space', text: rep('j j f f j f j f space j f j j f f space', 15) },
        { id: 'en_b2', title: '2. U, R, and K Keys', text: rep('j u j f r f k j k u r k u r k j f r k space', 12) },
        { id: 'en_b3', title: '3. D, E, and I Keys', text: rep('d e i d e i f d k i k i e d i e k d space', 12) },
        { id: 'en_b4', title: '4. C, G, and N Keys', text: rep('c g n c g n d c f g k n g c n g c d space', 12) },
        { id: 'en_b5', title: '5. Beginner Review 1', text: rep('j u g e c i n r f d k c r i n g e space', 12) }
      ]
    },
    {
      title: "Reaching Out (Top & Bottom Row)",
      lessons: [
        { id: 'en_b6', title: '6. T, S, and L Keys', text: rep('t s l t s l f t d s k l s t l s t l space', 12) },
        { id: 'en_b7', title: '7. O, B, and A Keys', text: rep('o b a o b a l o f b d a b o a b o a space', 12) },
        { id: 'en_b8', title: '8. V, H, and M Keys', text: rep('v h m v h m f v j h k m h v m h v m space', 12) },
        { id: 'en_b9', title: '9. Full Alphabet Practice', text: rep('the quick brown fox jumps over the lazy dog', 10) }
      ]
    }
  ],
  intermediate: [
    {
      title: "Common Words & Speed Building",
      lessons: [
        { id: 'en_i1', title: '1. Most Used Words 1', text: rep('the be to of and a in that have it for not on with he as you do', 5) },
        { id: 'en_i2', title: '2. Most Used Words 2', text: rep('at this but his by from they we say her she or an will my one all', 5) },
        { id: 'en_i3', title: '3. Sentence Practice', text: rep('Typing speed test checks your actual typing speed and accuracy in real time.', 6) }
      ]
    }
  ],
  advanced: [
    {
      title: "Numbers & Symbols (Pro Level)",
      lessons: [
        { id: 'en_a1', title: '1. Numbers Row', text: rep('1 2 3 4 5 6 7 8 9 0 1 5 9 2 8 4 7 3 6', 8) },
        { id: 'en_a2', title: '2. Special Symbols', text: rep('@ # $ % & * ( ) ! ? @ # $ % & * ( ) ! ?', 8) },
        { id: 'en_a3', title: '3. Coding & Data Entry', text: rep('User: admin_99! Pass: #Secure$2024 (ID: 874-ABC).', 8) }
      ]
    }
  ]
};

// --- CURRICULUM DATA (HINDI) - FULL BOX TEXT ---
const HI_CURRICULUM: Record<string, Section[]> = {
  beginner: [
    {
      title: "मूल अक्षर (Basic Keys & Words)",
      lessons: [
        { id: 'hi_b1', title: '1. होम रो (Home Row)', text: rep('क म र त क म र त क र म त र म त क क म र', 12) },
        { id: 'hi_b2', title: '2. ऊपर की रो (Top Row)', text: rep('च ट त प च ट त प प त ट च प त च ट च प', 12) },
        { id: 'hi_b3', title: '3. बिना मात्रा के शब्द', text: rep('कल चल जल फल नल मन तन धन पवन नयन रमन चमन', 8) },
        { id: 'hi_b4', title: '4. आ की मात्रा (aa)', text: rep('आम नाम काम दाम राम राजा बाजा छाता माता ताला', 8) }
      ]
    }
  ],
  intermediate: [
    {
      title: "मात्राएँ और छोटे वाक्य (Sentences)",
      lessons: [
        { id: 'hi_i1', title: '1. इ और ई की मात्रा', text: rep('किताब चिड़िया गिलास मीठा पानी दिन रात सुबह शाम', 8) },
        { id: 'hi_i2', title: '2. उ और ऊ की मात्रा', text: rep('दुकान मकान कविता कहानी फूल धूल धूप रूप सुख दुःख', 8) },
        { id: 'hi_i3', title: '3. छोटे वाक्य अभ्यास', text: rep('भारत हमारा देश है। समय बहुत कीमती है। हमें पढ़ना चाहिए।', 6) }
      ]
    }
  ],
  advanced: [
    {
      title: "कठिन शब्द और पैराग्राफ (Govt Exams)",
      lessons: [
        { id: 'hi_a1', title: '1. आधे अक्षर (Half Letters)', text: rep('विद्यालय विज्ञान प्रज्वलित आशीर्वाद श्रद्धांजलि उज्ज्वल', 6) },
        { id: 'hi_a2', title: '2. कठिन शब्द (Hard Words)', text: rep('द्वंद्व स्वच्छता कार्यक्रम अंतर्राष्ट्रीय प्रौद्योगिकी कृत्रिम', 6) },
        { id: 'hi_a3', title: '3. पैराग्राफ (Paragraph Test)', text: rep('हिंदी भारत की सबसे अधिक बोली जाने वाली भाषा है। यह न केवल संस्कृति है, बल्कि करोड़ों का माध्यम है।', 3) }
      ]
    }
  ]
};

const RANDOM_WORDS_EN = ['computer', 'software', 'typing', 'speed', 'test', 'practice', 'skill', 'fast', 'keyboard', 'internet', 'technology', 'network', 'system', 'data', 'coding', 'application', 'developer', 'interface', 'website', 'browser'];

export default function TypingSpeedTest() {
  const [view, setView] = useState<View>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [activeCategory, setActiveCategory] = useState<Category>('beginner');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
  const [theme, setTheme] = useState<Theme>('light');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Typing Engine States
  const [timer, setTimer] = useState<number>(0); 
  const [timeLimit, setTimeLimit] = useState<number>(60); 
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  const [targetText, setTargetText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  const startLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setTargetText(lesson.text);
    setUserInput('');
    setTimer(0);
    setIsActive(false);
    setIsFinished(false);
    setWpmHistory([]);
    setView('typing');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const startTimeTest = (mins: number) => {
    let textArray = [];
    for (let i = 0; i < (mins * 80); i++) { // Generate enough words to fill time
      textArray.push(RANDOM_WORDS_EN[Math.floor(Math.random() * RANDOM_WORDS_EN.length)]);
    }
    const txt = textArray.join(' ');
    
    setCurrentLesson({ id: `time_${mins}`, title: `${mins} Minute Test`, text: txt });
    setTargetText(txt);
    setUserInput('');
    setTimeLimit(mins * 60);
    setTimer(mins * 60);
    setIsActive(false);
    setIsFinished(false);
    setWpmHistory([]);
    setView('typing');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && !isFinished) {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          
          setWpmHistory(prev => {
             const timeElapsedMins = (activeCategory === 'timetest' ? (timeLimit - (prevTime - 1)) : (prevTime + 1)) / 60;
             const correctChars = userInput.split('').filter((c, i) => c === targetText[i]).length;
             const currentWpm = timeElapsedMins > 0 ? Math.round((correctChars / 5) / timeElapsedMins) : 0;
             return [...prev, currentWpm];
          });

          if (activeCategory === 'timetest') {
            if (prevTime <= 1) {
              finishTest();
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
  }, [isActive, isFinished, activeCategory, userInput, targetText, timeLimit]);

  const finishTest = () => {
    setIsFinished(true);
    setIsActive(false);
    if (currentLesson && activeCategory !== 'timetest' && !completedLessons.includes(currentLesson.id)) {
      setCompletedLessons([...completedLessons, currentLesson.id]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key.length === 1 || e.key === 'Backspace') {
      playClickSound();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    
    const value = e.target.value;
    if (!isActive && value.length > 0) {
      setIsActive(true);
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
    
    if (value.length <= targetText.length) {
      setUserInput(value);
      
      // Auto-scroll logic: Keep active character in view
      if (textContainerRef.current) {
        const cursorElement = textContainerRef.current.querySelector('.active-cursor');
        if (cursorElement) {
          cursorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      if (activeCategory !== 'timetest' && value.length === targetText.length) {
        finishTest();
      }
    }
  };

  const stats = useMemo(() => {
    let correctChars = 0;
    let incorrectChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === targetText[i]) correctChars++;
      else incorrectChars++;
    }
    const timeElapsedInSeconds = activeCategory === 'timetest' ? (timeLimit - timer) : timer;
    const timeElapsedInMinutes = timeElapsedInSeconds / 60;
    
    const netWpm = timeElapsedInMinutes > 0 ? Math.round((correctChars / 5) / timeElapsedInMinutes) : 0;
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
    
    return { netWpm, accuracy, correctChars, incorrectChars, timeTaken: timeElapsedInSeconds };
  }, [userInput, targetText, timer, timeLimit, activeCategory]);

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
      return (
        <span 
          key={index} 
          className={`${colorClass} ${bgClass} ${isCursor ? `active-cursor border-l-[3px] border-blue-500 animate-pulse` : ''} text-[28px] md:text-3xl leading-loose tracking-wider ${language === 'hi' ? 'font-sans' : 'font-mono'}`}
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

  // Progress Calculation
  const activeCurriculum = language === 'en' ? EN_CURRICULUM : HI_CURRICULUM;
  const currentSections = activeCategory !== 'timetest' ? activeCurriculum[activeCategory] : [];
  
  let totalLessonsInCategory = 0;
  let completedInCategory = 0;
  
  if (activeCategory !== 'timetest') {
    currentSections.forEach(sec => {
      sec.lessons.forEach(l => {
        totalLessonsInCategory++;
        if (completedLessons.includes(l.id)) completedInCategory++;
      });
    });
  }
  const progressPercent = totalLessonsInCategory > 0 ? Math.round((completedInCategory / totalLessonsInCategory) * 100) : 0;

  // --- RENDERING VIEWS ---

  if (view === 'typing') {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-[#121212] text-slate-200'} p-4 md:p-6 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-xl transition-colors"
            >
              ⬅ Back to Lessons
            </button>
            <h2 className="text-2xl font-black text-slate-500">{currentLesson?.title}</h2>
            <div className={`flex gap-6 items-center px-6 py-3 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1e1e1e] border-slate-700'}`}>
              <div className="text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{activeCategory === 'timetest' ? 'Time Left' : 'Elapsed'}</span>
                <span className={`text-3xl font-black ${activeCategory === 'timetest' && timer <= 10 ? 'text-red-500 animate-pulse' : ''}`}>{formatTime(timer)}</span>
              </div>
              <div className="w-px h-10 bg-slate-300"></div>
              <div className="text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Live WPM</span>
                <span className="text-3xl font-black text-blue-500">{stats.netWpm}</span>
              </div>
            </div>
          </div>

          {/* 🌟 TYPING AREA (FULL BOX) 🌟 */}
          <div 
            onClick={() => { if (inputRef.current && !isFinished) inputRef.current.focus(); }}
            className={`relative border-2 rounded-2xl p-8 h-[400px] overflow-y-auto cursor-text transition-colors shadow-inner ${theme === 'light' ? 'bg-white border-slate-200 hover:border-blue-400' : 'bg-[#1e1e1e] border-slate-700 hover:border-blue-500'}`}
          >
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text resize-none"
              autoComplete="off"
              spellCheck="false"
              disabled={isFinished}
            />
            <div ref={textContainerRef} className="z-0 select-none break-words whitespace-pre-wrap font-medium">
              {renderText()}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
             <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className={`px-6 py-3 rounded-xl font-bold border transition-colors ${soundEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
             >
              {soundEnabled ? '🔊 Key Sound ON' : '🔇 Sound OFF'}
             </button>
             <button 
              onClick={() => {
                setUserInput('');
                setTimer(activeCategory === 'timetest' ? timeLimit : 0);
                setIsFinished(false);
                setIsActive(false);
                setWpmHistory([]);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1"
             >
              🔄 Restart Lesson
             </button>
          </div>

          {/* Results Modal */}
          {isFinished && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in zoom-in duration-300">
              <div className="bg-white rounded-3xl p-8 max-w-2xl w-full text-center shadow-2xl">
                <h3 className="text-4xl font-black text-slate-800 mb-2">⭐ Lesson Complete!</h3>
                <p className="text-slate-500 mb-8 font-medium">Excellent work on "{currentLesson?.title}"</p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <span className="block text-sm font-bold text-blue-500 uppercase mb-2">Speed</span>
                    <span className="text-6xl font-black text-blue-700">{stats.netWpm} <span className="text-2xl">WPM</span></span>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <span className="block text-sm font-bold text-emerald-500 uppercase mb-2">Accuracy</span>
                    <span className="text-6xl font-black text-emerald-700">{stats.accuracy}%</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => {
                      setUserInput('');
                      setTimer(activeCategory === 'timetest' ? timeLimit : 0);
                      setIsFinished(false);
                      setIsActive(false);
                      setWpmHistory([]);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-8 py-4 rounded-xl font-bold text-lg transition-colors"
                  >
                    🔄 Try Again
                  </button>
                  <button 
                    onClick={() => setView('dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-transform hover:-translate-y-1"
                  >
                    Continue to Dashboard ➡️
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f0f4f8]' : 'bg-[#121212]'} font-sans pb-10 transition-colors duration-300`}>
      
      {/* Top Navbar */}
      <div className={`${theme === 'light' ? 'bg-[#1ba1e2]' : 'bg-[#1e1e1e] border-b border-slate-700'} text-white py-4 px-6 shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tighter">typing<span className="text-white/70">.pro</span></h1>
          
          <div className="flex gap-4 items-center">
            <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
              {language === 'en' ? '🇺🇸 English Course' : '🇮🇳 Hindi Course'}
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-8">
          
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Learn to Type</h3>
            <div className="flex flex-col gap-2">
              {['beginner', 'intermediate', 'advanced'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as Category)}
                  className={`flex justify-between items-center p-4 rounded-xl font-bold text-lg transition-all ${activeCategory === cat ? 'bg-[#1ba1e2] text-white shadow-md transform scale-105' : (theme === 'light' ? 'bg-white text-slate-600 hover:bg-slate-50' : 'bg-[#1e1e1e] text-slate-300 hover:bg-[#2a2a2a]')}`}
                >
                  <span className="capitalize">{cat}</span>
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${activeCategory === cat ? 'bg-white/20' : 'bg-slate-200 text-slate-400'}`}>▶</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Typing Practice</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveCategory('timetest')}
                className={`flex justify-between items-center p-4 rounded-xl font-bold text-lg transition-all ${activeCategory === 'timetest' ? 'bg-[#1ba1e2] text-white shadow-md transform scale-105' : (theme === 'light' ? 'bg-white text-slate-600 hover:bg-slate-50' : 'bg-[#1e1e1e] text-slate-300 hover:bg-[#2a2a2a]')}`}
              >
                <span>Time Test</span>
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${activeCategory === 'timetest' ? 'bg-white/20' : 'bg-slate-200 text-slate-400'}`}>⏱️</span>
              </button>
            </div>
          </div>

        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-3">
          
          {activeCategory !== 'timetest' ? (
            <div className={`rounded-xl overflow-hidden shadow-lg ${theme === 'light' ? 'bg-[#2a9bdc]' : 'bg-[#1e1e1e] border border-slate-700'}`}>
              
              {/* Progress Bar Header */}
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-bold text-lg">{language === 'en' ? 'English Course Progress' : 'Hindi Course Progress'}</span>
                  <span className="text-white font-bold text-lg">{progressPercent}%</span>
                </div>
                <div className="w-full bg-black/20 h-6 rounded-full overflow-hidden relative">
                  <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {/* Lesson Sections */}
              <div className="p-6 space-y-8">
                {currentSections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h2 className="text-white text-2xl font-black mb-4">{section.title}</h2>
                    <div className="space-y-3">
                      {section.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        return (
                          <div key={lesson.id} className={`flex justify-between items-center p-5 rounded-xl transition-transform hover:scale-[1.01] ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-[#2a2a2a]'}`}>
                            <div className="flex items-center gap-4">
                              {isCompleted ? (
                                <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg shadow-inner">✓</span>
                              ) : (
                                <span className="w-10 h-10 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold text-sm"></span>
                              )}
                              <span className={`font-black text-xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{lesson.title}</span>
                            </div>
                            <button 
                              onClick={() => startLesson(lesson)}
                              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-lg transition-transform hover:-translate-y-1 ${isCompleted ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-amber-400 text-amber-900 hover:bg-amber-500 shadow-md'}`}
                            >
                              ▶ Start
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            
            /* TIME TEST DASHBOARD */
            <div className={`rounded-2xl shadow-xl p-10 ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-slate-700'}`}>
               <h2 className={`text-4xl font-black mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>Time Trials ⏱️</h2>
               <p className={`text-lg mb-10 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Test your typing speed with random dictionary words. Ideal for typing exam preparation (SSC, Railway).</p>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[1, 3, 5].map(mins => (
                   <div key={mins} className={`border-2 rounded-3xl p-8 text-center transition-all hover:border-blue-500 hover:shadow-lg ${theme === 'light' ? 'border-slate-200' : 'border-slate-700 bg-[#2a2a2a]'}`}>
                     <div className="text-6xl mb-6">⏲️</div>
                     <h3 className={`text-3xl font-black mb-3 ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{mins} Minute</h3>
                     <p className={`text-sm mb-8 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Short bursts of random words to check your WPM.</p>
                     <button onClick={() => startTimeTest(mins)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-transform hover:-translate-y-1 text-lg">
                       Start Test
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}