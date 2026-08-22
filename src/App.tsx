import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TestBankView } from './components/TestBankView';
import { SpeakingGraderView } from './components/SpeakingGraderView';
import { BrainstormView } from './components/BrainstormView';
import { ErrorNotebookView } from './components/ErrorNotebookView';
import { KnowledgeVocabView } from './components/KnowledgeVocabView';
import { UserStats, UserProfile } from './types';

const DEFAULT_STATS: UserStats = {
  predicted_overall_band: 6.5,
  confidence_level: 'Độ tin cậy Cao (dựa trên bài thi gần đây)',
  skill_bands: { reading: 6.5, listening: 7.0, writing: 6.0, speaking: 6.5 },
  total_attempts: 4,
  streak_days: 5,
  credits: 25,
  frequent_errors: [
    { tag_code: 'W_TENSE_ERR', name: 'Lỗi Sai Thì Động Từ', count: 4 },
    { tag_code: 'S_PRON_ERR', name: 'Phát Âm Thiếu Sắc Thái', count: 3 },
    { tag_code: 'W_VOCAB_ERR', name: 'Dùng Từ Sai Ngữ Cảnh', count: 2 }
  ]
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
  const [user, setUser] = useState<any>({ id: 'u_student', full_name: 'Nguyễn Văn Học Viên', role: 'STUDENT' });
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [stats, setStats] = useState<UserStats | null>(DEFAULT_STATS);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const authRes = await fetch('/api/auth/me?user_id=u_student');
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) setUser(authData.user);
        if (authData.profile) setProfile(authData.profile);
      }
    } catch (err) {
      console.warn("Notice fetching auth profile:", err);
    }

    try {
      const statsRes = await fetch('/api/user/stats?user_id=u_student');
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

          {activeTab === 'speaking' && (
            <TestBankView initialSkill="SPEAKING" onTestCompleted={fetchUserData} />
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

        <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md text-slate-500 py-4 text-center text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-semibold text-emerald-700">© 2026 IELTS AI Master — Translucent Glossy Light Theme</p>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Cloud SQL PostgreSQL</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Gemini 3.6 Flash</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Google Workspace</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
