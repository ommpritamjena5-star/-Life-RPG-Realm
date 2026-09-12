import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sword,
  Flame,
  Coins,
  Sparkles,
  Trophy,
  Calendar,
  Timer,
  CheckCircle2,
  Plus,
  ArrowRight,
  Shield,
  Zap,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const Dashboard = ({ setActiveTab, onOpenNewQuest }) => {
  const { user, token, triggerProgressionEvent } = useAuth();
  const [quests, setQuests] = useState([]);
  const [performance, setPerformance] = useState({ score: 100 });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [questsRes, perfRes, schedRes] = await Promise.all([
        fetch(`/api/quests?date=${today}`, { credentials: 'omit', headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/analytics/daily?date=${today}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/schedule?date=${today}`, { credentials: 'omit', headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (questsRes.ok) {
        const qData = await questsRes.json();
        setQuests(qData.quests || []);
      }
      if (perfRes.ok) {
        const pData = await perfRes.json();
        setPerformance(pData.performance || { score: 100 });
      }
      if (schedRes.ok) {
        const sData = await schedRes.json();
        setTodaySchedule(sData.schedules || []);
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questId) => {
    sound.playQuestComplete();
    try {
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        triggerProgressionEvent(data.progression);
        // Refresh local quests state
        setQuests((prev) =>
          prev.map((q) => (q._id === questId || q.id === questId ? data.quest : q))
        );
        // Refresh performance
        const perfRes = await fetch('/api/analytics/daily', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (perfRes.ok) {
          const pData = await perfRes.json();
          setPerformance(pData.performance);
        }
      }
    } catch (e) {
      console.error('Complete quest error:', e);
    }
  };

  if (!user) return null;

  const xpPercent = Math.min(100, Math.round((user.currentXp / (user.xpToNextLevel || 100)) * 100));
  const activeQuests = quests.filter((q) => !q.isCompleted);
  const completedCount = quests.filter((q) => q.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Hero Banner / Character Overview HUD */}
      <div className="relative rounded-3xl p-6 sm:p-8 rpg-panel-glow border border-purple-500/40 overflow-hidden">
        {/* Background glow flares */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar & Title */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-700 p-[2px] shadow-xl shadow-purple-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl sm:text-4xl">
                  {user.avatar ? user.avatar.split(' ')[0] : '⚔️'}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                L{user.level || 1}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 tracking-wide">
                  {user.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-200 font-semibold">
                  {user.characterClass || 'Warrior'}
                </span>
              </div>
              <p className="text-xs text-amber-300 font-medium tracking-wide mt-1">
                ⭐ {user.title || 'Novice Adventurer'}
              </p>

              {/* Quick mini attributes row */}
              <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-semibold text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-purple-500/20">
                  INT: {user.attributes?.intellect || 10}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-purple-500/20">
                  STR: {user.attributes?.strength || 10}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-purple-500/20">
                  DISC: {user.attributes?.discipline || 10}
                </span>
              </div>
            </div>
          </div>

          {/* Right: XP Progress & Treasury Status */}
          <div className="flex flex-col gap-3 min-w-[280px] sm:min-w-[320px]">
            {/* XP Progress Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Level {user.level || 1} Experience
                </span>
                <span className="text-slate-300">
                  {user.currentXp} / {user.xpToNextLevel || 100} XP ({xpPercent}%)
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden p-[1px] border border-purple-500/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 rounded-full shimmer-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            {/* Quick Metrics (Streak, Gold, Performance Score) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/30 text-center">
                <div className="text-[10px] text-orange-300 font-semibold flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" /> Streak
                </div>
                <div className="font-rpg text-base font-bold text-orange-300 mt-0.5">{user.streak || 1} Days</div>
              </div>

              <div
                onClick={() => {
                  sound.playClick();
                  setActiveTab('shop');
                }}
                className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center cursor-pointer hover:bg-amber-900/40 transition-colors"
              >
                <div className="text-[10px] text-amber-300 font-semibold flex items-center justify-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" /> Gold
                </div>
                <div className="font-rpg text-base font-bold text-amber-300 mt-0.5">{user.gold || 0}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                <div className="text-[10px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" /> Daily Score
                </div>
                <div className="font-rpg text-base font-bold text-emerald-300 mt-0.5">{performance.score}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Quests & Time Planner Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Quests & Focus Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Quests Header */}
          <div className="rpg-panel rounded-3xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-rpg font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Sword className="w-5 h-5 text-amber-400" />
                  Today's Quests ({completedCount}/{quests.length})
                </h2>
                <p className="text-xs text-slate-400">Complete tasks to earn XP and Gold</p>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenNewQuest();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-rpg font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Forge Quest
              </button>
            </div>

            {/* Quests List */}
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading your quest scrolls...</div>
            ) : quests.length === 0 ? (
              <div className="py-10 text-center rounded-2xl bg-slate-900/40 border border-dashed border-purple-500/30 p-6">
                <p className="text-sm font-semibold text-slate-300">No active quests for today.</p>
                <p className="text-xs text-slate-500 mt-1">Forge your first quest to begin earning XP!</p>
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenNewQuest();
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-purple-950/80 border border-amber-400/40 hover:bg-purple-900/80"
                >
                  + Add Today's Goal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {quests.map((quest) => {
                  const isDone = quest.isCompleted;
                  return (
                    <div
                      key={quest._id || quest.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                          : 'bg-slate-900/80 border-purple-500/20 hover:border-purple-400/50 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          disabled={isDone}
                          onClick={() => handleCompleteQuest(quest._id || quest.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'border-2 border-purple-400/60 hover:border-amber-400 text-transparent'
                          }`}
                        >
                          ✓
                        </button>
                        <div>
                          <h4
                            className={`text-sm font-bold ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-100'
                            }`}
                          >
                            {quest.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 font-medium">
                              {quest.category}
                            </span>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold">{quest.difficulty}</span>
                            <span>•</span>
                            <span>{quest.durationMinutes} mins</span>
                          </div>
                        </div>
                      </div>

                      {/* Reward Tag */}
                      <div className="flex flex-col items-end text-xs font-bold flex-shrink-0">
                        <span className="text-purple-300">+{quest.xpReward} XP</span>
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <Coins className="w-3 h-3" /> +{quest.goldReward}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Daily Schedule & Focus Action Launcher */}
        <div className="space-y-6">
          {/* Quick Focus Session Widget */}
          <div className="rpg-panel-gold rounded-3xl p-6 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-rpg font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-400" /> Focus Sub-Session
              </span>
              <span className="text-[11px] text-amber-300/80 font-medium">45 Mins</span>
            </div>
            <h3 className="font-bold text-base text-slate-100 mb-1">Enter Deep Focus Realm</h3>
            <p className="text-xs text-slate-400 mb-4">
              Block distractions, enable ambient sounds, and earn +55 XP per sub-session.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('timer');
              }}
              className="w-full py-2.5 px-4 rounded-xl font-rpg font-bold text-xs tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>LAUNCH FOCUS TIMER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today's Schedule Timeline Preview */}
          <div className="rpg-panel rounded-3xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-rpg font-bold text-base text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" /> Today's Timeline
              </h3>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('schedule');
                }}
                className="text-xs text-purple-300 hover:text-white font-medium"
              >
                Plan Day →
              </button>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <p>No time blocks scheduled for today.</p>
                <p className="text-slate-500 mt-1">Structure your day to maximize discipline score.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.slice(0, 4).map((slot) => (
                  <div
                    key={slot._id || slot.id}
                    className="p-2.5 rounded-xl bg-slate-900/70 border border-purple-500/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{slot.title}</div>
                      <div className="text-[11px] text-purple-300/80">
                        {slot.startTime} - {slot.endTime} ({slot.durationMinutes}m)
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                      {slot.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
