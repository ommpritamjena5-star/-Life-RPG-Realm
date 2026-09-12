# ⚔️ LIFE RPG — The Gamified Personal Life Operating System

> **"Turn Your Real Life Into An Epic Fantasy Adventure"**  
> Complete real-world quests, master your daily schedule, log deep focus sub-sessions, earn XP & Gold, level up character attributes, and conquer your goals with instantaneous dopamine loops.

---

## 🌟 Overview & Product Philosophy

Traditional productivity apps and todo lists fail because they feel like chores. Real-world results take weeks or months to materialize. **Life RPG** bridges this gap by engineering a tactile, immersive Fantasy RPG operating system where every task completed, hour scheduled, and focus session finished delivers immediate gratification through:
- **Instant XP & Gold Rewards** with celebratory visual particles and Web Audio synthesized soundscapes.
- **Non-Linear Leveling Curve** where character mastery demands progressive dedication.
- **6 Core RPG Attributes** (Intellect, Strength, Vitality, Agility, Discipline, Charisma).
- **Pomodoro & Sub-Session Focus Engine** allowing 4-hour gargantuan tasks to be broken into 45-minute sub-sessions.
- **Circadian Time Blocking** from wake-up to sleep with conflict and overlap detection.
- **Accountability Sharing** generating daily report cards for mentors/contacts via Web Share and WhatsApp.

---

## 🏗️ System Architecture

```
                                +---------------------------+
                                |    React + Vite Client    |
                                |  Tailwind CSS + Motions   |
                                |  Web Audio FX Synthesizer |
                                +-------------+-------------+
                                              |
                                     REST API / JWT Auth
                                              |
                                              v
                                +---------------------------+
                                |   Express.js Node Backend |
                                |  Modular REST Controllers |
                                |  Progression & XP Engine  |
                                +-------------+-------------+
                                              |
                                     Mongoose ODM Adapter
                                              |
                                              v
                                +---------------------------+
                                |  MongoDB Atlas / Instance |
                                |  (Auto-Persist Engine)    |
                                +---------------------------+
```

---

## ⚡ Key Features

| Domain | Features |
|---|---|
| **⚔️ Quests Hub** | Full CRUD, Main/Daily/Side/Habit tiers, categories, subtask checklists, duplicate completion prevention, and attribute point multipliers. |
| **📅 Schedule Planner** | Time-blocking timeline from wake-up to sleep, conflict warnings, overlap detection, intelligent zero-schedule handling. |
| **⏱️ Focus Sub-Sessions** | Pomodoro & sub-session tracker (e.g. 4h task split into 45m blocks), ambient sound generator (Rain / Cyberpunk drone), live XP ticker. |
| **👤 RPG Progression** | Level formula $XP_{req} = \lfloor 100 \times \text{level}^{1.5} \rfloor$, 6 attributes radar, dynamic titles ("Grand Archmage", "Ascended Titan"), level up celebration with confetti cannon. |
| **📊 Analytics** | Daily performance score (%), 7-day weekly history bar chart, 30-day streak heatmap, category breakdown. |
| **🏆 Leaderboard** | Hall of Heroes global rankings with podium (#1 Gold, #2 Silver, #3 Bronze) and privacy toggle. |
| **💰 Shop & Inventory** | Store catalog with potions, gear, and custom real-world reward creator ("1 Hour Gaming", "Cheat Meal") with Gold price. |
| **🏆 Achievements** | 20+ unlockable RPG badges and trophy milestones. |
| **📱 Accountability Report**| Stylized quest report summary shareable via Web Share API or WhatsApp to a favorite contact/mentor. |

---

## 📁 Repository Structure

```
.
├── frontend/                   # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Navbar, MobileNav, LevelUpModal, DailyReportModal
│   │   ├── context/            # AuthContext & Progression Events
│   │   ├── pages/              # Landing, Dashboard, Quests, Schedule, Timer, Character, Analytics, Shop, Settings
│   │   ├── utils/              # soundEngine.js (Web Audio API Synthesizer)
│   │   ├── App.jsx             # Main App Coordinator
│   │   ├── index.css           # Modern Fantasy RPG Design System
│   │   └── main.jsx            # Entry point
│   ├── index.html              # Google Fonts & SEO Meta tags
│   ├── vite.config.js          # Tailwind CSS & API Proxy
│   └── package.json
│
├── backend/                    # Node.js + Express Backend
│   ├── config/                 # db.js (MongoDB Connection Adapter)
│   ├── data/                   # storageEngine.js & seedData.js
│   ├── middleware/             # auth.js (JWT Validation)
│   ├── models/                 # User, Quest, Schedule, Session, Item, Achievement
│   ├── routes/                 # auth, quests, schedule, sessions, character, analytics, leaderboard, shop, settings
│   ├── server.js               # Express Application Entry
│   ├── .env.example
│   └── package.json
│
├── .env.example                # Root environment template
├── package.json                # Root concurrently runner
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18+ (Tested on v22.x)
- **npm**: v9+

### 1. Installation
Clone the repository and install all dependencies in root, backend, and frontend:
```bash
# In the root directory
npm run install:all
```

### 2. Environment Configuration
Copy `.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

### 3. Launch Development Server
Start both Backend API (Port 5000) and Frontend Vite Server (Port 5173) with a single command:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser to experience Life RPG!

---

## 🧪 Demo / Judging Verification Flow

1. **Register & Onboard**: Create character "Shadow Knight", choose archetype, wake 07:00 / sleep 23:00, and set 45m focus defaults.
2. **Schedule**: Add today's schedule blocks (09:00 - 10:30 Coding). Observe conflict detection if overlapping blocks are created.
3. **Quest & Sub-Sessions**: Create "Study JavaScript" (4 Hours total duration, split into 45-minute sub-sessions).
4. **Timer Execution**: Launch Focus Timer, play ambient rain audio, finish sub-session, and observe XP (+55) & Gold (+22) celebration.
5. **Level-Up Experience**: Complete quests to trigger the full-screen **LEVEL UP!** modal with confetti fireworks and stat increases.
6. **Performance & Analytics**: Inspect the calculated Daily Performance Score and 7-day weekly history graph.
7. **Shop & Rewards**: Spend earned Gold on "1 Hour Guilt-Free Gaming" or "Elixir of Focus", check inventory.
8. **Accountability**: Click **Report** in the HUD to preview and share your Daily Quest Report card with your mentor.
9. **Persistence**: Refresh the browser, log out, and log back in to verify complete database persistence.

---

## 🚢 Production Deployment

- **Frontend**: Deploy `frontend/` to Vercel or Netlify.
- **Backend**: Deploy `backend/` to Render, Railway, or AWS.
- **Database**: Connect to MongoDB Atlas by providing `MONGODB_URI` in environment variables.

---

## 📜 License
MIT License. Built for the modern adventurer.
