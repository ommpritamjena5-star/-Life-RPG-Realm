import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AnalyticsPage = () => {
  const { user, token } = useAuth();
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [overview, setOverview] = useState(null);
  const [dailyPerf, setDailyPerf] = useState({ score: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadAnalytics();
    }
  }, [token]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [weeklyRes, overviewRes, dailyRes] = await Promise.all([
        fetch('/api/analytics/weekly', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/overview', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/daily', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (weeklyRes.ok) {
        const wData = await weeklyRes.json();
        setWeeklyHistory(wData.weeklyHistory || []);
      }
      if (overviewRes.ok) {
        const oData = await overviewRes.json();
        setOverview(oData);
      }
      if (dailyRes.ok) {
        const dData = await dailyRes.json();
        setDailyPerf(dData.performance || { score: 100 });
      }
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-emerald-400" />
          Performance & Progression Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your daily productivity percentage, weekly execution velocity, and consistency heatmap.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl rpg-panel border border-emerald-500/30">
          <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> Daily Score
          </div>
          <div className="font-rpg text-3xl font-black text-slate-100 mt-2">{dailyPerf.score}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Intelligently calibrated</div>
        </div>

        <div className="p-5 rounded-3xl rpg-panel border border-orange-500/30">
          <div className="text-xs text-orange-300 font-semibold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" /> Active Streak
          </div>
          <div className="font-rpg text-3xl font-black text-orange-400 mt-2">{overview?.currentStreak || 1} Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Consecutive discipline</div>
        </div>

        <div className="p-5 rounded-3xl rpg-panel border border-cyan-500/30">
          <div className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Quests Finished
          </div>
          <div className="font-rpg text-3xl font-black text-cyan-300 mt-2">{overview?.totalQuestsCompleted || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total lifetime quests</div>
        </div>

        <div className="p-5 rounded-3xl rpg-panel border border-purple-500/30">
          <div className="text-xs text-purple-300 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-400" /> Deep Focus Time
          </div>
          <div className="font-rpg text-3xl font-black text-purple-300 mt-2">{overview?.totalFocusMinutes || 0}m</div>
          <div className="text-[11px] text-slate-400 mt-1">Completed sub-sessions</div>
        </div>
      </div>

      {/* 7-Day Performance Chart */}
      <div className="rpg-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30">
        <h3 className="font-rpg font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" /> 7-Day Performance Score (%)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Track your daily execution percentage across the past week.
        </p>

        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
          {weeklyHistory.map((item, idx) => {
            const height = Math.max(15, (item.score / 100) * 140);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-amber-300 font-mono">{item.score}%</span>
                <div className="w-full max-w-[48px] bg-slate-900 rounded-t-xl overflow-hidden p-[1px] flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}px` }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                    className="w-full bg-gradient-to-t from-purple-600 via-indigo-500 to-amber-400 rounded-t-lg"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown & Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rpg-panel rounded-3xl p-6 border border-purple-500/20">
          <h3 className="font-rpg font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Category Breakdown
          </h3>
          {overview?.categoryBreakdown && Object.keys(overview.categoryBreakdown).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(overview.categoryBreakdown).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60">
                  <span className="font-semibold text-slate-200">{cat}</span>
                  <span className="font-bold text-purple-300">{count} Quests</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No category data yet. Complete quests to populate breakdown.</p>
          )}
        </div>

        {/* Streak Consistency Visual Grid */}
        <div className="rpg-panel rounded-3xl p-6 border border-purple-500/20">
          <h3 className="font-rpg font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" /> Consistency Tiles
          </h3>
          <p className="text-xs text-slate-400 mb-4">Daily streak activity check-in log.</p>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const active = i >= 28 - (overview?.currentStreak || 1);
              return (
                <div
                  key={i}
                  className={`h-6 rounded-md transition-all ${
                    active
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm shadow-orange-500/30'
                      : 'bg-slate-900 border border-slate-800'
                  }`}
                  title={active ? 'Day Complete' : 'Day Pending'}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
