import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    category: { type: String, default: 'General' },
    xpReward: { type: Number, default: 100 },
    goldReward: { type: Number, default: 50 },
    condition: {
      type: { type: String, required: true }, // 'quests_completed', 'streak_days', 'level_reached', 'focus_minutes', 'gold_accumulated'
      targetValue: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

const userAchievementSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    achievementCode: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    isClaimed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserAchievement = mongoose.models.UserAchievement || mongoose.model('UserAchievement', userAchievementSchema);
