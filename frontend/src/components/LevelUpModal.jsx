import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Flame, ChevronRight } from 'lucide-react';
import { sound } from '../utils/soundEngine';

export const LevelUpModal = ({ data, onClose }) => {
  if (!data) return null;

  const { newLevel, levelsGained, user } = data;

  useEffect(() => {
    // Fire celebratory confetti burst
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative max-w-md w-full rpg-panel-glow rounded-3xl p-6 sm:p-8 text-center border-2 border-amber-400/60 shadow-2xl shadow-purple-500/30 overflow-hidden"
        >
          {/* Glowing Aura Ring Background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/30 rounded-full blur-3xl" />

          {/* Level Up Banner */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 via-purple-500/30 to-amber-500/30 border border-amber-400/50 text-amber-300 font-rpg font-bold text-sm tracking-widest uppercase mb-4"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            LEVEL UP!
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          </motion.div>

          {/* Huge Level Circle */}
          <div className="relative my-4 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-700 p-1 shadow-xl shadow-amber-500/40 flex items-center justify-center animate-pulse-slow"
            >
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border border-amber-300/30">
                <span className="text-[11px] font-semibold tracking-wider text-purple-300 uppercase">LEVEL</span>
                <span className="font-rpg font-black text-4xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600">
                  {newLevel}
                </span>
              </div>
            </motion.div>
          </div>

          <h3 className="font-rpg text-2xl font-bold text-slate-100 tracking-wide mt-2">
            Your Powers Have Awakened!
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            {user?.name || 'Hero'} ascended {levelsGained > 1 ? `${levelsGained} levels` : 'to a new level'} of mastery.
          </p>

          {/* Reward Perks unlocked */}
          <div className="my-5 p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/30 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Level Up Treasury Bonus:
              </span>
              <span className="font-bold text-amber-300">+{50 * newLevel} Gold</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> All Attributes Enhanced:
              </span>
              <span className="font-bold text-emerald-400">+1 to All Stats</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Max Health & Mana:
              </span>
              <span className="font-bold text-cyan-300">Fully Restored</span>
            </div>
          </div>

          {/* Claim / Continue Button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 px-6 rounded-xl font-rpg font-bold tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>CLAIM ASCENSION</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
