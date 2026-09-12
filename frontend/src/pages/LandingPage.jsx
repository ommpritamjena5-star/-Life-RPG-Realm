import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sword,
  Calendar,
  Timer,
  Flame,
  BarChart3,
  Trophy,
  Coins,
  User,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../utils/soundEngine';

export const LandingPage = ({ onStartJourney, onLogin }) => {
  const [demoQuestCompleted, setDemoQuestCompleted] = useState(false);
  const [demoXp, setDemoXp] = useState(65);
  const [demoGold, setDemoGold] = useState(120);

  const handleDemoComplete = () => {
    if (demoQuestCompleted) return;
    sound.playQuestComplete();
    setDemoQuestCompleted(true);
    setDemoXp((prev) => prev + 50);
    setDemoGold((prev) => prev + 25);
  };

  const features = [
    {
      icon: Sword,
      title: '⚔️ Quests & Habits',
      desc: 'Transform chores, study sessions, and workouts into rewarding RPG quests with XP & Gold.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Calendar,
      title: '📅 Daily Planning',
      desc: 'Time-block your day from wake-up to sleep with intelligent conflict & overlap detection.',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Timer,
      title: '⏱️ Focus Sessions',
      desc: 'Break 4-hour monumental tasks into 45-minute sub-sessions with immersive ambient sounds.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Flame,
      title: '🔥 Active Streaks',
      desc: 'Build unbreakable momentum. Shield your streak with Aegis items and conquer consistency.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: BarChart3,
      title: '📊 Performance Engine',
      desc: 'Get a daily performance score and weekly analytics that intelligently evaluate your efforts.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Trophy,
      title: '🏆 Global Leaderboards',
      desc: 'Climb from Novice to Ascended Archmage and compete on the Hall of Heroes leaderboard.',
      color: 'from-yellow-400 to-amber-600',
    },
    {
      icon: Coins,
      title: '💰 Rewards & Economy',
      desc: 'Earn Gold to purchase virtual power-ups or redeem real-world rewards like guilt-free gaming.',
      color: 'from-amber-400 to-yellow-500',
    },
    {
      icon: User,
      title: '👤 Character Progression',
      desc: 'Level up 6 unique RPG attributes (Strength, Intellect, Vitality, Agility, Discipline, Charisma).',
      color: 'from-violet-500 to-purple-700',
    },
  ];

  return (
    <div className="min-h-screen rpg-background text-slate-100 flex flex-col justify-between">
      {/* Header / Nav */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-xl">
              ⚔️
            </div>
          </div>
          <span className="font-rpg font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-200 to-cyan-300">
            LIFE RPG
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onLogin();
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onStartJourney();
            }}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-rpg font-bold tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-6 shadow-sm shadow-purple-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            The Ultimate Gamified Life Operating System
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="font-rpg text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight uppercase"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400">
              TURN YOUR LIFE
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 text-glow-purple">
              INTO AN RPG
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto"
          >
            Complete real-world quests. Earn XP. Build your character stats. Master your daily schedule. Become better every single day.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => {
                sound.playClick();
                onStartJourney();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-rpg font-extrabold text-base tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>START YOUR JOURNEY</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onLogin();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-all"
            >
              Existing Hero Login
            </button>
          </motion.div>
        </div>

        {/* Live Interactive Demo Quest Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-2xl mx-auto rpg-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/40 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-rpg font-bold tracking-wider text-amber-400 uppercase">
                ⚡ Try The Interactive Experience
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-purple-300">XP: {demoXp}%</span>
              <span className="text-amber-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {demoGold}
              </span>
            </div>
          </div>

          <div
            onClick={handleDemoComplete}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              demoQuestCompleted
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-900/80 border-purple-500/30 hover:border-amber-400/60 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  demoQuestCompleted
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'border-2 border-purple-400/60 text-transparent'
                }`}
              >
                {demoQuestCompleted ? <CheckCircle2 className="w-5 h-5" /> : '✓'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  Daily Quest: Forge Your First Real-Life Habit
                </h4>
                <p className="text-xs text-slate-400">
                  {demoQuestCompleted ? '🎉 Quest Complete! +50 XP, +25 Gold awarded' : 'Click to complete and experience the dopamine loop'}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end text-xs font-bold">
              <span className="text-purple-300">+50 XP</span>
              <span className="text-amber-400">+25 Gold</span>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <section className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-rpg text-2xl sm:text-4xl font-bold text-slate-100 uppercase tracking-wide">
              Forged For Real-World Mastery
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Every tool in your arsenal to conquer procrastination and master your daily life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="rpg-panel rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} p-2 text-slate-950 flex items-center justify-center mb-4 shadow-md`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-100">{f.title}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/10 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Life RPG. Turn your ambitions into legendary achievements.</p>
      </footer>
    </div>
  );
};
