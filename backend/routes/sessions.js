import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/sessions
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const date = req.query.date || null;
    const sessions = await db.getSessions(userId, date);
    return res.json({ sessions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch focus sessions.' });
  }
});

// POST /api/sessions
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const {
      questId,
      title,
      category,
      durationMinutes,
      subSessionNumber,
      totalSubSessions,
      notes,
    } = req.body;

    const duration = Number(durationMinutes) || 45;
    const xpAwarded = Math.round(duration * 1.2);
    const goldAwarded = Math.round(duration * 0.5);

    let attributeBoost = 'intellect';
    if (category === 'Workout') attributeBoost = 'strength';
    else if (category === 'Meditation') attributeBoost = 'vitality';
    else if (category === 'Chores') attributeBoost = 'discipline';
    else if (category === 'Social') attributeBoost = 'charisma';

    const newSession = await db.createSession({
      userId,
      questId: questId || null,
      title: title || 'Deep Focus Session',
      category: category || 'Coding',
      durationMinutes: duration,
      subSessionNumber: Number(subSessionNumber) || 1,
      totalSubSessions: Number(totalSubSessions) || 1,
      xpAwarded,
      goldAwarded,
      notes: notes || '',
    });

    const progressionResult = await db.awardXpAndGold(
      userId,
      xpAwarded,
      goldAwarded,
      attributeBoost,
      1
    );

    const newlyUnlockedAchievements = await db.checkUserAchievements(userId);

    return res.status(201).json({
      message: 'Focus session completed! XP & Gold awarded.',
      session: newSession,
      progression: progressionResult,
      newAchievements: newlyUnlockedAchievements,
    });
  } catch (error) {
    console.error('Session create error:', error);
    return res.status(500).json({ error: 'Failed to log focus session.' });
  }
});

export default router;
