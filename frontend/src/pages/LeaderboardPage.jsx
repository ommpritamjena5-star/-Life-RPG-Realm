import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Flame, Sparkles, User, Shield, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LeaderboardPage = () => {
  const { user, token } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadLeaderboard();
    }
  }, [token]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.currentUserRank);
      }
    } catch (e) {
      console.error('Leaderboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            Hall of Legendary Heroes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global rankings of adventurers mastering their daily quests and level progression.
          </p>
        </div>

        {userRank && (
          <div className="px-4 py-2 rounded-2xl bg-purple-950/80 border border-purple-400/40 text-xs font-bold text-purple-200 flex items-center gap-2 shadow-sm">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Your Current Rank: #{userRank}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Summoning the Hall of Fame...</div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {top3.map((player, idx) => {
                const rankNumber = idx + 1;
                const isFirst = rankNumber === 1;
                const isSecond = rankNumber === 2;
                const isThird = rankNumber === 3;

                const borderColor = isFirst
                  ? 'border-amber-400'
                  : isSecond
                  ? 'border-slate-300'
                  : 'border-amber-700';

                const crownColor = isFirst
                  ? 'text-amber-300'
                  : isSecond
                  ? 'text-slate-300'
                  : 'text-amber-600';

                return (
                  <motion.div
                    key={player.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-3xl p-6 text-center relative overflow-hidden flex flex-col justify-between ${
                      isFirst ? 'rpg-panel-gold border-2 order-first md:order-2 md:-mt-4' : 'rpg-panel border'
                    } ${borderColor}`}
                  >
                    <div>
                      <Crown className={`w-8 h-8 mx-auto mb-2 ${crownColor}`} />
                      <div className="text-2xl font-rpg font-black text-amber-400">#{rankNumber}</div>

                      <div className="w-16 h-16 rounded-2xl bg-slate-950 mx-auto my-3 flex items-center justify-center text-3xl border border-purple-500/30">
                        {player.avatar ? player.avatar.split(' ')[0] : '⚔️'}
                      </div>

                      <h3 className="font-bold text-base text-slate-100 flex items-center justify-center gap-1.5">
                        {player.name}
                        {player.isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600 text-white">YOU</span>
                        )}
                      </h3>
                      <div className="text-xs text-slate-400">{player.title}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-around text-xs font-bold">
                      <span className="text-purple-300">Level {player.level}</span>
                      <span className="text-amber-300">{player.totalXpEarned} XP</span>
                      <span className="text-orange-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {player.streak}d
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full List */}
          <div className="rpg-panel rounded-3xl p-6 border border-purple-500/20 space-y-2">
            <h3 className="font-rpg font-bold text-base text-slate-200 mb-3">All Adventurers</h3>
            {leaderboard.map((player) => (
              <div
                key={player.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  player.isCurrentUser
                    ? 'bg-purple-950/60 border-amber-400/60 shadow-md'
                    : 'bg-slate-900/60 border-purple-500/10 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-7 font-rpg font-bold text-sm text-amber-400">
                    #{player.rank}
                  </div>
                  <div className="text-2xl">{player.avatar ? player.avatar.split(' ')[0] : '⚔️'}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {player.name}
                      {player.isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-600 text-white font-semibold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{player.title}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/30">
                    L{player.level}
                  </span>
                  <span className="text-amber-300 font-bold">{player.totalXpEarned} XP</span>
                  <span className="text-orange-400 hidden sm:flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {player.streak}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
