import express from 'express';
import { db } from '../data/storageEngine.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to convert "HH:mm" to minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

// GET /api/schedule
router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const schedules = db.getSchedules(userId, date);
    return res.json({ schedules, date });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch schedule.' });
  }
});

// POST /api/schedule
router.post('/', requireAuth, (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, startTime, endTime, date, type, category, questId, notes } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, Start Time, and End Time are required.' });
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }

    const durationMinutes = endMinutes - startMinutes;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Check for overlapping time blocks
    const existing = db.getSchedules(userId, targetDate);
    const overlap = existing.find((item) => {
      const itemStart = timeToMinutes(item.startTime);
      const itemEnd = timeToMinutes(item.endTime);
      return Math.max(startMinutes, itemStart) < Math.min(endMinutes, itemEnd);
    });

    const newSchedule = db.createSchedule({
      userId,
      date: targetDate,
      title: title.trim(),
      startTime,
      endTime,
      durationMinutes,
      type: type || 'quest',
      category: category || 'General',
      questId: questId || null,
      notes: notes || '',
    });

    return res.status(201).json({
      message: 'Time block scheduled successfully!',
      schedule: newSchedule,
      warning: overlap
        ? `Warning: This block overlaps with '${overlap.title}' (${overlap.startTime} - ${overlap.endTime})`
        : null,
    });
  } catch (error) {
    console.error('Schedule create error:', error);
    return res.status(500).json({ error: 'Failed to create schedule block.' });
  }
});

// PUT /api/schedule/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const updated = db.updateSchedule(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Schedule block not found.' });

    // If marked completed, update daily performance
    if (req.body.isCompleted !== undefined) {
      const userId = req.user._id || req.user.id;
      // Award mini discipline XP for completing scheduled blocks (+15 XP, +5 Gold)
      if (req.body.isCompleted) {
        db.awardXpAndGold(userId, 15, 5, 'discipline', 1);
      }
    }

    return res.json({ schedule: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update schedule block.' });
  }
});

// DELETE /api/schedule/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const success = db.deleteSchedule(req.params.id);
    if (!success) return res.status(404).json({ error: 'Schedule block not found.' });
    return res.json({ message: 'Schedule block removed.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete schedule block.' });
  }
});

export default router;
