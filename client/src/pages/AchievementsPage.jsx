import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Sparkles, CheckCircle2, Lock, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AchievementsPage = () => {
  const { user, token } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadAchievements();
    }
  }, [token]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
      }
    } catch (e) {
      console.error('Achievements error:', e);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            Heroic Achievements & Trophies
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Unlock trophies across Quests, Streaks, Focus Sessions, and Treasury milestones.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-purple-950/80 border border-purple-400/40 text-xs font-bold text-purple-200 flex items-center gap-2 shadow-sm">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Unlocked: {unlockedCount} / {achievements.length}</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Inspecting heroic hall of records...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = ach.isUnlocked;
            return (
              <motion.div
                key={ach.code}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'rpg-panel-gold border-amber-400/40 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-900/40 border-purple-500/20 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-purple-500/30">
                      {ach.icon}
                    </div>
                    {isUnlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> UNLOCKED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-500 border border-slate-800 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-100">{ach.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-500/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-300">+{ach.xpReward} XP</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +{ach.goldReward} Gold
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
