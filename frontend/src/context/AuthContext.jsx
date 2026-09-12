import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '../utils/soundEngine';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('liferpg_token') || '');
  const [loading, setLoading] = useState(true);
  const [levelUpData, setLevelUpData] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.settings) {
          sound.setEnabled(data.user.settings.soundEnabled !== false);
          sound.setVolume(data.user.settings.soundVolume || 70);
        }
      } else {
        logout();
      }
    } catch (e) {
      console.error('Fetch user error:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('liferpg_token', data.token);
    return data.user;
  };

  const register = async (name, email, phone, password, avatar = '🌱 Novice Adventurer', characterClass = 'Novice') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        avatar,
        characterClass,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('liferpg_token', data.token);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('liferpg_token');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const triggerProgressionEvent = (progression) => {
    if (!progression) return;
    if (progression.user) {
      setUser(progression.user);
    }
    if (progression.leveledUp) {
      sound.playLevelUp();
      setLevelUpData({
        newLevel: progression.newLevel,
        levelsGained: progression.levelsGained,
        user: progression.user,
      });
    }
  };

  const closeLevelUpModal = () => {
    setLevelUpData(null);
  };

  const triggerPenaltyEvent = (penaltyResult) => {
    if (!penaltyResult) return;
    if (penaltyResult.user) {
      setUser(penaltyResult.user);
    } else {
      fetchUser();
    }
    sound.playPenalty();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        fetchUser,
        refreshUser: fetchUser,
        triggerProgressionEvent,
        triggerPenaltyEvent,
        levelUpData,
        setLevelUpData,
        closeLevelUpModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
