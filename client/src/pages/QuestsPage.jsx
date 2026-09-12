import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword,
  Plus,
  Filter,
  CheckCircle2,
  Trash2,
  Coins,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const QuestsPage = ({ isNewQuestModalOpen, setIsNewQuestModalOpen }) => {
  const { user, token, triggerProgressionEvent } = useAuth();
  const [quests, setQuests] = useState([]);
  const [activeTier, setActiveTier] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // New Quest Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tier, setTier] = useState('Daily');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [subtasksText, setSubtasksText] = useState('');

  useEffect(() => {
    if (token) {
      loadQuests();
    }
  }, [token]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests || []);
      }
    } catch (e) {
      console.error('Failed to load quests:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuest = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    sound.playClick();

    const subtasks = subtasksText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          tier,
          durationMinutes: Number(durationMinutes),
          subtasks,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuests([data.quest, ...quests]);
        setTitle('');
        setDescription('');
        setSubtasksText('');
        setIsNewQuestModalOpen(false);
      }
    } catch (e) {
      console.error('Create quest error:', e);
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
        setQuests((prev) =>
          prev.map((q) => (q._id === questId || q.id === questId ? data.quest : q))
        );
      }
    } catch (e) {
      console.error('Complete quest error:', e);
    }
  };

  const handleDeleteQuest = async (questId) => {
    sound.playClick();
    try {
      const res = await fetch(`/api/quests/${questId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setQuests((prev) => prev.filter((q) => q._id !== questId && q.id !== questId));
      }
    } catch (e) {
      console.error('Delete quest error:', e);
    }
  };

  const filteredQuests = quests.filter((q) => {
    if (activeTier !== 'All' && q.tier !== activeTier) return false;
    if (activeCategory !== 'All' && q.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
            <Sword className="w-7 h-7 text-amber-400" />
            Quest Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accept real-world challenges, complete objectives, and claim your rewards.
          </p>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            setIsNewQuestModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl font-rpg font-bold text-xs tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> FORGE NEW QUEST
        </button>
      </div>

      {/* Filters (Tiers & Categories) */}
      <div className="flex flex-wrap gap-2 pt-2">
        {['All', 'Main', 'Daily', 'Side', 'Habit'].map((t) => (
          <button
            key={t}
            onClick={() => {
              sound.playClick();
              setActiveTier(t);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTier === t
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30 border border-purple-400/40'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {t === 'All' ? 'All Tiers' : `${t} Quests`}
          </button>
        ))}
      </div>

      {/* Quests Grid / List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading your quest parchment...</div>
      ) : filteredQuests.length === 0 ? (
        <div className="rpg-panel rounded-3xl p-12 text-center border border-dashed border-purple-500/30">
          <Sword className="w-12 h-12 text-purple-400/40 mx-auto mb-3" />
          <h3 className="font-rpg font-bold text-lg text-slate-200">No Quests in this Realm</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create a custom quest to earn XP, gold, and increase your character attributes.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              setIsNewQuestModalOpen(true);
            }}
            className="mt-5 px-5 py-2 rounded-xl text-xs font-rpg font-bold text-slate-950 bg-amber-400 hover:bg-amber-300"
          >
            + Forge Quest Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuests.map((quest) => {
            const isDone = quest.isCompleted;
            return (
              <motion.div
                key={quest._id || quest.id}
                layout
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                    : 'rpg-panel hover:border-purple-400/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/30">
                        {quest.tier}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-amber-500/30">
                        {quest.difficulty}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {quest.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuest(quest._id || quest.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                      title="Banish Quest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3
                    className={`font-bold text-base mt-1 ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {quest.title}
                  </h3>
                  {quest.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {quest.description}
                    </p>
                  )}

                  {/* Subtasks checklist if any */}
                  {quest.subtasks && quest.subtasks.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/50 border border-purple-500/20 space-y-1.5">
                      <div className="text-[11px] font-semibold text-purple-300">
                        Objectives ({quest.subtasks.filter((s) => s.isCompleted).length}/{quest.subtasks.length}):
                      </div>
                      {quest.subtasks.map((st) => (
                        <div key={st.id} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="text-purple-400">•</span>
                          <span className={st.isCompleted ? 'line-through text-slate-500' : ''}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with Rewards & Complete Button */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-purple-500/10">
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-purple-300">+{quest.xpReward} XP</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> +{quest.goldReward}
                    </span>
                    <span className="text-[10px] text-slate-400">+{quest.attributePoints} {quest.attributeBoost}</span>
                  </div>

                  <button
                    disabled={isDone}
                    onClick={() => handleCompleteQuest(quest._id || quest.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm shadow-purple-500/30'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </>
                    ) : (
                      <>
                        <span>Claim Victory</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Quest Modal */}
      <AnimatePresence>
        {isNewQuestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full rpg-panel-glow rounded-3xl p-6 sm:p-7 border border-purple-500/40 shadow-2xl overflow-hidden"
            >
              <h2 className="font-rpg font-bold text-xl text-slate-100 mb-1">Forge New Quest</h2>
              <p className="text-xs text-slate-400 mb-4">Define your objectives and earn bounty rewards.</p>

              <form onSubmit={handleCreateQuest} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quest Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Study JavaScript Algorithms"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about what you want to achieve..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    >
                      <option value="Coding">Coding (INT)</option>
                      <option value="Workout">Workout (STR)</option>
                      <option value="Reading">Reading (INT)</option>
                      <option value="Meditation">Meditation (VIT)</option>
                      <option value="Chores">Chores (DISC)</option>
                      <option value="Social">Social (CHA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    >
                      <option value="Easy">Easy (+25 XP)</option>
                      <option value="Medium">Medium (+50 XP)</option>
                      <option value="Hard">Hard (+100 XP)</option>
                      <option value="Epic">Epic (+250 XP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tier</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    >
                      <option value="Daily">Daily Quest</option>
                      <option value="Main">Main Quest</option>
                      <option value="Side">Side Quest</option>
                      <option value="Habit">Habit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subtasks Checklist (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={subtasksText}
                    onChange={(e) => setSubtasksText(e.target.value)}
                    placeholder="Read Chapter 3&#10;Solve 2 Leetcode problems&#10;Commit code to GitHub"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewQuestModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-rpg font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow cursor-pointer"
                  >
                    Forge Quest
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
