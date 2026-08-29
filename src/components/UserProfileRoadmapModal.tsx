import React, { useState, useEffect } from 'react';
import { 
  User, Target, Calendar, Clock, BookOpen, Award, Flame, Coins, 
  CheckCircle2, Sparkles, Edit3, X, Check, ArrowRight, ShieldCheck, 
  TrendingUp, BookMarked, Brain, RefreshCw, Layers, Bell, GraduationCap
} from 'lucide-react';
import { UserProfile, UserStats } from '../types';

interface UserProfileRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: UserProfile | null;
  stats: UserStats | null;
  onUpdateProfile: (updatedData: any) => Promise<void>;
  onNavigateTab: (tab: string) => void;
  onOpenCoinModal?: () => void;
}

export const UserProfileRoadmapModal: React.FC<UserProfileRoadmapModalProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  stats,
  onUpdateProfile,
  onNavigateTab,
  onOpenCoinModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'roadmap' | 'achievements'>('profile');
  
  // Profile Form States
  const [fullName, setFullName] = useState(user?.full_name || 'Trần Quỳnh Anh');
  const [currentBand, setCurrentBand] = useState<number>(profile?.current_band || 5.5);
  const [targetBand, setTargetBand] = useState<number>(profile?.target_band || 7.0);
  const [targetExamDate, setTargetExamDate] = useState<string>(profile?.target_exam_date || '2026-11-15');
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weekly_hours || 12);
  const [preferredSlot, setPreferredSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('EVENING');
  const [focusSkills, setFocusSkills] = useState<string[]>(['WRITING', 'SPEAKING']);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name);
    if (profile?.current_band) setCurrentBand(profile.current_band);
    if (profile?.target_band) setTargetBand(profile.target_band);
    if (profile?.target_exam_date) setTargetExamDate(profile.target_exam_date);
    if (profile?.weekly_hours) setWeeklyHours(profile.weekly_hours);
  }, [user, profile, isOpen]);

  if (!isOpen) return null;

  // Calculate days remaining to exam
  const calculateDaysRemaining = () => {
    try {
      const examDate = new Date(targetExamDate);
      const today = new Date();
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 60;
    }
  };

  const daysRemaining = calculateDaysRemaining();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      await onUpdateProfile({
        full_name: fullName,
        current_band: currentBand,
        target_band: targetBand,
        target_exam_date: targetExamDate,
        weekly_hours: weeklyHours,
        preferred_timeslot: preferredSlot,
        focus_skills: focusSkills
      });

      setSaveSuccessMsg('🎉 Đã cập nhật hồ sơ & đồng bộ lộ trình thành công!');
      setTimeout(() => {
        setSaveSuccessMsg(null);
      }, 3500);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (focusSkills.includes(skill)) {
      if (focusSkills.length > 1) {
        setFocusSkills(focusSkills.filter(s => s !== skill));
      }
    } else {
      setFocusSkills([...focusSkills, skill]);
    }
  };

  const roadmapMilestones = [
    {
      stage: 'GIAI ĐOẠN 1',
      title: 'Xây Dựng Nền Tảng & Từ Vựng Cốt Lõi',
      target: `Band ${currentBand.toFixed(1)} ➔ ${(currentBand + 0.5).toFixed(1)}`,
      duration: 'Tuần 1 - 3',
      status: 'COMPLETED',
      tasks: [
        'Học 300 từ vựng học thuật Academic Word List (AWL) theo chủ đề',
        'Nắm vững cấu trúc câu phức & dạng bài Nghe Section 1 & 2',
        'Luyện phát âm chuẩn IPA 44 âm & Intonation ngữ điệu tự nhiên'
      ]
    },
    {
      stage: 'GIAI ĐOẠN 2',
      title: 'Chiến Thuật Làm Bài & Phản Xạ Kỹ Năng',
      target: `Band ${(currentBand + 0.5).toFixed(1)} ➔ ${(targetBand - 0.5).toFixed(1)}`,
      duration: 'Tuần 4 - 7',
      status: 'IN_PROGRESS',
      tasks: [
        'Luyện phương pháp Skimming & Scanning dạng True/False/Not Given & Heading',
        'Luyện dàn ý Writing Task 1 (Line, Bar, Pie, Process) & Task 2 (Opinion, Discussion)',
        'Luyện Speaking Part 2 với phương pháp Mindmap 1 phút & mở rộng ý Part 3'
      ]
    },
    {
      stage: 'GIAI ĐOẠN 3',
      title: 'Tăng Tốc Giải Đề Thực Chiến & Chấm Điểm AI',
      target: `Band ${(targetBand - 0.5).toFixed(1)} ➔ ${targetBand.toFixed(1)}`,
      duration: 'Tuần 8 - 10',
      status: 'UPCOMING',
      tasks: [
        'Giải trọn bộ Cambridge IELTS 16 - 19 chuẩn giao diện thi máy tính',
        'Chấm chữa chi tiết Writing & Speaking cùng trợ lý AI để xóa sổ lỗi ngữ pháp',
        'Rèn luyện áp lực thời gian: Reading 60 phút, Listening 30 phút không ngắt quãng'
      ]
    },
    {
      stage: 'GIAI ĐOẠN 4',
      title: 'Tổng Ôn Về Đích & Tối Ưu Band Score',
      target: `Bứt Phá Band ${targetBand.toFixed(1)}+`,
      duration: '2 Tuần Trước Ngày Thi',
      status: 'UPCOMING',
      tasks: [
        'Thi thử Full Test 4 kỹ năng trong ngày mô phỏng kỳ thi chính thức',
        'Ôn lại toàn bộ Sổ Lỗi Sai (Error Notebook) và danh sách từ vựng hay nhầm',
        'Chuẩn bị tâm lý tự tin & chiến lược phân bổ thời gian phòng thi'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        id="user-profile-roadmap-card"
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-6 sm:p-7">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer shadow-xs border border-white/20"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:pr-12">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight text-white">{fullName}</h2>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-400/30 text-emerald-100 rounded-full border border-emerald-300/40">
                    {user?.role === 'TEACHER' ? 'GIẢNG VIÊN' : 'HỌC VIÊN PRO'}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  {user?.email || 'tranquynhanh28032016@gmail.com'} • Mã HV: <span className="font-mono text-white font-bold">{user?.id || 'u_student'}</span>
                </p>
              </div>
            </div>

            {/* Target Countdown Pill */}
            <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center sm:text-right shrink-0">
              <div className="text-[11px] font-semibold text-emerald-200">Đếm ngược ngày thi IELTS</div>
              <div className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-end gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>Còn {daysRemaining} ngày</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center bg-black/20 backdrop-blur-md p-1 rounded-2xl mt-6 border border-white/15">
            <button
              id="tab-btn-profile"
              type="button"
              onClick={() => setActiveSubTab('profile')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSubTab === 'profile'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Hồ Sơ & Mục Tiêu</span>
            </button>

            <button
              id="tab-btn-roadmap"
              type="button"
              onClick={() => setActiveSubTab('roadmap')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSubTab === 'roadmap'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lộ Trình Từng Giai Đoạn</span>
            </button>

            <button
              id="tab-btn-achievements"
              type="button"
              onClick={() => setActiveSubTab('achievements')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSubTab === 'achievements'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Thành Tích & Ví Xu</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[65vh] overflow-y-auto">
          {saveSuccessMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="font-bold">{saveSuccessMsg}</div>
            </div>
          )}

          {/* TAB 1: PROFILE & STUDY PREFERENCES */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và Tên Học Viên
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Đăng Ký
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'tranquynhanh28032016@gmail.com'}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Band Settings */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Thiết lập Mục tiêu Điểm IELTS
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    Mục tiêu: Band {targetBand.toFixed(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Trình độ xuất phát hiện tại:
                    </label>
                    <select
                      value={currentBand}
                      onChange={(e) => setCurrentBand(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0].map((b) => (
                        <option key={b} value={b}>Band {b.toFixed(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Band mục tiêu cần đạt:
                    </label>
                    <select
                      value={targetBand}
                      onChange={(e) => setTargetBand(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                        <option key={b} value={b}>Band {b.toFixed(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-emerald-200/50">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Ngày dự kiến thi chính thức:
                    </label>
                    <input
                      type="date"
                      value={targetExamDate}
                      onChange={(e) => setTargetExamDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Thời lượng tự học mỗi tuần (giờ):
                    </label>
                    <input
                      type="number"
                      min={4}
                      max={40}
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Time slots and focus skills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Khung giờ học ưu tiên:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'MORNING', label: '🌅 Sáng (7:30 - 9:00)' },
                    { id: 'AFTERNOON', label: '☀️ Chiều (14:00 - 16:00)' },
                    { id: 'EVENING', label: '🌙 Tối (19:30 - 21:30)' }
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setPreferredSlot(slot.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        preferredSlot === slot.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kỹ năng ưu tiên tăng tốc (chọn 1 hoặc nhiều):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['READING', 'LISTENING', 'WRITING', 'SPEAKING'].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition cursor-pointer ${
                        focusSkills.includes(skill)
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{skill}</span>
                      {focusSkills.includes(skill) && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab('dashboard');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Xem Lịch Biểu Tuần
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Đang Lưu Hồ Sơ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Lưu Thay Đổi & Tối Ưu Lộ Trình
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ROADMAP STAGES */}
          {activeSubTab === 'roadmap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Lộ trình 4 giai đoạn chinh phục Band {targetBand.toFixed(1)}</h4>
                    <p className="text-[11px] text-slate-500">Được tối ưu theo tốc độ học {weeklyHours} giờ/tuần của bạn</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab('tests');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Luyện Đề Ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200">
                {roadmapMilestones.map((m, idx) => (
                  <div key={idx} className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    {/* Circle marker */}
                    <div className={`absolute -left-6 top-4 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                      m.status === 'COMPLETED' ? 'bg-emerald-600 text-white' :
                      m.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white ring-4 ring-amber-100' :
                      'bg-slate-300 text-white'
                    }`}>
                      {m.status === 'COMPLETED' ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {m.stage}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-800">{m.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {m.target}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">({m.duration})</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 mt-2.5 pt-2 border-t border-slate-100">
                      {m.tasks.map((t, tIdx) => (
                        <li key={tIdx} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            m.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-400'
                          }`} />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ACHIEVEMENTS & WALLET */}
          {activeSubTab === 'achievements' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 text-amber-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-800">Ví Xu Thưởng</span>
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-900">
                    {stats?.credits !== undefined ? stats.credits : 25} <span className="text-sm font-semibold">Xu</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCoinModal?.();
                    }}
                    className="mt-2.5 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-extrabold transition shadow-2xs cursor-pointer"
                  >
                    Đổi Quà & Voucher
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 text-emerald-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800">Chuỗi Ngày Học</span>
                    <Flame className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-900">
                    {stats?.streak_days !== undefined ? stats.streak_days : 1} <span className="text-sm font-semibold">Ngày Streak</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-2 font-medium">Học đều mỗi ngày để nhân đôi Xu!</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/60 border border-teal-200 text-teal-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-800">Bài Thi Hoàn Thành</span>
                    <Award className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-teal-900">
                    {stats?.completed_tests_count || 12} <span className="text-sm font-semibold">Bài Test</span>
                  </div>
                  <p className="text-[11px] text-teal-700 mt-2 font-medium">Đã bao gồm 4 kỹ năng</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Huy hiệu & Cột mốc học tập đã đạt được
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Tân Thủ IELTS', desc: 'Gia nhập hệ thống', unlocked: true },
                    { label: 'Chiến Binh 7 Ngày', desc: 'Streak 7 ngày liên tiếp', unlocked: true },
                    { label: 'Bậc Thầy Reading', desc: 'Đạt Band 7.5 Reading', unlocked: true },
                    { label: 'Chinh Phục 8.0', desc: 'Đạt mục tiêu Overall 8.0', unlocked: false }
                  ].map((badge, bIdx) => (
                    <div
                      key={bIdx}
                      className={`p-3 rounded-xl border text-center transition ${
                        badge.unlocked
                          ? 'bg-white border-emerald-200 shadow-2xs'
                          : 'bg-slate-100 border-slate-200 opacity-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold text-xs mb-1.5">
                        {badge.unlocked ? '🏆' : '🔒'}
                      </div>
                      <div className="text-xs font-extrabold text-slate-800">{badge.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{badge.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
