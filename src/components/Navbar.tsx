import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Edit3, Mic, Brain, AlertCircle, FileText, LayoutDashboard, 
  Flame, Coins, Sparkles, BookMarked, GraduationCap, LogIn, UserPlus, 
  LogOut, ChevronDown, User, ShieldCheck, Target, Award, RefreshCw 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  profile?: any;
  stats: any;
  onOpenCoinModal?: () => void;
  onOpenAuthModal?: (mode: 'LOGIN' | 'REGISTER') => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  profile,
  stats, 
  onOpenCoinModal,
  onOpenAuthModal,
  onOpenProfileModal,
  onLogout 
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan & Lộ trình', icon: LayoutDashboard },
    { id: 'tests', label: 'Ngân hàng đề thi', icon: BookOpen },
    { id: 'brainstorm', label: 'Brainstorm Ý tưởng', icon: Brain },
    { id: 'errors', label: 'Sổ lỗi sai', icon: AlertCircle },
    { id: 'vocab', label: 'Sổ từ vựng & Quiz', icon: BookMarked },
    { id: 'articles', label: 'Bài viết kiến thức', icon: FileText },
  ];

  const isGuest = !user || user.id === 'u_guest';

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 text-slate-900 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
              I
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight uppercase text-slate-900">
                  IELTS<span className="text-emerald-600">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Gamification Badges & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div 
              onClick={onOpenCoinModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs group" 
              title="Chuỗi ngày học liên tục thực tế — Nhấp để xem quy tắc quy đổi xu"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
              <span>{stats?.streak_days !== undefined ? stats.streak_days : 0} Ngày Streak</span>
            </div>

            {/* Wallet Credits / Xu & Gift Store */}
            <button 
              onClick={onOpenCoinModal}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs group" 
              title="Cửa Hàng Đổi Xu Lấy Quà, Voucher Khóa Học & Nhà Sách"
            >
              <Coins className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>{stats?.credits !== undefined ? stats.credits : 25} Xu</span>
              <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.2 rounded text-emerald-100">
                Đổi Quà
              </span>
            </button>

            {/* User Dropdown / Auth Buttons */}
            {isGuest ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <button
                  id="nav-login-btn"
                  onClick={() => onOpenAuthModal?.('LOGIN')}
                  className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Đăng Nhập</span>
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => onOpenAuthModal?.('REGISTER')}
                  className="px-3 py-1 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng Ký (+50 Xu)</span>
                </button>
              </div>
            ) : (
              <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shadow-2xs ring-2 ring-emerald-100">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                      {user?.full_name || 'Trần Quỳnh Anh'}
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold">{user?.role === 'TEACHER' ? 'Giảng Viên IELTS' : 'Học Viên'}</p>
                  </div>
                </button>

                {/* Floating User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    {/* Header Info */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">{user?.full_name || 'Trần Quỳnh Anh'}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email || 'tranquynhanh28032016@gmail.com'}</p>
                        </div>
                      </div>

                      {/* Quick Badges in Dropdown */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60 text-[11px]">
                        <div className="flex-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-center font-bold text-slate-700">
                          🎯 Mục tiêu: <span className="text-emerald-700">Band {profile?.target_band?.toFixed(1) || '7.0'}</span>
                        </div>
                        <div className="flex-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-center font-bold text-slate-700">
                          🪙 Số dư: <span className="text-amber-600">{stats?.credits !== undefined ? stats.credits : 25} Xu</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-1 space-y-0.5">
                      <button
                        id="user-menu-profile-roadmap-btn"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setActiveTab('dashboard');
                          onOpenProfileModal?.();
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer text-left group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Hồ sơ & Lộ trình của tôi</p>
                          <p className="text-[10px] text-slate-500">Xem mục tiêu Band, ngày thi & lộ trình</p>
                        </div>
                      </button>

                      <button
                        id="user-menu-switch-account-btn"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onOpenAuthModal?.('LOGIN');
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer text-left"
                      >
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                        <span>Chuyển / Đổi tài khoản khác</span>
                      </button>

                      <button
                        id="user-menu-register-new-btn"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onOpenAuthModal?.('REGISTER');
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer text-left"
                      >
                        <UserPlus className="w-4 h-4 text-teal-600" />
                        <span>Đăng ký tài khoản mới (+50 Xu)</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="pt-1 mt-1 border-t border-slate-100 p-1">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onLogout?.();
                        }}
                        className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất khỏi thiết bị</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Bar Tabs */}
        <nav className="flex space-x-1.5 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'btn-glossy-emerald font-extrabold text-white scale-[1.02]'
                    : 'btn-glossy-dark font-medium text-slate-700 hover:text-emerald-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

