import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['potion', 'gear', 'title', 'theme', 'custom_reward'],
      default: 'potion',
    },
    icon: { type: String, default: '🧪' },
    costGold: { type: Number, required: true },
    rarity: {
      type: String,
      enum: ['Common', 'Rare', 'Epic', 'Legendary'],
      default: 'Common',
    },
    effects: {
      xpBonusPercent: { type: Number, default: 0 },
      streakProtection: { type: Boolean, default: false },
      statBonus: { type: String, default: null },
      statPoints: { type: Number, default: 0 },
      themeKey: { type: String, default: null },
    },
    isCustom: { type: Boolean, default: false },
    createdBy: { type: String, default: null }, // userId if custom reward
  },
  { timestamps: true }
);

export const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
