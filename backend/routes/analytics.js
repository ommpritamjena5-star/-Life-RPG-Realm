import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/daily
router.get('/daily', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const performance = await db.getDailyPerformance(userId, date);
    return res.json({ performance });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to calculate daily performance.' });
  }
});

// GET /api/analytics/weekly
router.get('/weekly', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const perf = await db.getDailyPerformance(userId, dateStr);
      const sessions = await db.getSessions(userId, dateStr);
      const focusMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

      days.push({
        date: dateStr,
        day: dayName,
        score: perf.score,
        completedQuests: perf.completedQuests,
        focusMinutes,
      });
    }

    return res.json({ weeklyHistory: days });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate weekly analytics.' });
  }
});

// GET /api/analytics/overview
router.get('/overview', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const user = (await db.findUserById(userId)) || req.user;
    const quests = await db.getQuests(userId);
    const sessions = await db.getSessions(userId);

    const totalQuestsCompleted = quests.filter((q) => q.isCompleted).length;
    const totalFocusMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalGoldEarned = user.gold || 0;
    const currentStreak = user.streak || 1;

    const categoryBreakdown = {};
    quests.forEach((q) => {
      categoryBreakdown[q.category] = (categoryBreakdown[q.category] || 0) + 1;
    });

    return res.json({
      totalQuestsCompleted,
      totalFocusMinutes,
      totalGoldEarned,
      currentStreak,
      level: user.level || 1,
      totalXpEarned: user.totalXpEarned || 0,
      attributes: user.attributes,
      categoryBreakdown,
      streakHistory: user.streakHistory || [],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch analytics overview.' });
  }
});

export default router;
