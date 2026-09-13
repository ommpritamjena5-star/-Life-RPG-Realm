import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const currentUserId = String(req.user._id || req.user.id);
    const leaderboard = await db.getLeaderboard();

    const rankedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player,
      isCurrentUser: String(player.id) === currentUserId,
    }));

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
