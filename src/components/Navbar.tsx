import React from 'react';
import { BookOpen, Edit3, Mic, Brain, AlertCircle, FileText, LayoutDashboard, Flame, Coins, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  stats: any;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, stats }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan & Lộ trình', icon: LayoutDashboard },
    { id: 'tests', label: 'Ngân hàng đề thi', icon: BookOpen },
    { id: 'writing', label: 'Chấm bài Writing', icon: Edit3 },
    { id: 'speaking', label: 'Luyện Speaking AI', icon: Mic },
    { id: 'brainstorm', label: 'Brainstorm Ý tưởng', icon: Brain },
    { id: 'errors', label: 'Sổ lỗi sai', icon: AlertCircle },
    { id: 'knowledge', label: 'Từ vựng & Bài học', icon: FileText },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100/80 text-slate-800 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-[#C7F3C7] border border-[#A5E0A5] flex items-center justify-center text-emerald-950 font-black text-lg shadow-xs">
              I
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight uppercase text-emerald-950">
                  IELTS<span className="text-emerald-700">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#C7F3C7] text-emerald-950 rounded-full border border-[#A5E0A5]">
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Gamification Badges & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF9EE] text-emerald-900 border border-[#C7F3C7] text-xs font-bold" title="Chuỗi ngày học liên tục">
              <Flame className="w-3.5 h-3.5 text-emerald-700 fill-emerald-600" />
              <span>🔥 {stats?.streak_days || 12} Ngày Streak</span>
            </div>

            {/* Wallet Credits */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF9EE] text-emerald-900 border border-[#C7F3C7] text-xs font-bold" title="Số lượt AI khả dụng">
              <Coins className="w-3.5 h-3.5 text-emerald-700" />
              <span>{stats?.credits || 25} AI Xu</span>
            </div>

            {/* User */}
            <div className="flex items-center gap-2 pl-2 border-l border-emerald-100">
              <div className="w-8 h-8 rounded-full bg-[#C7F3C7] border border-[#A5E0A5] flex items-center justify-center text-emerald-950 font-bold text-xs">
                {user?.full_name ? user.full_name.charAt(0) : 'N'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || 'Nguyễn Văn Học Viên'}</p>
                <p className="text-[10px] text-emerald-700 font-semibold">{user?.role || 'Học Viên IELTS'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-1.5 border-t border-emerald-50 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#C7F3C7] text-emerald-950 border border-[#A5E0A5] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-[#EEF9EE]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-900' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
