import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard
router.get('/', requireAuth, (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const leaderboard = db.getLeaderboard();

    // Map ranks and flag current user
    const rankedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player,
      isCurrentUser: player.id === currentUserId,
    }));

    // Find current user's exact rank
    const userRankIndex = rankedLeaderboard.findIndex((p) => p.isCurrentUser);
    const currentUserRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

    return res.json({
      leaderboard: rankedLeaderboard,
      currentUserRank,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

export default router;
