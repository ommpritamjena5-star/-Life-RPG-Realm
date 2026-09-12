import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    title: { type: String, required: true },
    startTime: { type: String, required: true }, // Format: "HH:mm" e.g. "09:00"
    endTime: { type: String, required: true }, // Format: "HH:mm" e.g. "10:30"
    durationMinutes: { type: Number, required: true },
    type: {
      type: String,
      enum: ['quest', 'routine', 'focus_session', 'break', 'meal', 'sleep'],
      default: 'quest',
    },
    category: { type: String, default: 'General' },
    questId: { type: String, default: null },
    isCompleted: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
