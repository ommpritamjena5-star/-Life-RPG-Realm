import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/quests
router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    // Automatically evaluate overdue tasks & inactivity penalties
    const autoPenalties = db.checkAndApplySlothPenalties(userId);
    const quests = db.getQuests(userId, req.query);
    return res.json({ quests, autoPenalties: autoPenalties || [] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch quests.' });
  }
});

// POST /api/quests
router.post('/', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      title,
      description,
      category,
      difficulty,
      tier,
      durationMinutes,
      subSessionsCount,
      subSessionDuration,
      subtasks,
      scheduledDate,
      priority,
      isRecurring,
      recurrencePattern,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Quest title is required.' });
    }

    // Determine rewards & attribute boost based on difficulty and category
    let xpReward = 50;
    let goldReward = 20;
    let attributePoints = 2;

    switch (difficulty) {
      case 'Easy':
        xpReward = 25;
        goldReward = 10;
        attributePoints = 1;
        break;
      case 'Medium':
        xpReward = 50;
        goldReward = 25;
        attributePoints = 2;
        break;
      case 'Hard':
        xpReward = 100;
        goldReward = 60;
        attributePoints = 4;
        break;
      case 'Epic':
        xpReward = 250;
        goldReward = 150;
        attributePoints = 8;
        break;
      default:
        xpReward = 50;
        goldReward = 20;
    }

    let attributeBoost = 'discipline';
    switch (category) {
      case 'Coding':
      case 'Reading':
        attributeBoost = 'intellect';
        break;
      case 'Workout':
        attributeBoost = 'strength';
        break;
      case 'Meditation':
        attributeBoost = 'vitality';
        break;
      case 'Chores':
        attributeBoost = 'discipline';
        break;
      case 'Social':
        attributeBoost = 'charisma';
        break;
      default:
        attributeBoost = 'agility';
    }

    const newQuest = db.createQuest({
      userId,
      title: title.trim(),
      description: description || '',
      category: category || 'General',
      difficulty: difficulty || 'Medium',
      tier: tier || 'Daily',
      xpReward,
      goldReward,
      attributeBoost,
      attributePoints,
      durationMinutes: Number(durationMinutes) || 45,
      subSessionsCount: Number(subSessionsCount) || 1,
      subSessionDuration: Number(subSessionDuration) || 45,
      subtasks: Array.isArray(subtasks)
        ? subtasks.map((st, i) => ({
            id: 'st_' + Date.now() + '_' + i,
            title: typeof st === 'string' ? st : st.title,
            isCompleted: false,
          }))
        : [],
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      priority: priority || 'medium',
      isRecurring: !!isRecurring,
      recurrencePattern: recurrencePattern || 'none',
    });

    return res.status(201).json({
      message: 'Quest forged successfully!',
      quest: newQuest,
    });
  } catch (error) {
    console.error('Create quest error:', error);
    return res.status(500).json({ error: 'Failed to create quest.' });
  }
});

// PUT /api/quests/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const quest = db.getQuestById(req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found.' });

    const userId = req.user._id || req.user.id;
    if (quest.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this quest.' });
    }

    const updated = db.updateQuest(req.params.id, req.body);
    return res.json({ quest: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update quest.' });
  }
});

// POST /api/quests/:id/complete
router.post('/:id/complete', requireAuth, (req, res) => {
  try {
    const quest = db.getQuestById(req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found.' });

    const userId = req.user._id || req.user.id;
    if (quest.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to complete this quest.' });
    }

    // Prevent duplicate completion
    if (quest.isCompleted) {
      return res.status(400).json({ error: 'Quest has already been completed!' });
    }

    // Mark quest completed
    const updatedQuest = db.updateQuest(quest._id || quest.id, {
      isCompleted: true,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    // Check for active consumable potion buffs in inventory (e.g. +20% XP)
    let xpGain = quest.xpReward || 50;
    let goldGain = quest.goldReward || 20;

    const user = db.findUserById(userId);
    const potion = user.inventory?.find((i) => i.effects?.xpBonusPercent && !i.isConsumed);
    if (potion) {
      const bonus = Math.round(xpGain * (potion.effects.xpBonusPercent / 100));
      xpGain += bonus;
      // Mark potion consumed
      potion.isConsumed = true;
      db.updateUser(userId, { inventory: user.inventory });
    }

    // Award XP, Gold, Level progression, Streak update
    const progressionResult = db.awardXpAndGold(
      userId,
      xpGain,
      goldGain,
      quest.attributeBoost,
      quest.attributePoints || 2
    );

    // Also update linked schedule if exists
    const schedules = db.getSchedules(userId, quest.scheduledDate);
    const linkedSchedule = schedules.find((s) => s.questId === (quest._id || quest.id));
    if (linkedSchedule) {
      db.updateSchedule(linkedSchedule._id || linkedSchedule.id, { isCompleted: true });
    }

    // Check newly unlocked achievements
    const newlyUnlockedAchievements = db.checkUserAchievements(userId);

    return res.json({
      message: 'Quest completed! Rewards granted.',
      quest: updatedQuest,
      progression: progressionResult,
      newAchievements: newlyUnlockedAchievements,
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    return res.status(500).json({ error: 'Failed to complete quest.' });
  }
});

// POST /api/quests/:id/skip (Sloth & Abandonment Penalty)
router.post('/:id/skip', requireAuth, (req, res) => {
  try {
    const quest = db.getQuestById(req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found.' });

    const userId = req.user._id || req.user.id;
    if (quest.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to abandon this quest.' });
    }

    if (quest.isCompleted) {
      return res.status(400).json({ error: 'Completed quests cannot be skipped.' });
    }

    // Determine penalty based on quest difficulty
    let xpLoss = 35;
    let goldLoss = 15;
    switch (quest.difficulty) {
      case 'Easy':
        xpLoss = 20;
        goldLoss = 10;
        break;
      case 'Medium':
        xpLoss = 40;
        goldLoss = 15;
        break;
      case 'Hard':
        xpLoss = 70;
        goldLoss = 30;
        break;
      case 'Epic':
        xpLoss = 120;
        goldLoss = 60;
        break;
      default:
        xpLoss = 35;
        goldLoss = 15;
    }

    // Mark quest as failed/skipped
    const updatedQuest = db.updateQuest(quest._id || quest.id, {
      status: 'failed',
      failedAt: new Date().toISOString(),
      penaltyApplied: true,
    });

    // Execute penalty deduction
    const penaltyResult = db.deductXpAndPenalize(
      userId,
      xpLoss,
      goldLoss,
      'discipline',
      `Skipped Quest: "${quest.title}"`
    );

    return res.json({
      message: `Quest skipped. Sloth Penalty: -${xpLoss} XP, -${goldLoss} Gold${penaltyResult.shieldUsed ? ' (Streak Protected by Aegis Shield!)' : ', Streak reduced by 1.'}`,
      quest: updatedQuest,
      penaltyResult,
    });
  } catch (error) {
    console.error('Skip quest error:', error);
    return res.status(500).json({ error: 'Failed to process quest penalty.' });
  }
});

// DELETE /api/quests/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const quest = db.getQuestById(req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found.' });

    const userId = req.user._id || req.user.id;
    if (quest.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this quest.' });
    }

    db.deleteQuest(req.params.id);
    return res.json({ message: 'Quest banished successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete quest.' });
  }
});

export default router;
