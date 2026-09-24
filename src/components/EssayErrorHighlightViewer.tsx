import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Maximize2,
  Filter,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';
import { AIGradingResult, ErrorInstance, SentenceUpgrade, ImprovedBand8Essay } from '../types';

interface EssayErrorHighlightViewerProps {
  essayText: string;
  result: AIGradingResult;
  taskTitle: string;
  taskLabel: string;
}

export function categorizeError(code: string = ''): {
  type: 'GRAMMAR' | 'SPELLING_PUNCT' | 'VOCAB';
  label: string;
  badgeBg: string;
  badgeText: string;
  markClass: string;
  markSelectedClass: string;
} {
  const c = (code || '').toLowerCase();
  if (
    c.includes('grammar') ||
    c.includes('agreement') ||
    c.includes('tense') ||
    c.includes('verb') ||
    c.includes('clause') ||
    c.includes('passive') ||
    c.includes('preposition') ||
    c.includes('modal') ||
    c.includes('article') ||
    c.includes('conditional') ||
    c.includes('word_form') ||
    c.includes('comparative')
  ) {
    let specificLabel = 'Ngữ pháp & Cấu trúc';
    if (c.includes('agreement')) specificLabel = 'Hòa hợp Chủ - Vị';
    else if (c.includes('tense') || c.includes('irregular')) specificLabel = 'Thì & Dạng động từ';
    else if (c.includes('verb_form') || c.includes('gerund')) specificLabel = 'Dạng động từ (V-ing / to-V)';
    else if (c.includes('clause') || c.includes('conjunction')) specificLabel = 'Mệnh đề & Liên từ nối';
    else if (c.includes('passive')) specificLabel = 'Thể bị động / Nội động từ';
    else if (c.includes('preposition')) specificLabel = 'Giới từ';
    else if (c.includes('article') || c.includes('noun')) specificLabel = 'Mạo từ & Danh từ';
    else if (c.includes('word_form')) specificLabel = 'Từ loại (Word Form)';
    else if (c.includes('conditional')) specificLabel = 'Câu điều kiện';
    else if (c.includes('modal')) specificLabel = 'Động từ khuyết thiếu';

    return {
      type: 'GRAMMAR',
      label: `[NGỮ PHÁP] ${specificLabel}`,
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800 border-rose-300',
      markClass: 'bg-rose-100 text-rose-900 border-b-2 border-rose-500 hover:bg-rose-200',
      markSelectedClass: 'bg-rose-600 text-white ring-2 ring-rose-600/50 shadow-sm'
    };
  }

  if (c.includes('spelling') || c.includes('typo') || c.includes('punct') || c.includes('comma') || c.includes('capital') || c.includes('contraction')) {
    let specificLabel = 'Chính tả & Dấu câu';
    if (c.includes('spelling') || c.includes('typo')) specificLabel = 'Chính tả';
    else if (c.includes('comma') || c.includes('punct')) specificLabel = 'Dấu câu & Dấu phẩy';
    else if (c.includes('capital')) specificLabel = 'Viết hoa';
    else if (c.includes('contraction')) specificLabel = 'Viết tắt học thuật';

    return {
      type: 'SPELLING_PUNCT',
      label: `[CHÍNH TẢ / DẤU CÂU] ${specificLabel}`,
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800 border-amber-300',
      markClass: 'bg-amber-100 text-amber-900 border-b-2 border-amber-500 hover:bg-amber-200',
      markSelectedClass: 'bg-amber-600 text-white ring-2 ring-amber-600/50 shadow-sm'
    };
  }

  return {
    type: 'VOCAB',
    label: '[TỪ VỰNG] Collocation & Diễn đạt',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800 border-blue-300',
    markClass: 'bg-blue-100 text-blue-900 border-b-2 border-blue-500 hover:bg-blue-200',
    markSelectedClass: 'bg-blue-600 text-white ring-2 ring-blue-600/50 shadow-sm'
  };
}

