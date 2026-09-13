import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const penalties = await db.checkAndApplySlothPenalties(userId);
    const user = (await db.findUserById(userId)) || req.user;
    const computedTitle = getTitleForLevel(user.level || 1);

    if (user.title !== computedTitle) {
      await db.updateUser(user._id || user.id, { title: computedTitle });
      user.title = computedTitle;
    }

    const { password: _, ...characterData } = user;
    return res.json({ character: characterData, penaltiesApplied: penalties || [] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch character profile.' });
  }
});

// POST /api/character/equip
router.post('/equip', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { itemId } = req.body;

    const user = await db.findUserById(userId);
    const inventory = Array.isArray(user?.inventory) ? [...user.inventory] : [];

    const targetItem = inventory.find((i) => String(i.itemId) === String(itemId));
    if (!targetItem) {
      return res.status(404).json({ error: 'Item not found in your inventory.' });
    }

    targetItem.isEquipped = !targetItem.isEquipped;

    const updatedUser = await db.updateUser(userId, { inventory });
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
