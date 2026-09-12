import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/achievements
router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const achievements = db.getAchievements();
    const userAchievements = db.getUserAchievements(userId);
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
router.post('/check', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const newlyUnlocked = db.checkUserAchievements(userId);
    return res.json({ newlyUnlocked });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check achievements.' });
  }
});

export default router;
