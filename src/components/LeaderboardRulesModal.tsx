import React from 'react';
import { Award, Trophy, Medal, Crown, Sparkles, Zap, Flame, Gift, HelpCircle, CheckCircle2, X, ChevronRight, BookOpen, Edit3, Mic, AlertCircle, ArrowUpRight } from 'lucide-react';
import { LeaderboardConfig } from '../types';

interface LeaderboardRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LeaderboardConfig | null;
  onOpenRewards?: () => void;
}

export const LeaderboardRulesModal: React.FC<LeaderboardRulesModalProps> = ({
  isOpen,
  onClose,
  config,
  onOpenRewards
}) => {
  if (!isOpen) return null;

  const currentMonthLabel = config?.month_label || `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 text-slate-800 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Quy Tắc Tính Điểm & Cơ Chế Thưởng Bảng Xếp Hạng</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {currentMonthLabel} • Áp dụng dữ liệu luyện tập thực tế
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top 3 Rewards Highlight Box */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4.5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-600" />
              Cơ Chế Thưởng Xu Vinh Danh Top 3 Mỗi Tháng
            </h4>
            <span className="text-[10px] font-extrabold bg-amber-200/80 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
              Trao thưởng vào 23:59 ngày cuối tháng
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Top 1 */}
            <div className="bg-white/90 border-2 border-amber-400 rounded-xl p-3 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-400/20 rounded-bl-full flex items-start justify-end p-1">
                <Crown className="w-4 h-4 text-amber-600 fill-amber-400" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md mb-1.5">
                  <Crown className="w-3 h-3 text-amber-600" /> Quán Quân Top 1
                </div>
                <div className="text-xl font-black text-amber-600 flex items-center gap-1">
                  <span>+500</span> <span className="text-xs font-bold text-slate-600">Xu Thưởng</span>
                </div>
                <p className="text-[10px] font-bold text-slate-600 mt-1">
                  Huy Hiệu Vàng Golden Master + Voucher sách & khóa học 500K
                </p>
              </div>
            </div>

            {/* Top 2 */}
            <div className="bg-white/90 border-2 border-slate-300 rounded-xl p-3 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-12 h-12 bg-slate-300/30 rounded-bl-full flex items-start justify-end p-1">
                <Medal className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-md mb-1.5">
                  <Medal className="w-3 h-3 text-slate-600" /> Á Quân 1 (Top 2)
                </div>
                <div className="text-xl font-black text-slate-700 flex items-center gap-1">
                  <span>+300</span> <span className="text-xs font-bold text-slate-600">Xu Thưởng</span>
                </div>
                <p className="text-[10px] font-bold text-slate-600 mt-1">
                  Huy Hiệu Bạc Silver Pro + Voucher phòng thi ảo 300K
                </p>
              </div>
            </div>

            {/* Top 3 */}
            <div className="bg-white/90 border-2 border-orange-300 rounded-xl p-3 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-12 h-12 bg-orange-300/30 rounded-bl-full flex items-start justify-end p-1">
                <Trophy className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-950 text-[10px] font-black px-2 py-0.5 rounded-md mb-1.5">
                  <Trophy className="w-3 h-3 text-orange-600" /> Á Quân 2 (Top 3)
                </div>
                <div className="text-xl font-black text-orange-600 flex items-center gap-1">
                  <span>+200</span> <span className="text-xs font-bold text-slate-600">Xu Thưởng</span>
                </div>
                <p className="text-[10px] font-bold text-slate-600 mt-1">
                  Huy Hiệu Đồng Bronze Achiever + Voucher luyện AI 200K
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-amber-950/90 font-medium">
            💡 <em>Xu thưởng được tự động cộng trực tiếp vào Ví Xu của bạn và có thể dùng để đổi Voucher Cambridge, đề thi thử AI, hoặc khóa học cao cấp.</em>
          </p>
        </div>

        {/* Scoring Formula Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
            <Zap className="w-4 h-4 text-emerald-600" />
            Công Thức Tính Tổng Điểm Hàng Tháng
          </h4>
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 font-mono text-xs font-bold text-emerald-950 flex items-center justify-between">
            <span>Tổng Điểm = (Số Lần Luyện × 20) + (Band Điểm TB × 30) + Điểm Bonus</span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Tự động</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hệ thống tổng hợp minh bạch từ dữ liệu làm bài thi thật (Reading, Listening), nộp bài viết luận Writing chấm AI, ghi âm Speaking, sửa sổ lỗi sai và duy trì chuỗi Streak.
          </p>
        </div>

        {/* Detailed Scoring Rules Table */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Bảng Chi Tiết Tích Lũy Điểm Theo Hoạt Động
          </h4>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Hoạt Động Học Tập</th>
                  <th className="p-3">Điểm Cơ Bản</th>
                  <th className="p-3">Điểm Thưởng (Bonus)</th>
                  <th className="p-3 hidden sm:table-cell">Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {(config?.scoring_rules || [
                  {
                    activity: 'Luyện tập Reading / Listening',
                    base_points: '+20 điểm / bài',
                    bonus_points: '+5 đến +30 điểm (Band 5.0 - 9.0)',
                    note: 'Tính theo số câu đúng thực tế'
                  },
                  {
                    activity: 'Nộp bài Writing Task 1 & 2 (AI Chấm)',
                    base_points: '+25 điểm / bài',
                    bonus_points: '+10 đến +40 điểm theo Band AI',
                    note: 'Chấm 4 tiêu chí IELTS Task Response'
                  },
                  {
                    activity: 'Luyện Speaking (Ghi âm & Chấm AI)',
                    base_points: '+25 điểm / bài',
                    bonus_points: '+10 đến +40 điểm phát âm/trôi chảy',
                    note: 'Chấm Fluency & Pronunciation'
                  },
                  {
                    activity: 'Sổ Lỗi Sai & Từ Vựng Thông Minh',
                    base_points: '+10 điểm / đề',
                    bonus_points: '+5 điểm mỗi 5 từ mới lưu trữ',
                    note: 'Khắc phục triệt để lỗ hổng ngữ pháp'
                  },
                  {
                    activity: 'Duy trì Chuỗi Ngày Học (Streak)',
                    base_points: '+15 điểm / ngày',
                    bonus_points: '+50 điểm (7 ngày), +150 điểm (30 ngày)',
                    note: 'Cộng trực tiếp vào điểm đua top'
                  }
                ]).map((rule, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      {rule.activity}
                    </td>
                    <td className="p-3 font-bold text-emerald-800 whitespace-nowrap">{rule.base_points}</td>
                    <td className="p-3 font-bold text-amber-700 whitespace-nowrap">{rule.bonus_points}</td>
                    <td className="p-3 text-slate-500 text-[11px] hidden sm:table-cell">{rule.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Quy tắc được áp dụng công bằng và bảo mật toàn hệ thống
          </span>
          <div className="flex items-center gap-2">
            {onOpenRewards && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRewards();
                }}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>Xem Kho Quà Đổi Xu</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition cursor-pointer"
            >
              Đã Hiểu
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
