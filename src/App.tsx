import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TestBankView } from './components/TestBankView';
import { WritingGraderView } from './components/WritingGraderView';
import { SpeakingGraderView } from './components/SpeakingGraderView';
import { BrainstormView } from './components/BrainstormView';
import { ErrorNotebookView } from './components/ErrorNotebookView';
import { KnowledgeVocabView } from './components/KnowledgeVocabView';
import { UserStats, UserProfile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<any>({ id: 'u_student', full_name: 'Nguyễn Văn Học Viên', role: 'STUDENT' });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Auto login / fetch default user
      const authRes = await fetch('/api/auth/me?user_id=u_student');
      const authData = await authRes.json();
      if (authData.user) setUser(authData.user);
      if (authData.profile) setProfile(authData.profile);

      // Fetch Stats & Predictive Band Scores
      const statsRes = await fetch('/api/user/stats?user_id=u_student');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const handleUpdateOnboarding = async (data: any) => {
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'u_student', ...data })
      });
      await res.json();
      fetchUserData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7F0] text-slate-800 font-sans antialiased selection:bg-[#C7F3C7] selection:text-emerald-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        stats={stats}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            profile={profile}
            onNavigate={(tab) => setActiveTab(tab)}
            onUpdateOnboarding={handleUpdateOnboarding}
          />
        )}

        {activeTab === 'tests' && (
          <TestBankView onTestCompleted={fetchUserData} />
        )}

        {activeTab === 'writing' && (
          <WritingGraderView />
        )}

        {activeTab === 'speaking' && (
          <SpeakingGraderView />
        )}

        {activeTab === 'brainstorm' && (
          <BrainstormView />
        )}

        {activeTab === 'errors' && (
          <ErrorNotebookView />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeVocabView />
        )}
      </main>

      <footer className="border-t border-[#C7F3C7] bg-white text-slate-500 py-4 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-emerald-950">© 2026 IELTS AI Master — Soft Mint (#C7F3C7) Theme</p>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
            <span>Database: SQLite</span>
            <span>AI: Gemini 3.6 Flash</span>
            <span>Framework: Express + React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
