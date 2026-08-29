import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Clock, Bookmark, BookmarkCheck, 
  ChevronLeft, ChevronRight, X, Copy, Check, Download, 
  Sparkles, ArrowRight, Share2, Filter, Tag, BookMarked, Gamepad2, Brain
} from 'lucide-react';
import { KnowledgeArticle } from '../types';

interface KnowledgeArticlesViewProps {
  onNavigate?: (tab: string) => void;
}

export const KnowledgeArticlesView: React.FC<KnowledgeArticlesViewProps> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [articleFilterSkill, setArticleFilterSkill] = useState<'ALL' | 'WRITING' | 'READING' | 'SPEAKING' | 'LISTENING' | 'BOOKMARKED'>('ALL');
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>('');
  const [isCopiedArticleContent, setIsCopiedArticleContent] = useState<boolean>(false);
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ielts_bookmarked_articles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/knowledge');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Error fetching knowledge articles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedArticleIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('ielts_bookmarked_articles', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyArticle = (article: KnowledgeArticle) => {
    const textToCopy = `# ${article.title}\nKỹ năng: ${article.skill_type} | Tác giả: ${article.author_name || 'Ms. Nga (IELTS 8.5)'}\n\n${article.content}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopiedArticleContent(true);
    setTimeout(() => setIsCopiedArticleContent(false), 2000);
  };

  const handleDownloadArticle = (article: KnowledgeArticle) => {
    const element = document.createElement('a');
    const file = new Blob([`# ${article.title}\n\nKỹ năng: ${article.skill_type}\nTác giả: ${article.author_name || 'IELTS Master Examiner'}\nNgày: ${new Date(article.created_at).toLocaleDateString('vi-VN')}\n\n${article.content}`], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${article.title.replace(/[\s/\\:*?"<>|]+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSkillBadgeStyle = (skill: string) => {
    switch (skill) {
      case 'WRITING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'READING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SPEAKING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LISTENING':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const estimateReadTime = (content: string) => {
    const wordsCount = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordsCount / 150));
    return `${minutes} phút đọc`;
  };

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-800">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 bg-emerald-100/70 text-emerald-900 rounded font-mono text-xs">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const renderFormattedArticleContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: string[] = [];

    const flushList = () => {
      if (currentListItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-3 space-y-2 list-disc list-inside text-slate-700 text-xs sm:text-sm pl-2">
            {currentListItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        currentListItems = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.startsWith('---')) {
        flushList();
        elements.push(<hr key={idx} className="my-6 border-slate-200" />);
        return;
      }

      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={idx} className="text-base sm:text-lg font-black text-slate-900 mt-6 mb-3 flex items-center gap-2 pb-2 border-b border-emerald-100">
            {renderInlineFormatting(trimmed.substring(3))}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={idx} className="text-sm sm:text-base font-extrabold text-slate-800 mt-5 mb-2 flex items-center gap-2">
            {renderInlineFormatting(trimmed.substring(4))}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('#### ')) {
        flushList();
        elements.push(
          <h4 key={idx} className="text-xs sm:text-sm font-bold text-emerald-800 mt-4 mb-1.5 flex items-center gap-1.5">
            {renderInlineFormatting(trimmed.substring(5))}
          </h4>
        );
        return;
      }

      // Callout box for Examiner Tip / Warnings / Examples
      if (trimmed.startsWith('💡') || trimmed.startsWith('⚠️') || trimmed.startsWith('🌟') || trimmed.startsWith('🎯') || trimmed.startsWith('📌') || trimmed.startsWith('🚀') || trimmed.startsWith('🌿') || trimmed.startsWith('🎓') || trimmed.startsWith('🔹') || trimmed.startsWith('📝') || trimmed.startsWith('🎧') || trimmed.startsWith('🖋️') || trimmed.startsWith('✍️') || trimmed.startsWith('🎙️')) {
        flushList();
        const isWarn = trimmed.startsWith('⚠️');
        const isExamTip = trimmed.startsWith('💡') || trimmed.startsWith('🌟') || trimmed.startsWith('🎯');
        
        elements.push(
          <div key={idx} className={`my-3.5 p-4 rounded-2xl border leading-relaxed text-xs sm:text-sm ${
            isWarn 
              ? 'bg-rose-50/90 border-rose-200/90 text-rose-950 shadow-xs' 
              : isExamTip
              ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950 shadow-xs'
              : 'bg-slate-50/90 border-slate-200/90 text-slate-900 shadow-xs'
          }`}>
            {renderInlineFormatting(trimmed)}
          </div>
        );
        return;
      }

      // Bullet item
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        currentListItems.push(trimmed.substring(2));
        return;
      }

      // Numbered item (e.g. 1. , 2. )
      if (/^\d+\.\s/.test(trimmed)) {
        flushList();
        elements.push(
          <div key={idx} className="my-2 p-3 bg-white rounded-xl border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed shadow-2xs">
            {renderInlineFormatting(trimmed)}
          </div>
        );
        return;
      }

      // Standard paragraph
      flushList();
      elements.push(
        <p key={idx} className="my-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  const filteredArticles = articles.filter(art => {
    let matchesSkill = true;
    if (articleFilterSkill === 'BOOKMARKED') {
      matchesSkill = bookmarkedArticleIds.includes(art.id);
    } else if (articleFilterSkill !== 'ALL') {
      matchesSkill = art.skill_type === articleFilterSkill;
    }

    const query = articleSearchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      art.title.toLowerCase().includes(query) || 
      art.content.toLowerCase().includes(query) || 
      (art.tags && art.tags.some(t => t.toLowerCase().includes(query)));
    return matchesSkill && matchesQuery;
  });

  const currentArticleIndex = selectedArticle 
    ? filteredArticles.findIndex(a => a.id === selectedArticle.id) 
    : -1;

  const handlePrevArticle = () => {
    if (currentArticleIndex > 0) {
      setSelectedArticle(filteredArticles[currentArticleIndex - 1]);
    }
  };

  const handleNextArticle = () => {
    if (currentArticleIndex >= 0 && currentArticleIndex < filteredArticles.length - 1) {
      setSelectedArticle(filteredArticles[currentArticleIndex + 1]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Search / Filter Controls */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>IELTS 8.5+ KNOWLEDGE & STRATEGY HUB</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kho Bài Viết Kiến Thức & Chiến Thuật Giải Đề
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Tổng hợp cẩm nang học thuật, kỹ thuật bẻ khóa bẫy đề thi IELTS từ Examiners, tuyển tập collocations C1/C2 và các phương pháp phát triển ý tưởng đột phá cho cả 4 kỹ năng.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[280px] sm:min-w-[340px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={articleSearchQuery}
              onChange={(e) => setArticleSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, từ khóa, tag..."
              className="w-full pl-10 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
            />
            {articleSearchQuery && (
              <button
                onClick={() => setArticleSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-slate-100 no-scrollbar">
          {(['ALL', 'WRITING', 'READING', 'SPEAKING', 'LISTENING', 'BOOKMARKED'] as const).map((skill) => {
            const isActive = articleFilterSkill === skill;
            let count = articles.length;
            if (skill === 'BOOKMARKED') {
              count = bookmarkedArticleIds.length;
            } else if (skill !== 'ALL') {
              count = articles.filter(a => a.skill_type === skill).length;
            }

            return (
              <button
                key={skill}
                onClick={() => setArticleFilterSkill(skill)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'btn-glossy-emerald text-white shadow-xs scale-[1.02]'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {skill === 'BOOKMARKED' && <Bookmark className="w-3.5 h-3.5 text-amber-500" />}
                <span>
                  {skill === 'ALL' && 'Tất Cả'}
                  {skill === 'WRITING' && 'Writing Task 1 & 2'}
                  {skill === 'READING' && 'Reading Skills'}
                  {skill === 'SPEAKING' && 'Speaking Fluency'}
                  {skill === 'LISTENING' && 'Listening Traps'}
                  {skill === 'BOOKMARKED' && 'Bài Đã Lưu'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 h-64 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 pt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {articleFilterSkill === 'BOOKMARKED' 
              ? 'Bạn chưa lưu bài viết nào vào danh mục yêu thích'
              : 'Không tìm thấy bài viết phù hợp'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {articleFilterSkill === 'BOOKMARKED'
              ? 'Nhấp vào biểu tượng dấu trang (Bookmark) ở bất kỳ bài viết nào để lưu lại và ôn tập nhanh tại đây.'
              : `Không có bài viết nào khớp với từ khóa "${articleSearchQuery}". Hãy thử từ khóa khác hoặc chuyển danh mục.`}
          </p>
          <button
            onClick={() => { setArticleSearchQuery(''); setArticleFilterSkill('ALL'); }}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Hiển thị tất cả bài viết
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const isBookmarked = bookmarkedArticleIds.includes(art.id);
            const readTime = estimateReadTime(art.content);
            const firstParagraph = art.content
              .replace(/##\s+/g, '')
              .replace(/###\s+/g, '')
              .replace(/\*\*/g, '')
              .replace(/---/g, '')
              .trim()
              .slice(0, 140);

            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="group bg-white border border-slate-200/80 hover:border-emerald-300 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden"
              >
                {/* Top Badges & Bookmark */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getSkillBadgeStyle(art.skill_type)}`}>
                        {art.skill_type}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {readTime}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleBookmark(art.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition"
                      title={isBookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết vào yêu thích"}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </button>
                  </div>

                  {/* Article Title */}
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                    {art.title}
                  </h3>

                  {/* Snippet Preview */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {firstParagraph}...
                  </p>

                  {/* Tags */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {art.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Author & CTA */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                      N
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">
                      {art.author_name || 'Ms. Nga (IELTS 8.5)'}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    <span>Đọc chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL ARTICLE DETAIL MODAL READER */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
          <div
            className="bg-white border border-slate-200/90 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Sticky Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Quay lại danh sách</span>
                </button>

                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider border ${getSkillBadgeStyle(selectedArticle.skill_type)}`}>
                  {selectedArticle.skill_type}
                </span>

                <span className="hidden sm:flex items-center gap-1 text-xs text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {estimateReadTime(selectedArticle.content)}
                </span>
              </div>

              {/* Actions Toolbar */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleCopyArticle(selectedArticle)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Sao chép nội dung bài viết"
                >
                  {isCopiedArticleContent ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sao chép</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadArticle(selectedArticle)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Tải bài viết về máy (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tải về</span>
                </button>

                <button
                  onClick={(e) => handleToggleBookmark(selectedArticle.id, e)}
                  className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    bookmarkedArticleIds.includes(selectedArticle.id)
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Lưu vào danh sách yêu thích"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {bookmarkedArticleIds.includes(selectedArticle.id) ? 'Đã lưu' : 'Lưu bài'}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Đóng cửa sổ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Article Content (Scrollable) */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
              {/* Author, Date & Meta info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                    N
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {selectedArticle.author_name || 'Ms. Nga (IELTS 8.5 & Academic Specialist)'}
                      </p>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold">
                        VERIFIED AUTHOR
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Đăng ngày {new Date(selectedArticle.created_at).toLocaleDateString('vi-VN')} • Chuyên đề {selectedArticle.skill_type}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedArticle.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Article Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {selectedArticle.title}
              </h1>

              {/* Formatted Article Body */}
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans pt-2">
                {renderFormattedArticleContent(selectedArticle.content)}
              </div>

              {/* Key Takeaways & Action Suggestions Box */}
              <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 rounded-3xl border border-emerald-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Gợi ý áp dụng & Luyện tập ngay
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Để khắc sâu kiến thức từ bài học này, bạn hãy chuyển sang phần **Ngân hàng đề thi**, **Sổ từ vựng** hoặc **Brainstorm Ý tưởng** để áp dụng trực tiếp các collocations và chiến thuật vừa đọc vào bài làm thực tế.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  {onNavigate && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedArticle(null);
                          onNavigate('vocab');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookMarked className="w-3.5 h-3.5" />
                        <span>Mở Sổ Tay Từ Vựng</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedArticle(null);
                          onNavigate('tests');
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Làm Bài Thi Thử</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedArticle(null);
                          onNavigate('brainstorm');
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Brain className="w-3.5 h-3.5 text-white" />
                        <span>Brainstorm Dàn Bài Writing</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Navigation (Previous / Next Article) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3">
              <button
                onClick={handlePrevArticle}
                disabled={currentArticleIndex <= 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  currentArticleIndex > 0
                    ? 'bg-white border border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 shadow-2xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Bài trước</span>
              </button>

              <span className="text-xs text-slate-600 font-semibold">
                Bài {currentArticleIndex + 1} / {filteredArticles.length}
              </span>

              <button
                onClick={handleNextArticle}
                disabled={currentArticleIndex >= filteredArticles.length - 1}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  currentArticleIndex < filteredArticles.length - 1
                    ? 'bg-white border border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 shadow-2xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Bài tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
