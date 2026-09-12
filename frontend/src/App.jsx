import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { LevelUpModal } from './components/LevelUpModal';
import { DailyReportModal } from './components/DailyReportModal';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './pages/AuthModal';
import { OnboardingModal } from './pages/OnboardingModal';
import { Dashboard } from './pages/Dashboard';
import { QuestsPage } from './pages/QuestsPage';
import { SchedulePage } from './pages/SchedulePage';
import { FocusTimerPage } from './pages/FocusTimerPage';
import { CharacterPage } from './pages/CharacterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ShopPage } from './pages/ShopPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { SettingsPage } from './pages/SettingsPage';
import { OracleChatbot } from './components/OracleChatbot';
import { sound } from './utils/soundEngine';

const AppContent = () => {
  const { user, loading, levelUpData, closeLevelUpModal } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [dailyReportOpen, setDailyReportOpen] = useState(false);
  const [newQuestModalOpen, setNewQuestModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen rpg-background flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-600 p-[2px] animate-bounce shadow-xl shadow-purple-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
            ⚔️
          </div>
        </div>
        <p className="font-rpg font-bold tracking-widest text-xs uppercase mt-4 text-purple-300">
          Summoning The Life RPG Realm...
        </p>
      </div>
    );
  }

  // Not logged in -> Landing Page
  if (!user) {
    return (
      <>
        <LandingPage
          onStartJourney={() => {
            setAuthMode('register');
            setAuthModalOpen(true);
          }}
          onLogin={() => {
            setAuthMode('login');
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
        />
        <OracleChatbot />
      </>
    );
  }

  // First time login -> Show onboarding wizard
  const showOnboarding = user.settings?.onboardingCompleted === false;

  const tabLabels = {
    dashboard: 'Hero Dashboard',
    quests: 'Quest Board',
    schedule: 'Daily Schedule',
    timer: 'Focus Sub-Sessions',
    character: 'Character Sheet',
    analytics: 'Analytics & Progression',
    leaderboard: 'Hall of Heroes',
    shop: 'Treasury & Rewards Bazaar',
    settings: 'System & Profile Settings',
  };

  const handleBackToDashboard = () => {
    sound.playClick();
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen rpg-background text-slate-100 flex flex-col justify-between pb-20 xl:pb-8">
      {/* Top Navbar HUD */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setDailyReportOpen(true)}
      />

      {/* Main App Content View Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        {/* Global Back Navigation Bar when in sub-pages */}
        {activeTab !== 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-md"
          >
            <button
              onClick={handleBackToDashboard}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-purple-200 hover:text-white hover:border-amber-400/60 hover:bg-purple-900/50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-amber-400" />
              <span>Back to Dashboard</span>
            </button>

            <div className="text-xs font-rpg font-bold tracking-wider text-purple-300/80 uppercase hidden sm:block">
              {tabLabels[activeTab] || 'Realm View'}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <Dashboard
              key="dashboard"
              setActiveTab={setActiveTab}
              onOpenNewQuest={() => {
                setActiveTab('quests');
                setNewQuestModalOpen(true);
              }}
            />
          )}
          {activeTab === 'quests' && (
            <QuestsPage
              key="quests"
              isNewQuestModalOpen={newQuestModalOpen}
              setIsNewQuestModalOpen={setNewQuestModalOpen}
              onBack={handleBackToDashboard}
            />
          )}
          {activeTab === 'schedule' && <SchedulePage key="schedule" onBack={handleBackToDashboard} />}
          {activeTab === 'timer' && <FocusTimerPage key="timer" onBack={handleBackToDashboard} />}
          {activeTab === 'character' && <CharacterPage key="character" onBack={handleBackToDashboard} />}
          {activeTab === 'analytics' && <AnalyticsPage key="analytics" onBack={handleBackToDashboard} />}
          {activeTab === 'leaderboard' && <LeaderboardPage key="leaderboard" onBack={handleBackToDashboard} />}
          {activeTab === 'shop' && <ShopPage key="shop" onBack={handleBackToDashboard} />}
          {activeTab === 'settings' && <SettingsPage key="settings" onBack={handleBackToDashboard} />}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Level Up Celebration Fireworks Modal */}
      <LevelUpModal data={levelUpData} onClose={closeLevelUpModal} />

      {/* Daily Accountability Report Modal */}
      <DailyReportModal
        isOpen={dailyReportOpen}
        onClose={() => setDailyReportOpen(false)}
      />

      {/* Onboarding Wizard Modal if first time */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {}}
      />

      {/* Oracle AI Companion Chatbot */}
      <OracleChatbot />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
