import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../data/storageEngine.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, avatar, characterClass } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Please provide name, email, mobile number, and password.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = db.createUser({
      name,
      email,
      phone: phone.trim(),
      password: hashedPassword,
      avatar: avatar || '⚔️ Shadow Knight',
      characterClass: characterClass || 'Warrior',
    });

    const token = generateToken(newUser);

    // Filter out password from response
    const { password: _, ...userData } = newUser;

    return res.status(201).json({
      message: 'Adventurer registered successfully!',
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user;

    return res.json({
      message: 'Welcome back, Adventurer!',
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const { password: _, ...userData } = req.user;
  return res.json({ user: userData });
});

// POST /api/auth/onboarding
router.post('/onboarding', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      characterName,
      characterClass,
      avatar,
      wakeUpTime,
      sleepTime,
      mainGoals,
      defaultSessionDuration,
      breakDuration,
      categories,
      leaderboardVisibility,
    } = req.body;

    const currentSettings = req.user.settings || {};
    const updatedSettings = {
      ...currentSettings,
      wakeUpTime: wakeUpTime || currentSettings.wakeUpTime,
      sleepTime: sleepTime || currentSettings.sleepTime,
      defaultSessionDuration: Number(defaultSessionDuration) || currentSettings.defaultSessionDuration,
      breakDuration: Number(breakDuration) || currentSettings.breakDuration,
      leaderboardVisibility: leaderboardVisibility !== undefined ? leaderboardVisibility : true,
      onboardingCompleted: true,
    };

    const updatedUser = db.updateUser(userId, {
      name: characterName || req.user.name,
      characterClass: characterClass || req.user.characterClass,
      avatar: avatar || req.user.avatar,
      settings: updatedSettings,
    });

    // Generate introductory starter quests tailored to user's onboarding choices
    const starterQuests = [
      {
        userId,
        title: 'Dawn of the Hero: Setup Daily Schedule',
        description: 'Plan your wake-up, deep work, and rest time blocks in the Schedule hub.',
        category: 'General',
        difficulty: 'Easy',
        tier: 'Main',
        xpReward: 50,
        goldReward: 25,
        durationMinutes: 15,
        attributeBoost: 'discipline',
        attributePoints: 3,
        scheduledDate: new Date().toISOString().split('T')[0],
      },
      {
        userId,
        title: 'Study Session: Master New Skill',
        description: 'Start a 45-minute focused sub-session using the RPG Focus Timer.',
        category: 'Coding',
        difficulty: 'Medium',
        tier: 'Daily',
        xpReward: 75,
        goldReward: 35,
        durationMinutes: 45,
        attributeBoost: 'intellect',
        attributePoints: 4,
        scheduledDate: new Date().toISOString().split('T')[0],
      },
      {
        userId,
        title: 'Physical Mastery: 20-Min Workout',
        description: 'Complete physical exercise or stretching to boost Strength.',
        category: 'Workout',
        difficulty: 'Easy',
        tier: 'Daily',
        xpReward: 50,
        goldReward: 20,
        durationMinutes: 20,
        attributeBoost: 'strength',
        attributePoints: 3,
        scheduledDate: new Date().toISOString().split('T')[0],
      },
    ];

    starterQuests.forEach((q) => db.createQuest(q));

    const { password: _, ...userData } = updatedUser;
    return res.json({
      message: 'Onboarding completed! Welcome to your Life RPG journey.',
      user: userData,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ error: 'Failed to complete onboarding.' });
  }
});

// POST /api/auth/forgot-password
// Generates a 6-digit Rune Reset Code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide your email address.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No adventurer found with this email address.' });
    }

    // Generate 6-digit Rune Recovery Code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    db.updateUser(user._id || user.id, {
      resetPasswordToken: resetCode,
      resetPasswordExpires: resetExpires,
    });

    return res.json({
      message: 'Recovery Rune dispatched! Use this rune code to reset your password.',
      resetCode, // provided so user can test/reset seamlessly in all environments
      expiresInMinutes: 15,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process password recovery.' });
  }
});

// POST /api/auth/reset-password
// Validates code and sets new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Please provide email, recovery rune code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== code.trim()) {
      return res.status(400).json({ error: 'Invalid recovery rune code. Please try again.' });
    }

    if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ error: 'Recovery rune code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = db.updateUser(user._id || user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    const token = generateToken(updatedUser);
    const { password: _, ...userData } = updatedUser;

    return res.json({
      message: 'Password successfully restored! Your hero access has been revived.',
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

export default router;

