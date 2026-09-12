import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  Coins,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const FocusTimerPage = () => {
  const { user, token, triggerProgressionEvent } = useAuth();
  
  // Timer session configurations
  const [taskTitle, setTaskTitle] = useState('Study JavaScript & DSA');
  const [category, setCategory] = useState('Coding');
  const [totalHours, setTotalHours] = useState(4); // e.g. 4 hours total
  const [subSessionDurationMins, setSubSessionDurationMins] = useState(45); // 45 mins each
  const [currentSubSession, setCurrentSubSession] = useState(1);

  const totalSubSessions = Math.max(1, Math.round((totalHours * 60) / subSessionDurationMins));

  // Running Timer state
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [ambientActive, setAmbientActive] = useState(false);
  const [completedSessionsToday, setCompletedSessionsToday] = useState([]);

  const timerRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(subSessionDurationMins * 60);
  }, [subSessionDurationMins]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isBreak, currentSubSession]);

  const handleSessionEnd = async () => {
    setIsRunning(false);
    sound.playTimerDing();
    sound.playQuestComplete();

    if (!isBreak) {
      // Award XP & Gold for completing focus sub-session
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: `${taskTitle} (Part ${currentSubSession}/${totalSubSessions})`,
            category,
            durationMinutes: subSessionDurationMins,
            subSessionNumber: currentSubSession,
            totalSubSessions,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          triggerProgressionEvent(data.progression);
          setCompletedSessionsToday((prev) => [data.session, ...prev]);
        }
      } catch (e) {
        console.error('Session submit error:', e);
      }

      // Switch to break
      setIsBreak(true);
      setSecondsLeft(10 * 60); // 10 min break
    } else {
      // Break over, advance sub-session
      setIsBreak(false);
      setCurrentSubSession((prev) => Math.min(totalSubSessions, prev + 1));
      setSecondsLeft(subSessionDurationMins * 60);
    }
  };

  const toggleTimer = () => {
    sound.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    sound.playClick();
    setIsRunning(false);
    setSecondsLeft(isBreak ? 10 * 60 : subSessionDurationMins * 60);
  };

  const toggleAmbientSound = () => {
    const next = !ambientActive;
    setAmbientActive(next);
    sound.toggleAmbient(next);
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const totalSeconds = isBreak ? 10 * 60 : subSessionDurationMins * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
            <Timer className="w-7 h-7 text-amber-400" />
            RPG Focus & Sub-Sessions Timer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Divide large 4-hour tasks into hyper-focused 45-minute sub-sessions and earn continuous XP.
          </p>
        </div>

        {/* Ambient Soundscape Button */}
        <button
          onClick={toggleAmbientSound}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            ambientActive
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
              : 'bg-slate-900 text-slate-400 border border-purple-500/30 hover:text-white'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>{ambientActive ? 'Ambient Rain: ON' : 'Ambient Rain: OFF'}</span>
        </button>
      </div>

      {/* Main Timer Display Card */}
      <div className="rpg-panel-glow rounded-3xl p-8 sm:p-12 text-center border border-purple-500/40 relative overflow-hidden">
        <div className="max-w-xl mx-auto">
          {/* Sub-Session Progress Tracker */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-bold font-rpg uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isBreak ? '☕ RECOVERY BREAK' : `SUB-SESSION ${currentSubSession} OF ${totalSubSessions}`}
          </div>

          {/* Task Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Focus Task Target</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Total Duration & Split</label>
              <div className="flex gap-2">
                <select
                  value={totalHours}
                  onChange={(e) => setTotalHours(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                >
                  <option value={1}>1 Hour Total</option>
                  <option value={2}>2 Hours Total</option>
                  <option value={3}>3 Hours Total</option>
                  <option value={4}>4 Hours Total</option>
                </select>
                <select
                  value={subSessionDurationMins}
                  onChange={(e) => setSubSessionDurationMins(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                >
                  <option value={25}>25m Sessions</option>
                  <option value={45}>45m Sessions</option>
                  <option value={60}>60m Sessions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Big Circular Styled Countdown */}
          <div className="my-6 flex justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center p-4 bg-slate-950/80 border-4 border-purple-500/20 shadow-2xl shadow-purple-500/20">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-800/40"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-amber-400 transition-all duration-1000"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="font-mono text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-amber-200 to-amber-400">
                  {formatTime(secondsLeft)}
                </div>
                <div className="text-xs font-semibold text-purple-300 mt-2 uppercase tracking-widest">
                  {isRunning ? '⚔️ Hyperfocus Engaged' : 'Timer Paused'}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs font-bold text-amber-300">
                  <span>+{Math.round(subSessionDurationMins * 1.2)} XP</span>
                  <span>•</span>
                  <span>+{Math.round(subSessionDurationMins * 0.5)} Gold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-slate-900 border border-purple-500/30 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Sub-Session"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className="px-8 py-3.5 rounded-2xl font-rpg font-bold text-sm tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 shadow-xl shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
              <span>{isRunning ? 'PAUSE SESSION' : 'START SUB-SESSION'}</span>
            </button>

            <button
              onClick={handleSessionEnd}
              className="p-3 rounded-2xl bg-slate-900 border border-purple-500/30 text-purple-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title="Complete Sub-Session Early"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
