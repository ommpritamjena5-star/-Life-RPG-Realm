import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/settings
router.get('/', requireAuth, (req, res) => {
  return res.json({ settings: req.user.settings || {} });
});

// PUT /api/settings
router.put('/', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const currentSettings = req.user.settings || {};
    const updatedSettings = {
      ...currentSettings,
      ...req.body,
    };

    const updatedUser = db.updateUser(userId, { settings: updatedSettings });
    const { password: _, ...userData } = updatedUser;

    return res.json({
      message: 'Settings updated successfully!',
      user: userData,
      settings: updatedSettings,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// GET /api/settings/daily-report
// Generates stylized Accountability Report card to share with favorite contact
router.get('/daily-report', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = req.user;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const performance = db.getDailyPerformance(userId, date);
    const quests = db.getQuests(userId, { date });
    const sessions = db.getSessions(userId, date);

    const completedQuests = quests.filter((q) => q.isCompleted);
    const totalFocusMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    const contact = user.settings?.favoriteContact || {
      name: 'Mentor / Accountability Partner',
      email: '',
      phone: '',
    };

    const reportCard = {
      heroName: user.name,
      characterClass: user.characterClass,
      level: user.level,
      streak: user.streak,
      date,
      performanceScore: performance.score,
      completedQuestsCount: completedQuests.length,
      totalQuestsCount: quests.length,
      completedQuestsList: completedQuests.map((q) => ({
        title: q.title,
        category: q.category,
        xpReward: q.xpReward,
      })),
      totalFocusMinutes,
      contact,
      shareableText: `⚔️ Life RPG Daily Quest Report for ${user.name} (${date}):
🏆 Daily Performance: ${performance.score}%
🔥 Active Streak: ${user.streak} Days
⚔️ Quests Completed: ${completedQuests.length}/${quests.length}
⏱️ Deep Focus Time: ${totalFocusMinutes} mins
⭐ Character Level: ${user.level} (${user.characterClass})
Keep forging greatness!`,
    };

    return res.json({ report: reportCard });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate daily report.' });
  }
});

export default router;
