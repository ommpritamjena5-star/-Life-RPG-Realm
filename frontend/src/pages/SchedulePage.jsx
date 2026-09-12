import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const SchedulePage = () => {
  const { user, token, triggerProgressionEvent } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [type, setType] = useState('quest');
  const [category, setCategory] = useState('Coding');

  useEffect(() => {
    if (token) {
      loadSchedule();
    }
  }, [token, selectedDate]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/schedule?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (e) {
      console.error('Schedule load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;
    sound.playClick();

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          startTime,
          endTime,
          date: selectedDate,
          type,
          category,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSchedules([...schedules, data.schedule].sort((a, b) => (a.startTime > b.startTime ? 1 : -1)));
        if (data.warning) {
          setConflictWarning(data.warning);
          setTimeout(() => setConflictWarning(null), 6000);
        }
        setTitle('');
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error('Create schedule error:', e);
    }
  };

  const handleToggleComplete = async (blockId, currentState) => {
    sound.playClick();
    try {
      const res = await fetch(`/api/schedule/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isCompleted: !currentState }),
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules((prev) =>
          prev.map((s) => (s._id === blockId || s.id === blockId ? data.schedule : s))
        );
      }
    } catch (e) {
      console.error('Toggle schedule error:', e);
    }
  };

  const handleDelete = async (blockId) => {
    sound.playClick();
    try {
      const res = await fetch(`/api/schedule/${blockId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSchedules((prev) => prev.filter((s) => s._id !== blockId && s.id !== blockId));
      }
    } catch (e) {
      console.error('Delete schedule error:', e);
    }
  };

  const totalMinutes = schedules.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const completedMinutes = schedules.filter((s) => s.isCompleted).reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const scheduleRatio = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-400" />
            Daily Time Planner
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Structure your hours from wake-up to sleep. Defend your timeline against chaos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={() => {
              sound.playClick();
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl font-rpg font-bold text-xs tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> ADD TIME BLOCK
          </button>
        </div>
      </div>

      {/* Conflict Warning Alert */}
      {conflictWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2.5 shadow-lg"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{conflictWarning}</span>
        </motion.div>
      )}

      {/* Daily Progress Gauge */}
      <div className="rpg-panel rounded-3xl p-5 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Daily Scheduled Mastery
          </div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {completedMinutes} / {totalMinutes} Minutes Executed ({scheduleRatio}%)
          </div>
        </div>
        <div className="w-full sm:w-64 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-purple-500/20">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${scheduleRatio}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Consulting the chronomancer...</div>
      ) : schedules.length === 0 ? (
        <div className="rpg-panel rounded-3xl p-12 text-center border border-dashed border-purple-500/30">
          <Clock className="w-12 h-12 text-indigo-400/40 mx-auto mb-3" />
          <h3 className="font-rpg font-bold text-lg text-slate-200">Timeline is Clear</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Plan your study sessions, workout routines, and deep work blocks for {selectedDate}.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              setIsModalOpen(true);
            }}
            className="mt-4 px-5 py-2 rounded-xl text-xs font-rpg font-bold text-slate-950 bg-amber-400 hover:bg-amber-300"
          >
            + Create Time Block
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((slot) => {
            const isDone = slot.isCompleted;
            return (
              <motion.div
                key={slot._id || slot.id}
                layout
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                    : 'rpg-panel hover:border-purple-400/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleComplete(slot._id || slot.id, slot.isCompleted)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'border-2 border-purple-400/60 hover:border-amber-400 text-transparent'
                    }`}
                  >
                    ✓
                  </button>

                  {/* Time Badge */}
                  <div className="w-24 text-xs font-mono font-bold text-purple-300">
                    {slot.startTime} - {slot.endTime}
                  </div>

                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {slot.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300">
                        {slot.category}
                      </span>
                      <span>•</span>
                      <span>{slot.durationMinutes} mins</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(slot._id || slot.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Time Block Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full rpg-panel-glow rounded-3xl p-6 border border-purple-500/40 shadow-2xl"
            >
              <h2 className="font-rpg font-bold text-xl text-slate-100 mb-1">Add Schedule Block</h2>
              <p className="text-xs text-slate-400 mb-4">Assign dedicated time on your timeline.</p>

              <form onSubmit={handleCreateBlock} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Block Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Study JavaScript Session 1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    >
                    </input>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    >
                    </input>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    >
                      <option value="quest">Quest Block</option>
                      <option value="routine">Routine</option>
                      <option value="focus_session">Deep Focus</option>
                      <option value="break">Rest / Break</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    >
                      <option value="Coding">Coding</option>
                      <option value="Workout">Workout</option>
                      <option value="Reading">Reading</option>
                      <option value="Meditation">Meditation</option>
                      <option value="Chores">Chores</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-rpg font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow cursor-pointer"
                  >
                    Add to Timeline
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
