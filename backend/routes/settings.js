import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';
import {
  sendWelcomeEmail,
  sendLoginSuccessEmail,
  sendForgotPasswordEmail,
  sendQuestReminderEmail,
  sendAchievementEmail,
  sendLevelUpEmail,
} from '../utils/emailService.js';

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

// POST /api/settings/send-reminder
// Manually or automatically dispatches quest reminder email to hero
router.post('/send-reminder', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];

    const allQuests = db.getQuests(userId, { date: today });
    const pendingQuests = allQuests.filter((q) => !q.isCompleted);

    const result = await sendQuestReminderEmail({
      to: user.email,
      name: user.name,
      pendingQuests,
      streak: user.streak || 0,
    });

    return res.json({
      message: `Quest reminder dispatched to ${user.email}!`,
      pendingCount: pendingQuests.length,
      deliveryStatus: result,
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    return res.status(500).json({ error: 'Failed to dispatch reminder email.' });
  }
});

// POST /api/settings/test-email
// Dispatches any test email template for live verification
router.post('/test-email', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { emailType = 'welcome', customRecipient } = req.body;
    const targetEmail = customRecipient || user.email;

    let result;
    switch (emailType) {
      case 'welcome':
        result = await sendWelcomeEmail({
          to: targetEmail,
          name: user.name,
          characterClass: user.characterClass,
        });
        break;
      case 'login':
        result = await sendLoginSuccessEmail({
          to: targetEmail,
          name: user.name,
          ip: req.ip || '127.0.0.1 (Local Session)',
          time: new Date().toLocaleString(),
        });
        break;
      case 'forgot-password':
        result = await sendForgotPasswordEmail({
          to: targetEmail,
          name: user.name,
          resetCode: '742918',
          expiresInMinutes: 15,
        });
        break;
      case 'reminder':
        const today = new Date().toISOString().split('T')[0];
        const quests = db.getQuests(user._id || user.id, { date: today });
        result = await sendQuestReminderEmail({
          to: targetEmail,
          name: user.name,
          pendingQuests: quests.length > 0 ? quests : [
            { title: 'Morning Gym & Strength Ritual', difficulty: 'Medium', xpReward: 75 },
            { title: '45-Min Coding Deep Focus', difficulty: 'Hard', xpReward: 120 },
          ],
          streak: user.streak || 3,
        });
        break;
      case 'achievement':
        result = await sendAchievementEmail({
          to: targetEmail,
          name: user.name,
          achievementTitle: 'Grand Archmage of Productivity',
          icon: '👑',
          description: 'Completed 5 consecutive days of 4-hour focus sessions.',
          xpReward: 350,
          goldReward: 150,
        });
        break;
      case 'levelup':
        result = await sendLevelUpEmail({
          to: targetEmail,
          name: user.name,
          newLevel: (user.level || 1) + 1,
          newClass: user.characterClass || 'Hero',
        });
        break;
      default:
        return res.status(400).json({ error: `Unknown email type: ${emailType}` });
    }

    return res.json({
      message: `Test [${emailType}] email dispatched successfully to ${targetEmail}!`,
      emailType,
      targetEmail,
      result,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({ error: 'Failed to send test email.' });
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
