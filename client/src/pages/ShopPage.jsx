import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Plus,
  Shield,
  Zap,
  Gift,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const ShopPage = () => {
  const { user, token, updateUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Custom Reward Form
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCost, setCustomCost] = useState(50);
  const [customIcon, setCustomIcon] = useState('🎮');

  useEffect(() => {
    if (token) {
      loadShopItems();
    }
  }, [token]);

  const loadShopItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shop/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error('Shop load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyItem = async (itemId) => {
    setError('');
    setSuccessMsg('');
    sound.playClick();

    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to purchase item');
      } else {
        sound.playPurchase();
        updateUser(data.user);
        setSuccessMsg(`Acquired ${data.item.name}! Added to your inventory.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      setError('Network error during purchase.');
    }
  };

  const handleCreateCustomReward = async (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    sound.playClick();

    try {
      const res = await fetch('/api/shop/custom-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: customName,
          description: customDesc,
          costGold: Number(customCost),
          icon: customIcon,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems([...items, data.item]);
        setCustomName('');
        setCustomDesc('');
        setIsCustomModalOpen(false);
        setSuccessMsg('Custom reward created! Ready for redemption in your shop.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      setError('Failed to create custom reward.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-rpg font-bold text-2xl sm:text-3xl text-slate-100 flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-amber-400" />
            Treasury & Rewards Bazaar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Spend earned Gold on virtual power-ups, cosmetic themes, or real-life rewards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-sm font-bold flex items-center gap-2 shadow-sm">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            <span>Treasury: {user?.gold || 0} Gold</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsCustomModalOpen(true);
            }}
            className="px-4 py-2 rounded-2xl font-rpg font-bold text-xs tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> CREATE CUSTOM REWARD
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading bazaar wares...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const canAfford = (user?.gold || 0) >= item.costGold;
            return (
              <motion.div
                key={item._id || item.id}
                whileHover={{ y: -3 }}
                className="rpg-panel rounded-3xl p-5 border border-purple-500/20 hover:border-amber-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="text-3xl p-2 rounded-2xl bg-slate-950 border border-purple-500/30">
                      {item.icon}
                    </div>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/30">
                      {item.rarity || 'Common'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-100">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-purple-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-rpg font-bold text-amber-300 text-sm">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{item.costGold} Gold</span>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleBuyItem(item._id || item.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {canAfford ? 'Redeem' : 'Need More Gold'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Custom Reward Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full rpg-panel-glow rounded-3xl p-6 border border-purple-500/40 shadow-2xl"
            >
              <h2 className="font-rpg font-bold text-xl text-slate-100 mb-1">Create Custom Reward</h2>
              <p className="text-xs text-slate-400 mb-4">
                Reward yourself with real-life perks after completing quests.
              </p>

              <form onSubmit={handleCreateCustomReward} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reward Name</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. 1 Hour Gaming, Cheat Snack, Movie"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="Rules and conditions for redeeming this reward..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gold Cost</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={1000}
                      value={customCost}
                      onChange={(e) => setCustomCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Icon</label>
                    <select
                      value={customIcon}
                      onChange={(e) => setCustomIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100"
                    >
                      <option value="🎮">🎮 Gaming</option>
                      <option value="🍕">🍕 Feast</option>
                      <option value="🍿">🍿 Movie</option>
                      <option value="☕">☕ Coffee Break</option>
                      <option value="🛍️">🛍️ Shopping</option>
                      <option value="🏖️">🏖️ Vacation</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-rpg font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow cursor-pointer"
                  >
                    Forge Reward
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
