import React, { useState, useEffect } from 'react';
import { Target, Award, Calendar, Clock, BookOpen, Edit3, Mic, Brain, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw, Sparkles, ExternalLink, Check, Zap, AlertCircle, ShieldCheck, Crown, Trophy, Medal, Flame, Headphones, ChevronRight, Activity, X, Coins, HelpCircle, History, Gift, Info } from 'lucide-react';
import { UserProfile, UserStats, LeaderboardItem, LeaderboardConfig } from '../types';
import { initAuth, googleSignIn, getCurrentUser, logoutGoogle } from '../lib/firebaseAuth';
import { syncMultipleEventsToCalendar, StudySessionEvent } from '../lib/googleCalendar';
import { SkillDiagnosticModal, SkillDiagnosisData } from './SkillDiagnosticModal';
import { LeaderboardRulesModal } from './LeaderboardRulesModal';

interface DashboardViewProps {
  user?: any;
  stats: UserStats | null;
  profile: UserProfile | null;
  onNavigate: (tab: string) => void;
  onUpdateOnboarding: (data: any) => Promise<void>;
  onOpenCoinModal?: () => void;
  onOpenProfileModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  stats,
  profile,
  onNavigate,
  onUpdateOnboarding,
  onOpenCoinModal,
  onOpenProfileModal,
}) => {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [currentBand, setCurrentBand] = useState(profile?.current_band || 5.5);
  const [targetBand, setTargetBand] = useState(profile?.target_band || 7.0);
  const [targetDate, setTargetDate] = useState(profile?.target_exam_date || '2026-11-15');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weekly_hours || 12);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('EVENING');
  const [focusSkills, setFocusSkills] = useState<string[]>(['WRITING', 'SPEAKING']);

  // Target Band and Exam Date Quick Edit State
  const [isEditingTargetBand, setIsEditingTargetBand] = useState(false);
  const [isEditingTargetDate, setIsEditingTargetDate] = useState(false);
  const [tempBand, setTempBand] = useState<number>(profile?.target_band || 7.0);
  const [tempDate, setTempDate] = useState<string>(profile?.target_exam_date || '2026-11-15');
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalToast, setGoalToast] = useState<string | null>(null);

  // Synchronize state with profile changes
  useEffect(() => {
    if (profile?.target_band) {
      setTargetBand(profile.target_band);
      setTempBand(profile.target_band);
    }
    if (profile?.target_exam_date) {
      setTargetDate(profile.target_exam_date);
      setTempDate(profile.target_exam_date);
    }
    if (profile?.current_band) setCurrentBand(profile.current_band);
    if (profile?.weekly_hours) setWeeklyHours(profile.weekly_hours);
  }, [profile]);

  // Helpers for date formatting
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '15/11/2026';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  const toInputDateFormat = (dateStr?: string) => {
    if (!dateStr) return '2026-11-15';
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  const getInitials = (nameStr: string) => {
    const clean = (nameStr || '').replace(/\(Bạn\)/g, '').trim();
    const words = clean.split(/\s+/);
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase() || 'HV';
  };

  const currentUid = user?.id || profile?.user_id || 'u_student';

  const handleSaveQuickBand = async (newBand: number) => {
    // 1. Instant optimistic UI update
    setTargetBand(newBand);
    setIsEditingTargetBand(false);
    setGoalToast(`🎯 Đã lưu mục tiêu: Band ${newBand.toFixed(1)} thành công!`);
    setTimeout(() => setGoalToast(null), 3500);

    // 2. Fast background persist to database
    try {
      setIsSavingGoal(true);
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUid,
          target_band: newBand,
          current_band: currentBand,
          target_exam_date: targetDate,
          weekly_hours: weeklyHours
        })
      });

      // Update parent state smoothly without blocking
      onUpdateOnboarding({
        current_band: currentBand,
        target_band: newBand,
        target_exam_date: targetDate,
        weekly_hours: weeklyHours,
        preferred_timeslot: preferredTimeSlot,
        focus_skills: focusSkills,
        skip_ai_generation: true
      });
    } catch (err) {
      console.error('Notice saving target band:', err);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleSaveQuickDate = async (newDate: string) => {
    // 1. Instant optimistic UI update
    setTargetDate(newDate);
    setIsEditingTargetDate(false);
    setGoalToast(`📅 Đã lưu ngày thi: ${formatDisplayDate(newDate)} thành công!`);
    setTimeout(() => setGoalToast(null), 3500);

    // 2. Fast background persist to database
    try {
      setIsSavingGoal(true);
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUid,
          target_band: targetBand,
          current_band: currentBand,
          target_exam_date: newDate,
          weekly_hours: weeklyHours
        })
      });

      // Update parent state smoothly without blocking
      onUpdateOnboarding({
        current_band: currentBand,
        target_band: targetBand,
        target_exam_date: newDate,
        weekly_hours: weeklyHours,
        preferred_timeslot: preferredTimeSlot,
        focus_skills: focusSkills,
        skip_ai_generation: true
      });
    } catch (err) {
      console.error('Notice saving exam date:', err);
    } finally {
      setIsSavingGoal(false);
    }
  };

  // Skill Diagnostic Assessment State
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<SkillDiagnosisData | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [initialDiagnosticSkill, setInitialDiagnosticSkill] = useState<string>('ALL');

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

  // Default fallback leaderboard
  const DEFAULT_LEADERBOARD_DATA: LeaderboardItem[] = [
    { rank: 1, user_id: 'u_triet', full_name: 'Hoàng Minh Triết', avatar_initials: 'MT', practice_count: 42, avg_band: 8.5, total_score: 1095, is_current_user: false },
    { rank: 2, user_id: 'u_dung', full_name: 'Lê Quốc Dũng', avatar_initials: 'LD', practice_count: 36, avg_band: 8.5, total_score: 975, is_current_user: false },
    { rank: 3, user_id: 'u_yen', full_name: 'Trần Thị Hải Yến', avatar_initials: 'HY', practice_count: 31, avg_band: 8.0, total_score: 860, is_current_user: false },
    { rank: 4, user_id: currentUid, full_name: `${user?.full_name || 'Trần Quỳnh Anh'} (Bạn)`, avatar_initials: getInitials(user?.full_name || 'Trần Quỳnh Anh'), practice_count: 28, avg_band: 7.5, total_score: 785, is_current_user: true },
    { rank: 5, user_id: 'u_ha', full_name: 'Phạm Thu Hà', avatar_initials: 'TH', practice_count: 27, avg_band: 8.0, total_score: 780, is_current_user: false },
    { rank: 6, user_id: 'u_thu', full_name: 'Trần Hoài Thu', avatar_initials: 'TT', practice_count: 24, avg_band: 7.5, total_score: 705, is_current_user: false },
    { rank: 7, user_id: 'u_anh', full_name: 'Đỗ Đức Anh', avatar_initials: 'DA', practice_count: 21, avg_band: 7.5, total_score: 645, is_current_user: false },
    { rank: 8, user_id: 'u_mai', full_name: 'Vũ Quỳnh Mai', avatar_initials: 'QM', practice_count: 18, avg_band: 7.0, total_score: 570, is_current_user: false },
    { rank: 9, user_id: 'u_nam', full_name: 'Đặng Bảo Nam', avatar_initials: 'BN', practice_count: 15, avg_band: 7.0, total_score: 510, is_current_user: false },
    { rank: 10, user_id: 'u_hang', full_name: 'Bùi Thanh Hằng', avatar_initials: 'BH', practice_count: 13, avg_band: 6.5, total_score: 455, is_current_user: false },
  ];

  // Leaderboard State
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardItem[]>(DEFAULT_LEADERBOARD_DATA);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardItem | null>(DEFAULT_LEADERBOARD_DATA[3]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [leaderboardConfig, setLeaderboardConfig] = useState<LeaderboardConfig | null>(null);
  const [showLeaderboardRulesModal, setShowLeaderboardRulesModal] = useState<boolean>(false);

  // Fetch Leaderboard Config & Scoring Rules
  useEffect(() => {
    fetch('/api/leaderboard/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.scoring_rules) {
          setLeaderboardConfig(data);
        }
      })
      .catch(err => console.error("Error fetching leaderboard config", err));
  }, []);

  // Synchronize active user name immediately into existing leaderboard list
  useEffect(() => {
    if (user?.full_name) {
      const activeName = user.full_name;
      const initials = getInitials(activeName);
      setLeaderboardList(prev => prev.map(item => {
        if (item.is_current_user || item.user_id === currentUid) {
          return {
            ...item,
            full_name: `${activeName.replace(/\s*\(Bạn\)/g, '')} (Bạn)`,
            avatar_initials: initials,
            is_current_user: true
          };
        }
        return item;
      }));
      if (currentUserRank) {
        setCurrentUserRank(prev => prev ? {
          ...prev,
          full_name: `${activeName.replace(/\s*\(Bạn\)/g, '')} (Bạn)`,
          avatar_initials: initials
        } : null);
      }
    }
  }, [user?.full_name, currentUid]);

  // Fetch Leaderboard data from server
  useEffect(() => {
    const encodedName = encodeURIComponent(user?.full_name || 'Trần Quỳnh Anh');
    fetch(`/api/leaderboard?user_id=${currentUid}&user_name=${encodedName}`)
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard && data.leaderboard.length > 0) {
          const updated = data.leaderboard.map((item: LeaderboardItem) => {
            if (item.is_current_user || item.user_id === currentUid) {
              const activeName = user?.full_name || item.full_name;
              return {
                ...item,
                full_name: `${activeName.replace(/\s*\(Bạn\)/g, '')} (Bạn)`,
                avatar_initials: getInitials(activeName),
                is_current_user: true
              };
            }
            return item;
          });
          setLeaderboardList(updated);
        }
        if (data.user_rank) {
          const activeName = user?.full_name || data.user_rank.full_name;
          setCurrentUserRank({
            ...data.user_rank,
            full_name: `${activeName.replace(/\s*\(Bạn\)/g, '')} (Bạn)`,
            avatar_initials: getInitials(activeName)
          });
        }
      })
      .catch(err => console.error("Error fetching leaderboard", err));
  }, [currentUid, user?.full_name]);

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

  const createLocalFallbackSchedule = (
    cBand: number,
    tBand: number,
    tDate: string,
    wHours: number,
    pSlot: string,
    fSkills: string[]
  ) => {
    const baseDate = new Date(Date.now() + 86400000);
    const formatDate = (d: Date, startHour: number, startMin: number) => {
      const copy = new Date(d);
      copy.setHours(startHour, startMin, 0, 0);
      return copy.toISOString().replace(/\.\d{3}Z$/, '');
    };

    const slotHours = pSlot === 'MORNING' ? 7 : pSlot === 'AFTERNOON' ? 14 : 19;
    const slotMin = pSlot === 'MORNING' ? 30 : pSlot === 'AFTERNOON' ? 0 : 30;

    const d1 = new Date(baseDate);
    const d2 = new Date(baseDate.getTime() + 86400000 * 1);
    const d3 = new Date(baseDate.getTime() + 86400000 * 3);
    const d4 = new Date(baseDate.getTime() + 86400000 * 5);
    const d5 = new Date(baseDate.getTime() + 86400000 * 7);
    const d6 = new Date(baseDate.getTime() + 86400000 * 9);
    const d7 = new Date(baseDate.getTime() + 86400000 * 11);

    return {
      overview: `Lộ trình học IELTS đột phá cá nhân hóa từ Band ${cBand} lên Band ${tBand} (${wHours} giờ/tuần).`,
      weekly_focus_summary: `Tập trung chuyên sâu kỹ năng ${fSkills.join(' & ')} kết hợp luyện thi mô phỏng.`,
      sessions: [
        {
          summary: "📝 [IELTS AI] Writing Task 2: Mở bài & Thân bài Opinion Essay",
          skill: "WRITING",
          start_time: formatDate(d1, slotHours, slotMin),
          end_time: formatDate(d1, slotHours + 1, slotMin + 30),
          description: "🎯 Mục tiêu: Viết hoàn chỉnh 1 bài Writing Task 2.\n• Phân tích đề chủ đề Education/Technology.\n• Sử dụng AI Grader để chấm trực tiếp bài viết.\n• Sửa ít nhất 3 lỗi ngữ pháp thì động từ.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "🗣️ [IELTS AI] Speaking Part 2: Cue Card Travel & Unforgettable Experience",
          skill: "SPEAKING",
          start_time: formatDate(d2, slotHours, slotMin),
          end_time: formatDate(d2, slotHours + 1, slotMin + 30),
          description: "🎯 Mục tiêu: Nói trôi chảy 2 phút chủ đề Travel.\n• Luyện tập từ vựng Band 7.5+ (explore new horizons, unforgettable memories).\n• Ghi âm bài nói và nộp lên AI Speaking Grader.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "📖 [IELTS AI] Reading Passage 2: Skimming & True/False/Not Given",
          skill: "READING",
          start_time: formatDate(d3, slotHours, slotMin),
          end_time: formatDate(d3, slotHours + 1, slotMin + 30),
          description: "🎯 Mục tiêu: Giải 1 bài Reading Academic.\n• Áp dụng kỹ thuật Skimming & Scanning.\n• Lưu 5 từ vựng mới vào Sổ tay từ vựng.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "🎧 [IELTS AI] Listening Part 3: Multiple Choice & Synonyms",
          skill: "LISTENING",
          start_time: formatDate(d4, slotHours, slotMin),
          end_time: formatDate(d4, slotHours + 1, slotMin + 30),
          description: "🎯 Mục tiêu: Bắt từ đồng nghĩa trong đoạn hội thoại học thuật.\n• Luyện nghe và chép chính tả các cụm từ quan trọng.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "📝 [IELTS AI] Writing Task 1: Báo cáo Biểu đồ Cột (Bar Chart)",
          skill: "WRITING",
          start_time: formatDate(d5, slotHours, slotMin),
          end_time: formatDate(d5, slotHours + 1, slotMin + 30),
          description: "🎯 Mục tiêu: Viết Overview và 2 đoạn Detail chuẩn xác.\n• Sử dụng các cụm từ so sánh tăng giảm Band 7.5+.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "🗣️ [IELTS AI] Speaking Part 3: Discussion on Education & AI Impact",
          skill: "SPEAKING",
          start_time: formatDate(d6, slotHours, slotMin),
          end_time: formatDate(d6, slotHours + 1, slotMin + 30),
          description: "🎯 Mục tiêu: Phản xạ các câu hỏi thảo luận chuyên sâu.\n• Sử dụng các từ nối suy luận (consequently, furthermore).",
          reminders_minutes: [15, 30]
        },
        {
          summary: "⚡ [IELTS AI] Full Mock Test: Listening & Reading Speed Test",
          skill: "READING",
          start_time: formatDate(d7, slotHours, slotMin),
          end_time: formatDate(d7, slotHours + 1, slotMin + 30),
          description: "🎯 Mục tiêu: Thi thử dưới áp lực thời gian.\n• Xem kết quả phân tích điểm Band tự động từ hệ thống AI.",
          reminders_minutes: [15, 30]
        }
      ]
    };
  };

  const handleGenerateAISchedule = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGeneratingSchedule(true);
    setSyncSuccessMsg(null);

    let data: any = null;
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

      if (res.ok) {
        data = await res.json();
      }
    } catch (networkErr) {
      console.warn("Network notice during AI schedule fetch, generating local plan:", networkErr);
    }

    if (!data || !data.sessions || !data.sessions.length) {
      data = createLocalFallbackSchedule(
        currentBand,
        targetBand,
        targetDate,
        weeklyHours,
        preferredTimeSlot,
        focusSkills
      );
    }

    setGeneratedSessions(data.sessions || []);
    setScheduleOverview(data.overview || '');
    setSyncSuccessMsg(`Đã sinh lịch học AI 2 tuần (${(data.sessions || []).length} buổi) thành công!`);

    try {
      await onUpdateOnboarding({
        current_band: currentBand,
        target_band: targetBand,
        target_exam_date: targetDate,
        weekly_hours: weeklyHours,
        preferred_timeslot: preferredTimeSlot,
        focus_skills: focusSkills,
        fullSchedule: data
      });
    } catch (saveErr) {
      console.warn("Profile update notice:", saveErr);
    } finally {
      setIsGeneratingSchedule(false);
      setShowOnboardingModal(false);
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

  // AI Skill Diagnostic Handlers
  const fetchSkillDiagnosis = async () => {
    setIsLoadingDiagnosis(true);
    try {
      const res = await fetch('/api/user/skill-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          target_band: targetBand,
          current_band: currentBand
        })
      });
      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosticData(data.diagnosis);
      }
    } catch (err) {
      console.error('Error fetching skill diagnosis:', err);
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  const handleOpenSkillDiagnosis = async (skill: string = 'ALL') => {
    setInitialDiagnosticSkill(skill);
    setShowDiagnosticModal(true);
    if (!diagnosticData) {
      await fetchSkillDiagnosis();
    }
  };

  const skillBands = stats?.skill_bands || { reading: 0, listening: 0, writing: 0, speaking: 0 };
  const hasCompletedTests = Boolean(stats?.has_completed_tests && stats?.total_attempts && stats.total_attempts > 0);
  const predictedBand = stats?.predicted_overall_band || currentBand || 5.5;

  return (
    <div className="space-y-6">
      {/* Top Hero Banner: Light Emerald Theme with Soft Accents */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 md:p-7 text-slate-900 shadow-sm">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-100/50 rounded-full -mr-20 -mt-20 pointer-events-none blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-teal-100/50 rounded-full -mr-10 -mb-10 pointer-events-none blur-2xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Overall Prediction & Hero Banner */}
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{hasCompletedTests ? 'Dự Đoán Điểm IELTS AI' : 'Khởi Động Luyện Thi IELTS'}</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Chào {user?.full_name || 'Trần Quỳnh Anh'}, sẵn sàng cho bài Thi Thử IELTS?
              </h1>
              <p className="text-xs text-slate-600 mt-1.5 max-w-md leading-relaxed font-medium">
                {hasCompletedTests ? (
                  <>
                    Luyện tập trên giao diện chuẩn thi thật trên máy tính với AI phân tích kỹ năng & ước tính điểm <span className="font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">Band {predictedBand.toFixed(1)}</span> ({stats?.total_attempts} bài thi).
                  </>
                ) : (
                  <>
                    Luyện tập trên giao diện chuẩn thi thật trên máy tính để AI chẩn đoán kỹ năng & ước tính điểm Band chính xác (Khởi điểm: <span className="font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md">Band {currentBand.toFixed(1)}</span> • Mục tiêu: <span className="font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">Band {targetBand.toFixed(1)}</span>).
                  </>
                )}
              </p>
            </div>

            {/* Target Goal Summary & Interactive Edit */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 pt-1">
              {/* Target Band Chip / Inline Editor */}
              {isEditingTargetBand ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                  <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-emerald-900 text-xs">Mục tiêu:</span>
                  <select
                    value={tempBand}
                    onChange={(e) => setTempBand(parseFloat(e.target.value))}
                    className="bg-white text-xs font-bold text-emerald-900 border border-emerald-300 rounded-md px-2 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                    autoFocus
                  >
                    {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                      <option key={b} value={b}>Band {b.toFixed(1)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSaveQuickBand(tempBand)}
                    disabled={isSavingGoal}
                    className="w-5 h-5 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs transition cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Lưu mục tiêu"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsEditingTargetBand(false)}
                    disabled={isSavingGoal}
                    className="w-5 h-5 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs transition cursor-pointer"
                    title="Hủy"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempBand(targetBand);
                    setIsEditingTargetBand(true);
                  }}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition cursor-pointer group shadow-2xs text-left"
                  title="Nhấp để thay đổi mục tiêu Band"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition" />
                  <span>Mục tiêu: <strong className="text-emerald-800 font-bold">{targetBand} Band</strong></span>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition ml-0.5" />
                </button>
              )}

              {/* Target Exam Date Chip / Inline Editor */}
              {isEditingTargetDate ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-emerald-900 text-xs">Ngày thi:</span>
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="bg-white text-xs font-bold text-emerald-900 border border-emerald-300 rounded-md px-2 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveQuickDate(tempDate)}
                    disabled={isSavingGoal}
                    className="w-5 h-5 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs transition cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Lưu ngày thi"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsEditingTargetDate(false)}
                    disabled={isSavingGoal}
                    className="w-5 h-5 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs transition cursor-pointer"
                    title="Hủy"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempDate(toInputDateFormat(targetDate));
                    setIsEditingTargetDate(true);
                  }}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition cursor-pointer group shadow-2xs text-left"
                  title="Nhấp để thay đổi ngày thi"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition" />
                  <span>Ngày thi: <strong className="text-emerald-800 font-bold">{formatDisplayDate(targetDate)}</strong></span>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition ml-0.5" />
                </button>
              )}
            </div>

            {/* Dedicated Action Buttons Row: Tách riêng nút Nhận Xét AI và Vào Thi Thử */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              {/* Nút riêng biệt: Nhận Xét AI Năng Lực */}
              <button
                onClick={() => handleOpenSkillDiagnosis('ALL')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-2.5 shadow-sm border border-slate-700/80 hover:border-emerald-500/50 hover:shadow-emerald-950/20 group"
                title="Mở bảng nhận xét, chẩn đoán chi tiết điểm mạnh, điểm yếu & kế hoạch bứt phá 4 kỹ năng từ AI"
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-white">Nhận Xét AI Từng Kỹ Năng</span>
                </div>
                <span className="text-[10px] uppercase font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded-md ml-1">
                  AI Report
                </span>
              </button>

              {/* Nút Vào Thi Thử */}
              <button
                onClick={() => onNavigate('tests')}
                className="btn-glossy-emerald font-black px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Vào Thi Thử Ngay</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Right: Skill Breakdown Progress Cards */}
          <div className="space-y-2 sm:w-80 shrink-0">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">Điểm 4 Kỹ Năng</span>
              {!hasCompletedTests && (
                <span className="text-[10px] text-slate-400 font-medium italic">Làm bài để AI chấm điểm</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
            {/* Reading Card */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Reading
                </span>
                {hasCompletedTests && skillBands.reading > 0 ? (
                  <span className="text-emerald-700 font-black">{skillBands.reading.toFixed(1)}</span>
                ) : (
                  <span className="text-slate-400 font-semibold text-[11px] bg-slate-200/60 px-1.5 py-0.2 rounded-md">Chưa thi</span>
                )}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: hasCompletedTests && skillBands.reading > 0 ? `${(skillBands.reading / 9) * 100}%` : '0%' }} 
                />
              </div>
            </div>

            {/* Listening Card */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> Listening
                </span>
                {hasCompletedTests && skillBands.listening > 0 ? (
                  <span className="text-emerald-700 font-black">{skillBands.listening.toFixed(1)}</span>
                ) : (
                  <span className="text-slate-400 font-semibold text-[11px] bg-slate-200/60 px-1.5 py-0.2 rounded-md">Chưa thi</span>
                )}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: hasCompletedTests && skillBands.listening > 0 ? `${(skillBands.listening / 9) * 100}%` : '0%' }} 
                />
              </div>
            </div>

            {/* Writing Card */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span className="flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" /> Writing
                </span>
                {hasCompletedTests && skillBands.writing > 0 ? (
                  <span className="text-emerald-700 font-black">{skillBands.writing.toFixed(1)}</span>
                ) : (
                  <span className="text-slate-400 font-semibold text-[11px] bg-slate-200/60 px-1.5 py-0.2 rounded-md">Chưa thi</span>
                )}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: hasCompletedTests && skillBands.writing > 0 ? `${(skillBands.writing / 9) * 100}%` : '0%' }} 
                />
              </div>
            </div>

            {/* Speaking Card */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span className="flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-rose-600" /> Speaking
                </span>
                {hasCompletedTests && skillBands.speaking > 0 ? (
                  <span className="text-emerald-700 font-black">{skillBands.speaking.toFixed(1)}</span>
                ) : (
                  <span className="text-slate-400 font-semibold text-[11px] bg-slate-200/60 px-1.5 py-0.2 rounded-md">Chưa thi</span>
                )}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: hasCompletedTests && skillBands.speaking > 0 ? `${(skillBands.speaking / 9) * 100}%` : '0%' }} 
                />
              </div>
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
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
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
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="truncate max-w-[150px]">{calendarUser.email}</span>
                  </div>
                  <button
                    onClick={logoutGoogle}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
                    title="Đăng xuất khỏi Google"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  disabled={isConnectingCalendar}
                  className="btn-glossy-emerald px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  {isConnectingCalendar ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Đang kết nối Google...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Kết Nối Google Calendar</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Status or Alert if not connected */}
            {!calendarUser && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Chưa kết nối Google Calendar:</strong> Hãy kết nối để khi AI sinh lộ trình học phù hợp, các buổi học sẽ được tự động đồng bộ trực tiếp vào ứng dụng Google Calendar của bạn với thông báo nhắc giờ học!
                </p>
              </div>
            )}

            {syncSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs text-emerald-900 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncSuccessMsg}</span>
                </div>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-emerald-300 px-2.5 py-1 rounded-lg font-bold text-emerald-700 flex items-center gap-1 hover:bg-emerald-50 transition shadow-2xs"
                >
                  <span>Mở Google Calendar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* AI Study Plan Header & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h3 className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-emerald-600" />
                  Lộ Trình & Lịch Học Chi Tiết ({generatedSessions.length} buổi)
                </h3>
                {scheduleOverview && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{scheduleOverview}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="dashboard-custom-goal-btn"
                  onClick={() => {
                    if (onOpenProfileModal) {
                      onOpenProfileModal();
                    } else {
                      setShowOnboardingModal(true);
                    }
                  }}
                  className="btn-glossy-dark text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hồ Sơ & Lộ Trình Chi Tiết</span>
                </button>

                <button
                  onClick={handleStartCalendarSync}
                  disabled={isSyncingCalendar || !generatedSessions.length}
                  className="btn-glossy-emerald disabled:opacity-50 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSyncingCalendar ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Đồng bộ {syncProgress.current}/{syncProgress.total}...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-white" />
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
                    READING: 'bg-blue-50 text-blue-700 border-blue-200',
                    LISTENING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    WRITING: 'bg-amber-50 text-amber-700 border-amber-200',
                    SPEAKING: 'bg-rose-50 text-rose-700 border-rose-200',
                  };

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all ${
                        session.synced
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${skillColor[session.skill] || 'bg-slate-100 text-slate-700'}`}>
                              {session.skill}
                            </span>
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {startDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isToday && (
                              <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Hôm nay</span>
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
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Đã lên lịch
                              </span>
                              {session.html_link && (
                                <a
                                  href={session.html_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-emerald-700 hover:text-emerald-800 underline font-bold flex items-center gap-0.5"
                                  title="Xem trên Google Calendar"
                                >
                                  <span>Xem</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
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
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
                <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Chưa có lịch học AI cá nhân hóa</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    Nhấp vào nút dưới đây để AI thiết kế cho bạn lộ trình học IELTS cụ thể từng ngày và đẩy vào Google Calendar.
                  </p>
                </div>
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="btn-glossy-emerald px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Brain className="w-4 h-4 text-white" />
                  <span>Sinh Lộ Trình Lịch Học AI</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Frequent Errors, Coin Wallet & Leaderboard */}
        <div className="space-y-6">
          {/* Coin & Reward Hub Card */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-sm pointer-events-none" />
            <div className="flex items-center justify-between border-b border-emerald-500/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-xs">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                    Cửa Hàng Đổi Quà & Ví Xu
                  </h3>
                  <span className="text-[10px] text-emerald-200">Đổi discount khóa học & voucher mua sách</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full border border-amber-300 shadow-2xs">
                🎁 Cửa Hàng Quà
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
                <span className="text-[11px] font-semibold text-emerald-200 block">Số Xu Đổi Quà</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white">{stats?.credits !== undefined ? stats.credits : 25}</span>
                  <span className="text-xs font-bold text-amber-300">Xu</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
                <span className="text-[11px] font-semibold text-emerald-200 block">Chuỗi Học Thực Tế</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white">{stats?.streak_days !== undefined ? stats.streak_days : 0}</span>
                  <span className="text-xs font-bold text-amber-300">Ngày</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-emerald-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="text-[11px] text-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Giảm 35-50% khóa học & Voucher Fahasa, Tiki...</span>
              </div>
              <button
                type="button"
                onClick={onOpenCoinModal}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <span>🎁 Đổi Quà & Xem Xu</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-950" />
              </button>
            </div>
          </div>

          {/* Frequent Errors Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Lỗi Hay Mắc Phải
              </h3>
              <button
                onClick={() => onNavigate('errors')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            {stats?.frequent_errors && stats.frequent_errors.length > 0 ? (
              <div className="space-y-2">
                {stats.frequent_errors.slice(0, 3).map((err, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-xl">
                    <span className="text-xs font-semibold text-slate-800">{err.name}</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                      {err.count} lần
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-xs space-y-1.5">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                <p className="font-medium text-slate-800">Chưa ghi nhận lỗi lặp lại.</p>
                <p className="text-[10px] text-slate-500">Các lỗi sai khi chấm bài sẽ được tự động gom vào đây.</p>
              </div>
            )}

            <button
              onClick={() => onNavigate('errors')}
              className="w-full mt-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-2 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
            >
              Ôn Lại Các Lỗi Sai Này
            </button>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-500" />
                  Bảng Xếp Hạng Top 10
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Thống kê dữ liệu thật • Thưởng Top 3 tới <strong>500 Xu</strong>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowLeaderboardRulesModal(true)}
                  className="text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                  title="Xem quy tắc tính điểm & cơ chế thưởng Xu"
                >
                  <HelpCircle className="w-3 h-3 text-amber-600" />
                  <span>Quy tắc tính điểm</span>
                </button>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                  {leaderboardConfig?.month_label || 'Tháng này'}
                </span>
              </div>
            </div>

            {/* Top 3 Reward Highlight Bar */}
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50/60 to-orange-50 border border-amber-200/90 rounded-2xl p-2.5 flex items-center justify-between text-[11px] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/30 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                </span>
                <div>
                  <span className="font-extrabold text-amber-950 block leading-tight">Thưởng Xu Top 3 Cuối Tháng:</span>
                  <span className="text-[10px] text-amber-800 font-semibold">Top 1: <strong>+500 Xu</strong> • Top 2: <strong>+300 Xu</strong> • Top 3: <strong>+200 Xu</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaderboardRulesModal(true)}
                className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
              >
                Chi tiết
              </button>
            </div>

            {isLoadingLeaderboard ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span>Đang tải bảng xếp hạng...</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {leaderboardList.map((item) => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;

                  if (isTop1) {
                    return (
                      <div
                        key={item.user_id}
                        className="bg-gradient-to-r from-amber-500/15 via-yellow-100/70 to-amber-50 border-2 border-amber-400/90 shadow-sm rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative overflow-hidden"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 ring-2 ring-amber-300">
                            1
                          </div>
                          <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {item.avatar_initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-400 shrink-0" />
                              <span className="text-xs font-extrabold text-slate-900 truncate">
                                {item.full_name}
                              </span>
                              {item.is_current_user && (
                                <span className="text-[9px] font-bold bg-amber-300 text-amber-950 px-1.5 py-0.2 rounded shrink-0">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <p className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500 fill-orange-400" />
                                <span>{item.practice_count} lần luyện tập</span>
                              </p>
                              <span className="text-[9px] font-extrabold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded-md border border-amber-300">
                                🎁 +500 Xu Thưởng
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-amber-100/90 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-xl text-left sm:text-right shrink-0 self-start sm:self-center flex sm:flex-col justify-between items-center sm:items-end gap-2 sm:gap-0">
                          <span className="text-xs font-black text-amber-900 leading-tight">
                            {item.avg_band} Band
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-700">
                            {item.total_score} điểm
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (isTop2) {
                    return (
                      <div
                        key={item.user_id}
                        className="bg-gradient-to-r from-slate-200/80 via-slate-100/70 to-slate-50 border-2 border-slate-300/90 shadow-sm rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 ring-2 ring-slate-300">
                            2
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-slate-400 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                            {item.avatar_initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Medal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {item.full_name}
                              </span>
                              {item.is_current_user && (
                                <span className="text-[9px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded shrink-0">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-slate-500" />
                                <span>{item.practice_count} lần luyện tập</span>
                              </p>
                              <span className="text-[9px] font-extrabold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded-md border border-slate-300">
                                🎁 +300 Xu Thưởng
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-200/90 border border-slate-300 text-slate-900 px-3 py-1.5 rounded-xl text-left sm:text-right shrink-0 self-start sm:self-center flex sm:flex-col justify-between items-center sm:items-end gap-2 sm:gap-0">
                          <span className="text-xs font-black text-slate-800 leading-tight">
                            {item.avg_band} Band
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-600">
                            {item.total_score} điểm
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (isTop3) {
                    return (
                      <div
                        key={item.user_id}
                        className="bg-gradient-to-r from-orange-500/10 via-amber-100/50 to-orange-50/60 border-2 border-orange-300/90 shadow-sm rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-400 to-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 ring-2 ring-orange-200">
                            3
                          </div>
                          <div className="w-8 h-8 rounded-full bg-orange-200 border-2 border-orange-300 text-orange-950 font-black text-xs flex items-center justify-center shrink-0">
                            {item.avatar_initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Trophy className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {item.full_name}
                              </span>
                              {item.is_current_user && (
                                <span className="text-[9px] font-bold bg-orange-300 text-orange-950 px-1.5 py-0.2 rounded shrink-0">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <p className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-orange-500" />
                                <span>{item.practice_count} lần luyện tập</span>
                              </p>
                              <span className="text-[9px] font-extrabold text-orange-950 bg-orange-200/90 px-1.5 py-0.5 rounded-md border border-orange-300">
                                🎁 +200 Xu Thưởng
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-100/90 border border-orange-300 text-orange-950 px-3 py-1.5 rounded-xl text-left sm:text-right shrink-0 self-start sm:self-center flex sm:flex-col justify-between items-center sm:items-end gap-2 sm:gap-0">
                          <span className="text-xs font-black text-orange-900 leading-tight">
                            {item.avg_band} Band
                          </span>
                          <span className="text-[10px] font-extrabold text-orange-700">
                            {item.total_score} điểm
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Rank 4 to 10
                  return (
                    <div
                      key={item.user_id}
                      className={`p-2.5 rounded-xl border transition flex items-center gap-2.5 ${
                        item.is_current_user
                          ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400/50'
                          : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <span className="text-xs font-black text-slate-400 w-5 text-center shrink-0">
                        {item.rank}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-slate-200 font-bold text-[10px] text-slate-700 flex items-center justify-center shrink-0">
                        {item.avatar_initials}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {item.full_name}
                        </span>
                        {item.is_current_user && (
                          <span className="text-[9px] font-extrabold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded shrink-0">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.avg_band} Band
                        </span>
                        <span className="block text-[9px] font-bold text-slate-500 mt-0.5">
                          {item.practice_count} lần ({item.total_score} đ)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding & Goal Configuration Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🌅 Sáng (7h30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredTimeSlot('AFTERNOON')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      preferredTimeSlot === 'AFTERNOON'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ☀️ Chiều (14h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredTimeSlot('EVENING')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      preferredTimeSlot === 'EVENING'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{sk}</span>
                      {focusSkills.includes(sk) && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingSchedule}
                  className="flex-1 btn-glossy-emerald py-2.5 rounded-xl font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isGeneratingSchedule ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>AI Đang Thiết Kế Lộ Trình...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-white" />
                      <span>Sinh Lịch Học Cá Nhân Hóa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Sync Confirmation Dialog */}
      {showSyncConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-emerald-600" />
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
                <li>Tài khoản nhận lịch: <strong className="text-emerald-700">{calendarUser?.email}</strong></li>
                <li>Tự động cài thông báo (reminders) trước 15 phút & 30 phút</li>
                <li>Nội dung chi tiết từng buổi học & tài liệu hướng dẫn từ AI</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowSyncConfirmModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-2.5 rounded-xl font-bold cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmSyncToCalendar}
                className="flex-1 btn-glossy-emerald py-2.5 rounded-xl font-extrabold transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Xác Nhận Thêm Lịch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Skill Diagnostic Assessment Modal */}
      <SkillDiagnosticModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        diagnosisData={diagnosticData}
        isLoading={isLoadingDiagnosis}
        onRefresh={fetchSkillDiagnosis}
        onNavigate={onNavigate}
        initialSkillFilter={initialDiagnosticSkill}
      />

      {/* Leaderboard Rules & Top 3 Rewards Modal */}
      <LeaderboardRulesModal
        isOpen={showLeaderboardRulesModal}
        onClose={() => setShowLeaderboardRulesModal(false)}
        config={leaderboardConfig}
        onOpenRewards={onOpenCoinModal}
      />
    </div>
  );
};
