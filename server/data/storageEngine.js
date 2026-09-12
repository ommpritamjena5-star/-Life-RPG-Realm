import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultAchievements, defaultShopItems } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Leveling formula: XP_needed = Math.floor(100 * Math.pow(level, 1.5))
export const calculateXpRequired = (level) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// Initial database structure
const getInitialState = () => ({
  users: [],
  quests: [],
  schedules: [],
  sessions: [],
  items: defaultShopItems,
  achievements: defaultAchievements,
  userAchievements: [],
});

class StorageEngine {
  constructor() {
    this.data = getInitialState();
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...getInitialState(),
          ...parsed,
          items: parsed.items && parsed.items.length ? parsed.items : defaultShopItems,
          achievements: parsed.achievements && parsed.achievements.length ? parsed.achievements : defaultAchievements,
        };
      } else {
        this.saveToFile();
      }
    } catch (e) {
      console.error('[StorageEngine] Error loading db.json:', e.message);
      this.data = getInitialState();
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[StorageEngine] Error saving db.json:', e.message);
    }
  }

  // Users
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find((u) => u._id === id || u.id === id);
  }

  createUser(userData) {
    const newUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...userData,
      level: 1,
      currentXp: 0,
      xpToNextLevel: calculateXpRequired(1),
      totalXpEarned: 0,
      gold: 100, // starting gold bonus
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  updateUser(id, updates) {
    const userIndex = this.data.users.findIndex((u) => u._id === id || u.id === id);
    if (userIndex === -1) return null;
    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.data.users[userIndex];
  }

  // Award XP & Gold with Non-Linear Level Progression
  awardXpAndGold(userId, xpGain, goldGain, attribute = null, attributePoints = 2) {
    const user = this.findUserById(userId);
    if (!user) return null;

    let { level, currentXp, xpToNextLevel, totalXpEarned, gold, attributes } = user;
    let leveledUp = false;
    let levelsGained = 0;

    currentXp += xpGain;
    totalXpEarned += xpGain;
    gold += goldGain;

    if (attribute && attributes[attribute] !== undefined) {
      attributes[attribute] += attributePoints;
    }

    // Check for level ups (can handle multiple level ups if huge XP)
    while (currentXp >= xpToNextLevel) {
      currentXp -= xpToNextLevel;
      level += 1;
      levelsGained += 1;
      leveledUp = true;
      xpToNextLevel = calculateXpRequired(level);
      // Give bonus gold and attributes on level up
      gold += 50 * level;
      Object.keys(attributes).forEach((attr) => {
        attributes[attr] += 1;
      });
    }

    // Update streak if needed
    const today = new Date().toISOString().split('T')[0];
    let streak = user.streak || 1;
    let streakHistory = user.streakHistory || [];

    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastActiveDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
      streakHistory.push({ date: today, completed: true });
    }

    const updated = this.updateUser(userId, {
      level,
      currentXp,
      xpToNextLevel,
      totalXpEarned,
      gold,
      attributes,
      streak,
      lastActiveDate: today,
      streakHistory,
    });

    // Check achievements
    this.checkUserAchievements(userId);

    return {
      user: updated,
      leveledUp,
      levelsGained,
      newLevel: level,
      xpGained: xpGain,
      goldGained: goldGain,
    };
  }

  // Quests
  getQuests(userId, query = {}) {
    let list = this.data.quests.filter((q) => q.userId === userId);
    if (query.tier) list = list.filter((q) => q.tier === query.tier);
    if (query.category) list = list.filter((q) => q.category === query.category);
    if (query.date) list = list.filter((q) => q.scheduledDate === query.date);
    if (query.status) list = list.filter((q) => q.status === query.status);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getQuestById(id) {
    return this.data.quests.find((q) => q._id === id || q.id === id);
  }

  createQuest(questData) {
    const newQuest = {
      _id: 'quest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...questData,
      isCompleted: false,
      status: 'pending',
      subtasks: questData.subtasks || [],
      scheduledDate: questData.scheduledDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.quests.push(newQuest);
    this.saveToFile();
    return newQuest;
  }

  updateQuest(id, updates) {
    const index = this.data.quests.findIndex((q) => q._id === id || q.id === id);
    if (index === -1) return null;
    this.data.quests[index] = {
      ...this.data.quests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.data.quests[index];
  }

  deleteQuest(id) {
    const initialLen = this.data.quests.length;
    this.data.quests = this.data.quests.filter((q) => q._id !== id && q.id !== id);
    this.saveToFile();
    return this.data.quests.length < initialLen;
  }

  // Schedules (Time Blocks)
  getSchedules(userId, date) {
    return this.data.schedules
      .filter((s) => s.userId === userId && (!date || s.date === date))
      .sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
  }

  createSchedule(scheduleData) {
    const newSchedule = {
      _id: 'sched_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...scheduleData,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.schedules.push(newSchedule);
    this.saveToFile();
    return newSchedule;
  }

  updateSchedule(id, updates) {
    const index = this.data.schedules.findIndex((s) => s._id === id || s.id === id);
    if (index === -1) return null;
    this.data.schedules[index] = {
      ...this.data.schedules[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToFile();
    return this.data.schedules[index];
  }

  deleteSchedule(id) {
    const initialLen = this.data.schedules.length;
    this.data.schedules = this.data.schedules.filter((s) => s._id !== id && s.id !== id);
    this.saveToFile();
    return this.data.schedules.length < initialLen;
  }

  // Sessions (Focus Sub-sessions)
  getSessions(userId, date = null) {
    let list = this.data.sessions.filter((s) => s.userId === userId);
    if (date) list = list.filter((s) => s.date === date);
    return list.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }

  createSession(sessionData) {
    const newSession = {
      _id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...sessionData,
      date: sessionData.date || new Date().toISOString().split('T')[0],
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.data.sessions.push(newSession);
    this.saveToFile();
    return newSession;
  }

  // Items & Store
  getItems(userId = null) {
    return this.data.items.filter((item) => !item.isCustom || item.createdBy === userId || !item.createdBy);
  }

  createCustomItem(userId, itemData) {
    const newItem = {
      _id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...itemData,
      isCustom: true,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    this.data.items.push(newItem);
    this.saveToFile();
    return newItem;
  }

  buyItem(userId, itemId) {
    const user = this.findUserById(userId);
    const item = this.data.items.find((i) => i._id === itemId || i.id === itemId);
    if (!user || !item) return { success: false, error: 'Item or user not found' };

    if (user.gold < item.costGold) {
      return { success: false, error: 'Insufficient Gold! Complete more quests or focus sessions to earn Gold.' };
    }

    const updatedGold = user.gold - item.costGold;
    const inventory = user.inventory || [];
    inventory.push({
      itemId: item._id || item.id,
      name: item.name,
      category: item.category,
      icon: item.icon,
      effects: item.effects,
      purchasedAt: new Date().toISOString(),
      isEquipped: false,
      isConsumed: false,
    });

    const updatedUser = this.updateUser(userId, { gold: updatedGold, inventory });
    return { success: true, user: updatedUser, item };
  }

  // Achievements
  getAchievements() {
    return this.data.achievements;
  }

  getUserAchievements(userId) {
    return this.data.userAchievements.filter((ua) => ua.userId === userId);
  }

  checkUserAchievements(userId) {
    const user = this.findUserById(userId);
    if (!user) return [];

    const completedQuests = this.data.quests.filter((q) => q.userId === userId && q.isCompleted).length;
    const userSessions = this.data.sessions.filter((s) => s.userId === userId);
    const totalFocusMinutes = userSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const unlockedList = this.getUserAchievements(userId).map((ua) => ua.achievementCode);

    const newlyUnlocked = [];

    this.data.achievements.forEach((ach) => {
      if (unlockedList.includes(ach.code)) return;

      let satisfied = false;
      const { type, targetValue } = ach.condition;

      if (type === 'quests_completed' && completedQuests >= targetValue) satisfied = true;
      if (type === 'streak_days' && (user.streak || 1) >= targetValue) satisfied = true;
      if (type === 'focus_minutes' && totalFocusMinutes >= targetValue) satisfied = true;
      if (type === 'level_reached' && user.level >= targetValue) satisfied = true;
      if (type === 'gold_accumulated' && user.gold >= targetValue) satisfied = true;

      if (satisfied) {
        const unlockRecord = {
          _id: 'uach_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          userId,
          achievementCode: ach.code,
          unlockedAt: new Date().toISOString(),
          isClaimed: true,
        };
        this.data.userAchievements.push(unlockRecord);
        newlyUnlocked.push(ach);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveToFile();
    }
    return newlyUnlocked;
  }

  // Daily Performance Calculation
  getDailyPerformance(userId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const user = this.findUserById(userId);
    if (!user) return { score: 100, message: 'Ready for quests' };

    const schedules = this.getSchedules(userId, targetDate);
    const quests = this.getQuests(userId, { date: targetDate });
    const sessions = this.getSessions(userId, targetDate);

    const totalScheduledMinutes = schedules.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const completedScheduledMinutes = schedules.filter((s) => s.isCompleted).reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const completedQuests = quests.filter((q) => q.isCompleted).length;
    const totalQuests = quests.length;
    const totalFocusMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    // Intelligent Zero-Activity Handling
    // If no schedule or quest was planned yet, do not give 0%. Give 100% (Clean Slate / Ready) or baseline.
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
      // User worked without scheduling: 100% active
      score = 100;
    }

    return {
      date: targetDate,
      score,
      totalScheduledMinutes,
      completedScheduledMinutes,
      completedQuests,
      totalQuests,
      totalFocusMinutes,
    };
  }

  // Leaderboard
  getLeaderboard() {
    return this.data.users
      .filter((u) => u.settings?.leaderboardVisibility !== false)
      .map((u) => ({
        id: u._id || u.id,
        name: u.name,
        avatar: u.avatar || '⚔️ Shadow Knight',
        title: u.title || 'Novice Adventurer',
        level: u.level || 1,
        totalXpEarned: u.totalXpEarned || 0,
        streak: u.streak || 1,
        gold: u.gold || 0,
      }))
      .sort((a, b) => b.totalXpEarned - a.totalXpEarned || b.level - a.level);
  }
}

export const db = new StorageEngine();
