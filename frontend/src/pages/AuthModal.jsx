import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  Sparkles,
  AlertCircle,
  Zap,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';
import { Hero3DModel } from '../components/Hero3DModel';

export const AuthModal = ({ isOpen, onClose, initialMode = 'register', onComplete }) => {
  const { login, register, updateUser } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [characterClass, setCharacterClass] = useState('Warrior');
  const [avatar, setAvatar] = useState('⚔️ Shadow Knight');
  
  // Forgot Password State
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request Code, 2 = Enter Code & New Pass
  const [recoveryCode, setRecoveryCode] = useState('');
  const [serverDispatchedCode, setServerDispatchedCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const classDetails = {
    Warrior: {
      name: 'Warrior',
      icon: '⚔️',
      title: 'Vanguard of Discipline',
      lore: 'Masters of Strength, physical workouts, and unwavering momentum.',
      stats: { STR: 18, INT: 10, VIT: 16, AGI: 12, DISC: 15 },
      color: 'from-amber-500 to-red-600',
      border: 'border-amber-400',
      textGlow: 'text-amber-300',
    },
    Mage: {
      name: 'Mage',
      icon: '🔮',
      title: 'Archmage of Mind',
      lore: 'Masters of Intellect, coding algorithms, and deep knowledge.',
      stats: { STR: 8, INT: 20, VIT: 12, AGI: 14, DISC: 17 },
      color: 'from-purple-500 to-cyan-500',
      border: 'border-purple-400',
      textGlow: 'text-purple-300',
    },
    Rogue: {
      name: 'Rogue',
      icon: '🗡️',
      title: 'Shadow of Speed',
      lore: 'Masters of Agility, high-velocity sprints, and swift execution.',
      stats: { STR: 12, INT: 14, VIT: 11, AGI: 20, DISC: 14 },
      color: 'from-emerald-500 to-teal-500',
      border: 'border-emerald-400',
      textGlow: 'text-emerald-300',
    },
    Paladin: {
      name: 'Paladin',
      icon: '🛡️',
      title: 'Guardian of Vitality',
      lore: 'Masters of Vitality, healthy circadian rhythms, and unbroken streaks.',
      stats: { STR: 14, INT: 11, VIT: 20, AGI: 10, DISC: 16 },
      color: 'from-yellow-400 to-amber-600',
      border: 'border-yellow-400',
      textGlow: 'text-yellow-300',
    },
  };

  const selectedClassInfo = classDetails[characterClass];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    sound.playClick();

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
        if (onComplete) onComplete();
      } else if (mode === 'register') {
        await register(name, email, password, `${selectedClassInfo.icon} ${name || characterClass}`, characterClass);
        onClose();
        if (onComplete) onComplete();
      } else if (mode === 'forgot') {
        if (forgotStep === 1) {
          // Request Code
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to dispatch recovery code');

          setServerDispatchedCode(data.resetCode);
          setRecoveryCode(data.resetCode); // Auto-populate for user convenience
          setSuccessMsg('Recovery rune generated! Enter code below to reset password.');
          setForgotStep(2);
        } else {
          // Reset Password
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match. Please re-enter.');
          }
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: recoveryCode, newPassword: password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to reset password');

          sound.playLevelUp();
          setSuccessMsg('Password successfully restored! Redirecting to login...');
          setTimeout(() => {
            setMode('login');
            setForgotStep(1);
            setSuccessMsg('');
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Instant Demo Login for judges/testers
  const handleInstantDemoLogin = async () => {
    setError('');
    setLoading(true);
    sound.playClick();
    try {
      const demoEmail = 'shadow.knight@liferpg.io';
      const demoPass = 'hero12345';

      try {
        await login(demoEmail, demoPass);
      } catch (loginErr) {
        await register('Shadow Knight', demoEmail, demoPass, '⚔️ Shadow Knight', 'Warrior');
      }

      onClose();
      if (onComplete) onComplete();
    } catch (e) {
      setError('Could not connect demo session.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength helper
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', percent: 0, color: 'bg-slate-700' };
    if (password.length < 6) return { label: 'Novice Shield', percent: 35, color: 'bg-rose-500' };
    if (password.length < 10) return { label: 'Adept Armor', percent: 70, color: 'bg-amber-400' };
    return { label: 'Mythic Aegis', percent: 100, color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="relative max-w-4xl w-full rpg-panel-glow rounded-3xl border-2 border-purple-500/40 shadow-2xl shadow-purple-500/20 overflow-hidden my-auto"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-5 right-5 z-20 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-purple-500/30 hover:bg-purple-900/50 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* Left Column: 3D Holographic Character Awakening Portal */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-[#0e1124] to-[#080914] border-b lg:border-b-0 lg:border-r border-purple-500/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-rpg font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300">
                    ✨ 3D Hero Awakening Portal
                  </span>
                </div>
                <h3 className="font-rpg text-xl font-black text-slate-100 uppercase tracking-wide">
                  {mode === 'forgot' ? 'Rune Restoration' : selectedClassInfo.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {mode === 'forgot'
                    ? 'Recover lost credentials through ancient memory runes.'
                    : selectedClassInfo.lore}
                </p>
              </div>

              {/* 3D Model Artifact Display */}
              <div className="relative my-4 flex items-center justify-center">
                <Hero3DModel characterClass={characterClass} size={220} interactive={true} />
              </div>

              {/* Class Attribute Radar Meters */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between">
                  <span>Class Attribute Bias</span>
                  <span className="text-amber-400">Lv.1 Stats</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {Object.entries(selectedClassInfo.stats).map(([k, v]) => (
                    <div key={k} className="p-1.5 rounded-lg bg-slate-900 border border-purple-500/20">
                      <div className="text-[9px] font-bold text-slate-400">{k}</div>
                      <div className="text-xs font-black text-amber-300 mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Runic Terminal Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-slate-950/60">
              <div>
                {/* Mode Switcher Tabs */}
                {mode !== 'forgot' ? (
                  <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 mb-5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setMode('register');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className={`py-2 rounded-xl text-xs font-rpg font-bold tracking-wider transition-all cursor-pointer ${
                        mode === 'register'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ⚔️ AWAKEN HERO (SIGN UP)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setMode('login');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className={`py-2 rounded-xl text-xs font-rpg font-bold tracking-wider transition-all cursor-pointer ${
                        mode === 'login'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🔑 ENTER REALM (LOG IN)
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-purple-950/50 border border-purple-500/30 mb-5">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setMode('login');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="px-3 py-1 rounded-xl text-xs text-purple-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Log In
                    </button>
                    <span className="text-xs font-rpg font-bold text-amber-300 uppercase mr-2">
                      Password Restoration
                    </span>
                  </div>
                )}

                {/* Instant Demo Login Button (in login or register mode) */}
                {mode !== 'forgot' && (
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    className="w-full mb-4 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                    <span>⚡ Quick Demo Login: Instant Hero Access</span>
                  </button>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Register Fields */}
                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Hero / Character Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Shadow Knight"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Class Selection Cards */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Choose Character Archetype
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.values(classDetails).map((c) => (
                            <div
                              key={c.name}
                              onClick={() => {
                                sound.playClick();
                                setCharacterClass(c.name);
                              }}
                              className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                                characterClass === c.name
                                  ? 'bg-purple-950/90 border-amber-400 shadow-md shadow-amber-500/10'
                                  : 'bg-slate-900/60 border-slate-800 hover:border-purple-500/40 text-slate-400'
                              }`}
                            >
                              <span className="text-xl">{c.icon}</span>
                              <div className="text-left">
                                <div className="text-xs font-bold text-slate-200">{c.name}</div>
                                <div className="text-[10px] text-amber-300/80">
                                  {c.name === 'Warrior' && 'Strength'}
                                  {c.name === 'Mage' && 'Intellect'}
                                  {c.name === 'Rogue' && 'Agility'}
                                  {c.name === 'Paladin' && 'Vitality'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email Field (Always visible) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Realm Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hero@liferpg.io"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Forgot Password Step 2: Code & New Password */}
                  {mode === 'forgot' && forgotStep === 2 && (
                    <>
                      {/* Generated Code Badge */}
                      {serverDispatchedCode && (
                        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-amber-300 font-semibold uppercase">
                              Dispatched Recovery Rune:
                            </div>
                            <div className="text-lg font-mono font-black text-amber-300 tracking-widest">
                              {serverDispatchedCode}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(serverDispatchedCode);
                              setCodeCopied(true);
                              sound.playClick();
                              setTimeout(() => setCodeCopied(false), 2000);
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{codeCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          6-Digit Rune Code
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            placeholder="e.g. 849201"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 font-mono tracking-widest text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          New Password Rune
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Confirm New Password Rune
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Standard Password Field (for Login and Register) */}
                  {mode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Secret Password Rune
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setMode('forgot');
                              setForgotStep(1);
                              setError('');
                              setSuccessMsg('');
                            }}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                          >
                            Forgot Password Rune?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Shield Meter for register mode */}
                      {mode === 'register' && password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                            <span>Security Shield:</span>
                            <span className="text-amber-300 font-bold">{strength.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${strength.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${strength.percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl font-rpg font-extrabold text-sm tracking-widest text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {mode === 'login'
                            ? 'COMMENCE QUEST (LOG IN)'
                            : mode === 'register'
                            ? 'AWAKEN YOUR HERO'
                            : forgotStep === 1
                            ? 'DISPATCH RECOVERY RUNE'
                            : 'RESTORE HERO CREDENTIALS'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
