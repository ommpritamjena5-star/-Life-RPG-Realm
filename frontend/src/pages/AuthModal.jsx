import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Mail,
  Phone,
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
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';
import { Hero3DModel } from '../components/Hero3DModel';

export const AuthModal = ({ isOpen, onClose, initialMode = 'register', onComplete }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [characterClass, setCharacterClass] = useState('Warrior');
  
  // Forgot Password State
  const [forgotStep, setForgotStep] = useState(1);
  const [recoveryCode, setRecoveryCode] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const classDetails = {
    Warrior: {
      name: 'Warrior',
      icon: '⚔️',
      title: 'Vanguard of Discipline',
      lore: 'Masters of Strength, heavy armor, broadsword combat, and physical discipline.',
      stats: { STR: 18, INT: 10, VIT: 16, AGI: 12, DISC: 15 },
      color: 'from-amber-500 to-red-600',
      border: 'border-amber-400',
      textGlow: 'text-amber-300',
    },
    Mage: {
      name: 'Mage',
      icon: '🔮',
      title: 'Archmage of Mind',
      lore: 'Masters of Intellect, arcane crystal staffs, orbital spellcraft, and coding algorithms.',
      stats: { STR: 8, INT: 20, VIT: 12, AGI: 14, DISC: 17 },
      color: 'from-purple-500 to-cyan-500',
      border: 'border-purple-400',
      textGlow: 'text-purple-300',
    },
    Rogue: {
      name: 'Rogue',
      icon: '🗡️',
      title: 'Shadow of Speed',
      lore: 'Masters of Agility, stealth hoods, dual-wielded daggers, and rapid task execution.',
      stats: { STR: 12, INT: 14, VIT: 11, AGI: 20, DISC: 14 },
      color: 'from-emerald-500 to-teal-500',
      border: 'border-emerald-400',
      textGlow: 'text-emerald-300',
    },
    Paladin: {
      name: 'Paladin',
      icon: '🛡️',
      title: 'Guardian of Vitality',
      lore: 'Masters of Vitality, radiant warhammers, solar halos, and unbroken daily streaks.',
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
        if (!email.trim() || !password) {
          throw new Error('All fields are required. Please provide your Email and Password.');
        }
        await login(email.trim(), password);
        onClose();
        if (onComplete) onComplete();
      } else if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Hero Name is required.');
        }
        if (!email.trim()) {
          throw new Error('Email address is required.');
        }
        if (!phone.trim()) {
          throw new Error('Mobile number is compulsory for hero alerts.');
        }
        if (!password) {
          throw new Error('Password is required.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please confirm your password.');
        }

        await register(
          name.trim(),
          email.trim(),
          phone.trim(),
          password,
          `🌱 ${name.trim() || 'Novice Adventurer'}`,
          'Novice'
        );
        onClose();
        if (onComplete) onComplete();
      } else if (mode === 'forgot') {
        if (forgotStep === 1) {
          if (!email.trim()) {
            throw new Error('Please enter your email address to receive the recovery code.');
          }
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
          let data = null;
          try {
            data = await res.json();
          } catch (jsonErr) {
            // response was not JSON
          }
          if (!res.ok) {
            throw new Error(data?.error || `Unable to send recovery code (Status: ${res.status}). Please check your connection.`);
          }

          setRecoveryCode('');
          setSuccessMsg(data.message || `A 6-digit recovery code has been sent to ${email.trim()}. Please check your email inbox.`);
          setForgotStep(2);
        } else {
          if (!recoveryCode.trim()) {
            throw new Error('Please enter the 6-digit Rune code sent to your email.');
          }
          if (!password) {
            throw new Error('Please enter your new password.');
          }
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long.');
          }
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match. Please re-enter.');
          }
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), code: recoveryCode.trim(), newPassword: password }),
          });
          let data = null;
          try {
            data = await res.json();
          } catch (jsonErr) {
            // response was not JSON
          }
          if (!res.ok) {
            throw new Error(data?.error || `Failed to reset password (Status: ${res.status}). Please verify the 6-digit code.`);
          }

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
            {/* Left Column: 3D Human-like Hero Awakening Portal */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-[#0e1124] to-[#080914] border-b lg:border-b-0 lg:border-r border-purple-500/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <img src="/logo.png" alt="Life RPG Crest" className="w-12 h-12 rounded-2xl border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40 object-cover" />
                  <div>
                    <span className="font-rpg font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-amber-300 tracking-wider">
                      LIFE RPG
                    </span>
                    <span className="block text-[9px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                      Awakening Portal
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-rpg font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300">
                    ✨ 3D Humanoid Hero Model
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Drag 360°
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

              {/* 3D Humanoid Character Model */}
              <div className="relative my-2 flex flex-col items-center justify-center">
                <Hero3DModel characterClass={characterClass} size={230} interactive={true} />
                
                {/* Archetype Quick Switcher for 3D Model Inspection */}
                <div className="flex items-center gap-1.5 mt-2 p-1 rounded-xl bg-slate-900/90 border border-purple-500/30">
                  {Object.values(classDetails).map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setCharacterClass(c.name);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        characterClass === c.name
                          ? 'bg-purple-600 text-amber-300 border border-amber-400 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span className="text-[10px]">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Attribute Radar Meters */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
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
                  <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 mb-4 shadow-inner">
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
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-purple-950/50 border border-purple-500/30 mb-4">
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

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  {mode === 'register' && (
                    <>
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-0.5 flex items-center justify-between">
                          <span>Hero / Character Name</span>
                          <span className="text-[10px] text-amber-400 font-bold">* Required</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Shadow Knight"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email / Identifier Field */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-0.5 flex items-center justify-between">
                      <span>
                        {mode === 'login'
                          ? 'Email, Mobile Number, or Hero Name'
                          : mode === 'forgot'
                          ? 'Registered Email or Hero Name'
                          : 'Email Realm Address'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">* Required</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                      <input
                        type={mode === 'register' ? 'email' : 'text'}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          mode === 'login'
                            ? 'e.g. hero@gmail.com, 9876543210, or GK'
                            : mode === 'forgot'
                            ? 'e.g. hero@gmail.com or GK'
                            : 'hero@gmail.com'
                        }
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Compulsory Mobile Number (Visible in Sign Up mode) */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-0.5 flex items-center justify-between">
                        <span>Mobile Number</span>
                        <span className="text-[10px] text-amber-400 font-bold">* Required</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Forgot Password Step 2: Verification */}
                  {mode === 'forgot' && forgotStep === 2 && (
                    <>
                      <div className="p-3 rounded-2xl bg-purple-950/70 border border-purple-500/40 text-xs text-purple-200 flex items-start gap-2.5">
                        <Mail className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-amber-300 mb-0.5">Verification Code Dispatched to Email</p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            We have sent a 6-digit Rune code to <span className="font-semibold text-white">{email}</span>. Please check your inbox (or spam folder), enter the code below, and set your new password.
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <span>Enter 6-Digit Email Code</span>
                            <span className="text-[10px] text-amber-400 font-bold">* Required</span>
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              sound.playClick();
                              setLoading(true);
                              try {
                                const res = await fetch('/api/auth/forgot-password', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: email.trim() }),
                                });
                                const data = await res.json();
                                setSuccessMsg(data.message || 'New recovery code dispatched to your email!');
                              } catch (e) {
                                setError('Failed to resend code.');
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
                          >
                            Resend Email Code
                          </button>
                        </div>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit code from email"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 font-mono tracking-widest text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-0.5 flex items-center justify-between">
                          <span>New Password Rune</span>
                          <span className="text-[10px] text-amber-400 font-bold">* Required</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-0.5 flex items-center justify-between">
                          <span>Confirm New Password Rune</span>
                          <span className="text-[10px] text-amber-400 font-bold">* Required</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Standard Password Field */}
                  {mode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <span>Secret Password Rune</span>
                          <span className="text-[10px] text-amber-400 font-bold">* Required</span>
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
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                          >
                            Forgot Password Rune?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="•••••••• (Min 6 chars)"
                          className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {mode === 'register' && password && (
                        <div className="mt-1.5 space-y-0.5">
                          <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                            <span>Security Shield:</span>
                            <span className="text-amber-300 font-bold">{strength.label}</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
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

                  {/* Confirm Password Field for Registration */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-0.5 flex items-center justify-between">
                        <span>Confirm Password Rune</span>
                        <span className="text-[10px] text-amber-400 font-bold">* Required</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-2xl font-rpg font-extrabold text-xs sm:text-sm tracking-widest text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
