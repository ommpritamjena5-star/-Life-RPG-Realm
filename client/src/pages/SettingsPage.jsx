import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Clock,
  Timer,
  Volume2,
  Sparkles,
  Trophy,
  Share2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const SettingsPage = () => {
  const { user, token, updateUser } = useAuth();
  const current = user?.settings || {};

  const [name, setName] = useState(user?.name || '');
  const [characterClass, setCharacterClass] = useState(user?.characterClass || 'Warrior');
  const [timezone, setTimezone] = useState(current.timezone || 'UTC');
  const [wakeUpTime, setWakeUpTime] = useState(current.wakeUpTime || '07:00');
  const [sleepTime, setSleepTime] = useState(current.sleepTime || '23:00');
  const [defaultSessionDuration, setDefaultSessionDuration] = useState(current.defaultSessionDuration || 45);
  const [breakDuration, setBreakDuration] = useState(current.breakDuration || 15);
  const [soundEnabled, setSoundEnabled] = useState(current.soundEnabled !== false);
  const [soundVolume, setSoundVolume] = useState(current.soundVolume || 70);
  const [animationIntensity, setAnimationIntensity] = useState(current.animationIntensity || 'high');
  const [theme, setTheme] = useState(current.theme || 'fantasy-dark');
  const [leaderboardVisibility, setLeaderboardVisibility] = useState(current.leaderboardVisibility !== false);
  
  // Favorite Contact
  const [contactName, setContactName] = useState(current.favoriteContact?.name || 'Mentor');
  const [contactEmail, setContactEmail] = useState(current.favoriteContact?.email || '');
  const [contactPhone, setContactPhone] = useState(current.favoriteContact?.phone || '');
  const [dailyReportEnabled, setDailyReportEnabled] = useState(current.favoriteContact?.dailyReportEnabled !== false);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    sound.playClick();

    const updatedSettings = {
      timezone,
      wakeUpTime,
      sleepTime,
      defaultSessionDuration: Number(defaultSessionDuration),
      breakDuration: Number(breakDuration),
      soundEnabled,
      soundVolume: Number(soundVolume),
      animationIntensity,
      theme,
      leaderboardVisibility,
      favoriteContact: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        dailyReportEnabled,
      },
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSettings),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser({ name, characterClass, settings: data.settings });
        sound.setEnabled(soundEnabled);
        sound.setVolume(soundVolume);
        setSavedMsg('Settings saved successfully!');
        setTimeout(() => setSavedMsg(''), 3500);
      }
    } catch (e) {
      console.error('Save settings error:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-purple-400" />
            System & Hero Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your daily battle rhythm, focus timers, accountability partner, and audio preferences.
          </p>
        </div>

        {savedMsg && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Hero Identity */}
        <div className="rpg-panel rounded-3xl p-6 border border-purple-500/20 space-y-4">
          <h3 className="font-rpg font-bold text-base text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" /> Hero Identity & Timezone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">RPG Class</label>
              <select
                value={characterClass}
                onChange={(e) => setCharacterClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
              >
                <option value="Warrior">Warrior (Strength)</option>
                <option value="Mage">Mage (Intellect)</option>
                <option value="Rogue">Rogue (Agility)</option>
                <option value="Paladin">Paladin (Vitality)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="UTC / Asia/Kolkata / America/New_York"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Circadian & Focus Defaults */}
        <div className="rpg-panel rounded-3xl p-6 border border-purple-500/20 space-y-4">
          <h3 className="font-rpg font-bold text-base text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Circadian Schedule & Focus Sessions
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Wake-Up Time</label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bed Time</label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Focus Session (mins)</label>
              <input
                type="number"
                min={15}
                max={180}
                value={defaultSessionDuration}
                onChange={(e) => setDefaultSessionDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Break Duration (mins)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Favorite Contact / Accountability Partner */}
        <div className="rpg-panel-gold rounded-3xl p-6 border border-amber-500/30 space-y-4">
          <h3 className="font-rpg font-bold text-base text-slate-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" /> Favorite Contact (Accountability Partner)
          </h3>
          <p className="text-xs text-slate-400">
            Configure your mentor or accountability partner for automated Daily Quest Reports.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Partner Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Mentor / Best Friend"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Partner Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="mentor@example.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Partner WhatsApp / Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Audio, Visual & Leaderboard Privacy */}
        <div className="rpg-panel rounded-3xl p-6 border border-purple-500/20 space-y-4">
          <h3 className="font-rpg font-bold text-base text-slate-100 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" /> Audio, Animations & Privacy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-purple-500/20">
              <span className="text-xs font-semibold text-slate-200">RPG Sound Effects</span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Animation Intensity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Animation Intensity</label>
              <select
                value={animationIntensity}
                onChange={(e) => setAnimationIntensity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
              >
                <option value="high">High (Full Particles & Glow)</option>
                <option value="medium">Medium</option>
                <option value="reduced">Reduced Motion</option>
              </select>
            </div>

            {/* Leaderboard Visibility */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-purple-500/20">
              <span className="text-xs font-semibold text-slate-200">Public Leaderboard</span>
              <input
                type="checkbox"
                checked={leaderboardVisibility}
                onChange={(e) => setLeaderboardVisibility(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl font-rpg font-bold text-xs tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'SAVING CHANGES...' : 'SAVE SETTINGS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
