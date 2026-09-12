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

  // Email Notification Preferences
  const [emailReminders, setEmailReminders] = useState(current.emailReminders !== false);
  const [emailSecurityAlerts, setEmailSecurityAlerts] = useState(current.emailSecurityAlerts !== false);
  const [emailAchievements, setEmailAchievements] = useState(current.emailAchievements !== false);

  // Email test state
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState('');

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
      emailReminders,
      emailSecurityAlerts,
      emailAchievements,
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

  const handleSendReminderNow = async () => {
    setEmailTestLoading(true);
    sound.playClick();
    setEmailTestResult('');
    try {
      const res = await fetch('/api/settings/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      sound.playPurchase();
      setEmailTestResult(`✅ ${data.message}`);
    } catch (err) {
      setEmailTestResult('⚠️ Failed to dispatch reminder.');
    } finally {
      setEmailTestLoading(false);
    }
  };

  const handleTestEmail = async (emailType) => {
    setEmailTestLoading(true);
    sound.playClick();
    setEmailTestResult('');
    try {
      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emailType }),
      });
      const data = await res.json();
      sound.playPurchase();
      setEmailTestResult(`✨ [${emailType.toUpperCase()}] email dispatched to ${user?.email || 'your address'}! Check terminal / inbox.`);
    } catch (err) {
      setEmailTestResult('⚠️ Failed to dispatch test email.');
    } finally {
      setEmailTestLoading(false);
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
            Configure your battle rhythm, email notifications, accountability partner, and audio preferences.
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

        {/* Section 3: 📧 Astral Email Notifications & Testing Hub */}
        <div className="rpg-panel rounded-3xl p-6 border-2 border-purple-500/30 space-y-4 bg-slate-950/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-rpg font-bold text-base text-slate-100 flex items-center gap-2">
                <span>📧</span> Astral Email Dispatch & Notifications
              </h3>
              <p className="text-xs text-purple-300/80 mt-0.5">
                Manage automated emails dispatched to <span className="text-amber-400 font-bold">{user?.email || 'your registered email'}</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendReminderNow}
              disabled={emailTestLoading}
              className="px-3.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-400/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto disabled:opacity-50"
            >
              <span>⏰</span>
              <span>Send Daily Reminder Now</span>
            </button>
          </div>

          {emailTestResult && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-purple-950/60 border border-purple-400/40 text-xs text-amber-300 font-semibold"
            >
              {emailTestResult}
            </motion.div>
          )}

          {/* Email Notification Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/20">
              <div>
                <div className="text-xs font-bold text-slate-200">Daily Quest Reminders</div>
                <div className="text-[10px] text-slate-400">Streak alerts & pending tasks</div>
              </div>
              <input
                type="checkbox"
                checked={emailReminders}
                onChange={(e) => setEmailReminders(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/20">
              <div>
                <div className="text-xs font-bold text-slate-200">Login Security Alerts</div>
                <div className="text-[10px] text-slate-400">Notifies on account sign in</div>
              </div>
              <input
                type="checkbox"
                checked={emailSecurityAlerts}
                onChange={(e) => setEmailSecurityAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/20">
              <div>
                <div className="text-xs font-bold text-slate-200">Achievement Milestones</div>
                <div className="text-[10px] text-slate-400">Trophy & Level-up scrolls</div>
              </div>
              <input
                type="checkbox"
                checked={emailAchievements}
                onChange={(e) => setEmailAchievements(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Email Template Tester */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-2.5">
            <div className="text-[11px] font-rpg font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between">
              <span>🔮 Live Email Template Dispatch Tester</span>
              <span className="text-[10px] text-slate-400 font-normal">Click any button to test delivery</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleTestEmail('welcome')}
                disabled={emailTestLoading}
                className="p-2 rounded-xl bg-slate-950 hover:bg-purple-950 border border-purple-500/30 hover:border-amber-400/50 text-[11px] font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer text-center disabled:opacity-40"
              >
                🎉 Signup
              </button>
              <button
                type="button"
                onClick={() => handleTestEmail('login')}
                disabled={emailTestLoading}
                className="p-2 rounded-xl bg-slate-950 hover:bg-purple-950 border border-purple-500/30 hover:border-amber-400/50 text-[11px] font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer text-center disabled:opacity-40"
              >
                🛡️ Login Alert
              </button>
              <button
                type="button"
                onClick={() => handleTestEmail('forgot-password')}
                disabled={emailTestLoading}
                className="p-2 rounded-xl bg-slate-950 hover:bg-purple-950 border border-purple-500/30 hover:border-amber-400/50 text-[11px] font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer text-center disabled:opacity-40"
              >
                🔑 Reset Rune
              </button>
              <button
                type="button"
                onClick={() => handleTestEmail('reminder')}
                disabled={emailTestLoading}
                className="p-2 rounded-xl bg-slate-950 hover:bg-purple-950 border border-purple-500/30 hover:border-amber-400/50 text-[11px] font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer text-center disabled:opacity-40"
              >
                ⏰ Reminder
              </button>
              <button
                type="button"
                onClick={() => handleTestEmail('achievement')}
                disabled={emailTestLoading}
                className="p-2 rounded-xl bg-slate-950 hover:bg-purple-950 border border-purple-500/30 hover:border-amber-400/50 text-[11px] font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer text-center disabled:opacity-40"
              >
                🏆 Achievement
              </button>
              <button
                type="button"
                onClick={() => handleTestEmail('levelup')}
                disabled={emailTestLoading}
                className="p-2 rounded-xl bg-slate-950 hover:bg-purple-950 border border-purple-500/30 hover:border-amber-400/50 text-[11px] font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer text-center disabled:opacity-40"
              >
                ⚡ Level Up
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Favorite Contact / Accountability Partner */}
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

        {/* Section 5: Audio, Visual & Leaderboard Privacy */}
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

            {/* Leaderboard Privacy */}
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
