import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  FileText,
  Layers,
  Search,
  Sparkles,
  FolderOpen,
  Tag,
  Zap,
  Play,
  RotateCcw,
  Clock,
  Award,
  Trophy,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  CheckSquare,
  Square,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ErrorInstance, RemedialExam, RemedialQuestion } from '../types';

interface ErrorNotebookViewProps {
  onActivityCompleted?: () => void;
}

export const ErrorNotebookView: React.FC<ErrorNotebookViewProps> = ({ onActivityCompleted }) => {
  const [errors, setErrors] = useState<ErrorInstance[]>([]);
  const [frequentErrors, setFrequentErrors] = useState<any[]>([]);
  const [testErrors, setTestErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter states
  const [activeTabMode, setActiveTabMode] = useState<'BY_TEST' | 'BY_TAG' | 'BY_SKILL'>('BY_TEST');
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGroupedByTest, setIsGroupedByTest] = useState<boolean>(true);

  // Selected error IDs for custom test creation
  const [selectedErrorIds, setSelectedErrorIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);

  // Remedial Test Generator Modal states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [testQuestionCount, setTestQuestionCount] = useState<number>(10);
  const [testTargetBand, setTestTargetBand] = useState<string>('Band 7.0');
  const [testScope, setTestScope] = useState<'ALL' | 'FILTERED' | 'SELECTED' | 'SPECIFIC_TEST'>('ALL');
  const [specificTestTitle, setSpecificTestTitle] = useState<string>('');
  const [isGeneratingTest, setIsGeneratingTest] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Active Exam Player States
  const [activeExam, setActiveExam] = useState<RemedialExam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600);
  const [isExamCompleted, setIsExamCompleted] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [isSubmittingExam, setIsSubmittingExam] = useState<boolean>(false);

  useEffect(() => {
    fetchErrors();
  }, []);

  // Countdown timer for active exam
  useEffect(() => {
    let timer: any = null;
    if (activeExam && !isExamCompleted && timeRemainingSeconds > 0) {
      timer = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeExam, isExamCompleted, timeRemainingSeconds]);

  const fetchErrors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/error-notebook?user_id=u_student');
      const data = await res.json();
      setErrors(data.errors || []);
      setFrequentErrors(data.frequent_errors || []);
      setTestErrors(data.test_errors || []);
    } catch (err) {
      console.error("Lỗi khi tải Sổ tay lỗi sai:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic
  const filteredErrors = errors.filter((err: any) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (err.original_text || '').toLowerCase().includes(q) ||
        (err.corrected_text || '').toLowerCase().includes(q) ||
        (err.explanation || '').toLowerCase().includes(q) ||
        (err.source_title || '').toLowerCase().includes(q) ||
        (err.error_tag_name || '').toLowerCase().includes(q);
      if (!matchText) return false;
    }

    // Skill filter
    if (selectedSkillFilter !== 'ALL' && err.source_type !== selectedSkillFilter) {
      return false;
    }

    // Tag filter
    if (selectedTagFilter !== 'ALL' && err.error_tag_code !== selectedTagFilter) {
      return false;
    }

    // Test filter
    if (selectedTestFilter !== 'ALL' && err.source_title !== selectedTestFilter) {
      return false;
    }

    return true;
  });

  // Group errors by test title
  const groupedByTestMap = new Map<string, ErrorInstance[]>();
  filteredErrors.forEach((err) => {
    const title = err.source_title || 'Bài tập tổng hợp';
    if (!groupedByTestMap.has(title)) {
      groupedByTestMap.set(title, []);
    }
    groupedByTestMap.get(title)!.push(err);
  });

  const getSkillBadge = (skill: string) => {
    switch (skill) {
      case 'WRITING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">📝 Writing</span>;
      case 'SPEAKING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">🗣️ Speaking</span>;
      case 'READING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">📖 Reading</span>;
      case 'LISTENING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">🎧 Listening</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{skill}</span>;
    }
  };

  const toggleSelectError = (id: string) => {
    setSelectedErrorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFilteredErrors = () => {
    const allFilteredIds = filteredErrors.map((e) => e.id);
    if (selectedErrorIds.length === allFilteredIds.length) {
      setSelectedErrorIds([]);
    } else {
      setSelectedErrorIds(allFilteredIds);
    }
  };

  // Open generator modal for a specific test
  const handleOpenTestModalForSpecificTest = (testTitle: string) => {
    setSpecificTestTitle(testTitle);
    setTestScope('SPECIFIC_TEST');
    setIsConfigModalOpen(true);
  };

  // Trigger AI Test Generation
  const handleGenerateExam = async () => {
    setIsGeneratingTest(true);
    setGenerationStep('Đang phân tích các lỗi sai & thói quen ngữ pháp...');

    try {
      setTimeout(() => {
        setGenerationStep('Đang khởi tạo các bẫy đề thi theo chuẩn Cambridge & IDP...');
      }, 1200);

      const payload: any = {
        user_id: 'u_student',
        question_count: testQuestionCount,
        target_band: testTargetBand,
        skill_filter: testScope === 'FILTERED' ? selectedSkillFilter : 'ALL',
        tag_filter: testScope === 'FILTERED' ? selectedTagFilter : 'ALL',
        test_filter: testScope === 'SPECIFIC_TEST' ? specificTestTitle : (testScope === 'FILTERED' ? selectedTestFilter : 'ALL'),
        selected_error_ids: testScope === 'SELECTED' ? selectedErrorIds : []
      };

      const res = await fetch('/api/error-notebook/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.test && data.test.questions && data.test.questions.length > 0) {
        setActiveExam(data.test);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setTimeRemainingSeconds((data.test.time_limit_minutes || 10) * 60);
        setIsExamCompleted(false);
        setExamResult(null);
        setIsConfigModalOpen(false);
      } else {
        alert("Không thể tạo đề thi. Vui lòng thử lại!");
      }
    } catch (err: any) {
      console.error("Lỗi tạo đề thi từ lỗi sai:", err);
      alert(`Lỗi tạo đề thi: ${err.message || 'Vui lòng kiểm tra kết nối mạng'}`);
    } finally {
      setIsGeneratingTest(false);
      setGenerationStep('');
    }
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (isExamCompleted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleAutoSubmitExam = () => {
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    setIsSubmittingExam(true);

    try {
      const timeSpent = (activeExam.time_limit_minutes * 60) - timeRemainingSeconds;
      const res = await fetch('/api/error-notebook/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          test_id: activeExam.test_id,
          answers: userAnswers,
          questions: activeExam.questions,
          time_spent_seconds: Math.max(10, timeSpent)
        })
      });

      const data = await res.json();
      setExamResult(data);
      setIsExamCompleted(true);
      if (onActivityCompleted) onActivityCompleted();
    } catch (err: any) {
      console.error("Lỗi nộp bài thi:", err);
      alert(`Lỗi nộp bài: ${err.message}`);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Sổ Tay Lỗi Sai AI</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                  AI Remedial Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tự động tổng hợp và tạo đề thi trắc nghiệm cá nhân hóa để khắc phục triệt để các lỗi bạn từng mắc phải.
              </p>
            </div>
          </div>

          {/* Action Buttons: Generate Remedial Test & Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <button
              onClick={() => {
                setTestScope(selectedErrorIds.length > 0 ? 'SELECTED' : 'ALL');
                setIsConfigModalOpen(true);
              }}
              className="btn-glossy-emerald px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-amber-300" />
              <span>⚡ Tạo Đề Luyện Tập Từ Lỗi Sai</span>
            </button>

            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng lỗi lưu</span>
              <span className="text-sm font-extrabold text-emerald-700">{errors.length}</span>
            </div>

            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đề thi ghi nhận</span>
              <span className="text-sm font-extrabold text-slate-800">{testErrors.length}</span>
            </div>
          </div>
        </div>

        {/* Search & Mode Tabs */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Classification View Modes */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => { setActiveTabMode('BY_TEST'); setSelectedTagFilter('ALL'); setSelectedSkillFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTabMode === 'BY_TEST' ? 'bg-white text-slate-900 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Theo Đề thi ({testErrors.length})</span>
            </button>

            <button
              onClick={() => { setActiveTabMode('BY_TAG'); setSelectedTestFilter('ALL'); setSelectedSkillFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTabMode === 'BY_TAG' ? 'bg-white text-slate-900 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Theo Loại lỗi ({frequentErrors.length})</span>
            </button>

            <button
              onClick={() => { setActiveTabMode('BY_SKILL'); setSelectedTestFilter('ALL'); setSelectedTagFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTabMode === 'BY_SKILL' ? 'bg-white text-slate-900 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Theo Kỹ năng</span>
            </button>
          </div>

          {/* Search bar & Selection Mode Toggle */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu sai, từ ngữ hoặc đề thi..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedErrorIds([]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isSelectionMode
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isSelectionMode ? `Đã chọn (${selectedErrorIds.length})` : 'Chọn lỗi'}</span>
            </button>
          </div>
        </div>

        {/* Selection Action Bar (Visible when in Selection Mode) */}
        {isSelectionMode && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllFilteredErrors}
                className="font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                {selectedErrorIds.length === filteredErrors.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả trong danh sách lọc'}
              </button>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Đã chọn <strong>{selectedErrorIds.length}</strong> / {filteredErrors.length} lỗi</span>
            </div>

            <button
              onClick={() => {
                if (selectedErrorIds.length === 0) {
                  alert("Vui lòng tích chọn ít nhất 1 lỗi sai!");
                  return;
                }
                setTestScope('SELECTED');
                setIsConfigModalOpen(true);
              }}
              disabled={selectedErrorIds.length === 0}
              className="btn-glossy-emerald px-3 py-1.5 rounded-xl text-xs font-black disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>Tạo Đề Từ {selectedErrorIds.length} Lỗi Đã Chọn</span>
            </button>
          </div>
        )}

        {/* Dynamic Filter Badges based on activeTabMode */}
        {activeTabMode === 'BY_TEST' && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Lọc theo Đề:
            </span>
            <button
              onClick={() => setSelectedTestFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs cursor-pointer transition ${
                selectedTestFilter === 'ALL'
                  ? 'btn-glossy-emerald font-extrabold text-white shadow-sm'
                  : 'bg-slate-100 font-medium text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất Cả Đề Thi ({errors.length})
            </button>
            {testErrors.map((te) => (
              <button
                key={te.source_title}
                onClick={() => setSelectedTestFilter(te.source_title)}
                className={`px-3 py-1 rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5 ${
                  selectedTestFilter === te.source_title
                    ? 'btn-glossy-emerald font-extrabold text-white shadow-sm'
                    : 'bg-slate-100 font-medium text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="truncate max-w-[200px]">{te.source_title}</span>
                <span className="px-1.5 py-0.2 bg-slate-200/80 rounded-md text-[10px] font-bold text-slate-700">
                  {te.count}
                </span>
              </button>
            ))}

            {/* Toggle Grouping Mode */}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGroupedByTest}
                  onChange={(e) => setIsGroupedByTest(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>Gộp nhóm theo đề</span>
              </label>
            </div>
          </div>
        )}

        {activeTabMode === 'BY_TAG' && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Loại lỗi:
            </span>
            <button
              onClick={() => setSelectedTagFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs cursor-pointer transition ${
                selectedTagFilter === 'ALL'
                  ? 'btn-glossy-emerald font-extrabold text-white shadow-sm'
                  : 'bg-slate-100 font-medium text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất Cả Loại Lỗi
            </button>
            {frequentErrors.map((fe) => (
              <button
                key={fe.code}
                onClick={() => setSelectedTagFilter(fe.code)}
                className={`px-3 py-1 rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5 ${
                  selectedTagFilter === fe.code
                    ? 'btn-glossy-emerald font-extrabold text-white shadow-sm'
                    : 'bg-slate-100 font-medium text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{fe.name}</span>
                <span className="px-1.5 py-0.2 bg-slate-200/80 rounded-md text-[10px] font-bold text-slate-700">
                  {fe.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {activeTabMode === 'BY_SKILL' && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Chọn Kỹ năng:
            </span>
            {[
              { code: 'ALL', label: 'Tất Cả Kỹ Năng' },
              { code: 'WRITING', label: '📝 Writing' },
              { code: 'SPEAKING', label: '🗣️ Speaking' },
              { code: 'READING', label: '📖 Reading' },
              { code: 'LISTENING', label: '🎧 Listening' },
            ].map((sk) => (
              <button
                key={sk.code}
                onClick={() => setSelectedSkillFilter(sk.code)}
                className={`px-3.5 py-1 rounded-xl text-xs cursor-pointer transition ${
                  selectedSkillFilter === sk.code
                    ? 'btn-glossy-emerald font-extrabold text-white shadow-sm'
                    : 'bg-slate-100 font-medium text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sk.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 text-xs shadow-sm">
          <Sparkles className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="font-bold text-slate-800">Đang đồng bộ Sổ tay lỗi sai...</p>
        </div>
      ) : activeTabMode === 'BY_TEST' && isGroupedByTest ? (
        /* Grouped By Test Cards */
        <div className="space-y-6">
          {Array.from(groupedByTestMap.entries()).length > 0 ? (
            Array.from(groupedByTestMap.entries()).map(([testTitle, testErrorList]) => {
              const sampleError = testErrorList[0];
              return (
                <div key={testTitle} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
                  {/* Test Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <FileText className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-extrabold text-slate-900">{testTitle}</h2>
                          {sampleError && getSkillBadge(sampleError.source_type || 'GENERAL')}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Phát hiện {testErrorList.length} lỗi cần khắc phục
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => handleOpenTestModalForSpecificTest(testTitle)}
                        className="btn-glossy-emerald px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                        <span>Tạo Đề Cho Bài Này</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTestFilter(testTitle);
                          setIsGroupedByTest(false);
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-3 py-1.5 cursor-pointer transition"
                      >
                        Xem riêng
                      </button>
                    </div>
                  </div>

                  {/* List of Errors for this test */}
                  <div className="space-y-3">
                    {testErrorList.map((err) => {
                      const isSelected = selectedErrorIds.includes(err.id);
                      return (
                        <div
                          key={err.id}
                          onClick={() => {
                            if (isSelectionMode) toggleSelectError(err.id);
                          }}
                          className={`p-4 rounded-2xl border text-xs space-y-2 transition ${
                            isSelectionMode ? 'cursor-pointer' : ''
                          } ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                              : 'bg-slate-50/80 border-slate-200/70 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isSelectionMode && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectError(err.id);
                                  }}
                                  className="text-emerald-700"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-700 fill-emerald-100" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              )}
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                                [{err.error_tag_code}] {err.error_tag_name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {err.created_at ? new Date(err.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <p className="text-slate-800 font-medium">
                              <span className="text-slate-500 font-semibold mr-1">Lỗi ban đầu:</span>
                              <span className="text-rose-600 line-through bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 font-mono">
                                {err.original_text}
                              </span>
                            </p>
                            <p className="text-slate-800 font-medium">
                              <span className="text-slate-500 font-semibold mr-1">Sửa chuẩn:</span>
                              <strong className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 font-mono">
                                {err.corrected_text}
                              </strong>
                            </p>
                            <p className="text-slate-600 text-[11px] pt-1">
                              <strong className="text-emerald-900 font-bold">Giải thích AI:</strong> {err.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 text-xs space-y-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-900">Không tìm thấy lỗi sai nào khớp bộ lọc</p>
              <p className="text-slate-500">Hãy thử xóa từ khóa tìm kiếm hoặc bỏ chọn lọc đề thi.</p>
            </div>
          )}
        </div>
      ) : (
        /* Flat List View */
        <div className="space-y-4">
          {filteredErrors.length > 0 ? (
            filteredErrors.map((err: any) => {
              const isSelected = selectedErrorIds.includes(err.id);
              return (
                <div
                  key={err.id}
                  onClick={() => {
                    if (isSelectionMode) toggleSelectError(err.id);
                  }}
                  className={`bg-white border rounded-3xl p-5 space-y-3 shadow-sm transition ${
                    isSelectionMode ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isSelectionMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectError(err.id);
                          }}
                          className="text-emerald-700 mr-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700 fill-emerald-100" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      )}
                      {getSkillBadge(err.source_type)}
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                        [{err.error_tag_code}] {err.error_tag_name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-500" />
                        {err.source_title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {err.created_at ? new Date(err.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-2">
                    <p className="text-slate-800 font-medium">
                      <span className="text-slate-500 font-semibold mr-1">Lỗi ban đầu:</span>
                      <span className="text-rose-600 line-through bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 font-mono">
                        {err.original_text}
                      </span>
                    </p>
                    <p className="text-slate-800 font-medium">
                      <span className="text-slate-500 font-semibold mr-1">Sửa chuẩn:</span>
                      <strong className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 font-mono">
                        {err.corrected_text}
                      </strong>
                    </p>
                    <p className="text-slate-600 text-[11px] pt-1">
                      <strong className="text-emerald-900 font-bold">Giải thích chi tiết:</strong> {err.explanation}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 text-xs space-y-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-900">Không có lỗi sai nào khớp với bộ lọc đã chọn</p>
              <p className="text-slate-500">Mọi lỗi sai khi làm bài thi hay nộp bài cho AI sẽ tự động xuất hiện tại đây.</p>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: CẤU HÌNH TẠO ĐỀ THI KHẮC PHỤC LỖI SAI ================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Zap className="w-5 h-5 fill-current text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Tạo Đề Thi Khắc Phục Lỗi Sai AI</h3>
                  <p className="text-xs text-slate-500">Thiết lập bộ đề trắc nghiệm nhắm đúng các lỗi bạn từng mắc</p>
                </div>
              </div>
              <button
                onClick={() => !isGeneratingTest && setIsConfigModalOpen(false)}
                disabled={isGeneratingTest}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer transition disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                1. Phạm vi nguồn lỗi sai sử dụng để tạo đề:
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <label
                  onClick={() => setTestScope('ALL')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    testScope === 'ALL'
                      ? 'bg-emerald-50/80 border-emerald-400 font-bold text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="block font-extrabold">Toàn bộ {errors.length} lỗi trong Sổ tay</span>
                      <span className="text-[11px] text-slate-500 font-normal">Quét toàn diện tất cả các dạng lỗi ngữ pháp, từ vựng và câu cú</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="scope"
                    checked={testScope === 'ALL'}
                    onChange={() => setTestScope('ALL')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                {selectedErrorIds.length > 0 && (
                  <label
                    onClick={() => setTestScope('SELECTED')}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      testScope === 'SELECTED'
                        ? 'bg-emerald-50/80 border-emerald-400 font-bold text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="block font-extrabold">{selectedErrorIds.length} lỗi bạn vừa chọn bằng tay</span>
                        <span className="text-[11px] text-slate-500 font-normal">Tạo đề thi tập trung xử lý đúng các lỗi được đánh dấu</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="scope"
                      checked={testScope === 'SELECTED'}
                      onChange={() => setTestScope('SELECTED')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                )}

                {specificTestTitle && (
                  <label
                    onClick={() => setTestScope('SPECIFIC_TEST')}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      testScope === 'SPECIFIC_TEST'
                        ? 'bg-emerald-50/80 border-emerald-400 font-bold text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="block font-extrabold truncate max-w-[280px]">Đề: {specificTestTitle}</span>
                        <span className="text-[11px] text-slate-500 font-normal">Chỉ lấy các lỗi phát sinh trong bài thi này</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="scope"
                      checked={testScope === 'SPECIFIC_TEST'}
                      onChange={() => setTestScope('SPECIFIC_TEST')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                2. Số lượng câu hỏi & thời gian làm bài:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { count: 5, time: '5 phút', label: 'Khởi động nhanh' },
                  { count: 10, time: '10 phút', label: 'Tiêu chuẩn' },
                  { count: 15, time: '15 phút', label: 'Chuyên sâu' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setTestQuestionCount(item.count)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      testQuestionCount === item.count
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-extrabold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="block text-sm font-black text-emerald-700">{item.count} Câu</span>
                    <span className="block text-[11px] text-slate-500">{item.time}</span>
                    <span className="block text-[10px] text-slate-400">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Band Goal */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                3. Định hướng độ chuẩn & mục tiêu Band:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { band: 'Band 6.0 - 6.5', desc: 'Chắc ngữ pháp căn bản' },
                  { band: 'Band 7.0 - 7.5', desc: 'Chuẩn học thuật C1' },
                  { band: 'Band 8.0+', desc: 'Tinh hoa Lexical & C2' },
                ].map((item) => (
                  <button
                    key={item.band}
                    type="button"
                    onClick={() => setTestTargetBand(item.band)}
                    className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                      testTargetBand === item.band
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-extrabold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="block font-bold text-slate-800">{item.band}</span>
                    <span className="block text-[10px] text-slate-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Progress Indicator */}
            {isGeneratingTest && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2 animate-pulse">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Gemini AI đang tổng hợp và tạo đề thi...</span>
                </div>
                <p className="text-[11px] text-emerald-700 pl-6">{generationStep}</p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                disabled={isGeneratingTest}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleGenerateExam}
                disabled={isGeneratingTest}
                className="btn-glossy-emerald px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isGeneratingTest ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Đang Tạo Đề Thi...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-amber-300" />
                    <span>Bắt Đầu Làm Đề Thi Khắc Phục</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN EXAM PLAYER / RESULTS MODAL ================= */}
      {activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Exam Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Zap className="w-5 h-5 fill-current text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight line-clamp-1">
                    {activeExam.title}
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{activeExam.total_questions} Câu hỏi cá nhân hóa</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{activeExam.target_band_focus}</span>
                  </div>
                </div>
              </div>

              {!isExamCompleted ? (
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-2xl">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="font-mono font-black text-sm text-amber-400">
                    {formatTimer(timeRemainingSeconds)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setActiveExam(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm cursor-pointer transition"
                >
                  ✕
                </button>
              )}
            </div>

            {/* If Exam is in Progress */}
            {!isExamCompleted ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Question Progress Navigator Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Câu hỏi {currentQuestionIndex + 1} / {activeExam.questions.length}</span>
                      <span className="text-emerald-700">
                        Đã làm {Object.keys(userAnswers).length} / {activeExam.questions.length} câu
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {activeExam.questions.map((q, idx) => {
                        const isAnswered = userAnswers[q.id] !== undefined;
                        const isCurrent = currentQuestionIndex === idx;
                        return (
                          <button
                            key={q.id}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer shrink-0 ${
                              isCurrent
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-1 font-black shadow-xs'
                                : isAnswered
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Question Box */}
                  {activeExam.questions[currentQuestionIndex] && (
                    <div className="space-y-4">
                      {/* Scenario & Context Header */}
                      <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-xs space-y-1.5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-extrabold text-[10px]">
                              {activeExam.questions[currentQuestionIndex].scenario_type || 'IELTS Academic Context'}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md font-extrabold text-[10px]">
                              {activeExam.questions[currentQuestionIndex].rule_category}
                            </span>
                          </div>
                          <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5" /> Bẫy tương tự từ lỗi đã ghi nhận
                          </span>
                        </div>
                        {activeExam.questions[currentQuestionIndex].target_error_pattern && (
                          <p className="text-[11px] text-slate-300">
                            <strong className="text-emerald-400">Dạng bẫy kiểm tra:</strong> {activeExam.questions[currentQuestionIndex].target_error_pattern}
                          </p>
                        )}
                      </div>

                      {/* Rich Academic Context Passage */}
                      {activeExam.questions[currentQuestionIndex].context_passage && (
                        <div className="p-4 bg-emerald-50/40 border border-emerald-200/90 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Đoạn Ngữ Cảnh Học Thuật (Context Passage):</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed italic bg-white/80 p-3 rounded-xl border border-emerald-100/80">
                            {activeExam.questions[currentQuestionIndex].context_passage}
                          </p>
                        </div>
                      )}

                      {/* Question Instruction / Prompt */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-bold leading-relaxed flex items-start gap-2.5">
                        <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>{activeExam.questions[currentQuestionIndex].question}</div>
                      </div>

                      {/* 4 Options (A, B, C, D) */}
                      <div className="space-y-2.5">
                        {activeExam.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                          const isSelected = userAnswers[activeExam.questions[currentQuestionIndex].id] === optIdx;
                          const optionLetters = ['A', 'B', 'C', 'D'];
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(activeExam.questions[currentQuestionIndex].id, optIdx)}
                              className={`w-full p-3.5 rounded-2xl border text-left text-xs transition cursor-pointer flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-emerald-50/90 border-emerald-400 font-bold text-emerald-950 ring-1 ring-emerald-300 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 border border-slate-300'
                                }`}
                              >
                                {optionLetters[optIdx]}
                              </div>
                              <span className="flex-1 font-medium">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Exam Player Bottom Navigation */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < activeExam.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(activeExam.questions.length - 1, prev + 1))}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Câu tiếp</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitExam}
                        disabled={isSubmittingExam}
                        className="btn-glossy-emerald px-5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {isSubmittingExam ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin" />
                            <span>Đang Chấm Bài...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Nộp Bài Chấm Điểm</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ================= EXAM RESULTS & DETAILED MASTERY BREAKDOWN ================= */
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Result Summary Score Card */}
                {examResult && (
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-100">
                          Kết quả Đề Khắc Phục Lỗi Sai
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          {examResult.score_percentage >= 80 ? '🎉 Xuất Sắc! Bạn Đã Khắc Phục Lỗi' : '💪 Cố Lên! Cần Ôn Lại Thêm Một Chút'}
                        </h3>
                        <p className="text-xs text-emerald-100">
                          Đã hoàn thành đề trong {Math.round(examResult.time_spent_seconds / 60)} phút.
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl text-center border border-white/20">
                          <span className="block text-[10px] uppercase font-bold text-emerald-200">Độ chính xác</span>
                          <span className="text-2xl font-black text-white">
                            {examResult.correct_count}/{examResult.total_questions}
                          </span>
                          <span className="block text-[10px] text-emerald-200">({examResult.score_percentage}%)</span>
                        </div>

                        <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl text-center border border-white/20">
                          <span className="block text-[10px] uppercase font-bold text-emerald-200">Tác động Band</span>
                          <span className="text-2xl font-black text-amber-300">
                            {examResult.estimated_band_impact}
                          </span>
                          <span className="block text-[10px] text-emerald-200">tiềm năng tăng</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Question Review List */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Chi Tiết Đáp Án & Lời Khuyên Examiner:</span>
                  </h4>

                  {examResult?.review_list?.map((rev: any, idx: number) => {
                    const qObj = activeExam.questions.find((q) => q.id === rev.question_id);
                    return (
                      <div
                        key={rev.question_id}
                        className={`p-4 rounded-2xl border text-xs space-y-3 ${
                          rev.is_correct
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        {/* Question Status Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                rev.is_correct
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-800">
                              {rev.is_correct ? '✓ Trả lời chính xác' : '✗ Chưa chính xác'}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                              {rev.rule_category}
                            </span>
                            {rev.scenario_type && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold text-[10px]">
                                {rev.scenario_type}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Context Passage in Review */}
                        {(rev.context_passage || qObj?.context_passage) && (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs italic font-serif text-slate-800 leading-relaxed">
                            <strong className="font-sans text-[10px] text-slate-500 not-italic uppercase tracking-wider block mb-1">
                              Ngữ cảnh bài thi:
                            </strong>
                            {rev.context_passage || qObj?.context_passage}
                          </div>
                        )}

                        {/* Question Prompt */}
                        <p className="text-slate-900 font-bold text-xs">{rev.question}</p>

                        {/* Answer comparison */}
                        <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                          {qObj && (
                            <div className="space-y-1">
                              <p className="text-slate-700">
                                <span className="font-bold text-slate-500 mr-1.5">Lựa chọn của bạn:</span>
                                {rev.user_choice_index >= 0 ? (
                                  <span className={rev.is_correct ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold line-through'}>
                                    {qObj.options[rev.user_choice_index]}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">(Bỏ trống)</span>
                                )}
                              </p>
                              {!rev.is_correct && (
                                <p className="text-slate-700">
                                  <span className="font-bold text-slate-500 mr-1.5">Đáp án chuẩn:</span>
                                  <strong className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {qObj.options[rev.correct_index]}
                                  </strong>
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Trap Mechanism & Explanation & Examiner Pro Tip */}
                        <div className="space-y-2 text-[11px]">
                          {(rev.trap_mechanism || qObj?.trap_mechanism) && (
                            <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900">
                              <strong className="font-extrabold flex items-center gap-1 text-amber-800 mb-0.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                Phân tích cơ chế bẫy (Trap Mechanism):
                              </strong>
                              <span>{rev.trap_mechanism || qObj?.trap_mechanism}</span>
                            </div>
                          )}

                          <p className="text-slate-700">
                            <strong className="text-slate-900 font-bold">💡 Giải thích chi tiết:</strong> {rev.explanation}
                          </p>
                          {rev.pro_tip && (
                            <p className="text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80 font-medium">
                              <strong className="text-emerald-950 font-extrabold">🌟 Lời khuyên Examiner (Band 7.5+):</strong> {rev.pro_tip}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      // Retry this same exam
                      setCurrentQuestionIndex(0);
                      setUserAnswers({});
                      setTimeRemainingSeconds((activeExam.time_limit_minutes || 10) * 60);
                      setIsExamCompleted(false);
                      setExamResult(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm Lại Đề Này</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveExam(null);
                        setIsConfigModalOpen(true);
                      }}
                      className="btn-glossy-emerald px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                      <span>Tạo Đề Thi Mới</span>
                    </button>

                    <button
                      onClick={() => setActiveExam(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white cursor-pointer transition"
                    >
                      Hoàn Tất & Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
