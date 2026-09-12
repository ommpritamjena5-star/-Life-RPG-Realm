import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    questId: { type: String, default: null },
    title: { type: String, required: true },
    category: { type: String, default: 'Coding' },
    durationMinutes: { type: Number, required: true },
    subSessionNumber: { type: Number, default: 1 },
    totalSubSessions: { type: Number, default: 1 },
    xpAwarded: { type: Number, default: 0 },
    goldAwarded: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
