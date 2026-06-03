"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function TimerTool() {
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'timer'>('stopwatch');

  // ==========================================
  // ⏱️ STOPWATCH STATE
  // ==========================================
  const [swTime, setSwTime] = useState(0);
  const [swIsRunning, setSwIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swStartTimeRef = useRef<number>(0);
  const swIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // ⌛ COUNTDOWN TIMER STATE
  // ==========================================
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('10');
  const [seconds, setSeconds] = useState('00');
  const [timerTime, setTimerTime] = useState(0); 
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [timerIsFinished, setTimerIsFinished] = useState(false);
  const timerEndTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // 🔊 WEB AUDIO API ALARM (3 BEEPS)
  // ==========================================
  const playAlarm = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 800; // Beep pitch
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }, i * 600);
    }
  };

  // ==========================================
  // ⏱️ STOPWATCH LOGIC (Background Safe)
  // ==========================================
  const startStopwatch = () => {
    if (!swIsRunning) {
      setSwIsRunning(true);
      swStartTimeRef.current = Date.now() - swTime;
      swIntervalRef.current = setInterval(() => {
        setSwTime(Date.now() - swStartTimeRef.current);
      }, 10);
    } else {
      setSwIsRunning(false);
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    }
  };

  const resetStopwatch = () => {
    setSwIsRunning(false);
    if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    setSwTime(0);
    setLaps([]);
  };

  const addLap = () => {
    if (swIsRunning) {
      setLaps([swTime, ...laps]);
    }
  };

  // ==========================================
  // ⌛ COUNTDOWN TIMER LOGIC (Background Safe)
  // ==========================================
  const startTimer = () => {
    if (!timerIsRunning && !timerIsFinished) {
      let totalMs = timerTime;
      if (totalMs === 0) {
        totalMs = (parseInt(hours || '0') * 3600 + parseInt(minutes || '0') * 60 + parseInt(seconds || '0')) * 1000;
        if (totalMs === 0) return;
      }
      
      setTimerIsRunning(true);
      setTimerTime(totalMs);
      timerEndTimeRef.current = Date.now() + totalMs;

      timerIntervalRef.current = setInterval(() => {
        const remaining = timerEndTimeRef.current - Date.now();
        if (remaining <= 0) {
          clearInterval(timerIntervalRef.current as NodeJS.Timeout);
          setTimerTime(0);
          setTimerIsRunning(false);
          setTimerIsFinished(true);
          playAlarm();
        } else {
          setTimerTime(remaining);
        }
      }, 50);
    } else {
      setTimerIsRunning(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resetTimer = () => {
    setTimerIsRunning(false);
    setTimerIsFinished(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerTime(0);
  };

  const formatTime = (ms: number, showMs = true) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);

    const pad = (num: number) => num.toString().padStart(2, '0');
    
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}${showMs ? `.${pad(millis)}` : ''}`;
    return `${pad(m)}:${pad(s)}${showMs ? `.${pad(millis)}` : ''}`;
  };

  useEffect(() => {
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
      
      {/* TAB SWITCHER */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button 
          className={`flex-1 py-4 text-sm sm:text-base font-semibold transition ${activeTab === 'stopwatch' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
          onClick={() => setActiveTab('stopwatch')}
        >
          ⏱ Stopwatch
        </button>
        <button 
          className={`flex-1 py-4 text-sm sm:text-base font-semibold transition ${activeTab === 'timer' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
          onClick={() => setActiveTab('timer')}
        >
          ⌛ Countdown Timer
        </button>
      </div>

      <div className="p-8 sm:p-12 flex flex-col items-center">
        
        {/* ================= STOPWATCH UI ================= */}
        {activeTab === 'stopwatch' && (
          <div className="w-full flex flex-col items-center">
            <div className="text-6xl sm:text-7xl font-mono font-bold text-gray-800 dark:text-gray-100 tracking-wider mb-10">
              {formatTime(swTime)}
            </div>
            
            <div className="flex gap-3 sm:gap-4 mb-8">
              <button onClick={startStopwatch} className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition">
                {swIsRunning ? '⏸ Pause' : (swTime > 0 ? '▶ Resume' : '▶ Start')}
              </button>
              <button onClick={addLap} disabled={!swIsRunning} className="px-6 sm:px-8 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg transition disabled:opacity-50">
                🚩 Lap
              </button>
              <button onClick={resetStopwatch} className="px-6 sm:px-8 py-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-lg transition">
                ↻ Reset
              </button>
            </div>

            {/* LAPS LIST */}
            {laps.length > 0 && (
              <div className="w-full max-w-md h-48 overflow-y-auto border border-gray-200 dark:border-zinc-700 rounded-lg p-4 bg-gray-50 dark:bg-zinc-800/50">
                {laps.map((lap, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-zinc-700 last:border-0 font-mono text-lg text-gray-700 dark:text-gray-300">
                    <span className="text-gray-400 dark:text-gray-500">Lap {laps.length - index}</span>
                    <span className="font-bold">{formatTime(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= COUNTDOWN TIMER UI ================= */}
        {activeTab === 'timer' && (
          <div className="w-full flex flex-col items-center">
            
            {timerIsFinished ? (
              <div className="text-4xl sm:text-5xl font-bold text-red-600 dark:text-red-400 mb-10 animate-pulse bg-red-50 dark:bg-red-500/10 py-6 px-12 rounded-2xl border-2 border-red-500 dark:border-red-500/50">
                ⏰ Time's Up!
              </div>
            ) : (
              <div className={`mb-10 transition-colors duration-300 ${timerTime <= 10000 && timerTime > 0 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-800 dark:text-gray-100'}`}>
                {timerTime > 0 || timerIsRunning ? (
                  <div className="text-6xl sm:text-7xl font-mono font-bold tracking-wider">
                    {formatTime(timerTime, false)}
                  </div>
                ) : (
                  <div className="flex gap-4 text-3xl font-mono">
                    <div className="flex flex-col items-center">
                      <input type="number" value={hours} onChange={e => setHours(e.target.value)} className="w-20 sm:w-24 p-3 bg-transparent border-2 border-gray-300 dark:border-zinc-700 rounded-xl text-center focus:border-blue-500 outline-none text-gray-800 dark:text-gray-100" min="0" max="99" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-sans mt-2">Hours</span>
                    </div>
                    <span className="mt-4 font-bold text-gray-800 dark:text-gray-100">:</span>
                    <div className="flex flex-col items-center">
                      <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} className="w-20 sm:w-24 p-3 bg-transparent border-2 border-gray-300 dark:border-zinc-700 rounded-xl text-center focus:border-blue-500 outline-none text-gray-800 dark:text-gray-100" min="0" max="59" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-sans mt-2">Minutes</span>
                    </div>
                    <span className="mt-4 font-bold text-gray-800 dark:text-gray-100">:</span>
                    <div className="flex flex-col items-center">
                      <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} className="w-20 sm:w-24 p-3 bg-transparent border-2 border-gray-300 dark:border-zinc-700 rounded-xl text-center focus:border-blue-500 outline-none text-gray-800 dark:text-gray-100" min="0" max="59" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-sans mt-2">Seconds</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 sm:gap-4">
              {!timerIsFinished && (
                <button onClick={startTimer} className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition">
                  {timerIsRunning ? '⏸ Pause' : (timerTime > 0 ? '▶ Resume' : '▶ Start')}
                </button>
              )}
              <button onClick={resetTimer} className="px-6 sm:px-8 py-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-lg transition">
                ↻ Reset
              </button>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}