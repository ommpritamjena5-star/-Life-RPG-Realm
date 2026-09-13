import { User } from '../models/User.js';
import { Quest } from '../models/Quest.js';
import { Schedule } from '../models/Schedule.js';
import { Session } from '../models/Session.js';
import { Item } from '../models/Item.js';
import { Achievement, UserAchievement } from '../models/Achievement.js';
import { defaultAchievements, defaultShopItems } from './seedData.js';

// Leveling formula: XP_needed = Math.floor(100 * Math.pow(level, 1.5))
export const calculateXpRequired = (level) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

class MongoStorageEngine {
  constructor() {
    this.initialized = false;
  }

  // Ensure default catalog exists in MongoDB
  async ensureCatalog() {
    try {
      const itemCount = await Item.countDocuments();
      if (itemCount === 0) {
        await Item.insertMany(defaultShopItems);
        console.log('[MongoDB] Seeded default Bazaar items.');
      }
      const achCount = await Achievement.countDocuments();
      if (achCount === 0) {
        await Achievement.insertMany(defaultAchievements);
        console.log('[MongoDB] Seeded default Achievements.');
      }
      this.initialized = true;
    } catch (e) {
      console.warn('[MongoDB] Catalog init note:', e.message);
    }
  }

  // Users
  async findUserByEmail(email) {
    if (!email) return null;
    const searchEmail = String(email).trim().toLowerCase();
    return await User.findOne({ email: searchEmail }).lean();
  }

  async findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = String(identifier).trim();
    const cleanLower = clean.toLowerCase();
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Direct or lowercase email match
    let user = await User.findOne({ email: cleanLower }).lean();
    if (user) return user;

    // 2. Case-insensitive exact email match
    try {
      user = await User.findOne({ email: { $regex: new RegExp(`^${escapeRegex(clean)}$`, 'i') } }).lean();
      if (user) return user;
    } catch {}

    // 3. Email prefix matching (e.g. piku6664@gmail.com vs piku6664@gmail or username as email prefix)
    if (cleanLower.includes('@')) {
      const prefix = cleanLower.split('@')[0];
      try {
        user = await User.findOne({ email: { $regex: new RegExp(`^${escapeRegex(prefix)}(@.*)?$`, 'i') } }).lean();
        if (user) return user;
      } catch {}
    } else {
      try {
        user = await User.findOne({ email: { $regex: new RegExp(`^${escapeRegex(cleanLower)}@`, 'i') } }).lean();
        if (user) return user;
      } catch {}
    }

