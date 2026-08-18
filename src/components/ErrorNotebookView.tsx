import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Filter, BookOpen, Clock, FileText, Layers, Search, Sparkles, FolderOpen, Tag } from 'lucide-react';
import { ErrorInstance } from '../types';

export const ErrorNotebookView: React.FC = () => {
  const [errors, setErrors] = useState<ErrorInstance[]>([]);
  const [frequentErrors, setFrequentErrors] = useState<any[]>([]);
  const [testErrors, setTestErrors] = useState<any[]>([]);
  
  // Filter states
  const [activeTabMode, setActiveTabMode] = useState<'BY_TEST' | 'BY_TAG' | 'BY_SKILL'>('BY_TEST');
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGroupedByTest, setIsGroupedByTest] = useState<boolean>(true);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      const res = await fetch('/api/error-notebook?user_id=u_student');
      const data = await res.json();
      setErrors(data.errors || []);
      setFrequentErrors(data.frequent_errors || []);
      setTestErrors(data.test_errors || []);
    } catch (err) {
      console.error("Lỗi khi tải Sổ tay lỗi sai:", err);
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Sổ Tay Lỗi Sai AI</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tự động tổng hợp, phân loại lỗi theo từng đề thi & kỹ năng để ôn tập nhắm mục tiêu.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng lỗi lưu</span>
              <span className="text-base font-extrabold text-emerald-700">{errors.length}</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số đề thi ghi nhận</span>
              <span className="text-base font-extrabold text-slate-800">{testErrors.length}</span>
            </div>
          </div>
        </div>

        {/* Search & Mode Tabs */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Classification View Modes */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => { setActiveTabMode('BY_TEST'); setSelectedTagFilter('ALL'); setSelectedSkillFilter('ALL'); }}
              className={`px-3.5 py-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 ${
                activeTabMode === 'BY_TEST' ? 'bg-white text-slate-900 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Phân loại theo Đề thi ({testErrors.length})</span>
            </button>

            <button
              onClick={() => { setActiveTabMode('BY_TAG'); setSelectedTestFilter('ALL'); setSelectedSkillFilter('ALL'); }}
              className={`px-3.5 py-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 ${
                activeTabMode === 'BY_TAG' ? 'bg-white text-slate-900 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Theo Loại lỗi ({frequentErrors.length})</span>
            </button>

            <button
              onClick={() => { setActiveTabMode('BY_SKILL'); setSelectedTestFilter('ALL'); setSelectedTagFilter('ALL'); }}
              className={`px-3.5 py-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 ${
                activeTabMode === 'BY_SKILL' ? 'bg-white text-slate-900 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Theo Kỹ năng</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu sai, từ ngữ hoặc đề thi..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

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
                <span className="truncate max-w-[220px]">{te.source_title}</span>
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
                <span>Gộp nhóm danh sách theo từng đề</span>
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
      {activeTabMode === 'BY_TEST' && isGroupedByTest ? (
        /* Grouped By Test Cards */
        <div className="space-y-6">
          {Array.from(groupedByTestMap.entries()).length > 0 ? (
            Array.from(groupedByTestMap.entries()).map(([testTitle, testErrorList]) => {
              const sampleError = testErrorList[0];
              return (
                <div key={testTitle} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
                  {/* Test Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                        <FileText className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-extrabold text-slate-900">{testTitle}</h2>
                          {sampleError && getSkillBadge(sampleError.source_type)}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Phát hiện {testErrorList.length} lỗi cần khắc phục
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTestFilter(testTitle);
                        setIsGroupedByTest(false);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 cursor-pointer self-start sm:self-auto transition"
                    >
                      Xem riêng đề này
                    </button>
                  </div>

                  {/* List of Errors for this test */}
                  <div className="space-y-3">
                    {testErrorList.map((err) => (
                      <div key={err.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-2 hover:border-slate-300 transition">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            [{err.error_tag_code}] {err.error_tag_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(err.created_at).toLocaleDateString('vi-VN')}
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
                    ))}
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
            filteredErrors.map((err: any) => (
              <div key={err.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSkillBadge(err.source_type)}
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                      [{err.error_tag_code}] {err.error_tag_name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-500" />
                      {err.source_title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{new Date(err.created_at).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-2">
                  <p className="text-slate-800 font-medium">
                    <span className="text-slate-500 font-semibold mr-1">Lỗi ban đầu:</span>
                    <span className="text-rose-600 line-through bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 font-mono">{err.original_text}</span>
                  </p>
                  <p className="text-slate-800 font-medium">
                    <span className="text-slate-500 font-semibold mr-1">Sửa chuẩn:</span>
                    <strong className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 font-mono">{err.corrected_text}</strong>
                  </p>
                  <p className="text-slate-600 text-[11px] pt-1">
                    <strong className="text-emerald-900 font-bold">Giải thích chi tiết:</strong> {err.explanation}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 text-xs space-y-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-900">Không có lỗi sai nào khớp với bộ lọc đã chọn</p>
              <p className="text-slate-500">Mọi lỗi sai khi làm bài thi hay nộp bài cho AI sẽ tự động xuất hiện tại đây.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
