import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TestBankView } from './components/TestBankView';
import { SpeakingGraderView } from './components/SpeakingGraderView';
import { BrainstormView } from './components/BrainstormView';
import { ErrorNotebookView } from './components/ErrorNotebookView';
import { KnowledgeVocabView } from './components/KnowledgeVocabView';
import { KnowledgeArticlesView } from './components/KnowledgeArticlesView';
import { CoinRewardModal } from './components/CoinRewardModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileRoadmapModal } from './components/UserProfileRoadmapModal';
import { UserStats, UserProfile } from './types';

const DEFAULT_STATS: UserStats = {
  predicted_overall_band: 5.5,
  confidence_level: 'Chưa có bài thi (Hãy làm bài thi đầu tiên để AI đánh giá năng lực)',
  skill_bands: { reading: 0, listening: 0, writing: 0, speaking: 0 },
  total_attempts: 0,
  has_completed_tests: false,
  streak_days: 1,
  credits: 50,
  frequent_errors: []
};

const DEFAULT_PROFILE: UserProfile = {
  user_id: 'u_student',
  current_band: 5.5,
  target_band: 7.0,
  target_exam_date: '2026-11-15',
  weekly_hours: 10,
  updated_at: new Date().toISOString()
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Auth state with localStorage persistence
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('ielts_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.email === 'student@ielts.vn' ||
          parsed.email === 'teacher@ielts.vn' ||
          parsed.full_name?.includes('Nguyễn Văn Học Viên') ||
          parsed.full_name?.includes('Cô Nga') ||
          parsed.full_name?.includes('Thầy Hoàng') ||
          !parsed.full_name
        ) {
          parsed.email = 'tranquynhanh28032016@gmail.com';
          parsed.full_name = 'Trần Quỳnh Anh';
          parsed.role = parsed.role || 'STUDENT';
          localStorage.setItem('ielts_auth_user', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {}
    return { id: 'u_student', full_name: 'Trần Quỳnh Anh', role: 'STUDENT', email: 'tranquynhanh28032016@gmail.com' };
  });

  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [stats, setStats] = useState<UserStats | null>(DEFAULT_STATS);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const currentUserId = user?.id || 'u_student';

  useEffect(() => {
    fetchUserData(currentUserId);
  }, [currentUserId]);

  const fetchUserData = async (uid?: string) => {
    const targetUid = uid || user?.id || 'u_student';
    try {
      const authRes = await fetch(`/api/auth/me?user_id=${targetUid}`);
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) {
          const fetchedUser = { ...authData.user };
          if (
            fetchedUser.email === 'student@ielts.vn' ||
            fetchedUser.email === 'teacher@ielts.vn' ||
            fetchedUser.full_name?.includes('Nguyễn Văn Học Viên') ||
            fetchedUser.full_name?.includes('Cô Nga') ||
            fetchedUser.full_name?.includes('Thầy Hoàng') ||
            !fetchedUser.full_name
          ) {
            fetchedUser.full_name = 'Trần Quỳnh Anh';
            fetchedUser.email = 'tranquynhanh28032016@gmail.com';
            fetchedUser.role = 'STUDENT';
          }
          setUser(fetchedUser);
          try {
            localStorage.setItem('ielts_auth_user', JSON.stringify(fetchedUser));
          } catch (e) {}
        }
        if (authData.profile) {
          setProfile(authData.profile);
        }
      }
    } catch (err) {
      console.warn("Notice fetching auth profile:", err);
    }

    try {
      const statsRes = await fetch(`/api/user/stats?user_id=${targetUid}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        setStats((prev) => prev || DEFAULT_STATS);
      }
    } catch (err) {
      console.warn("Notice fetching stats, using default fallback:", err);
      setStats((prev) => prev || DEFAULT_STATS);
    }
  };

  const handleAuthSuccess = (data: { user: any; profile?: any }) => {
    if (data.user) {
      setUser(data.user);
      try {
        localStorage.setItem('ielts_auth_user', JSON.stringify(data.user));
        localStorage.setItem('ielts_auth_user_id', data.user.id);
      } catch (e) {}
    }
    if (data.profile) {
      setProfile(data.profile);
    }
    fetchUserData(data.user?.id);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('ielts_auth_user');
      localStorage.removeItem('ielts_auth_user_id');
    } catch (e) {}
    
    // Switch to default student or open login
    const defaultUser = { id: 'u_student', full_name: 'Trần Quỳnh Anh', role: 'STUDENT', email: 'tranquynhanh28032016@gmail.com' };
    setUser(defaultUser);
    fetchUserData('u_student');
    setAuthModalMode('LOGIN');
    setIsAuthModalOpen(true);
  };

  const handleUpdateOnboarding = async (data: any) => {
    const targetUid = user?.id || 'u_student';
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUid, ...data })
      });
      await res.json();
      fetchUserData(targetUid);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    const targetUid = user?.id || 'u_student';
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUid, ...data })
      });
      await res.json();
      
      if (data.full_name) {
        setUser((prev: any) => ({ ...prev, full_name: data.full_name }));
        try {
          const stored = localStorage.getItem('ielts_auth_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.full_name = data.full_name;
            localStorage.setItem('ielts_auth_user', JSON.stringify(parsed));
          }
        } catch (e) {}
      }

      fetchUserData(targetUid);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Ambient soft background glows for light theme */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-teal-100/50 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          profile={profile}
          stats={stats}
          onOpenCoinModal={() => setIsCoinModalOpen(true)}
          onOpenAuthModal={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              stats={stats}
              profile={profile}
              onNavigate={(tab) => setActiveTab(tab)}
              onUpdateOnboarding={handleUpdateOnboarding}
              onOpenCoinModal={() => setIsCoinModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          )}

          {activeTab === 'tests' && (
            <TestBankView onTestCompleted={() => fetchUserData(currentUserId)} />
          )}

          {activeTab === 'speaking' && (
            <TestBankView initialSkill="SPEAKING" onTestCompleted={() => fetchUserData(currentUserId)} />
          )}

          {activeTab === 'brainstorm' && (
            <BrainstormView />
          )}

          {activeTab === 'errors' && (
            <ErrorNotebookView onActivityCompleted={() => fetchUserData(currentUserId)} />
          )}

          {(activeTab === 'vocab' || activeTab === 'knowledge') && (
            <KnowledgeVocabView onNavigate={(tab) => setActiveTab(tab)} onActivityCompleted={() => fetchUserData(currentUserId)} />
          )}

          {activeTab === 'articles' && (
            <KnowledgeArticlesView onNavigate={(tab) => setActiveTab(tab)} />
          )}
        </main>

        <CoinRewardModal
          isOpen={isCoinModalOpen}
          onClose={() => {
            setIsCoinModalOpen(false);
            fetchUserData(currentUserId);
          }}
          userId={currentUserId}
          currentCredits={stats?.credits !== undefined ? stats.credits : 25}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
        />

        <UserProfileRoadmapModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          profile={profile}
          stats={stats}
          onUpdateProfile={handleUpdateProfile}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setIsProfileModalOpen(false);
          }}
          onOpenCoinModal={() => {
            setIsProfileModalOpen(false);
            setIsCoinModalOpen(true);
          }}
        />

        <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md text-slate-500 py-4 text-center text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-semibold text-emerald-700">© 2026 IELTS AI Master — Translucent Glossy Light Theme</p>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Hệ thống Đăng ký & Đăng nhập</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> SQLite Database</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Gemini 3.6 Flash</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