    // 4. Phone number match (digits only or partial matching)
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length >= 7) {
      try {
        user = await User.findOne({ phone: { $regex: new RegExp(digitsOnly + '$') } }).lean();
        if (user) return user;
      } catch {}
    }

    // 5. Hero / Character Name match (case-insensitive)
    try {
      user = await User.findOne({ name: { $regex: new RegExp(`^${escapeRegex(clean)}$`, 'i') } }).lean();
      if (user) return user;
    } catch {}

    return null;
  }

  async findUserById(id) {
    if (!id) return null;
    try {
      return await User.findById(id).lean();
    } catch {
      return await User.findOne({ _id: id }).lean();
    }
  }

  async createUser(userData) {
    const user = await User.create({
      ...userData,
      level: 1,
      currentXp: 0,
      xpToNextLevel: calculateXpRequired(1),
      totalXpEarned: 0,
      gold: 100,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      streakHistory: [{ date: new Date().toISOString().split('T')[0], completed: true }],
      attributes: {
        strength: 10,
        intellect: 10,
        vitality: 10,
        agility: 10,
        discipline: 10,
        charisma: 10,
      },
      dailyPerformance: {
        date: new Date().toISOString().split('T')[0],
        score: 100,
        totalScheduledMinutes: 0,
        completedMinutes: 0,
        questsCompleted: 0,
      },
      settings: {
        timezone: 'UTC',
        wakeUpTime: '07:00',
        sleepTime: '23:00',
        defaultSessionDuration: 45,
        breakDuration: 15,
        remindersEnabled: true,
        soundEnabled: true,
        soundVolume: 70,
        animationIntensity: 'high',
        theme: 'fantasy-dark',
        leaderboardVisibility: true,
        favoriteContact: {
          name: 'Mentor / Accountability Partner',
          email: '',
          phone: '',
          dailyReportEnabled: true,
        },
        onboardingCompleted: false,
        ...(userData.settings || {}),
      },
      inventory: [],
    });
    return user.toObject ? user.toObject() : user;
  }

  async updateUser(id, updates) {
    try {
      return await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    } catch {
      return await User.findOneAndUpdate({ _id: id }, { $set: updates }, { new: true }).lean();
    }
  }

  // Award XP & Gold with Non-Linear Level Progression
  async awardXpAndGold(userId, xpGain, goldGain, attribute = null, attributePoints = 2) {
    const user = await this.findUserById(userId);
    if (!user) return null;

    let { level = 1, currentXp = 0, totalXpEarned = 0, gold = 0, attributes = {} } = user;
    let leveledUp = false;
    let levelsGained = 0;

    currentXp += xpGain;
    totalXpEarned += xpGain;
    gold += goldGain;

    const updatedAttributes = {
      strength: attributes.strength || 10,
      intellect: attributes.intellect || 10,
      vitality: attributes.vitality || 10,
      agility: attributes.agility || 10,
      discipline: attributes.discipline || 10,
      charisma: attributes.charisma || 10,
    };

    if (attribute && updatedAttributes[attribute] !== undefined) {
      updatedAttributes[attribute] += attributePoints;
    }

    let xpToNextLevel = calculateXpRequired(level);
    while (currentXp >= xpToNextLevel) {
      currentXp -= xpToNextLevel;
      level += 1;
      levelsGained += 1;
      leveledUp = true;
      xpToNextLevel = calculateXpRequired(level);
      gold += 50 * level;
      Object.keys(updatedAttributes).forEach((attr) => {
        updatedAttributes[attr] += 1;
      });
    }

    const today = new Date().toISOString().split('T')[0];
    let streak = user.streak || 1;
    let streakHistory = Array.isArray(user.streakHistory) ? [...user.streakHistory] : [];

    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastActiveDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
      streakHistory.push({ date: today, completed: true });
    }

    let characterClass = user.characterClass || 'Novice';
    let archetypeEvolved = false;

    if (level >= 2 || totalXpEarned >= 80) {
      const { strength = 10, intellect = 10, vitality = 10, agility = 10 } = updatedAttributes;
      const maxAttr = Math.max(strength, intellect, vitality, agility);

      let evolvedArchetype = characterClass;
      if (maxAttr === strength && strength > 10) evolvedArchetype = 'Warrior';
      else if (maxAttr === intellect && intellect > 10) evolvedArchetype = 'Mage';
      else if (maxAttr === agility && agility > 10) evolvedArchetype = 'Rogue';
      else if (maxAttr === vitality && vitality > 10) evolvedArchetype = 'Paladin';

      if (evolvedArchetype !== characterClass) {
        characterClass = evolvedArchetype;
        archetypeEvolved = true;
      }
    }

    const updated = await this.updateUser(userId, {
      level,
      currentXp,
      xpToNextLevel,
      totalXpEarned,
      gold,
      attributes: updatedAttributes,
      characterClass,
      streak,
      lastActiveDate: today,
      streakHistory,
    });

    await this.checkUserAchievements(userId);

    return {
      user: updated,
      leveledUp,
      levelsGained,
      newLevel: level,
      characterClass,
      archetypeEvolved,
      xpGained: xpGain,
      goldGained: goldGain,
    };
  }

  // Deduct XP, Gold, Discipline and reduce streak on task skip or inactivity
  async deductXpAndPenalize(userId, xpLoss = 30, goldLoss = 10, attributeLoss = 'discipline', reason = 'Skipped Quest') {
    const user = await this.findUserById(userId);
    if (!user) return null;

    let { currentXp = 0, totalXpEarned = 0, gold = 0, attributes = {}, streak = 1, inventory = [] } = user;
    let shieldUsed = false;

    const shieldIndex = inventory.findIndex((item) => item.effects?.streakProtection && !item.isConsumed);
    if (shieldIndex !== -1) {
      inventory[shieldIndex].isConsumed = true;
      shieldUsed = true;
    } else {
      streak = Math.max(1, streak - 1);
    }

    currentXp = Math.max(0, currentXp - xpLoss);
    totalXpEarned = Math.max(0, totalXpEarned - xpLoss);
    gold = Math.max(0, gold - goldLoss);

    const updatedAttributes = {
      strength: attributes.strength || 10,
      intellect: attributes.intellect || 10,
      vitality: attributes.vitality || 10,
      agility: attributes.agility || 10,
      discipline: attributes.discipline || 10,
      charisma: attributes.charisma || 10,
    };

    if (attributeLoss && updatedAttributes[attributeLoss] !== undefined) {
      updatedAttributes[attributeLoss] = Math.max(1, updatedAttributes[attributeLoss] - 1);
    }

    const updated = await this.updateUser(userId, {
      currentXp,
      totalXpEarned,
      gold,
      streak,
      attributes: updatedAttributes,
      inventory,
    });

    return {
      user: updated,
      penaltyApplied: true,
      xpLoss,
      goldLoss,
      attributeLoss,
      reason,
      shieldUsed,
    };
  }

  // Check and apply sloth penalties for overdue quests
  async checkAndApplySlothPenalties(userId) {
    const today = new Date().toISOString().split('T')[0];
    const overdueQuests = await Quest.find({
      userId,
      isCompleted: false,
      scheduledDate: { $lt: today },
    }).lean();

    const penalties = [];
    for (const q of overdueQuests) {
      const penalty = await this.deductXpAndPenalize(userId, 20, 10, 'discipline', `Overdue: ${q.title}`);
      if (penalty) {
        penalties.push({ questId: q._id, title: q.title, ...penalty });
      }
      await Quest.findByIdAndUpdate(q._id, { scheduledDate: today });
    }
    return penalties;
  }

  // Quests
  async getQuests(userId, filters = {}) {
    const query = { userId };
    if (filters.date) query.scheduledDate = filters.date;
    if (filters.category) query.category = filters.category;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.tier) query.tier = filters.tier;
    if (filters.status) query.status = filters.status;
    if (filters.isCompleted !== undefined) query.isCompleted = filters.isCompleted === 'true' || filters.isCompleted === true;

    return await Quest.find(query).sort({ priority: -1, createdAt: -1 }).lean();
  }

  async getQuestById(id) {
    try {
      return await Quest.findById(id).lean();
    } catch {
      return await Quest.findOne({ _id: id }).lean();
    }
  }

  async createQuest(questData) {
    const quest = await Quest.create(questData);
    return quest.toObject ? quest.toObject() : quest;
  }

  async updateQuest(id, updates) {
    try {
      return await Quest.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    } catch {
      return await Quest.findOneAndUpdate({ _id: id }, { $set: updates }, { new: true }).lean();
    }
  }

  async deleteQuest(id) {
    try {
      await Quest.findByIdAndDelete(id);
    } catch {
      await Quest.findOneAndDelete({ _id: id });
    }
    return true;
  }

  // Schedules
  async getSchedules(userId, date = null) {
    const query = { userId };
    if (date) query.date = date;
    return await Schedule.find(query).sort({ startTime: 1 }).lean();
  }

  async getScheduleById(id) {
    try {
      return await Schedule.findById(id).lean();
    } catch {
      return await Schedule.findOne({ _id: id }).lean();
    }
  }

  async createSchedule(scheduleData) {
    const schedule = await Schedule.create(scheduleData);
    return schedule.toObject ? schedule.toObject() : schedule;
  }

  async updateSchedule(id, updates) {
    try {
      return await Schedule.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    } catch {
      return await Schedule.findOneAndUpdate({ _id: id }, { $set: updates }, { new: true }).lean();
    }
  }

  async deleteSchedule(id) {
    try {
      await Schedule.findByIdAndDelete(id);
    } catch {
      await Schedule.findOneAndDelete({ _id: id });
    }
    return true;
  }

  // Focus Sub-Sessions
  async getSessions(userId, date = null) {
    const query = { userId };
    if (date) query.date = date;
    return await Session.find(query).sort({ createdAt: -1 }).lean();
  }

  async createSession(sessionData) {
    const session = await Session.create(sessionData);
    return session.toObject ? session.toObject() : session;
  }

  // Shop & Treasury
  async getItems() {
    await this.ensureCatalog();
    return await Item.find({}).lean();
  }

  async getItemById(id) {
    try {
      return await Item.findById(id).lean();
    } catch {
      return await Item.findOne({ _id: id }).lean();
    }
  }

  async createItem(itemData) {
    const item = await Item.create(itemData);
    return item.toObject ? item.toObject() : item;
  }

  async buyItem(userId, itemId) {
    const user = await this.findUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const item = await this.getItemById(itemId);
    if (!item) return { success: false, error: 'Item not found in shop' };

    if (user.gold < item.costGold) {
      return { success: false, error: 'Insufficient gold balance' };
    }

    const updatedGold = user.gold - item.costGold;
    const inventory = Array.isArray(user.inventory) ? [...user.inventory] : [];
    inventory.push({
      itemId: String(item._id || item.id),
      name: item.name,
      category: item.category,
      icon: item.icon,
      effects: item.effects,
      purchasedAt: new Date().toISOString(),
      isEquipped: false,
      isConsumed: false,
    });

    const updatedUser = await this.updateUser(userId, { gold: updatedGold, inventory });
    return { success: true, user: updatedUser, item };
  }

  // Achievements
  async getAchievements() {
    await this.ensureCatalog();
    return await Achievement.find({}).lean();
  }

  async getUserAchievements(userId) {
    return await UserAchievement.find({ userId }).lean();
  }

  async checkUserAchievements(userId) {
    const user = await this.findUserById(userId);
    if (!user) return [];

    const completedQuests = await Quest.countDocuments({ userId, isCompleted: true });
    const userSessions = await Session.find({ userId }).lean();
    const totalFocusMinutes = userSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const unlockedRecords = await this.getUserAchievements(userId);
    const unlockedList = unlockedRecords.map((ua) => ua.achievementCode);

    const achievements = await this.getAchievements();
    const newlyUnlocked = [];

    for (const ach of achievements) {
      if (unlockedList.includes(ach.code)) continue;

      let satisfied = false;
      const { type, targetValue } = ach.condition || {};

      if (type === 'quests_completed' && completedQuests >= targetValue) satisfied = true;
      if (type === 'streak_days' && (user.streak || 1) >= targetValue) satisfied = true;
      if (type === 'focus_minutes' && totalFocusMinutes >= targetValue) satisfied = true;
      if (type === 'level_reached' && (user.level || 1) >= targetValue) satisfied = true;
      if (type === 'gold_accumulated' && (user.gold || 0) >= targetValue) satisfied = true;

      if (satisfied) {
        await UserAchievement.create({
          userId,
          achievementCode: ach.code,
          unlockedAt: new Date(),
          isClaimed: true,
        });
        newlyUnlocked.push(ach);
      }
    }

    return newlyUnlocked;
  }

  // Daily Performance Calculation
  async getDailyPerformance(userId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const user = await this.findUserById(userId);
    if (!user) return { score: 100, message: 'Ready for quests' };

    const schedules = await this.getSchedules(userId, targetDate);
    const quests = await this.getQuests(userId, { date: targetDate });
    const sessions = await this.getSessions(userId, targetDate);

    const totalScheduledMinutes = schedules.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const completedScheduledMinutes = schedules
      .filter((s) => s.isCompleted)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const completedQuests = quests.filter((q) => q.isCompleted).length;
    const totalQuests = quests.length;
    const totalFocusMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    let score = 100;
    if (totalScheduledMinutes > 0 || totalQuests > 0) {
      let scheduleRatio = totalScheduledMinutes > 0 ? (completedScheduledMinutes / totalScheduledMinutes) * 100 : 100;
      let questRatio = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 100;

      if (totalScheduledMinutes > 0 && totalQuests > 0) {
        score = Math.round(scheduleRatio * 0.5 + questRatio * 0.5);
      } else if (totalScheduledMinutes > 0) {
        score = Math.round(scheduleRatio);
      } else {
        score = Math.round(questRatio);
      }
    } else if (totalFocusMinutes > 0) {
      score = 100;
    }

    const performanceData = {
      date: targetDate,
      score,
      totalScheduledMinutes,
      completedScheduledMinutes,
      completedQuests,
      totalQuests,
      totalFocusMinutes,
    };

    // Permanently persist performance to MongoDB Atlas so it is immediately visible on next visit
    try {
      await this.updateUser(userId, { dailyPerformance: performanceData });
    } catch {}

    return performanceData;
  }

  // Leaderboard
  async getLeaderboard() {
    const users = await User.find({ 'settings.leaderboardVisibility': { $ne: false } })
      .sort({ totalXpEarned: -1, level: -1 })
      .lean();

    return users.map((u) => ({
      id: String(u._id),
      name: u.name,
      avatar: u.avatar || '⚔️ Shadow Knight',
      title: u.title || 'Novice Adventurer',
      level: u.level || 1,
      totalXpEarned: u.totalXpEarned || 0,
      streak: u.streak || 1,
      gold: u.gold || 0,
    }));
  }
}

export const db = new MongoStorageEngine();
