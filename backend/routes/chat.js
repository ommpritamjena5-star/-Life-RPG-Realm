import express from 'express';

const router = express.Router();

// Knowledge Engine for Life RPG AI Oracle
const KNOWLEDGE_BASE = [
  {
    keywords: ['level', 'xp', 'leveling', 'experience', 'progression', 'calculate'],
    title: '⚔️ Level Progression & XP Engine',
    response: `In **Life RPG**, your level reflects your real-world consistency and habit mastery!
- **Non-Linear Level Formula**: $XP_{req} = \\lfloor 100 \\times \\text{level}^{1.5} \\rfloor$. Each level becomes progressively more challenging.
- **Earning XP**: Complete Daily Quests (+50 XP), Main Quests (+100 XP), Epic Quests (+250 XP), or complete Focus Sessions (+40 XP per 45-min block).
- **Level-Up Rewards**: Every level up awards **+50 bonus Gold**, increases all 6 RPG attributes, and unlocks higher-tier Bazaar equipment!`,
    suggestions: ['How do I unlock Archetypes?', 'What are Sloth Penalties?', 'How does Gold work?'],
  },
  {
    keywords: ['archetype', 'class', 'warrior', 'mage', 'rogue', 'paladin', 'novice', 'unlock class'],
    title: '🧙 Character Archetypes & Dynamic Evolution',
    response: `Every hero starts as a **🌱 Novice Adventurer**. Archetypes are not chosen at signup—they are **earned and dynamically awarded** as you train real-world habits:
- **⚔️ Vanguard Warrior**: Awarded by training **Strength** through workouts, gym, and physical discipline.
- **🔮 Arcane Archmage**: Awarded by training **Intellect** through coding, deep reading, and studying algorithms.
- **🗡️ Shadow Rogue**: Awarded by training **Agility** through rapid focus sprints and fast task execution.
- **🛡️ Solar Paladin**: Awarded by training **Vitality & Discipline** through unbroken daily streaks and morning routines!`,
    suggestions: ['How do I boost Intellect?', 'Tell me about Focus Sessions', 'How does the 3D model work?'],
  },
  {
    keywords: ['penalty', 'punishment', 'skip', 'miss', 'inactive', 'sloth', 'fail', 'streak lose', 'streak break'],
    title: '💀 Sloth Penalties & Accountability',
    response: `To conquer procrastination, Life RPG enforces real consequences for breaking discipline:
- **Skipping a Quest**: Incurs an immediate penalty (e.g., Medium Quest: **-40 XP, -15 Gold, -1 Streak Day, -1 Discipline**).
- **Overdue Task Decay**: Quests left uncompleted past midnight are automatically marked as failed, penalizing 50% of the reward value.
- **Prolonged Inactivity**: If inactive for $\\ge 2$ consecutive days, an automated sloth penalty of **-25 XP and -15 Gold per missed day** is applied.
- **🛡️ Aegis Streak Shield**: Protects your streak! Available in the Bazaar; automatically consumes 1 charge to prevent streak resets.`,
    suggestions: ['Where do I get Aegis Shields?', 'How do Quests work?', 'How do I recover lost XP?'],
  },
  {
    keywords: ['focus', 'timer', 'pomodoro', 'sub-session', 'rain', 'ambient', 'session'],
    title: '⏱️ Focus Sub-Sessions & Neuro-Flow',
    response: `The **Focus Timer** breaks daunting 4-hour tasks into bite-sized **45-minute sub-sessions** with 15-minute regenerative breaks.
- **Ambient Rain Audio**: Toggle soothing ambient rain sounds generated directly in your browser with zero network lag.
- **Rewards**: Completing focus sessions awards **+40 XP, +15 Gold, and +2 Agility/Discipline**.
- **Tactile Sound FX**: Custom chimes sound when focus sessions and breaks complete!`,
    suggestions: ['How does Daily Planning work?', 'What items are in the Bazaar?', 'How do I level up?'],
  },
  {
    keywords: ['schedule', 'planning', 'time block', 'calendar', 'overlap', 'conflict'],
    title: '📅 Daily Schedule Planner',
    response: `The **Daily Schedule Planner** lets you time-block your entire day from wake-up to sleep:
- **Intelligent Conflict Detection**: The planner alerts you if tasks overlap in time (e.g., Gym from 18:00–19:00 overlapping with Team Meeting).
- **Quest Linkage**: Link schedule blocks directly to active quests for synchronized progress.
- **Efficiency Metric**: Your schedule contributes to your daily performance efficiency score!`,
    suggestions: ['Tell me about the Performance Score', 'How do I complete Quests?', 'How do Streaks work?'],
  },
  {
    keywords: ['gold', 'bazaar', 'shop', 'item', 'elixir', 'shield', 'buy', 'reward'],
    title: '💰 Rewards Bazaar & Gold Economy',
    response: `Earn Gold by completing quests, logging focus sessions, and maintaining streaks!
- **🧪 Elixir of Hyperfocus**: Grants +20% bonus XP on your next completed quest (40 Gold).
- **🛡️ Aegis of Discipline**: Streak freeze shield that protects your streak from missed days (75 Gold).
- **🗡️ Blade of the Archmage**: Cosmetic badge granting permanent +5 Intellect aura (120 Gold).
- **☕ Real-World Rewards**: Create custom guilt-free rewards (e.g. 1 hour gaming, coffee treat) and redeem them with hard-earned Gold!`,
    suggestions: ['How do I earn Gold fast?', 'What are Archetypes?', 'How do Penalties work?'],
  },
  {
    keywords: ['stats', 'attributes', 'strength', 'intellect', 'vitality', 'agility', 'discipline', 'charisma'],
    title: '👤 6-Stat RPG Attribute System',
    response: `Your character develops across 6 core RPG attributes:
1. **⚔️ Strength (STR)**: Boosted by workouts, gym sessions, and physical exertion.
2. **🔮 Intellect (INT)**: Boosted by coding, studying, reading, and problem solving.
3. **🌿 Vitality (VIT)**: Boosted by meditation, sleep hygiene, nutrition, and wellness habits.
4. **⚡ Agility (AGI)**: Boosted by rapid focus sessions and quick task completions.
5. **🛡️ Discipline (DISC)**: Boosted by maintaining daily streaks and completing chores.
6. **👑 Charisma (CHA)**: Boosted by social events, networking, and public speaking!`,
    suggestions: ['How do I level up Strength?', 'How do I level up Intellect?', 'What are Archetypes?'],
  },
  {
    keywords: ['report', 'accountability', 'partner', 'mentor', 'share'],
    title: '📋 Daily Accountability Reports',
    response: `Life RPG features an automatic **Daily Accountability Report generator**:
- Generates a clean, shareable performance summary of completed quests, focus hours, active streak, and efficiency score.
- Can be copied to your clipboard with one click or automatically formatted for your mentor, coach, or accountability partner!`,
    suggestions: ['How does the Performance Score work?', 'Tell me about Focus Sessions', 'How do I level up?'],
  },
];

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, userContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Please provide a message query.' });
    }

    const query = message.trim().toLowerCase();

    // Find best match in knowledge base
    let bestMatch = null;
    let maxKeywordScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (query.includes(kw)) {
          score += kw.length;
        }
      }
      if (score > maxKeywordScore) {
        maxKeywordScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch && maxKeywordScore > 0) {
      return res.json({
        reply: bestMatch.response,
        title: bestMatch.title,
        suggestions: bestMatch.suggestions,
      });
    }

    // Contextual intelligent fallback
    let heroName = userContext?.name || 'Adventurer';
    let heroLevel = userContext?.level || 1;
    let heroClass = userContext?.characterClass || 'Novice';

    const fallbackResponse = `Greetings, **${heroName}** (Level ${heroLevel} ${heroClass})! I am **Aura, the Grand Archmage Oracle** of Life RPG.

I can guide you through:
- ⚔️ **Quests & Habits**: How to forge daily habits and earn XP/Gold.
- 🧙 **Archetypes**: How to evolve from Novice into Warrior, Mage, Rogue, or Paladin.
- ⏱️ **Focus Sub-Sessions**: 45-minute Pomodoro bursts with ambient audio.
- 💀 **Sloth Penalties**: Consequences of skipping tasks and how Aegis Shields protect your streak.
- 💰 **Bazaar Economy**: Purchasing elixirs and redeeming real-world rewards.

What would you like to explore?`;

    return res.json({
      reply: fallbackResponse,
      title: '🧙 Oracle AI Companion',
      suggestions: [
        'How do I level up fast?',
        'How do Archetypes unlock?',
        'How do Sloth Penalties work?',
        'Tell me about Focus Sessions',
      ],
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Failed to consult the Oracle.' });
  }
});

export default router;
