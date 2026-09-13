import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';
import { sendAchievementEmail } from '../utils/emailService.js';

const router = express.Router();

// GET /api/achievements
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const achievements = await db.getAchievements();
    const userAchievements = await db.getUserAchievements(userId);
    const unlockedMap = new Set(userAchievements.map((ua) => ua.achievementCode));

    const enriched = achievements.map((ach) => ({
      ...ach,
      isUnlocked: unlockedMap.has(ach.code),
      unlockedAt: userAchievements.find((ua) => ua.achievementCode === ach.code)?.unlockedAt || null,
    }));

    return res.json({ achievements: enriched });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch achievements.' });
  }
});

// POST /api/achievements/check
router.post('/check', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const user = req.user;
    const newlyUnlocked = await db.checkUserAchievements(userId);

    if (newlyUnlocked && newlyUnlocked.length > 0 && user?.email) {
      newlyUnlocked.forEach((ach) => {
        sendAchievementEmail({
          to: user.email,
          name: user.name,
          achievementTitle: ach.title,
          icon: ach.icon || '🏆',
          description: ach.description,
          xpReward: ach.xpReward || 100,
          goldReward: ach.goldReward || 50,
        }).catch((err) => console.warn('[Email Warning]:', err.message));
      });
    }

    return res.json({ newlyUnlocked });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check achievements.' });
  }
});

export default router;
