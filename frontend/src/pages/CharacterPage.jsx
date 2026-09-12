import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Zap,
  Flame,
  Award,
  Sparkles,
  Trophy,
  Activity,
  Heart,
  Brain,
  Wind,
  Smile,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';
import { Character3DModel } from '../components/Character3DModel';
import { CardTilt } from '../components/CardTilt';

export const CharacterPage = () => {
  const { user, token, updateUser } = useAuth();
  const [character, setCharacter] = useState(user);

  useEffect(() => {
    if (token) {
      fetch('/api/character', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.character) setCharacter(data.character);
        })
        .catch((e) => console.error(e));
    }
  }, [token]);

  if (!character) return null;

  const attributesList = [
    { key: 'intellect', name: 'Intellect', icon: Brain, value: character.attributes?.intellect || 10, color: 'text-cyan-400', desc: 'Boosted by Coding & Reading' },
    { key: 'strength', name: 'Strength', icon: Zap, value: character.attributes?.strength || 10, color: 'text-amber-400', desc: 'Boosted by Workouts & Fitness' },
    { key: 'vitality', name: 'Vitality', icon: Heart, value: character.attributes?.vitality || 10, color: 'text-rose-400', desc: 'Boosted by Sleep & Meditation' },
    { key: 'agility', name: 'Agility', icon: Wind, value: character.attributes?.agility || 10, color: 'text-emerald-400', desc: 'Boosted by Speed & Fast Tasks' },
    { key: 'discipline', name: 'Discipline', icon: Shield, value: character.attributes?.discipline || 10, color: 'text-purple-400', desc: 'Boosted by Streaks & Deep Focus' },
    { key: 'charisma', name: 'Charisma', icon: Smile, value: character.attributes?.charisma || 10, color: 'text-yellow-300', desc: 'Boosted by Socializing & Sharing' },
  ];

  const handleToggleEquip = async (itemId) => {
    sound.playClick();
    try {
      const res = await fetch('/api/character/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCharacter(data.user);
        updateUser(data.user);
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
          <User className="w-7 h-7 text-amber-400" />
          Hero Character & 3D Model Inspection
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect your interactive 3D hero avatar, dynamic attributes, lifetime XP, and equipped artifacts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Character Model & Identity Card */}
        <div className="lg:col-span-5 rpg-panel-glow rounded-3xl p-6 sm:p-8 border-2 border-purple-500/40 text-center flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-rpg font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> 3D Hero Model
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <RotateCw className="w-3 h-3" /> Drag to Rotate 360°
              </span>
            </div>

            {/* 3D Character Model Rendering */}
            <div className="my-3 flex justify-center">
              <Character3DModel
                characterClass={character.characterClass || 'Warrior'}
                size={270}
                interactive={true}
              />
            </div>

            <h2 className="font-rpg font-black text-2xl sm:text-3xl text-slate-100">{character.name}</h2>
            <div className="inline-block mt-1 px-3.5 py-1 rounded-full bg-purple-950 border border-purple-400/40 text-purple-300 text-xs font-bold shadow-sm">
              {character.characterClass || 'Warrior'} • Level {character.level || 1}
            </div>
            <p className="text-xs text-amber-300 font-bold mt-2">⭐ {character.title || 'Novice Adventurer'}</p>

            {/* Total XP Earned */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-xs text-slate-300 text-left space-y-2.5">
              <div className="flex justify-between">
                <span>Lifetime XP Accumulated:</span>
                <span className="font-bold text-purple-300">{character.totalXpEarned || 0} XP</span>
              </div>
              <div className="flex justify-between">
                <span>Streak Discipline:</span>
                <span className="font-bold text-orange-400">{character.streak || 1} Days Active</span>
              </div>
              <div className="flex justify-between">
                <span>Treasury Gold:</span>
                <span className="font-bold text-amber-300">{character.gold || 0} Gold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 6 Attributes & Inventory */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rpg-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-xl">
            <h3 className="font-rpg font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> 6 Core Character Attributes
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Level up individual stats by completing corresponding real-life quest categories.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attributesList.map((attr) => {
                const Icon = attr.icon;
                return (
                  <CardTilt key={attr.key} maxAngle={8}>
                    <div className="h-full p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col justify-between hover:border-purple-400/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30">
                            <Icon className={`w-4 h-4 ${attr.color}`} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">{attr.name}</h4>
                            <span className="text-[10px] text-slate-400">{attr.desc}</span>
                          </div>
                        </div>
                        <span className="font-rpg text-xl font-bold text-amber-300">{attr.value}</span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-3 border border-purple-500/20">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                          style={{ width: `${Math.min(100, attr.value * 2.5)}%` }}
                        />
                      </div>
                    </div>
                  </CardTilt>
                );
              })}
            </div>
          </div>

          {/* Equipped Gear / Inventory */}
          <div className="rpg-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-xl">
            <h3 className="font-rpg font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> Equipped Artifacts & Inventory
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Manage items, badges, and potions unlocked from the Rewards Bazaar.
            </p>

            {character.inventory && character.inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {character.inventory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      item.isEquipped
                        ? 'bg-purple-950/40 border-amber-400/50 shadow-sm'
                        : 'bg-slate-900/60 border-purple-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{item.icon || '🛡️'}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-purple-300 uppercase">{item.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleEquip(item.itemId)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        item.isEquipped
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {item.isEquipped ? 'Equipped' : 'Equip'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Your inventory is currently empty. Visit the Shop to acquire items and rewards!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
