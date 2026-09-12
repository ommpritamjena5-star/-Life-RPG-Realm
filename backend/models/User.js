import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '🌱 Novice Adventurer' },
    characterClass: { type: String, default: 'Novice' },
    title: { type: String, default: 'Novice Adventurer' },
    level: { type: Number, default: 1 },
    currentXp: { type: Number, default: 0 },
    xpToNextLevel: { type: Number, default: 100 },
    totalXpEarned: { type: Number, default: 0 },
    gold: { type: Number, default: 50 },
    streak: { type: Number, default: 1 },
    lastActiveDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    streakHistory: [{ date: String, completed: Boolean }],
    
    // 6 RPG Character Attributes
    attributes: {
      strength: { type: Number, default: 10 },
      intellect: { type: Number, default: 10 },
      vitality: { type: Number, default: 10 },
      agility: { type: Number, default: 10 },
      discipline: { type: Number, default: 10 },
      charisma: { type: Number, default: 10 },
    },

    // Daily Performance Tracking
    dailyPerformance: {
      date: { type: String, default: () => new Date().toISOString().split('T')[0] },
      score: { type: Number, default: 0 },
      totalScheduledMinutes: { type: Number, default: 0 },
      completedMinutes: { type: Number, default: 0 },
      questsCompleted: { type: Number, default: 0 },
    },

    // Settings & Schedule Preferences
    settings: {
      timezone: { type: String, default: 'UTC' },
      wakeUpTime: { type: String, default: '07:00' },
      sleepTime: { type: String, default: '23:00' },
      defaultSessionDuration: { type: Number, default: 45 },
      breakDuration: { type: Number, default: 15 },
      remindersEnabled: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
      soundVolume: { type: Number, default: 70 },
      animationIntensity: { type: String, enum: ['high', 'medium', 'reduced'], default: 'high' },
      theme: { type: String, default: 'fantasy-dark' },
      leaderboardVisibility: { type: Boolean, default: true },
      favoriteContact: {
        name: { type: String, default: 'Mentor / Accountability Partner' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        dailyReportEnabled: { type: Boolean, default: true },
      },
      onboardingCompleted: { type: Boolean, default: false },
    },

    // Inventory & Equipped Items
    inventory: [
      {
        itemId: { type: String },
        name: { type: String },
        category: { type: String },
        icon: { type: String },
        purchasedAt: { type: Date, default: Date.now },
        isEquipped: { type: Boolean, default: false },
        isConsumed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
