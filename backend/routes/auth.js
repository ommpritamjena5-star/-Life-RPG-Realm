import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../data/storageEngine.js';
import { User } from '../models/User.js';
import { generateToken, requireAuth } from '../middleware/auth.js';
import {
  sendWelcomeEmail,
  sendLoginSuccessEmail,
  sendForgotPasswordEmail,
} from '../utils/emailService.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, avatar, characterClass } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Please provide name, email, mobile number, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    const existing = await db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.createUser({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      avatar: avatar || '🌱 Novice Adventurer',
      characterClass: characterClass || 'Novice',
    });

    // Send Welcome Email (Non-blocking async)
    sendWelcomeEmail({
      to: cleanEmail,
      name: cleanName,
      characterClass: newUser.characterClass || 'Novice',
    }).catch((err) => console.warn('[Email Warning]:', err.message));

    const token = generateToken(newUser);
    const { password: _, ...userData } = newUser;

    return res.status(201).json({
      message: 'Adventurer registered successfully! Welcome scroll dispatched to your email.',
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login (Accepts Email, Mobile Phone Number, or Hero Name)
router.post('/login', async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = (email || identifier || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Please provide your Email/Mobile/Username and Password.' });
    }

    const user = await db.findUserByIdentifier(loginIdentifier);

    if (!user) {
      return res.status(401).json({
        error: `No adventurer account found for "${loginIdentifier}". Please check your spelling or click "Awaken Hero" to sign up!`,
      });
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && typeof password === 'string') {
      isMatch = await bcrypt.compare(password.trim(), user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        error: 'Incorrect password. Please verify your password or use "Forgot Password" to restore access.',
      });
    }

    // Send Login Alert Email (Non-blocking async)
    if (user.email && user.email.includes('@')) {
      sendLoginSuccessEmail({
        to: user.email,
        name: user.name,
        time: new Date().toLocaleString(),
      }).catch((err) => console.warn('[Email Warning]:', err.message));
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user;

    return res.json({
      message: 'Welcome back, Adventurer! Login security alert dispatched.',
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
router.post('/onboarding', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
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

    const updatedUser = await db.updateUser(userId, {
      name: characterName || req.user.name,
      characterClass: characterClass || req.user.characterClass,
      avatar: avatar || req.user.avatar,
      settings: updatedSettings,
    });

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

    for (const q of starterQuests) {
      await db.createQuest(q);
    }

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

// POST /api/auth/forgot-password (Accepts Email, Mobile, or Username)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, identifier } = req.body;
    const searchTarget = (email || identifier || '').trim();

    if (!searchTarget) {
      return res.status(400).json({ error: 'Please provide your Email, Mobile number, or Hero name.' });
    }

    const user = await db.findUserByIdentifier(searchTarget);

    if (!user || !user.email) {
      return res.status(404).json({
        error: `No adventurer account found for "${searchTarget}". Please check the spelling or Sign Up first!`,
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await db.updateUser(user._id || user.id, {
      resetPasswordToken: resetCode,
      resetPasswordExpires: resetExpires,
    });

    try {
      await sendForgotPasswordEmail({
        to: user.email,
        name: user.name || 'Hero',
        resetCode,
        expiresInMinutes: 15,
      });
      console.log(`[Forgot Password] Recovery rune code successfully dispatched to ${user.email}`);
    } catch (err) {
      console.warn('[Email Warning]:', err.message);
    }

    return res.status(200).json({
      message: `A 6-digit recovery code has been dispatched to ${user.email}. Please check your inbox or spam folder.`,
      email: user.email,
      expiresInMinutes: 15,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process password recovery. Please try again.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, identifier, code, newPassword } = req.body;
    const searchTarget = (email || identifier || '').trim();

    if (!searchTarget || !code || !newPassword) {
      return res.status(400).json({ error: 'Please provide your Email/Username, recovery rune code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const user = await db.findUserByIdentifier(searchTarget);

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (!user.resetPasswordToken || user.resetPasswordToken.trim() !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid recovery rune code. Please enter the exact 6 digits sent to your email.' });
    }

    if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ error: 'Recovery rune code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await db.updateUser(user._id || user.id, {
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
