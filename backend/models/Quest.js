import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

const questSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Coding', 'Workout', 'Reading', 'Meditation', 'Chores', 'Social', 'General'],
      default: 'General',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Epic'],
      default: 'Medium',
    },
    tier: {
      type: String,
      enum: ['Main', 'Daily', 'Side', 'Habit'],
      default: 'Daily',
    },
    xpReward: { type: Number, default: 50 },
    goldReward: { type: Number, default: 20 },
    attributeBoost: {
      type: String,
      enum: ['strength', 'intellect', 'vitality', 'agility', 'discipline', 'charisma'],
      default: 'discipline',
    },
    attributePoints: { type: Number, default: 2 },
    
    // Total estimated duration in minutes
    durationMinutes: { type: Number, default: 45 },
    subSessionsCount: { type: Number, default: 1 },
    subSessionDuration: { type: Number, default: 45 },
    
    subtasks: [subtaskSchema],
    
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    scheduledDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: { type: String, enum: ['none', 'daily', 'weekdays', 'weekly'], default: 'none' },
  },
  { timestamps: true }
);

export const Quest = mongoose.models.Quest || mongoose.model('Quest', questSchema);
