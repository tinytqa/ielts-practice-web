import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen, 
  Headphones, 
  Edit3, 
  Mic, 
  RefreshCw, 
  ShieldCheck, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

export interface SkillDiagnosisItem {
  skill: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
  skill_name_vi: string;
  current_band: number;
  target_band: number;
  gap_text: string;
  status_level: string;
  status_color: 'emerald' | 'blue' | 'amber' | 'rose';
  diagnosis_summary: string;
  strengths: string[];
  weaknesses: string[];
  frequent_pitfalls: string[];
  action_plan: string[];
  recommended_practice: string;
}

export interface SkillDiagnosisData {
  overall_verdict: string;
  overall_analysis: string;
  overall_readiness_percentage: number;
  estimated_weeks_to_target: number;
  strategic_priorities: string[];
  skills_diagnosis: SkillDiagnosisItem[];
}

interface SkillDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosisData: SkillDiagnosisData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onNavigate: (tab: string) => void;
  initialSkillFilter?: string;
}

export const SkillDiagnosticModal: React.FC<SkillDiagnosticModalProps> = ({
  isOpen,
  onClose,
  diagnosisData,
  isLoading,
  onRefresh,
  onNavigate,
  initialSkillFilter = 'ALL'
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(initialSkillFilter);

  if (!isOpen) return null;

  const skillIcons: Record<string, any> = {
    READING: BookOpen,
    LISTENING: Headphones,
    WRITING: Edit3,
    SPEAKING: Mic
  };

  const skillTheme: Record<string, { bg: string; border: string; text: string; badge: string; iconBg: string }> = {
    READING: {
      bg: 'bg-blue-50/40',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      iconBg: 'bg-blue-100 text-blue-700'
    },
    LISTENING: {
      bg: 'bg-emerald-50/40',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700'
    },
    WRITING: {
      bg: 'bg-amber-50/40',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      iconBg: 'bg-amber-100 text-amber-700'
    },
    SPEAKING: {
      bg: 'bg-rose-50/40',
      border: 'border-rose-200',
      text: 'text-rose-900',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      iconBg: 'bg-rose-100 text-rose-700'
    }
  };

  const statusBadgeStyle = (statusColor: string) => {
    switch (statusColor) {
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'rose':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const filteredSkills = diagnosisData?.skills_diagnosis.filter(item => {
    if (activeFilter === 'ALL') return true;
    return item.skill === activeFilter;
  }) || [];

  const handleActionClick = (skill: string) => {
    onClose();
    if (skill === 'WRITING') onNavigate('writing');
    else if (skill === 'SPEAKING') onNavigate('speaking');
    else onNavigate('tests');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white relative flex items-start justify-between shrink-0">
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Examiner Comprehensive Diagnosis</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Nhận Xét & Đánh Giá Năng Lực Theo Từng Kỹ Năng
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Báo cáo chẩn đoán trạng thái thực tế 4 kỹ năng IELTS (Reading, Listening, Writing, Speaking), phát hiện điểm nghẽn & đề xuất kế hoạch bứt phá Band mục tiêu.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto animate-bounce shadow-sm">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Giám Khảo AI Đang Phân Tích Dữ Liệu...</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Đang tổng hợp điểm số các lần thi thử, lỗi sai từ Sổ tay và đối chiếu ma trận tiêu chí chấm thi IELTS Band Descriptors...
                </p>
              </div>
            </div>
          ) : !diagnosisData ? (
            <div className="py-12 text-center space-y-3 bg-white p-6 rounded-2xl border border-slate-200">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Chưa tải được dữ liệu nhận xét</p>
              <button
                onClick={onRefresh}
                className="btn-glossy-emerald px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tải Lại Nhận Xét AI</span>
              </button>
            </div>
          ) : (
            <>
              {/* Overall Readiness Hero Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Đánh Giá Tổng Quan Từ Giám Khảo AI
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {diagnosisData.overall_analysis}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 bg-emerald-50/70 border border-emerald-200 px-4 py-2.5 rounded-2xl">
                    <div className="text-center">
                      <span className="block text-[10px] uppercase font-extrabold text-emerald-700">Mức Độ Sẵn Sàng</span>
                      <span className="text-xl font-black text-emerald-900 leading-none">
                        {diagnosisData.overall_readiness_percentage}%
                      </span>
                    </div>
                    <div className="h-8 w-px bg-emerald-200" />
                    <div className="text-center">
                      <span className="block text-[10px] uppercase font-extrabold text-emerald-700">Thời Gian Dự Kiến</span>
                      <span className="text-xs font-black text-emerald-900 leading-none flex items-center justify-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        ~{diagnosisData.estimated_weeks_to_target} tuần
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strategic Priorities */}
                {diagnosisData.strategic_priorities && diagnosisData.strategic_priorities.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
                      3 Ưu Tiên Chiến Lược Cần Tập Trung:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {diagnosisData.strategic_priorities.map((pri, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-slate-800">
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{pri}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skill Tabs Filter */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Tất Cả 4 Kỹ Năng</span>
                </button>

                {(['READING', 'LISTENING', 'WRITING', 'SPEAKING'] as const).map(sk => {
                  const Icon = skillIcons[sk];
                  const active = activeFilter === sk;
                  const label = sk === 'READING' ? 'Reading' : sk === 'LISTENING' ? 'Listening' : sk === 'WRITING' ? 'Writing' : 'Speaking';
                  return (
                    <button
                      key={sk}
                      onClick={() => setActiveFilter(sk)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Skills Detailed Grid */}
              <div className="space-y-5">
                {filteredSkills.map((item) => {
                  const Icon = skillIcons[item.skill] || BookOpen;
                  const theme = skillTheme[item.skill] || skillTheme.READING;

                  return (
                    <div
                      key={item.skill}
                      className={`rounded-2xl border ${theme.border} ${theme.bg} p-5 space-y-4 transition shadow-2xs hover:shadow-xs`}
                    >
                      {/* Top Skill Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                              {item.skill_name_vi}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                              <span>Hiện tại: <strong className="text-slate-900 font-bold">{item.current_band.toFixed(1)}</strong></span>
                              <span>•</span>
                              <span>Mục tiêu: <strong className="text-emerald-700 font-bold">{item.target_band.toFixed(1)}</strong></span>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">{item.gap_text}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-xl text-xs font-black border ${statusBadgeStyle(item.status_color)} shadow-2xs`}>
                            {item.status_level}
                          </span>
                        </div>
                      </div>

                      {/* AI Diagnosis Summary Paragraph */}
                      <div className="bg-white/90 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed space-y-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-800">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Nhận Xét Tình Trạng Hiện Tại:
                        </span>
                        <p>{item.diagnosis_summary}</p>
                      </div>

                      {/* Strengths & Weaknesses 2-Column Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Strengths */}
                        <div className="bg-white/80 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
                          <h5 className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Điểm Mạnh Nổi Bật ({item.strengths.length})
                          </h5>
                          <ul className="space-y-1.5">
                            {item.strengths.map((str, sIdx) => (
                              <li key={sIdx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-snug">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses / Obstacles */}
                        <div className="bg-white/80 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                          <h5 className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Điểm Nghẽn Cần Khắc Phục ({item.weaknesses.length})
                          </h5>
                          <ul className="space-y-1.5">
                            {item.weaknesses.map((w, wIdx) => (
                              <li key={wIdx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-snug">
                                <span className="text-amber-500 font-bold mt-0.5">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Frequent Pitfalls */}
                      {item.frequent_pitfalls && item.frequent_pitfalls.length > 0 && (
                        <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-950 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Bẫy Đề Thi & Lỗi Dễ Vấp Phải:</span>
                            <span className="text-rose-900 leading-snug">
                              {item.frequent_pitfalls.join(' — ')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Plan & Recommended Practice */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-emerald-600" />
                            Kế Hoạch Bứt Phá:
                          </span>
                          <p className="text-xs text-slate-700 font-medium">
                            {item.action_plan.join('. ')}
                          </p>
                          <div className="text-[11px] text-slate-500 mt-1">
                            <strong className="text-slate-700">Đề xuất:</strong> {item.recommended_practice}
                          </div>
                        </div>

                        <button
                          onClick={() => handleActionClick(item.skill)}
                          className="btn-glossy-emerald text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
                        >
                          <span>Luyện Tập Ngay</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-glossy-dark text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Yêu Cầu AI Phân Tích Lại</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            Đóng Báo Cáo
          </button>
        </div>
      </div>
    </div>
  );
};
