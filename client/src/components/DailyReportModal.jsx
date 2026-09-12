import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Send, Award, Flame, Timer, Sword } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const DailyReportModal = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      fetchReport();
    }
  }, [isOpen, token]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/daily-report', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } catch (e) {
      console.error('Failed to fetch daily report:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.shareableText);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  const shareReport = async () => {
    if (!report) return;
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Life RPG Daily Report - ${report.heroName}`,
          text: report.shareableText,
        });
      } catch (err) {}
    } else {
      copyToClipboard();
    }
  };

  const shareViaWhatsApp = () => {
    if (!report) return;
    sound.playClick();
    const phone = report.contact?.phone ? report.contact.phone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(report.shareableText);
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-lg w-full rpg-panel-glow rounded-3xl p-6 sm:p-7 border border-purple-500/40 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-400/40 text-purple-300">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-rpg font-bold text-lg text-slate-100">Daily Accountability Report</h3>
                <p className="text-xs text-slate-400">Share your daily conquests with your favorite mentor</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Compiling your heroic deeds...
            </div>
          ) : report ? (
            <div className="mt-4 space-y-4">
              {/* Accountability Partner Badge */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                <span className="text-indigo-300 font-medium">Recipient Partner:</span>
                <span className="font-bold text-indigo-100">{report.contact?.name || 'Mentor'}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20">
                  <div className="text-xs text-purple-300 font-medium">Performance</div>
                  <div className="font-rpg text-xl font-bold text-amber-300 mt-0.5">{report.performanceScore}%</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20">
                  <div className="text-xs text-purple-300 font-medium flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" /> Streak
                  </div>
                  <div className="font-rpg text-xl font-bold text-orange-400 mt-0.5">{report.streak}d</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20">
                  <div className="text-xs text-purple-300 font-medium flex items-center justify-center gap-1">
                    <Sword className="w-3 h-3 text-cyan-400" /> Quests
                  </div>
                  <div className="font-rpg text-xl font-bold text-cyan-300 mt-0.5">
                    {report.completedQuestsCount}/{report.totalQuestsCount}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20">
                  <div className="text-xs text-purple-300 font-medium flex items-center justify-center gap-1">
                    <Timer className="w-3 h-3 text-emerald-400" /> Focus
                  </div>
                  <div className="font-rpg text-xl font-bold text-emerald-400 mt-0.5">{report.totalFocusMinutes}m</div>
                </div>
              </div>

              {/* Shareable Text Preview Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-purple-500/30 text-xs font-mono text-slate-300 whitespace-pre-wrap select-all">
                {report.shareableText}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  onClick={copyToClipboard}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Card'}</span>
                </button>
                <button
                  onClick={shareViaWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={shareReport}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-600/30"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Sheet</span>
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
