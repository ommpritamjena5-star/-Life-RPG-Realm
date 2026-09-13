import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  Target,
  Timer,
  Coffee,
  Trophy,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const OnboardingModal = ({ isOpen, onComplete }) => {
  const { user, token, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [characterName, setCharacterName] = useState(user?.name || 'Shadow Knight');
  const [characterClass, setCharacterClass] = useState(user?.characterClass || 'Warrior');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [mainGoals, setMainGoals] = useState('Master Full-Stack Dev, Daily Gym, Read 20 pages');
  const [defaultSessionDuration, setDefaultSessionDuration] = useState(45);
  const [breakDuration, setBreakDuration] = useState(15);
  const [categories, setCategories] = useState(['Coding', 'Workout', 'Reading']);
  const [leaderboardVisibility, setLeaderboardVisibility] = useState(true);

  if (!isOpen) return null;

  const totalSteps = 4;

  const toggleCategory = (cat) => {
    sound.playClick();
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    sound.playQuestComplete();

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          characterName,
          characterClass,
          wakeUpTime,
          sleepTime,
          mainGoals,
          defaultSessionDuration: Number(defaultSessionDuration),
          breakDuration: Number(breakDuration),
          categories,
          leaderboardVisibility,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        onComplete();
      }
    } catch (e) {
      console.error('Onboarding submit error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-lg w-full rpg-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-2xl overflow-hidden"
        >
          {/* Top Progress Indicator & Brand */}
          <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Life RPG Crest" className="w-11 h-11 rounded-2xl border-2 border-cyan-400/60 shadow-md shadow-cyan-500/30 object-cover" />
              <div>
                <span className="text-xs font-bold text-cyan-300 font-rpg uppercase tracking-widest block">
                  HERO AWAKENING
                </span>
                <span className="text-[10px] text-amber-400 font-bold tracking-wider">
                  Step {step} of {totalSteps}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s === step
                        ? 'w-6 bg-amber-400'
                        : s < step
                        ? 'w-3 bg-cyan-500'
                        : 'w-3 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Skip ➔
              </button>
            </div>
          </div>

          {/* STEP 1: Hero Identity */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-rpg text-xl font-bold text-slate-100">Name Your Hero & Archetype</h3>
                <p className="text-xs text-slate-400 mt-1">Every legend begins with an identity.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Character Name</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Life Goal</label>
                <textarea
                  rows={2}
                  value={mainGoals}
                  onChange={(e) => setMainGoals(e.target.value)}
                  placeholder="e.g. Master React, Build my dream project, Gym 4x a week..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: Sleep & Circadian Schedule */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-rpg text-xl font-bold text-slate-100">Circadian Battle Rhythm</h3>
                <p className="text-xs text-slate-400 mt-1">Configure your daily operational hours for time-blocking.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Wake-Up Time
                  </label>
                  <input
                    type="time"
                    value={wakeUpTime}
                    onChange={(e) => setWakeUpTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Bed Time
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Deep Focus Defaults */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-rpg text-xl font-bold text-slate-100">Focus Sub-Session Tuning</h3>
                <p className="text-xs text-slate-400 mt-1">Break big quests into calibrated focus sessions.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-cyan-400" /> Focus Session (mins)
                  </label>
                  <select
                    value={defaultSessionDuration}
                    onChange={(e) => setDefaultSessionDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value={25}>25 minutes (Pomodoro)</option>
                    <option value={45}>45 minutes (Optimal RPG)</option>
                    <option value={60}>60 minutes (Deep Dive)</option>
                    <option value={90}>90 minutes (Ultradian)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-emerald-400" /> Break Time (mins)
                  </label>
                  <select
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Categories & Leaderboard */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-rpg text-xl font-bold text-slate-100">Quest Domains & Arena</h3>
                <p className="text-xs text-slate-400 mt-1">Select your primary fields of mastery.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Active Categories</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Coding', 'Workout', 'Reading', 'Meditation', 'Chores', 'Social'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                        categories.includes(cat)
                          ? 'bg-purple-600/40 border border-amber-400 text-amber-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard toggle */}
              <div
                onClick={() => {
                  sound.playClick();
                  setLeaderboardVisibility(!leaderboardVisibility);
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20 flex items-center justify-between cursor-pointer hover:border-purple-500/40"
              >
                <div className="flex items-center gap-2 text-xs">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-200 font-medium">Appear on Global Leaderboard</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    leaderboardVisibility ? 'bg-amber-500 text-slate-950 font-bold' : 'border border-slate-700'
                  }`}
                >
                  {leaderboardVisibility && '✓'}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-purple-500/20">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStep(step - 1);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStep(step + 1);
                }}
                className="px-6 py-2.5 rounded-xl font-rpg font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl font-rpg font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Initializing Realm...' : 'ENTER YOUR LIFE RPG'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
