import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to determine title based on level
const getTitleForLevel = (level) => {
  if (level >= 30) return 'God of Discipline';
  if (level >= 25) return 'Grand Archmage';
  if (level >= 20) return 'Legendary Champion';
  if (level >= 15) return 'Mythic Warlord';
  if (level >= 10) return 'Ascended Master';
  if (level >= 5) return 'Veteran Adventurer';
  if (level >= 3) return 'Apprentice Pathfinder';
  return 'Novice Adventurer';
};

// GET /api/character
router.get('/', requireAuth, (req, res) => {
  try {
    const user = req.user;
    const computedTitle = getTitleForLevel(user.level);
    
    // Check if title needs update
    if (user.title !== computedTitle) {
      db.updateUser(user._id || user.id, { title: computedTitle });
      user.title = computedTitle;
    }

    const { password: _, ...characterData } = user;
    return res.json({ character: characterData });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch character profile.' });
  }
});

// POST /api/character/equip
router.post('/equip', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { itemId } = req.body;

    const user = db.findUserById(userId);
    const inventory = user.inventory || [];
    
    const targetItem = inventory.find((i) => i.itemId === itemId);
    if (!targetItem) {
      return res.status(404).json({ error: 'Item not found in your inventory.' });
    }

    // Toggle equip state
    targetItem.isEquipped = !targetItem.isEquipped;

    const updatedUser = db.updateUser(userId, { inventory });
    const { password: _, ...userData } = updatedUser;

    return res.json({
      message: targetItem.isEquipped ? `Equipped ${targetItem.name}!` : `Unequipped ${targetItem.name}.`,
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle item equip.' });
  }
});

export default router;
