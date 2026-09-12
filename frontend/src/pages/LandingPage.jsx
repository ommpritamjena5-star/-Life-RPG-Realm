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
  RotateCw,
} from 'lucide-react';
import { sound } from '../utils/soundEngine';
import { Hero3DModel } from '../components/Hero3DModel';
import { ThreeCanvasBackground } from '../components/ThreeCanvasBackground';
import { CardTilt } from '../components/CardTilt';

export const LandingPage = ({ onStartJourney, onLogin }) => {
  const [demoQuestCompleted, setDemoQuestCompleted] = useState(false);
  const [demoXp, setDemoXp] = useState(65);
  const [demoGold, setDemoGold] = useState(120);
  const [activeHeroClass, setActiveHeroClass] = useState('Warrior');

  const classDescriptions = {
    Warrior: 'Vanguard Titan wielding heavy plate armor, greatsword, and tower shield.',
    Mage: 'Arcane Archmage channeling glowing crystal staffs and orbital spellcraft.',
    Rogue: 'Shadow Phantom specializing in stealth agility and dual shadow daggers.',
    Paladin: 'Solar Guardian protected by radiant plate, warhammer, and a solar halo.',
  };

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
      title: 'Quests & Habits',
      tag: 'XP ENGINE',
      desc: 'Transform mundane daily chores, coding tasks, and workouts into rewarding RPG quests with XP & Gold.',
      color: 'from-purple-500 via-indigo-500 to-cyan-500',
      borderColor: 'border-purple-500/30',
      borderHover: 'border-purple-400',
      badgeBg: 'bg-purple-950/80 text-purple-300 border border-purple-500/40',
      glowShadow: 'hover:shadow-purple-500/25',
      widgetBg: 'bg-purple-950/40 border border-purple-500/30',
      widgetLeft: '⚔️ S-Rank Bounty',
      widgetRight: '+150 XP • 45 Gold',
      widgetRightColor: 'text-amber-300',
    },
    {
      icon: Calendar,
      title: 'Daily Planning',
      tag: 'TIME-BLOCKING',
      desc: 'Time-block your day from wake-up to sleep with intelligent conflict & overlap detection alerts.',
      color: 'from-cyan-400 via-blue-500 to-indigo-600',
      borderColor: 'border-cyan-500/30',
      borderHover: 'border-cyan-400',
      badgeBg: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40',
      glowShadow: 'hover:shadow-cyan-500/25',
      widgetBg: 'bg-cyan-950/40 border border-cyan-500/30',
      widgetLeft: '🟢 Smart Sync',
      widgetRight: 'Zero Overlaps',
      widgetRightColor: 'text-emerald-300',
    },
    {
      icon: Timer,
      title: 'Focus Sessions',
      tag: 'NEURO-FLOW',
      desc: 'Break 4-hour gargantuan tasks into 45-minute sub-sessions with immersive ambient rain sounds.',
      color: 'from-amber-400 via-orange-500 to-red-500',
      borderColor: 'border-amber-500/30',
      borderHover: 'border-amber-400',
      badgeBg: 'bg-amber-950/80 text-amber-300 border border-amber-500/40',
      glowShadow: 'hover:shadow-amber-500/25',
      widgetBg: 'bg-amber-950/40 border border-amber-500/30',
      widgetLeft: '🎧 Rain Ambience',
      widgetRight: '45m Burst Flow',
      widgetRightColor: 'text-amber-300',
    },
    {
      icon: Flame,
      title: 'Active Streaks',
      tag: 'MOMENTUM',
      desc: 'Build unbreakable momentum. Shield your streak with Aegis items and conquer consistency.',
      color: 'from-orange-500 via-red-500 to-rose-600',
      borderColor: 'border-orange-500/30',
      borderHover: 'border-orange-400',
      badgeBg: 'bg-rose-950/80 text-orange-300 border border-orange-500/40',
      glowShadow: 'hover:shadow-orange-500/25',
      widgetBg: 'bg-orange-950/40 border border-orange-500/30',
      widgetLeft: '🔥 14-Day Streak',
      widgetRight: '1.5x XP Boost',
      widgetRightColor: 'text-orange-300',
    },
    {
      icon: BarChart3,
      title: 'Performance Engine',
      tag: 'ANALYTICS',
      desc: 'Get a daily performance score and weekly analytics that intelligently evaluate your efforts.',
      color: 'from-emerald-400 via-teal-500 to-cyan-500',
      borderColor: 'border-emerald-500/30',
      borderHover: 'border-emerald-400',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40',
      glowShadow: 'hover:shadow-emerald-500/25',
      widgetBg: 'bg-emerald-950/40 border border-emerald-500/30',
      widgetLeft: '⚡ Daily Rating',
      widgetRight: '94% Efficiency',
      widgetRightColor: 'text-emerald-300',
    },
    {
      icon: Trophy,
      title: 'Global Leaderboards',
      tag: 'HALL OF FAME',
      desc: 'Climb from Novice to Ascended Archmage and compete on the Hall of Heroes global leaderboard.',
      color: 'from-yellow-300 via-amber-400 to-yellow-600',
      borderColor: 'border-yellow-500/30',
      borderHover: 'border-yellow-400',
      badgeBg: 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/40',
      glowShadow: 'hover:shadow-yellow-500/25',
      widgetBg: 'bg-yellow-950/40 border border-yellow-500/30',
      widgetLeft: '👑 Rank #1 Tier',
      widgetRight: 'Diamond League',
      widgetRightColor: 'text-yellow-300',
    },
    {
      icon: Coins,
      title: 'Rewards & Economy',
      tag: 'BAZAAR',
      desc: 'Earn Gold to purchase virtual power-ups or redeem real-world rewards like guilt-free gaming.',
      color: 'from-amber-300 via-yellow-400 to-amber-600',
      borderColor: 'border-amber-400/30',
      borderHover: 'border-amber-300',
      badgeBg: 'bg-amber-950/80 text-amber-300 border border-amber-400/40',
      glowShadow: 'hover:shadow-amber-400/25',
      widgetBg: 'bg-amber-950/40 border border-amber-400/30',
      widgetLeft: '☕ Real Reward',
      widgetRight: '1,250 Gold Pouch',
      widgetRightColor: 'text-amber-300',
    },
    {
      icon: User,
      title: 'Character Progression',
      tag: '6-STAT MATRIX',
      desc: 'Level up 6 unique RPG attributes (Strength, Intellect, Vitality, Agility, Discipline, Charisma).',
      color: 'from-violet-500 via-purple-500 to-pink-500',
      borderColor: 'border-purple-500/30',
      borderHover: 'border-purple-400',
      badgeBg: 'bg-violet-950/80 text-purple-300 border border-purple-500/40',
      glowShadow: 'hover:shadow-purple-500/25',
      widgetBg: 'bg-violet-950/40 border border-purple-500/30',
      widgetLeft: '⚔️ STR • 🔮 INT',
      widgetRight: 'Lv. 14 Hero',
      widgetRightColor: 'text-purple-300',
    },
  ];

  return (
    <div className="min-h-screen rpg-background text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* 3D Interactive Three.js Starfield Background */}
      <ThreeCanvasBackground density="high" interactive={true} />

      {/* Header / Nav */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-2xl">
              ⚔️
            </div>
          </div>
          <div>
            <span className="font-rpg font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-200 to-cyan-300">
              LIFE RPG
            </span>
            <span className="block text-[10px] text-purple-400 font-bold uppercase tracking-widest">
              Gamified Life OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onLogin();
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onStartJourney();
            }}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-rpg font-bold tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Awaken Hero
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-6 shadow-md shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              The Next-Gen Gamified Operating System
            </motion.div>

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

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Complete real-world quests. Master circadian time blocks. Log deep 45-minute focus sessions. Build character attributes and conquer procrastination.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => {
                  sound.playClick();
                  onStartJourney();
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-rpg font-extrabold text-sm tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer hover:scale-105"
              >
                <span>START YOUR JOURNEY</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onLogin();
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-semibold text-xs text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔑 Sign In to Realm</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column: 3D Human-Like Character Model & Class Switcher */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <CardTilt maxAngle={12} className="w-full">
              <div className="rpg-panel-glow rounded-3xl p-6 sm:p-7 border-2 border-purple-500/40 text-center relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-rpg font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 3D Hero Model
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Drag 360°
                  </span>
                </div>

                {/* Class Selector Tabs */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {['Warrior', 'Mage', 'Rogue', 'Paladin'].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => {
                        sound.playClick();
                        setActiveHeroClass(cls);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeHeroClass === cls
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-purple-500/20'
                      }`}
                    >
                      {cls === 'Warrior' && '⚔️ '}
                      {cls === 'Mage' && '🔮 '}
                      {cls === 'Rogue' && '🗡️ '}
                      {cls === 'Paladin' && '🛡️ '}
                      {cls}
                    </button>
                  ))}
                </div>

                {/* 3D Humanoid Model */}
                <div className="my-1 flex justify-center">
                  <Hero3DModel characterClass={activeHeroClass} size={270} interactive={true} />
                </div>

                {/* Class Description */}
                <p className="text-xs text-slate-300 mt-2 font-medium px-2">
                  {classDescriptions[activeHeroClass]}
                </p>
              </div>
            </CardTilt>
          </div>
        </div>

        {/* Live Interactive Quest Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-3xl mx-auto rpg-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/40 relative overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-rpg font-bold tracking-wider text-amber-400 uppercase">
                ⚡ Try The Dopamine Feedback Loop
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-purple-300">XP: {demoXp}%</span>
              <span className="text-amber-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {demoGold} Gold
              </span>
            </div>
          </div>

          <div
            onClick={handleDemoComplete}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              demoQuestCompleted
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/90 border-purple-500/30 hover:border-amber-400/60 hover:bg-slate-800/90'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  demoQuestCompleted
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'border-2 border-purple-400/60 text-transparent hover:border-amber-400'
                }`}
              >
                {demoQuestCompleted ? <CheckCircle2 className="w-5 h-5" /> : '✓'}
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-100">
                  Daily Quest: Forge Your First Real-Life Habit
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {demoQuestCompleted
                    ? '🎉 Quest Complete! +50 XP & +25 Gold awarded to Treasury'
                    : 'Click to complete and experience the tactile dopamine chime'}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end text-xs font-black">
              <span className="text-purple-300">+50 XP</span>
              <span className="text-amber-400">+25 Gold</span>
            </div>
          </div>
        </motion.div>

        {/* Features Grid with 3D Tilt and Glowing Cyber-Fantasy Aesthetics */}
        <section className="mt-28 relative">
          {/* Ambient section backdrop glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[70%] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-14 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[11px] font-rpg font-bold tracking-widest uppercase mb-3 shadow-lg shadow-purple-900/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Forged For Real-World Mastery</span>
            </div>
            <h2 className="font-rpg text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-slate-100 to-cyan-200 uppercase tracking-wide drop-shadow-md">
              Your Complete RPG Arsenal
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Every system is engineered to eliminate procrastination, reward consistency, and turn everyday ambitions into legendary achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {features.map((f, i) => (
              <CardTilt key={i} maxAngle={12} className="h-full">
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  onMouseEnter={() => sound.playClick()}
                  className={`h-full relative group rounded-3xl p-6 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#080914] border ${f.borderColor || 'border-purple-500/30'} hover:${f.borderHover || 'border-amber-400/70'} transition-all duration-300 shadow-xl hover:shadow-2xl ${f.glowShadow || 'hover:shadow-purple-500/20'} flex flex-col justify-between overflow-hidden backdrop-blur-xl`}
                >
                  {/* Internal ambient corner glow */}
                  <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${f.color} opacity-10 group-hover:opacity-25 rounded-full blur-2xl transition-opacity pointer-events-none`} />

                  {/* Top Bar: Icon + Category Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${f.color} p-3 text-slate-950 flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                        <f.icon className="w-7 h-7 stroke-[2.2]" />
                      </div>
                      <span className={`text-[10px] font-rpg font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${f.badgeBg || 'bg-purple-950/70 text-purple-300 border border-purple-500/30'} shadow-sm`}>
                        {f.tag}
                      </span>
                    </div>

                    <h3 className="font-rpg font-black text-lg text-slate-100 group-hover:text-amber-300 transition-colors tracking-wide">
                      {f.title}
                    </h3>
                    <p className="mt-2.5 text-xs text-slate-400 leading-relaxed font-medium">
                      {f.desc}
                    </p>
                  </div>

                  {/* Bottom Micro-Widget / Gamified Live Metric Badge */}
                  <div className="mt-6 pt-3.5 border-t border-slate-800/80">
                    <div className={`p-2 rounded-xl ${f.widgetBg || 'bg-slate-900/80 border border-purple-500/20'} flex items-center justify-between text-[11px] font-bold`}>
                      <span className="text-slate-400 flex items-center gap-1.5">
                        {f.widgetLeft}
                      </span>
                      <span className={`${f.widgetRightColor || 'text-amber-300'} font-black`}>
                        {f.widgetRight}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </CardTilt>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/10 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Life RPG. Turn your ambitions into legendary achievements.</p>
      </footer>
    </div>
  );
};
