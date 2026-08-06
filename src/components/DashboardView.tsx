import React, { useState, useEffect } from 'react';
import { Target, Award, Calendar, Clock, BookOpen, Edit3, Mic, Brain, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw, Sparkles, ExternalLink, Check, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserProfile, UserStats } from '../types';
import { initAuth, googleSignIn, getCurrentUser, logoutGoogle } from '../lib/firebaseAuth';
import { syncMultipleEventsToCalendar, StudySessionEvent } from '../lib/googleCalendar';

interface DashboardViewProps {
  stats: UserStats | null;
  profile: UserProfile | null;
  onNavigate: (tab: string) => void;
  onUpdateOnboarding: (data: any) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  profile,
  onNavigate,
  onUpdateOnboarding,
}) => {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [currentBand, setCurrentBand] = useState(profile?.current_band || 5.5);
  const [targetBand, setTargetBand] = useState(profile?.target_band || 7.0);
  const [targetDate, setTargetDate] = useState(profile?.target_exam_date || '2026-11-15');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weekly_hours || 12);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('EVENING');
  const [focusSkills, setFocusSkills] = useState<string[]>(['WRITING', 'SPEAKING']);

  // Google Auth & Calendar Sync State
  const [calendarUser, setCalendarUser] = useState<any>(null);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [showSyncConfirmModal, setShowSyncConfirmModal] = useState(false);
  const [generatedSessions, setGeneratedSessions] = useState<StudySessionEvent[]>([]);
  const [scheduleOverview, setScheduleOverview] = useState<string>('');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCalendarUser(user);
        setCalendarToken(token);
      },
      () => {
        setCalendarUser(null);
        setCalendarToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Parse existing study plan json if present
  useEffect(() => {
    if (profile?.study_plan_json) {
      try {
        const parsed = JSON.parse(profile.study_plan_json);
        if (parsed.fullSchedule?.sessions) {
          setGeneratedSessions(parsed.fullSchedule.sessions);
          setScheduleOverview(parsed.fullSchedule.overview || '');
        }
      } catch (e) {
        console.error("Error parsing study_plan_json", e);
      }
    }
  }, [profile]);

  const handleConnectGoogle = async () => {
    setIsConnectingCalendar(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCalendarUser(result.user);
        setCalendarToken(result.accessToken);
      }
    } catch (err: any) {
      alert(`Không thể kết nối Google Calendar: ${err.message || err}`);
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleGenerateAISchedule = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGeneratingSchedule(true);
    setSyncSuccessMsg(null);

    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_band: currentBand,
          target_band: targetBand,
          target_exam_date: targetDate,
          weekly_hours: weeklyHours,
          preferred_timeslot: preferredTimeSlot,
          focus_skills: focusSkills
        })
      });

      const data = await res.json();
      if (data.sessions) {
        setGeneratedSessions(data.sessions);
        setScheduleOverview(data.overview || '');

        // Save into profile
        await onUpdateOnboarding({
          current_band: currentBand,
          target_band: targetBand,
          target_exam_date: targetDate,
          weekly_hours: weeklyHours,
          preferred_timeslot: preferredTimeSlot,
          focus_skills: focusSkills,
          fullSchedule: data
        });
      }
    } catch (err) {
      console.error("Lỗi sinh lịch học AI:", err);
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const handleStartCalendarSync = () => {
    if (!calendarToken) {
      handleConnectGoogle();
      return;
    }
    setShowSyncConfirmModal(true);
  };

  const handleConfirmSyncToCalendar = async () => {
    setShowSyncConfirmModal(false);
    if (!calendarToken || !generatedSessions.length) return;

    setIsSyncingCalendar(true);
    setSyncProgress({ current: 0, total: generatedSessions.length });

    try {
      const updated = await syncMultipleEventsToCalendar(
        calendarToken,
        generatedSessions,
        (current, total) => setSyncProgress({ current, total })
      );

      setGeneratedSessions(updated);
      setSyncSuccessMsg(`Đã đồng bộ thành công ${updated.filter(s => s.synced).length}/${updated.length} buổi học vào Google Calendar của ${calendarUser?.email || 'bạn'}!`);
    } catch (err: any) {
      alert(`Đồng bộ thất bại: ${err.message}`);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const toggleFocusSkill = (skill: string) => {
    if (focusSkills.includes(skill)) {
      if (focusSkills.length > 1) {
        setFocusSkills(focusSkills.filter(s => s !== skill));
      }
    } else {
      setFocusSkills([...focusSkills, skill]);
    }
  };

  const skillBands = stats?.skill_bands || { reading: 6.5, listening: 7.0, writing: 6.0, speaking: 6.5 };
  const predictedBand = stats?.predicted_overall_band || 6.5;

  return (
    <div className="space-y-6">
      {/* Top Hero Banner: Light Mint Green Theme (#E8F8E8 & #C7F3C7) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#E8F8E8] border border-[#BDE8BD] p-6 md:p-7 text-emerald-950 shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C7F3C7]/40 rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#C7F3C7]/30 rounded-full -mr-10 -mb-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Overall Prediction & Hero Banner */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-900 border border-[#A5E0A5] text-xs font-black uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Dự Đoán Điểm IELTS AI</span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-950 leading-tight">
                Sẵn sàng cho bài Thi Thử IELTS?
              </h1>
              <p className="text-xs text-emerald-900 mt-1.5 max-w-md leading-relaxed font-medium">
                Luyện tập trên giao diện chuẩn thi thật trên máy tính với AI phân tích kỹ năng & ước tính điểm <span className="font-extrabold text-emerald-950 text-sm bg-[#C7F3C7] px-1.5 py-0.5 rounded-md">Band {predictedBand.toFixed(1)}</span>.
              </p>
            </div>

            {/* Target Goal Summary */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-900 pt-2 border-t border-[#A5E0A5]/50">
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-[#A5E0A5]">
                <Target className="w-3.5 h-3.5 text-emerald-700" />
                <span>Mục tiêu: <strong className="text-emerald-950 font-bold">{profile?.target_band || 7.0} Band</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-[#A5E0A5]">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ngày thi: <strong className="text-emerald-950 font-bold">{profile?.target_exam_date || '15/11/2026'}</strong></span>
              </div>

              <button
                onClick={() => onNavigate('tests')}
                className="bg-[#C7F3C7] hover:bg-[#b2ebb2] text-emerald-950 border border-[#96DC96] px-4 py-1.5 rounded-xl font-black text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 ml-auto sm:ml-0"
              >
                <span>Vào Thi Thử Ngay</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-950" />
              </button>
            </div>
          </div>

          {/* Right: Skill Breakdown Progress Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:w-80 shrink-0">
            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#BDE8BD] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-blue-600" /> Reading</span>
                <span className="text-emerald-950 font-black">{skillBands.reading}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(skillBands.reading / 9) * 100}%` }} />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#BDE8BD] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-600" /> Listening</span>
                <span className="text-emerald-950 font-black">{skillBands.listening}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(skillBands.listening / 9) * 100}%` }} />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#BDE8BD] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-1"><Edit3 className="w-3.5 h-3.5 text-amber-600" /> Writing</span>
                <span className="text-emerald-950 font-black">{skillBands.writing}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(skillBands.writing / 9) * 100}%` }} />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#BDE8BD] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5 text-rose-600" /> Speaking</span>
                <span className="text-emerald-950 font-black">{skillBands.speaking}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${(skillBands.speaking / 9) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Google Calendar Integration & Study Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Google Calendar Integration & AI Study Schedule */}
        <div className="lg:col-span-2 space-y-6">

          {/* Google Calendar Banner & Connection Card */}
          <div className="bg-white border border-[#C7F3C7] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F8E8] border border-[#BDE8BD] flex items-center justify-center text-emerald-800 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Tích Hợp Google Calendar Thông Báo
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tự động tạo nhắc nhở (reminders) lịch học IELTS trên điện thoại & máy tính
                  </p>
                </div>
              </div>

              {/* Calendar Auth Button */}
              {calendarUser ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#E8F8E8] border border-[#BDE8BD] px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span className="truncate max-w-[150px]">{calendarUser.email}</span>
                  </div>
                  <button
                    onClick={logoutGoogle}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1"
                    title="Đăng xuất khỏi Google"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  disabled={isConnectingCalendar}
                  className="bg-[#C7F3C7] hover:bg-[#b2ebb2] text-emerald-950 border border-[#A5E0A5] px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs shrink-0"
                >
                  {isConnectingCalendar ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kết nối Google...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-emerald-800 text-emerald-800" />
                      <span>Kết Nối Google Calendar</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Status or Alert if not connected */}
            {!calendarUser && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Chưa kết nối Google Calendar:</strong> Hãy kết nối để khi AI sinh lộ trình học phù hợp, các buổi học sẽ được tự động đồng bộ trực tiếp vào ứng dụng Google Calendar của bạn với thông báo nhắc giờ học!
                </p>
              </div>
            )}

            {syncSuccessMsg && (
              <div className="bg-[#E8F8E8] border border-[#BDE8BD] rounded-2xl p-3 flex items-center justify-between gap-2 text-xs text-emerald-950 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncSuccessMsg}</span>
                </div>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-[#A5E0A5] px-2.5 py-1 rounded-lg font-bold text-emerald-900 flex items-center gap-1 hover:bg-[#C7F3C7] transition"
                >
                  <span>Mở Google Calendar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* AI Study Plan Header & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-emerald-700" />
                  Lộ Trình & Lịch Học Chi Tiết ({generatedSessions.length} buổi)
                </h3>
                {scheduleOverview && (
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{scheduleOverview}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tùy Chỉnh Mục Tiêu</span>
                </button>

                <button
                  onClick={handleStartCalendarSync}
                  disabled={isSyncingCalendar || !generatedSessions.length}
                  className="bg-[#C7F3C7] hover:bg-[#b2ebb2] disabled:opacity-50 text-emerald-950 border border-[#A5E0A5] text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {isSyncingCalendar ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-900" />
                      <span>Đồng bộ {syncProgress.current}/{syncProgress.total}...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-emerald-900" />
                      <span>Đồng Bộ Sang Google Calendar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of Generated Study Sessions */}
            {generatedSessions.length > 0 ? (
              <div className="space-y-3 pt-2">
                {generatedSessions.map((session, index) => {
                  const startDate = new Date(session.start_time);
                  const isToday = startDate.toDateString() === new Date().toDateString();

                  const skillColor: Record<string, string> = {
                    READING: 'bg-blue-50 text-blue-800 border-blue-200',
                    LISTENING: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    WRITING: 'bg-amber-50 text-amber-800 border-amber-200',
                    SPEAKING: 'bg-rose-50 text-rose-800 border-rose-200',
                  };

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all ${
                        session.synced
                          ? 'bg-[#E8F8E8]/60 border-[#BDE8BD]'
                          : 'bg-slate-50/80 border-slate-200 hover:border-[#A5E0A5]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${skillColor[session.skill] || 'bg-slate-100 text-slate-700'}`}>
                              {session.skill}
                            </span>
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {startDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isToday && (
                              <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Hôm nay</span>
                            )}
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug pt-0.5">
                            {session.summary}
                          </h4>

                          <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1 font-normal">
                            {session.description}
                          </p>
                        </div>

                        {/* Status / Direct Link Badge */}
                        <div className="shrink-0 pt-1 sm:pt-0">
                          {session.synced ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-white border border-[#A5E0A5] px-2.5 py-1 rounded-xl shadow-2xs">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Đã lên lịch
                              </span>
                              {session.html_link && (
                                <a
                                  href={session.html_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-emerald-900 hover:text-emerald-950 underline font-bold flex items-center gap-0.5"
                                  title="Xem trên Google Calendar"
                                >
                                  <span>Xem</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                              Chưa đồng bộ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Chưa có lịch học AI cá nhân hóa</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    Nhấp vào nút dưới đây để AI thiết kế cho bạn lộ trình học IELTS cụ thể từng ngày và đẩy vào Google Calendar.
                  </p>
                </div>
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="bg-[#C7F3C7] hover:bg-[#b2ebb2] text-emerald-950 border border-[#A5E0A5] px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Brain className="w-4 h-4 text-emerald-900" />
                  <span>Sinh Lộ Trình Lịch Học AI</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Frequent Errors & Leaderboard */}
        <div className="space-y-6">
          {/* Frequent Errors Card */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Lỗi Hay Mắc Phải
              </h3>
              <button
                onClick={() => onNavigate('errors')}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            {stats?.frequent_errors && stats.frequent_errors.length > 0 ? (
              <div className="space-y-2">
                {stats.frequent_errors.slice(0, 3).map((err, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-amber-50/60 border border-amber-200/80 p-2 rounded-xl">
                    <span className="text-xs font-semibold text-slate-800">{err.name}</span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                      {err.count} lần
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-xs space-y-1.5">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                <p className="font-medium text-slate-800">Chưa ghi nhận lỗi lặp lại.</p>
                <p className="text-[10px] text-slate-400">Các lỗi sai khi chấm bài sẽ được tự động gom vào đây.</p>
              </div>
            )}

            <button
              onClick={() => onNavigate('errors')}
              className="w-full mt-3 text-xs font-bold text-emerald-800 border border-emerald-200 py-2 rounded-xl hover:bg-emerald-50 transition cursor-pointer"
            >
              Ôn Lại Các Lỗi Sai Này
            </button>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-500" />
                Bảng Xếp Hạng
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Tháng này</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 w-4 text-center">1</span>
                <div className="w-6 h-6 rounded-full bg-slate-200 font-bold text-[10px] text-slate-700 flex items-center justify-center">LD</div>
                <span className="text-xs font-semibold text-slate-800 flex-1 truncate">Lê Quốc Dũng</span>
                <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">8.5</span>
              </div>

              <div className="flex items-center gap-2.5 bg-[#E8F8E8] p-2 rounded-xl border border-[#BDE8BD]">
                <span className="text-xs font-black text-emerald-700 w-4 text-center">2</span>
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">NV</div>
                <span className="text-xs font-bold text-emerald-950 flex-1 truncate">Nguyễn Văn Học Viên (Bạn)</span>
                <span className="text-xs font-black text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">8.0</span>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 w-4 text-center">3</span>
                <div className="w-6 h-6 rounded-full bg-slate-200 font-bold text-[10px] text-slate-700 flex items-center justify-center">TT</div>
                <span className="text-xs font-semibold text-slate-800 flex-1 truncate">Trần Hoài Thu</span>
                <span className="text-xs font-black text-slate-700 bg-slate-200 px-2 py-0.5 rounded">7.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding & Goal Configuration Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Cấu Hình Lộ Trình & Lịch Học Google Calendar
              </h3>
              <button
                onClick={() => setShowOnboardingModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateAISchedule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Band hiện tại</label>
                  <select
                    value={currentBand}
                    onChange={(e) => setCurrentBand(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5].map((b) => (
                      <option key={b} value={b}>{b} Band</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Band mục tiêu</label>
                  <select
                    value={targetBand}
                    onChange={(e) => setTargetBand(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                      <option key={b} value={b}>{b} Band</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ngày dự kiến thi thật</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Giờ học / tuần</label>
                  <input
                    type="number"
                    min={4}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Khung giờ học ưu tiên hàng ngày</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredTimeSlot('MORNING')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      preferredTimeSlot === 'MORNING'
                        ? 'bg-[#C7F3C7] border-[#A5E0A5] text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🌅 Sáng (7h30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredTimeSlot('AFTERNOON')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      preferredTimeSlot === 'AFTERNOON'
                        ? 'bg-[#C7F3C7] border-[#A5E0A5] text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ☀️ Chiều (14h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredTimeSlot('EVENING')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      preferredTimeSlot === 'EVENING'
                        ? 'bg-[#C7F3C7] border-[#A5E0A5] text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🌙 Tối (19h30)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kỹ năng cần ưu tiên cải thiện</label>
                <div className="grid grid-cols-2 gap-2">
                  {['READING', 'LISTENING', 'WRITING', 'SPEAKING'].map((sk) => (
                    <button
                      type="button"
                      key={sk}
                      onClick={() => toggleFocusSkill(sk)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between ${
                        focusSkills.includes(sk)
                          ? 'bg-[#E8F8E8] border-[#A5E0A5] text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{sk}</span>
                      {focusSkills.includes(sk) && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingSchedule}
                  className="flex-1 bg-[#C7F3C7] hover:bg-[#b2ebb2] text-emerald-950 border border-[#A5E0A5] py-2.5 rounded-xl font-black transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  {isGeneratingSchedule ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-900" />
                      <span>AI Đang Thiết Kế Lộ Trình...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-emerald-900" />
                      <span>Sinh Lịch Học Cá Nhân Hóa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Sync Confirmation Dialog (Explicit Confirmation per Workspace skill rules) */}
      {showSyncConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-200 rounded-3xl max-w-md w-full p-6 text-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-emerald-900">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F8E8] border border-[#BDE8BD] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Xác Nhận Đồng Bộ Lịch Học</h3>
                <p className="text-xs text-slate-500">Google Calendar API</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                Bạn có chắc chắn muốn thêm <strong>{generatedSessions.length} buổi học IELTS AI</strong> vào lịch Google Calendar cá nhân?
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pt-1">
                <li>Tài khoản nhận lịch: <strong className="text-emerald-900">{calendarUser?.email}</strong></li>
                <li>Tự động cài thông báo (reminders) trước 15 phút & 30 phút</li>
                <li>Nội dung chi tiết từng buổi học & tài liệu hướng dẫn từ AI</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowSyncConfirmModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmSyncToCalendar}
                className="flex-1 bg-[#C7F3C7] hover:bg-[#b2ebb2] text-emerald-950 border border-[#A5E0A5] py-2.5 rounded-xl font-black transition cursor-pointer text-xs shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-900" />
                <span>Xác Nhận Thêm Lịch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
