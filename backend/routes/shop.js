import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/shop/items
router.get('/items', requireAuth, async (req, res) => {
  try {
    const items = await db.getItems();
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch shop catalog.' });
  }
});

// POST /api/shop/buy
router.post('/buy', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required.' });
    }

    const result = await db.buyItem(userId, itemId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const { password: _, ...userData } = result.user;
    return res.json({
      message: `Successfully acquired ${result.item.name}!`,
      user: userData,
      item: result.item,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process purchase.' });
  }
});

// POST /api/shop/custom-reward
router.post('/custom-reward', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { name, description, costGold, icon } = req.body;

    if (!name || !costGold) {
      return res.status(400).json({ error: 'Reward name and Gold cost are required.' });
    }

    const newItem = await db.createItem({
      name: name.trim(),
      description: description || '',
      category: 'custom_reward',
      costGold: Number(costGold),
      icon: icon || '🎁',
      rarity: 'Common',
      effects: {},
      isCustom: true,
      createdBy: userId,
    });

    return res.status(201).json({
      message: 'Custom reward created! Available in your shop.',
      item: newItem,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create custom reward.' });
  }
});

export default router;
