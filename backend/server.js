import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import authRoutes from './routes/auth.js';
import questsRoutes from './routes/quests.js';
import scheduleRoutes from './routes/schedule.js';
import sessionsRoutes from './routes/sessions.js';
import characterRoutes from './routes/character.js';
import analyticsRoutes from './routes/analytics.js';
import leaderboardRoutes from './routes/leaderboard.js';
import shopRoutes from './routes/shop.js';
import achievementsRoutes from './routes/achievements.js';
import settingsRoutes from './routes/settings.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Connect Database (with automatic fallback)
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    title: 'Life RPG Server',
    databaseConnected: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quests', questsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chat', chatRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Server Error]:', err);
  res.status(500).json({ error: 'Internal server error occurred.', details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`⚔️ Life RPG Server running on port ${PORT} (http://localhost:${PORT})`);
});
