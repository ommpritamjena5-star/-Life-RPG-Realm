import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    { id: 'character', label: 'Character', icon: User },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const xpPercent = Math.min(100, Math.round((user.currentXp / (user.xpToNextLevel || 100)) * 100));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/20 bg-[#0b0c16]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => {
              sound.playClick();
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-amber-500 p-[1px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-xl">
                ⚔️
              </div>
            </div>
            <div>
              <span className="font-rpg font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300">
                LIFE RPG
              </span>
              <span className="hidden sm:block text-[10px] text-purple-400/80 font-medium tracking-widest uppercase">
                Life OS
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Character Stats HUD (XP, Gold, Streak) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-400 text-xs font-bold shadow-sm shadow-orange-500/10">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse fill-orange-500/20" />
              <span>{user.streak || 1}d</span>
            </div>

            {/* Gold Counter */}
            <div
              onClick={() => {
                sound.playClick();
                setActiveTab('shop');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-900/40 transition-colors shadow-sm shadow-amber-500/10"
              title="Your Gold Treasury"
            >
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span>{user.gold || 0}</span>
            </div>

            {/* Character Level & XP Mini Bar */}
            <div
              onClick={() => {
                sound.playClick();
                setActiveTab('character');
              }}
              className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 cursor-pointer hover:bg-purple-900/40 transition-all shadow-sm shadow-purple-500/10"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-purple-600 text-[11px] font-extrabold text-slate-950 shadow">
                L{user.level || 1}
              </div>
              <div className="w-24">
                <div className="flex justify-between text-[10px] font-semibold text-purple-300 mb-0.5">
                  <span>XP</span>
                  <span>{xpPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Daily Accountability Report Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenReport();
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/50 text-xs font-semibold transition-all shadow-sm"
              title="Generate Daily Report for Accountability Partner"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Report</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition-colors"
              title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                sound.playClick();
                logout();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-purple-500/20 bg-slate-950/95 px-4 pt-2 pb-4 space-y-1">
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
