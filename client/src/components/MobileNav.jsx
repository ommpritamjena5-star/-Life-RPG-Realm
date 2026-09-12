import React from 'react';
import { Sparkles, Sword, Calendar, Timer, User, Menu } from 'lucide-react';
import { sound } from '../utils/soundEngine';

export const MobileNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Sparkles },
    { id: 'quests', label: 'Quests', icon: Sword },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'timer', label: 'Focus', icon: Timer },
    { id: 'character', label: 'Hero', icon: User },
  ];

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0e1a]/95 border-t border-purple-500/20 backdrop-blur-xl px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? 'bg-purple-950/80 border border-amber-400/40 shadow-sm shadow-amber-400/20' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
