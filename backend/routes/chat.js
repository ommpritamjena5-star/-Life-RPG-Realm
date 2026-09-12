import express from 'express';

const router = express.Router();

// Comprehensive Genuine Life RPG Knowledge Base
const KNOWLEDGE_BASE = [
  {
    category: 'leveling',
    keywords: ['level', 'xp', 'leveling', 'experience', 'progression', 'calculate', 'formula', 'level up', 'fast xp', 'rank'],
    title: '⚔️ Level Progression & XP Engine',
    response: `In **Life RPG**, your level reflects your real-world habit mastery and daily discipline!
- **Non-Linear Level Formula**: $XP_{req} = \\lfloor 100 \\times \\text{level}^{1.5} \\rfloor$. Each rank becomes progressively more challenging.
- **Earning XP**: Complete Daily Quests (+50 XP), Main Quests (+100 XP), Epic Quests (+250 XP), or complete Focus Sessions (+40 XP per 45-min block).
- **Level-Up Rewards**: Every level up awards **+50 bonus Gold**, permanently increases all 6 RPG attributes (+1 STR, INT, VIT, AGI, DISC, CHA), and unlocks higher-tier Bazaar equipment!`,
    suggestions: ['🧙 How do Archetypes unlock?', '💀 How do Sloth Penalties work?', '💰 How does Gold work?'],
  },
  {
    category: 'archetypes',
    keywords: ['archetype', 'class', 'warrior', 'mage', 'rogue', 'paladin', 'novice', 'unlock class', 'character class', 'evolution'],
    title: '🧙 Character Archetypes & Dynamic Evolution',
    response: `Every hero starts as a **🌱 Novice Adventurer**. In Life RPG, archetypes are not chosen from a static signup dropdown—they are **earned and dynamically awarded** as you train real-world habits:
- **⚔️ Vanguard Warrior**: Awarded by training **Strength** through gym, workouts, sports, and physical discipline.
- **🔮 Arcane Archmage**: Awarded by training **Intellect** through programming, deep reading, and studying algorithms.
- **🗡️ Shadow Rogue**: Awarded by training **Agility** through rapid focus sprints, speed sessions, and fast task execution.
- **🛡️ Solar Paladin**: Awarded by training **Vitality & Discipline** through unbroken daily streaks, morning routines, and wellness!`,
    suggestions: ['⚔️ How do I level up fast?', '⏱️ Tell me about Focus Sessions', '👤 What are the 6 RPG Attributes?'],
  },
  {
    category: 'penalties',
    keywords: ['penalty', 'punishment', 'skip', 'miss', 'inactive', 'sloth', 'fail', 'streak lose', 'streak break', 'streak reset', 'overdue', 'decay'],
    title: '💀 Sloth Penalties & Accountability',
    response: `To conquer procrastination, Life RPG enforces real consequences for breaking discipline:
- **Skipping a Quest**: Incurs an immediate penalty (e.g. Medium Quest: **-40 XP, -15 Gold, -1 Streak Day, -1 Discipline**).
- **Overdue Task Decay**: Quests left uncompleted past midnight are automatically marked as failed, penalizing 50% of the reward value.
- **Prolonged Inactivity**: If inactive for $\\ge 2$ consecutive days, an automated sloth penalty of **-25 XP and -15 Gold per missed day** is applied.
- **🛡️ Aegis Streak Shield**: Protects your streak! Available in the Treasury Bazaar; automatically consumes 1 charge to prevent streak resets when you miss a day.`,
    suggestions: ['💰 Where do I get Aegis Shields?', '⚔️ How do Quests work?', '📋 What is the Daily Report?'],
  },
  {
    category: 'focus',
    keywords: ['focus', 'timer', 'pomodoro', 'sub-session', 'rain', 'ambient', 'session', 'neuro-flow', 'deep work', 'audio'],
    title: '⏱️ Focus Sub-Sessions & Neuro-Flow',
    response: `The **Focus Timer** breaks daunting 4-hour tasks into bite-sized **45-minute sub-sessions** with 15-minute regenerative breaks.
- **Ambient Rain Audio**: Toggle soothing ambient rain sounds generated directly in your browser with zero network lag.
- **Rewards**: Completing focus sessions awards **+40 XP, +15 Gold, and +2 Agility/Discipline**.
- **Tactile Sound FX**: Custom chimes sound when focus sessions and breaks complete!`,
    suggestions: ['📅 How does Daily Planning work?', '💰 What items are in the Bazaar?', '⚔️ How do I level up fast?'],
  },
  {
    category: 'schedule',
    keywords: ['schedule', 'planning', 'time block', 'calendar', 'overlap', 'conflict', 'planner', 'routine', 'wake', 'sleep', 'bed time'],
    title: '📅 Daily Schedule Planner',
    response: `The **Daily Schedule Planner** lets you time-block your entire day from wake-up to sleep:
- **Intelligent Conflict Detection**: The planner alerts you if tasks overlap in time (e.g., Gym from 18:00–19:00 overlapping with Team Meeting).
- **Quest Linkage**: Link schedule blocks directly to active quests for synchronized progress.
- **Efficiency Metric**: Your schedule contributes directly to your daily performance efficiency score!`,
    suggestions: ['📋 Tell me about Daily Reports', '⚔️ How do I complete Quests?', '🔥 How do Streaks work?'],
  },
  {
    category: 'bazaar',
    keywords: ['gold', 'bazaar', 'shop', 'item', 'elixir', 'shield', 'buy', 'reward', 'treasury', 'store', 'spend', 'aegis'],
    title: '💰 Rewards Bazaar & Gold Economy',
    response: `Earn Gold by completing quests, logging focus sessions, and maintaining streaks!
- **🧪 Elixir of Hyperfocus**: Grants +20% bonus XP on your next completed quest (40 Gold).
- **🛡️ Aegis of Discipline**: Streak freeze shield that protects your streak from missed days (75 Gold).
- **🗡️ Blade of the Archmage**: Cosmetic badge granting permanent +5 Intellect aura (120 Gold).
- **☕ Real-World Rewards**: Create custom guilt-free rewards (e.g. 1 hour gaming, coffee treat) and redeem them with hard-earned Gold!`,
    suggestions: ['⚔️ How do I earn Gold fast?', '🧙 How do Archetypes unlock?', '💀 How do Sloth Penalties work?'],
  },
  {
    category: 'attributes',
    keywords: ['stats', 'attributes', 'strength', 'intellect', 'vitality', 'agility', 'discipline', 'charisma', 'stat points', 'str', 'int', 'vit', 'agi', 'disc', 'cha'],
    title: '👤 6-Stat RPG Attribute System',
    response: `Your character develops across 6 core RPG attributes:
1. **⚔️ Strength (STR)**: Boosted by workouts, gym sessions, and physical exertion.
2. **🔮 Intellect (INT)**: Boosted by coding, studying, reading, and problem solving.
3. **🌿 Vitality (VIT)**: Boosted by meditation, sleep hygiene, nutrition, and wellness habits.
4. **⚡ Agility (AGI)**: Boosted by rapid focus sessions and quick task completions.
5. **🛡️ Discipline (DISC)**: Boosted by maintaining daily streaks and completing chores.
6. **👑 Charisma (CHA)**: Boosted by social events, networking, and public speaking!`,
    suggestions: ['🧙 How do Archetypes unlock?', '⚔️ How do I level up fast?', '⏱️ Tell me about Focus Sessions'],
  },
  {
    category: 'quests',
    keywords: ['quest', 'quests', 'habit', 'habits', 'daily quest', 'main quest', 'epic quest', 'task', 'board', 'create quest'],
    title: '⚔️ Quest Board & Habit Mastery',
    response: `The **Quest Board** organizes your daily habits and major projects into 3 RPG Tiers:
- **🌱 Daily Quests**: Repeatable habits (e.g., Drink 2L water, 30m reading) yielding +50 XP and +20 Gold.
- **🛡️ Main Quests**: Weekly objectives (e.g., Build full-stack feature) yielding +100 XP and +50 Gold.
- **👑 Epic Quests**: Long-term milestones (e.g., Complete university semester project) yielding +250 XP and +120 Gold.
Completing all daily quests boosts your daily performance efficiency score to 100%!`,
    suggestions: ['💀 How do Sloth Penalties work?', '💰 What items are in the Bazaar?', '⏱️ How do Focus Sessions work?'],
  },
  {
    category: 'reports',
    keywords: ['report', 'accountability', 'partner', 'mentor', 'share', 'contact', 'performance score', 'daily report'],
    title: '📋 Daily Accountability Reports',
    response: `Life RPG features an automatic **Daily Accountability Report generator**:
- Summarizes completed quests, deep focus hours, active streak count, and daily performance efficiency score.
- One-click copy formatted text directly for your mentor, coach, or accountability partner!
- Access anytime from the **Daily Report** button on the top HUD Navbar.`,
    suggestions: ['📅 How does the Schedule Planner work?', '⏱️ How do Focus Sessions work?', '⚔️ How do I level up fast?'],
  },
  {
    category: 'email',
    keywords: ['email', 'mail', 'forgot password', 'reset password', 'rune code', 'notification', 'reminder email', 'welcome email', 'smtp'],
    title: '📧 Astral Email Notifications & Security',
    response: `Life RPG includes a comprehensive Astral Email system:
- **🎉 Welcome Scroll**: Dispatched upon signup with starter quest guidance.
- **🛡️ Login Security Alert**: Dispatched on every login with timestamp and IP location.
- **🔑 Password Recovery Rune**: Dispatches a 6-digit Rune Code with a 15-minute expiry to restore access.
- **⏰ Daily Habit Reminders**: Alerts you of pending daily quests before midnight to defend your streak.
- **🏆 Achievement & Level-Up Scrolls**: Celebrates your milestones directly in your inbox.
Manage email toggles and test templates in the **Settings** hub!`,
    suggestions: ['🔑 How do I reset my password?', '💀 How do Sloth Penalties work?', '⚔️ How do I level up fast?'],
  },
  {
    category: 'model',
    keywords: ['3d', 'model', 'avatar', 'humanoid', 'three.js', 'character sheet', 'visual', 'render', 'rotate', 'inspect'],
    title: '✨ 3D Humanoid Hero Model',
    response: `Life RPG features an interactive **Three.js 3D character viewport**:
- Renders human-like warrior armor, mage robes, rogue hoods, and paladin crests with dynamic procedural lighting and particle auras.
- Drag with your mouse or finger to inspect your character in full 360° orbital rotation!
- Visual equipment and weapons adapt dynamically as your character ascends levels and unlocks archetypes.`,
    suggestions: ['🧙 How do Archetypes unlock?', '👤 What are the 6 RPG Attributes?', '⚔️ How do I level up fast?'],
  },
  {
    category: 'greetings',
    keywords: ['hi', 'hello', 'hey', 'greetings', 'who are you', 'what are you', 'help', 'aura', 'oracle', 'menu'],
    title: '🧙 Aura • Grand Archmage Oracle',
    response: `Greetings, Adventurer! I am **Aura**, the specialized AI Oracle and Game Master of **Life RPG**.

I am trained strictly to guide heroes on their journey to master real-world habits. You can ask me genuine questions about:
- ⚔️ **XP Formulas & Level Progression**
- 🧙 **Dynamic Character Archetypes (Warrior, Mage, Rogue, Paladin)**
- 💀 **Sloth Penalties & Aegis Streak Shields**
- ⏱️ **Focus Sub-Sessions & Pomodoro Neuro-Flow**
- 📅 **Daily Schedule Planner & Time-Blocking**
- 💰 **Rewards Bazaar & Gold Economy**
- 👤 **6-Stat Attribute System (STR, INT, VIT, AGI, DISC, CHA)**
- 📧 **Email Notifications & Password Recovery Runes**`,
    suggestions: ['⚔️ How do I level up fast?', '🧙 How do Archetypes unlock?', '💀 How do Sloth Penalties work?', '⏱️ How do Focus Sessions work?'],
  },
];

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, userContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Please write a valid question.' });
    }

    const query = message.trim().toLowerCase();

    // Check query against Genuine Knowledge Base
    let bestMatch = null;
    let maxKeywordScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of entry.keywords) {
        // Word boundary or inclusion match
        if (query.includes(kw)) {
          score += kw.length;
        }
      }
      if (score > maxKeywordScore) {
        maxKeywordScore = score;
        bestMatch = entry;
      }
    }

    // Require a minimum confidence score (e.g. at least 3 matching characters)
    if (bestMatch && maxKeywordScore >= 3) {
      return res.json({
        valid: true,
        reply: bestMatch.response,
        title: bestMatch.title,
        suggestions: bestMatch.suggestions,
      });
    }

    // If query is UNKNOWN, OFF-TOPIC, GIBBERISH, or UNNECESSARY:
    // Reject politely and instruct user to write a valid question with suggestions
    const invalidReply = `⚠️ **Invalid Question Detected**

I am **Aura, the Life RPG Oracle**. I can only answer genuine questions regarding the **Life RPG Operating System, Real-World Habits, Quests, Focus Sessions, Archetypes, Sloth Penalties, XP Formulas, and Game Mechanics**.

**Please write a valid question** about Life RPG, or select one of the suggested inquiries below:`;

    return res.json({
      valid: false,
      reply: invalidReply,
      title: '⚠️ Please Write a Valid Question',
      suggestions: [
        '⚔️ How do I level up fast?',
        '🧙 How do Archetypes unlock?',
        '💀 How do Sloth Penalties work?',
        '⏱️ How do Focus Sessions work?',
        '💰 How does the Rewards Bazaar work?',
        '📅 How does the Schedule Planner work?',
      ],
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Failed to consult the Oracle.' });
  }
});

export default router;
