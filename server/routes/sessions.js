import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/sessions
router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const date = req.query.date || null;
    const sessions = db.getSessions(userId, date);
    return res.json({ sessions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch focus sessions.' });
  }
});

// POST /api/sessions
// Log completed focus sub-session (e.g. 45-minute sub-session)
router.post('/', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
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
    
    // XP Calculation: 1 XP per minute of focus + bonus for completion
    const xpAwarded = Math.round(duration * 1.2);
    const goldAwarded = Math.round(duration * 0.5);

    let attributeBoost = 'intellect';
    if (category === 'Workout') attributeBoost = 'strength';
    else if (category === 'Meditation') attributeBoost = 'vitality';
    else if (category === 'Chores') attributeBoost = 'discipline';
    else if (category === 'Social') attributeBoost = 'charisma';

    const newSession = db.createSession({
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

    // Award XP and Gold to user
    const progressionResult = db.awardXpAndGold(
      userId,
      xpAwarded,
      goldAwarded,
      attributeBoost,
      1
    );

    // Check newly unlocked achievements
    const newlyUnlockedAchievements = db.checkUserAchievements(userId);

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
