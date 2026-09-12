import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const AuthModal = ({ isOpen, onClose, initialMode = 'register', onComplete }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [characterClass, setCharacterClass] = useState('Warrior');
  const [avatar, setAvatar] = useState('⚔️ Shadow Knight');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const classes = [
    { name: 'Warrior', icon: '⚔️', desc: 'Masters of Strength and Physical discipline' },
    { name: 'Mage', icon: '🔮', desc: 'Masters of Intellect, Coding and Knowledge' },
    { name: 'Rogue', icon: '🗡️', desc: 'Masters of Speed, Agility and Rapid execution' },
    { name: 'Paladin', icon: '🛡️', desc: 'Masters of Vitality, Health and Consistent streaks' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    sound.playClick();

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, `${avatar}`, characterClass);
      }
      onClose();
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-md w-full rpg-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-600 p-[1px] mx-auto mb-3 shadow-md shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-2xl">
                {mode === 'login' ? '🔑' : '⚔️'}
              </div>
            </div>
            <h2 className="font-rpg text-2xl font-bold text-slate-100 uppercase tracking-wide">
              {mode === 'login' ? 'Enter The Realm' : 'Awaken Your Hero'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Welcome back! Your quest logs and character await.'
                : 'Begin your gamified life operating system journey.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/80 border border-purple-500/20 mb-5">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode('register');
                setError('');
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode('login');
                setError('');
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hero / Character Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Shadow Knight"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Choose RPG Class</label>
                  <div className="grid grid-cols-2 gap-2">
                    {classes.map((c) => (
                      <div
                        key={c.name}
                        onClick={() => {
                          sound.playClick();
                          setCharacterClass(c.name);
                          setAvatar(`${c.icon} ${c.name}`);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          characterClass === c.name
                            ? 'bg-purple-950/80 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.icon}</span>
                          <span className="text-xs font-bold text-slate-200">{c.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adventurer@liferpg.io"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-rpg font-bold tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{mode === 'login' ? 'ENTER ADVENTURE' : 'BEGIN JOURNEY'}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
