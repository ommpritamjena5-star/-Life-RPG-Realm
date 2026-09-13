import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword,
  Calendar,
  Timer,
  User,
  ShoppingBag,
  Trophy,
  BarChart3,
  Settings,
  Volume2,
  VolumeX,
  Share2,
  LogOut,
  Flame,
  Coins,
  Sparkles,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const Navbar = ({ activeTab, setActiveTab, onOpenReport }) => {
  const { user, logout } = useAuth();
  const [soundOn, setSoundOn] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.setEnabled(next);
    if (next) sound.playClick();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'quests', label: 'Quests', icon: Sword },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'character', label: 'Hero Sheet', icon: User },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'shop', label: 'Bazaar', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const xpPercent = Math.min(100, Math.round((user.currentXp / (user.xpToNextLevel || 100)) * 100));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/25 bg-[#07080e]/95 backdrop-blur-2xl shadow-xl shadow-black/60">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-18 gap-2 lg:gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => {
              sound.playClick();
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0 select-none py-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/30 group-hover:scale-108 transition-all overflow-hidden">
              <img
                src="/logo.png"
                alt="Life RPG Logo"
                className="w-full h-full object-cover rounded-[14px] bg-slate-950"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-rpg font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-amber-300 drop-shadow-sm">
                LIFE RPG
              </span>
              <span className="block text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                Hero Operating System
              </span>
            </div>
          </div>

          {/* Desktop Nav Links (Scrollable HUD strip so it never breaks text) */}
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 rounded-2xl bg-slate-950/70 border border-purple-500/20 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-rpg font-bold tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-amber-300 border border-amber-400/50 shadow-md shadow-purple-500/30 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Character Stats HUD (XP, Gold, Streak, Tools) */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-950/60 border border-orange-500/40 text-orange-300 text-xs font-black shadow-sm shadow-orange-500/20"
              title="Consecutive Active Days"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-pulse fill-orange-400" />
              <span>{user.streak || 1}d</span>
            </div>

            {/* Gold Treasury Counter */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('shop');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-black hover:bg-amber-900/60 hover:border-amber-400 transition-all cursor-pointer shadow-sm shadow-amber-500/20"
              title="Treasury Vault (Click to visit Bazaar)"
            >
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              <span>{user.gold || 0}</span>
            </button>

            {/* Level & XP Mini Gauge */}
            <div
              onClick={() => {
                sound.playClick();
                setActiveTab('character');
              }}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:border-purple-400 hover:bg-purple-900/50 cursor-pointer transition-all shadow-sm shadow-purple-500/20"
              title="Hero Level & XP Progress"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-purple-600 text-[11px] font-black text-slate-950 shadow">
                L{user.level || 1}
              </div>
              <div className="w-20 md:w-24">
                <div className="flex justify-between text-[10px] font-bold text-purple-300 mb-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">XP</span>
                  <span className="text-amber-300 font-extrabold">{xpPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-purple-500/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Daily Accountability Report */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenReport();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 hover:text-white hover:bg-indigo-900/70 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Accountability Report"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Report</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundOn
                  ? 'bg-purple-950/60 border-purple-500/40 text-amber-300 hover:bg-purple-900/60 shadow-sm'
                  : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Logout Exit Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                logout();
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
              title="Log Out of Realm"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-purple-500/20 bg-[#07080e]/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-1.5 shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-2 mb-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-rpg font-bold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-amber-300 border border-amber-400/50 shadow-md shadow-purple-500/30'
                        : 'text-slate-300 hover:text-white bg-slate-900/80 border border-purple-500/20 hover:bg-purple-950/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenReport();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span>Generate Daily Accountability Report</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
