import React, { useState } from 'react';
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
      </>
    );
  }

  // First time login -> Show onboarding wizard
  const showOnboarding = user.settings?.onboardingCompleted === false;

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
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenNewQuest={() => {
              setActiveTab('quests');
              setNewQuestModalOpen(true);
            }}
          />
        )}
        {activeTab === 'quests' && (
          <QuestsPage
            isNewQuestModalOpen={newQuestModalOpen}
            setIsNewQuestModalOpen={setNewQuestModalOpen}
          />
        )}
        {activeTab === 'schedule' && <SchedulePage />}
        {activeTab === 'timer' && <FocusTimerPage />}
        {activeTab === 'character' && <CharacterPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'leaderboard' && <LeaderboardPage />}
        {activeTab === 'shop' && <ShopPage />}
        {activeTab === 'settings' && <SettingsPage />}
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