export const EssayErrorHighlightViewer: React.FC<EssayErrorHighlightViewerProps> = ({
  essayText,
  result,
  taskTitle,
  taskLabel
}) => {
  const [activeTab, setActiveTab] = useState<'HIGHLIGHT' | 'UPGRADES' | 'BAND8_ESSAY'>('HIGHLIGHT');
  const [selectedError, setSelectedError] = useState<ErrorInstance | null>(null);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'GRAMMAR' | 'SPELLING_PUNCT' | 'VOCAB'>('ALL');
  const [expandedUpgradeIdx, setExpandedUpgradeIdx] = useState<number | null>(0);
  const [expandedParagraphIdx, setExpandedParagraphIdx] = useState<number | null>(0);

  const errors = result.errors || [];
  const upgrades = result.sentence_upgrades || [];
  const band8Essay = result.improved_band8_essay;

  const userBand = typeof result.overall_band === 'number' ? result.overall_band : (result.estimated_band ?? 6.5);
  const isHighBand = userBand >= 8.0;
  const targetBandLabel = isHighBand ? 'Band 9.0' : 'Band 8.0 - 9.0';
  const rewriteTabLabel = isHighBand ? 'Bản Viết Lại Band 9.0' : 'Bản Viết Lại Band 8.0 - 9.0';

  // Counts by category
  const grammarCount = useMemo(() => errors.filter(e => categorizeError(e.error_tag_code).type === 'GRAMMAR').length, [errors]);
  const spellingPunctCount = useMemo(() => errors.filter(e => categorizeError(e.error_tag_code).type === 'SPELLING_PUNCT').length, [errors]);
  const vocabCount = useMemo(() => errors.filter(e => categorizeError(e.error_tag_code).type === 'VOCAB').length, [errors]);

  const filteredErrors = useMemo(() => {
    if (filterCategory === 'ALL') return errors;
    return errors.filter(e => categorizeError(e.error_tag_code).type === filterCategory);
  }, [errors, filterCategory]);

  // Helper to render text with highlighted error snippets
  const renderHighlightedEssay = () => {
    if (!essayText) return null;
    if (!errors.length) {
      return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-line">
          {essayText}
        </div>
      );
    }

    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
        {renderHighlightedSegments(essayText, errors, (err) => setSelectedError(err), selectedError, filterCategory)}
      </div>
    );
  };

  return (
    <div className="bg-white border-2 border-emerald-400/80 rounded-3xl p-5 shadow-lg space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Chi Tiết Sửa Lỗi Ngữ Pháp & Nâng Cấp {targetBandLabel}
            </span>
            <span className="text-xs text-slate-500 font-bold">{taskLabel}</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-1">
            Chữa Lỗi Ngữ Pháp & Nâng Cấp Câu Chuẩn Giám Khảo IELTS
          </h3>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('HIGHLIGHT')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-bold flex items-center gap-1.5 ${
              activeTab === 'HIGHLIGHT'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Chữa Lỗi Chi Tiết ({errors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('UPGRADES')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-bold flex items-center gap-1.5 ${
              activeTab === 'UPGRADES'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Nâng Cấp Cấu Trúc Câu ({upgrades.length || '3-5'})</span>
          </button>

          {band8Essay && (
            <button
              onClick={() => setActiveTab('BAND8_ESSAY')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-bold flex items-center gap-1.5 ${
                activeTab === 'BAND8_ESSAY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{rewriteTabLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: HIGHLIGHT TRỰC TIẾP TRÊN BÀI VIẾT CỦA HỌC VIÊN */}
      {activeTab === 'HIGHLIGHT' && (
        <div className="space-y-4">
          {/* Error Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-1 text-xs text-slate-600 font-bold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Lọc theo nhóm lỗi:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => { setFilterCategory('ALL'); setSelectedError(null); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterCategory === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Tất cả ({errors.length})</span>
              </button>

              <button
                onClick={() => { setFilterCategory('GRAMMAR'); setSelectedError(null); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterCategory === 'GRAMMAR'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Ngữ Pháp & Cấu Trúc ({grammarCount})</span>
              </button>

              <button
                onClick={() => { setFilterCategory('SPELLING_PUNCT'); setSelectedError(null); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterCategory === 'SPELLING_PUNCT'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>Chính Tả & Dấu Câu ({spellingPunctCount})</span>
              </button>

              <button
                onClick={() => { setFilterCategory('VOCAB'); setSelectedError(null); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterCategory === 'VOCAB'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span>Từ Vựng & Collocation ({vocabCount})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Highlighted text container */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Bài viết học viên (Đã đánh dấu lỗi sai):
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Bấm vào từ được highlight để xem giải thích</span>
              </div>
              {renderHighlightedEssay()}
            </div>

            {/* Right: Error Inspection Cards */}
            <div className="lg:col-span-5 space-y-2.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>
                  {filterCategory === 'GRAMMAR' ? 'Chi Tiết Lỗi Ngữ Pháp & Quy Tắc:' : 'Chi Tiết Lỗi & Quy Tắc Học Thuật:'}
                </span>
                {selectedError && (
                  <button
                    onClick={() => setSelectedError(null)}
                    className="text-emerald-600 hover:underline text-[10px] cursor-pointer"
                  >
                    Xem tất cả ({filteredErrors.length})
                  </button>
                )}
              </label>

              {filteredErrors.length === 0 ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <strong className="block font-bold">
                    {filterCategory === 'GRAMMAR' 
                      ? 'Không phát hiện lỗi ngữ pháp hay cấu trúc câu!' 
                      : 'Không phát hiện lỗi nào trong danh mục này!'}
                  </strong>
                  <p className="text-emerald-800/80 text-[11px]">Độ chính xác ngữ pháp và diễn đạt được kiểm soát rất tốt.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {(selectedError ? [selectedError] : filteredErrors).map((err, idx) => {
                    const isSelected = selectedError?.original_text === err.original_text;
                    const catInfo = categorizeError(err.error_tag_code);
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedError(err)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs space-y-2 ${
                          isSelected
                            ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/40 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${catInfo.badgeBg} ${catInfo.badgeText}`}>
                            {catInfo.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Lỗi #{idx + 1}</span>
                        </div>

                        {/* Error Text vs Correct Text */}
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="text-rose-700 line-through font-medium flex items-start gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-rose-500 shrink-0 mt-0.5">Sai:</span>
                            <span>"{err.original_text}"</span>
                          </div>
                          <div className="text-emerald-700 font-bold flex items-start gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-emerald-600 shrink-0 mt-0.5">Sửa đúng:</span>
                            <span>"{err.corrected_text}"</span>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="text-slate-600 text-[11px] leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                          <strong className="text-slate-900 block flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                            Quy tắc ngữ pháp & Giải thích chi tiết:
                          </strong>
                          <p className="text-slate-700 leading-relaxed font-sans">{err.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NÂNG CẤP TỪNG CÂU LÊN BAND 8.0+ (CHỈ RÕ THAY ĐỔI & TẠI SAO THAY ĐỔI) */}
      {activeTab === 'UPGRADES' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
            <strong className="font-black flex items-center gap-1.5 text-amber-900">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Chiến lược nâng cấp câu lên {targetBandLabel}+ (Grammatical Range & Precision):
            </strong>
            <p className="leading-relaxed">
              Dưới đây là các câu tiêu biểu trích từ bài viết của bạn. Giám khảo AI phân tích chi tiết từng cụm từ được thay đổi kèm lý do học thuật (Đa dạng cấu trúc ngữ pháp GRA: Mệnh đề phân từ, Đảo ngữ, Thể bị động học thuật, Collocations C1/C2) để bài viết bứt phá điểm số.
            </p>
          </div>

          {upgrades.length === 0 ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
              Chưa có phân tích nâng cấp câu riêng biệt cho bài viết này. Hãy tham khảo tab {rewriteTabLabel}.
            </div>
          ) : (
            <div className="space-y-3">
              {upgrades.map((upg, idx) => {
                const isExpanded = expandedUpgradeIdx === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 transition space-y-3 shadow-2xs"
                  >
                    {/* Header bar */}
                    <div
                      onClick={() => setExpandedUpgradeIdx(isExpanded ? null : idx)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-xs text-slate-800">
                          Nâng cấp câu #{idx + 1} ➔ Band {upg.target_band || (isHighBand ? 9.0 : 8.5)}
                        </span>
                      </div>
                      <button className="text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Sentence Comparison Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Original */}
                      <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-1">
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                          Câu gốc của bạn:
                        </span>
                        <p className="text-slate-700 font-sans italic">"{upg.original_sentence}"</p>
                      </div>

                      {/* Upgraded */}
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-300 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Phiên bản {targetBandLabel}+ (Đa dạng cấu trúc & Ngữ pháp):
                        </span>
                        <p className="text-emerald-950 font-bold font-sans">"{upg.upgraded_sentence}"</p>
                      </div>
                    </div>

                    {/* Breakdown of specific changes & WHY */}
                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t border-slate-200/80">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                          🔎 Chi tiết từng điểm thay đổi & Lý do thay đổi (Why it changed):
                        </span>

                        <div className="space-y-2">
                          {upg.changes_breakdown?.map((chg, cIdx) => (
                            <div
                              key={cIdx}
                              className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-mono text-[11px] line-through">
                                  {chg.highlight_text}
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold text-[11px]">
                                  {chg.replaced_with}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed pl-1 border-l-2 border-emerald-500">
                                <strong className="text-slate-800">Tại sao thay đổi: </strong>
                                {chg.reason}
                              </p>
                            </div>
                          ))}
                        </div>

                        {upg.explanation && (
                          <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-700 leading-relaxed">
                            <strong>💡 Tác dụng tổng thể:</strong> {upg.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BẢN VIẾT LẠI BAND 8.0 TOÀN BÀI (PARAGRAPH-BY-PARAGRAPH WITH WHY) */}
      {activeTab === 'BAND8_ESSAY' && band8Essay && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1.5">
            <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Bản Viết Lại {targetBandLabel} (Dựa trên ý tưởng gốc của bạn):
            </h4>
            <p className="leading-relaxed">
              Giám khảo AI đã tối ưu lại toàn bộ bài viết của bạn để đạt tiêu chuẩn <strong>{targetBandLabel}</strong> nhưng vẫn giữ nguyên quan điểm và lập luận của bạn. Dưới đây là phân tích đối chiếu từng đoạn văn và lý do cải thiện.
            </p>
            {band8Essay.overall_strategy && (
              <div className="mt-2 pt-2 border-t border-emerald-200 text-emerald-900 font-medium">
                <strong>🎯 Chiến lược chuyển đổi:</strong> {band8Essay.overall_strategy}
              </div>
            )}
          </div>

          {/* Paragraph by Paragraph Breakdown */}
          <div className="space-y-3">
            {band8Essay.paragraph_breakdown?.map((para, pIdx) => {
              const isExpanded = expandedParagraphIdx === pIdx;
              return (
                <div
                  key={pIdx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 transition"
                >
                  <div
                    onClick={() => setExpandedParagraphIdx(isExpanded ? null : pIdx)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                        {para.paragraph_type || `Đoạn ${pIdx + 1}`}
                      </span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-700">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Đoạn gốc của bạn:
                      </span>
                      <p className="text-slate-700 font-sans italic whitespace-pre-line">
                        {para.original_paragraph || '(Chưa có đoạn này trong bài viết)'}
                      </p>
                    </div>

                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-300 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Đoạn tối ưu {targetBandLabel}:
                      </span>
                      <p className="text-emerald-950 font-bold font-sans whitespace-pre-line">
                        {para.improved_paragraph}
                      </p>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="text-slate-700 text-[11px] leading-relaxed">
                        <strong className="text-slate-900">Tại sao đoạn này đạt điểm cao hơn: </strong>
                        {para.why_improved}
                      </div>

                      {para.key_changes && para.key_changes.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-100">
                          <strong className="text-[11px] text-slate-800">Các điểm thay đổi then chốt:</strong>
                          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-600">
                            {para.key_changes.map((kc, kIdx) => (
                              <li key={kIdx}>{kc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Full Essay Text for Easy Copy */}
          {band8Essay.full_text && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Toàn văn bài luận mẫu {targetBandLabel} hoàn chỉnh:
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(band8Essay.full_text)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  Sao chép bài viết
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {band8Essay.full_text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to segment text and highlight error matches
function renderHighlightedSegments(
  fullText: string,
  errors: ErrorInstance[],
  onSelectError: (err: ErrorInstance) => void,
  selectedError: ErrorInstance | null,
  activeFilter: 'ALL' | 'GRAMMAR' | 'SPELLING_PUNCT' | 'VOCAB'
) {
  if (!errors || errors.length === 0) return fullText;

  // Find all error matches with indices
  interface Match {
    start: number;
    end: number;
    error: ErrorInstance;
  }

  const matches: Match[] = [];

  errors.forEach((err) => {
    if (!err.original_text) return;
    const target = err.original_text.trim();
    if (!target) return;

    let searchIndex = 0;
    const lowerFull = fullText.toLowerCase();
    const lowerTarget = target.toLowerCase();

    while (searchIndex < fullText.length) {
      const foundIdx = lowerFull.indexOf(lowerTarget, searchIndex);
      if (foundIdx === -1) break;

      matches.push({
        start: foundIdx,
        end: foundIdx + target.length,
        error: err
      });
      searchIndex = foundIdx + target.length;
    }
  });

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Filter overlapping matches
  const nonOverlappingMatches: Match[] = [];
  let lastEnd = 0;

  for (const m of matches) {
    if (m.start >= lastEnd) {
      nonOverlappingMatches.push(m);
      lastEnd = m.end;
    }
  }

  if (nonOverlappingMatches.length === 0) return fullText;

  const elements: React.ReactNode[] = [];
  let currentIndex = 0;

  nonOverlappingMatches.forEach((m, idx) => {
    // Plain text before match
    if (m.start > currentIndex) {
      elements.push(
        <span key={`text-${idx}`}>{fullText.substring(currentIndex, m.start)}</span>
      );
    }

    const isSelected = selectedError?.original_text === m.error.original_text;
    const catInfo = categorizeError(m.error.error_tag_code);
    const isMuted = activeFilter !== 'ALL' && catInfo.type !== activeFilter;

    // Highlighted element
    elements.push(
      <mark
        key={`match-${idx}`}
        onClick={() => onSelectError(m.error)}
        title={`Bấm để xem sửa lỗi (${catInfo.label}): ${m.error.explanation}`}
        className={`px-1 py-0.5 rounded cursor-pointer transition font-bold ${
          isMuted
            ? 'opacity-40 bg-slate-200 text-slate-700 hover:opacity-100'
            : isSelected
            ? catInfo.markSelectedClass
            : catInfo.markClass
        }`}
      >
        {fullText.substring(m.start, m.end)}
      </mark>
    );

    currentIndex = m.end;
  });

  // Remaining text
  if (currentIndex < fullText.length) {
    elements.push(
      <span key="text-end">{fullText.substring(currentIndex)}</span>
    );
  }

  return <>{elements}</>;
}
