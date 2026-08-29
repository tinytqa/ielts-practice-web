import React, { useState, useEffect } from 'react';
import { FileText, Search, BookMarked, Volume2, Plus, Sparkles, CheckCircle2, Gamepad2, Award, Zap, RefreshCw, Copy, Check, Flame, HelpCircle, Trophy, ArrowRight, Share2, Download, Upload, FileUp, Image, ScanText, X, FileSpreadsheet, Edit3, ListPlus, ExternalLink, BookOpen, Clock, Table, Globe, FolderOpen, CheckSquare } from 'lucide-react';
import { VocabWord } from '../types';
import { createVocabSheetInGoogleSheets, fetchVocabFromGoogleSheet, listUserGoogleSheets, SheetVocabItem } from '../lib/googleWorkspace';
import { googleSignIn, getAccessToken } from '../lib/firebaseAuth';

interface KnowledgeVocabViewProps {
  onNavigate?: (tab: string) => void;
  onActivityCompleted?: () => void;
}

export const KnowledgeVocabView: React.FC<KnowledgeVocabViewProps> = ({ onNavigate, onActivityCompleted }) => {
  const [activeSubTab, setActiveSubTab] = useState<'VOCAB' | 'QUIZ'>('VOCAB');
  const [vocabWords, setVocabWords] = useState<VocabWord[]>([]);

  // Google Sheets Export States
  const [isExportingSheet, setIsExportingSheet] = useState<boolean>(false);
  const [exportedSheetUrl, setExportedSheetUrl] = useState<string | null>(null);
  const [sheetExportSuccess, setSheetExportSuccess] = useState<string | null>(null);

  // Dictionary Lookup State
  const [searchWord, setSearchWord] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  // Quizizz Generation & Game States
  const [quizTopic, setQuizTopic] = useState<string>('General IELTS Academic');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<any | null>(null);

  // File Upload OCR & Manual & Google Sheets Quiz States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [extractedWords, setExtractedWords] = useState<any[]>([]);
  const [manualWordsInput, setManualWordsInput] = useState<string>('');
  const [saveManualToNotebook, setSaveManualToNotebook] = useState<boolean>(true);
  const [quizSourceMode, setQuizSourceMode] = useState<'FILE_OCR' | 'MANUAL' | 'PRESETS' | 'GOOGLE_SHEET'>('FILE_OCR');

  // Google Sheets Import States
  const [sheetUrlOrId, setSheetUrlOrId] = useState<string>('');
  const [isFetchingSheet, setIsFetchingSheet] = useState<boolean>(false);
  const [sheetParseError, setSheetParseError] = useState<string | null>(null);
  const [parsedSheetData, setParsedSheetData] = useState<{ title: string; sheetName: string; words: SheetVocabItem[] } | null>(null);
  const [userDriveSheets, setUserDriveSheets] = useState<Array<{ id: string; name: string; modifiedTime?: string; webViewLink?: string }>>([]);
  const [isLoadingDriveSheets, setIsLoadingDriveSheets] = useState<boolean>(false);
  const [showDriveSheetsPicker, setShowDriveSheetsPicker] = useState<boolean>(false);
  const [saveSheetWordsToNotebook, setSaveSheetWordsToNotebook] = useState<boolean>(true);
  
  // Quiz Game Arena State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [userAnswers, setUserAnswers] = useState<{ questionIdx: number; selectedOption: number; isCorrect: boolean }[]>([]);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isCopiedFormat, setIsCopiedFormat] = useState<boolean>(false);

  useEffect(() => {
    fetchVocab();
  }, []);

  const fetchVocab = async () => {
    try {
      const res = await fetch('/api/vocab?user_id=u_student');
      const data = await res.json();
      setVocabWords(data.words || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLookupWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWord.trim() || isSearching) return;
    setIsSearching(true);

    try {
      const res = await fetch('/api/vocab/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: searchWord, user_id: 'u_student' })
      });
      const data = await res.json();
      setLookupResult(data);
      fetchVocab(); // refresh vocab notebook list
      if (onActivityCompleted) onActivityCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Export Vocabulary to Google Sheets
  const handleExportVocabToGoogleSheets = async (customWordsList?: any[], customTitle?: string) => {
    setIsExportingSheet(true);
    setSheetExportSuccess(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signInRes = await googleSignIn();
        token = signInRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('Vui lòng cấp quyền kết nối tài khoản Google để xuất file Google Sheets.');
      }

      const listToExport = customWordsList && customWordsList.length > 0 ? customWordsList : vocabWords;
      if (!listToExport || listToExport.length === 0) {
        throw new Error('Sổ từ vựng đang trống. Hãy tra từ hoặc trích xuất OCR trước khi xuất.');
      }

      const title = customTitle || `IELTS AI - Sổ Tay Từ Vựng Học Thuật (${listToExport.length} từ)`;
      const rows = [
        ['STT', 'Từ Vựng (Vocabulary)', 'Phiên Âm (IPA)', 'Nghĩa Tiếng Việt (Meaning)', 'Câu Ví Dụ Học Thuật (Example Sentence)', 'Ngày Lưu'],
        ...listToExport.map((w, idx) => [
          String(idx + 1),
          w.word || '',
          w.ipa || '',
          w.meaning_vi || w.meaning || '',
          w.example_sentence || w.example || '',
          w.created_at ? new Date(w.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')
        ])
      ];

      const res = await createVocabSheetInGoogleSheets(token, title, rows);
      setExportedSheetUrl(res.url);
      setSheetExportSuccess(`Đã xuất thành công ${listToExport.length} từ vựng sang Google Sheets!`);
    } catch (err: any) {
      console.error("Sheets export error:", err);
      alert(`Không thể xuất sang Google Sheets: ${err.message || err}`);
    } finally {
      setIsExportingSheet(false);
    }
  };

  // Generate Quizizz Questions
  const handleGenerateQuizizz = async (selectedTopic?: string) => {
    const topicToUse = selectedTopic || quizTopic;
    setIsGeneratingQuiz(true);
    setGameState('IDLE');

    try {
      const res = await fetch('/api/vocab/quizizz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          topic: topicToUse
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      } else {
        createFallbackQuizData();
      }
    } catch (err) {
      console.warn("Quizizz fetch notice, generating local fallback:", err);
      createFallbackQuizData();
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Upload File (Image OCR / PDF / DOCX) and Generate Quizizz
  const handleFileUploadAndGenerateQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!uploadFile || isUploadingFile) return;

    setIsUploadingFile(true);
    setIsGeneratingQuiz(true);
    setGameState('IDLE');

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await fetch('/api/vocab/quizizz-upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
        if (data.extracted_words && Array.isArray(data.extracted_words)) {
          const seen = new Set<string>();
          const uniqueList = data.extracted_words.filter((w: any) => {
            const k = (w.word || '').trim().toLowerCase();
            if (!k || seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          setExtractedWords(uniqueList);
          fetchVocab(); // Refresh user vocabulary notebook
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'Có lỗi xảy ra khi đọc tệp.');
      }
    } catch (err) {
      console.error("Upload OCR Quizizz error:", err);
      alert('Không thể tải tệp lên máy chủ.');
    } finally {
      setIsUploadingFile(false);
      setIsGeneratingQuiz(false);
    }
  };

  // Generate Quizizz from Manual Input Words
  const handleManualWordsGenerateQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualWordsInput.trim()) return;

    setIsGeneratingQuiz(true);
    setGameState('IDLE');

    try {
      const res = await fetch('/api/vocab/quizizz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          topic: 'Nhập Tay Cá Nhân',
          manual_words: manualWordsInput,
          save_to_notebook: saveManualToNotebook
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
        if (saveManualToNotebook) {
          fetchVocab(); // Refresh user vocabulary notebook
        }
      } else {
        createFallbackQuizData();
      }
    } catch (err) {
      console.warn("Manual words quizizz error:", err);
      createFallbackQuizData();
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Google Sheets Import Handlers
  const handleFetchGoogleSheetVocab = async (targetUrlOrId?: string) => {
    const inputVal = targetUrlOrId || sheetUrlOrId;
    if (!inputVal.trim()) {
      setSheetParseError('Vui lòng nhập đường link Google Sheet (URL) hoặc mã Spreadsheet ID.');
      return;
    }

    setIsFetchingSheet(true);
    setSheetParseError(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        // Attempt login if available, but if user cancels, fetchVocabFromGoogleSheet will still try public CSV
        try {
          const signInRes = await googleSignIn();
          token = signInRes?.accessToken || null;
        } catch {
          // continue to try public mode
        }
      }

      const result = await fetchVocabFromGoogleSheet(token, inputVal);
      setParsedSheetData(result);
      if (result.words.length > 0) {
        setSheetUrlOrId(inputVal);
      }
    } catch (err: any) {
      console.error("Google sheet import error:", err);
      setSheetParseError(err.message || 'Không thể trích xuất từ vựng từ Google Sheet.');
    } finally {
      setIsFetchingSheet(false);
    }
  };

  const handleGenerateQuizFromSheet = async () => {
    if (!parsedSheetData || !parsedSheetData.words || parsedSheetData.words.length === 0) return;

    setIsGeneratingQuiz(true);
    setGameState('IDLE');

    try {
      const res = await fetch('/api/vocab/quizizz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          topic: `Google Sheet: ${parsedSheetData.title}`,
          sheet_words: parsedSheetData.words,
          save_to_notebook: saveSheetWordsToNotebook
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
        if (saveSheetWordsToNotebook) {
          fetchVocab();
        }
      } else {
        createFallbackQuizData();
      }
    } catch (err) {
      console.warn("Sheet quiz generate error:", err);
      createFallbackQuizData();
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleLoadDriveSheets = async () => {
    setIsLoadingDriveSheets(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signInRes = await googleSignIn();
        token = signInRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('Vui lòng đăng nhập tài khoản Google để duyệt bảng tính từ Google Drive.');
      }
      const sheets = await listUserGoogleSheets(token);
      setUserDriveSheets(sheets);
      setShowDriveSheetsPicker(true);
    } catch (err: any) {
      alert(`Không thể lấy danh sách Google Sheets: ${err.message || err}`);
    } finally {
      setIsLoadingDriveSheets(false);
    }
  };

  const createFallbackQuizData = () => {
    const questionsFromVocab = vocabWords.length > 0
      ? vocabWords.map((vw, idx) => ({
          question: `Nghĩa chuẩn của từ vựng IELTS "${vw.word}" ${vw.ipa ? `(${vw.ipa})` : ''} là gì?`,
          options: [
            vw.meaning_vi,
            "sự phát triển nhanh chóng ngoài dự kiến",
            "khả năng thích ứng với môi trường",
            "sự duy trì và bảo tồn sinh thái"
          ],
          correct_index: 0,
          explanation: `Từ "${vw.word}" nghĩa là: ${vw.meaning_vi}. Ví dụ: ${vw.example_sentence || 'N/A'}`,
          word_target: vw.word
        }))
      : [];

    const defaultQuestions = [
      {
        question: "Nghĩa tiếng Việt chuẩn của từ vựng 'deterioration' là gì?",
        options: ["sự suy giảm, làm tệ đi", "sự phát triển vượt bậc", "sự bảo tồn nguyên vẹn", "sự thay thế tạm thời"],
        correct_index: 0,
        explanation: "Deterioration (noun) chỉ quá trình trở nên tồi tệ hơn, suy giảm chất lượng.",
        word_target: "deterioration"
      },
      {
        question: "Điền từ phù hợp vào chỗ trống: 'Rising carbon emissions will ___ existing climate issues.'",
        options: ["exacerbate", "ameliorate", "conserve", "synthesize"],
        correct_index: 0,
        explanation: "Exacerbate (verb) = làm trầm trọng thêm vấn đề tiêu cực.",
        word_target: "exacerbate"
      },
      {
        question: "Từ vựng nào đồng nghĩa với 'crucial' / 'extremely important' trong bài IELTS Writing?",
        options: ["indispensable", "superficial", "redundant", "trivial"],
        correct_index: 0,
        explanation: "Indispensable (adj) = không thể thiếu, rất quan trọng.",
        word_target: "indispensable"
      },
      {
        question: "Collocation chuẩn cho bài Writing Task 2: 'play an ___ role in economic growth'",
        options: ["integral", "irrelevant", "arbitrary", "ephemeral"],
        correct_index: 0,
        explanation: "Play an integral role = đóng vai trò không thể thiếu / thiết yếu.",
        word_target: "integral"
      },
      {
        question: "Từ nào mang nghĩa 'chưa từng có tiền lệ' trong IELTS Writing & Speaking?",
        options: ["unprecedented", "conventional", "predictable", "monotonous"],
        correct_index: 0,
        explanation: "Unprecedented (adj) = chưa từng xảy ra trong quá khứ.",
        word_target: "unprecedented"
      }
    ];

    const finalQuestions = [...questionsFromVocab, ...defaultQuestions].slice(0, 8);
    setQuizData({
      title: `Bộ Quiz Ôn Luyện Từ Vựng Sổ Tay (${finalQuestions.length} câu)`,
      questions: finalQuestions
    });
  };

  const startQuizGame = () => {
    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      handleGenerateQuizizz();
      return;
    }
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setUserAnswers([]);
    setGameState('PLAYING');
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const currentQ = quizData.questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.correct_index;

    let pointsEarned = 0;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      // Score multiplier based on streak: x1, x2, x3, x5
      const multiplier = newStreak >= 5 ? 5 : newStreak >= 3 ? 3 : newStreak >= 2 ? 2 : 1;
      pointsEarned = 100 * multiplier;
      setScore(prev => prev + pointsEarned);
    } else {
      setStreak(0);
    }

    setUserAnswers(prev => [...prev, {
      questionIdx: currentQuestionIndex,
      selectedOption: optionIndex,
      isCorrect
    }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < quizData.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState('FINISHED');
    }
  };

  // Generate Quiz Copyable Import Format
  const getQuizCopyText = () => {
    if (!quizData || !quizData.questions) return '';
    return quizData.questions.map((q: any, i: number) => {
      const opts = q.options.join('\t');
      return `Q${i + 1}: ${q.question}\t${opts}\tCorrect Option: ${q.correct_index + 1}\tTime: 15s\tExplanation: ${q.explanation}`;
    }).join('\n');
  };

  const handleCopyQuizFormat = () => {
    const text = getQuizCopyText();
    navigator.clipboard.writeText(text);
    setIsCopiedFormat(true);
    setTimeout(() => setIsCopiedFormat(false), 2500);
  };

  const quizOptionColors = [
    'from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white',
    'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white',
    'from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white',
    'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-emerald-600" />
            Thư Viện Từ Vựng & Đấu Trí Quiz
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tra cứu từ vựng IELTS, lưu sổ tay tự động & ôn luyện bằng bộ câu hỏi game Quiz tương tác cao.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('VOCAB')}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'VOCAB' ? 'btn-glossy-emerald font-extrabold text-white shadow-sm' : 'font-medium text-slate-700 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Sổ Từ Vựng ({vocabWords.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('QUIZ')}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'QUIZ' ? 'btn-glossy-emerald font-extrabold text-white shadow-sm' : 'font-medium text-slate-700 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
            <span>🎮 Tạo Quiz & Đấu Trí</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: VOCABULARY NOTEBOOK & LOOKUP */}
      {activeSubTab === 'VOCAB' && (
        <div className="space-y-6">
          {/* Quick Quiz Banner CTA */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" /> Ôn tập tương tác Quiz
              </div>
              <h2 className="text-base font-black">Biến Sổ Từ Vựng Thành Bộ Quiz Trắc Nghiệm Đấu Trí</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Luyện tập ghi nhớ phản xạ 8 từ vựng với chế độ x2 x5 Combo Streak, tính điểm thời gian và kiểm tra độ chính xác tức thì.
              </p>
            </div>

            <button
              onClick={() => setActiveSubTab('QUIZ')}
              className="px-5 py-3 bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold text-xs rounded-2xl shadow-lg cursor-pointer transition flex items-center justify-center gap-2 self-start md:self-auto"
            >
              <Gamepad2 className="w-4 h-4 text-slate-950" />
              <span>Chuyển Sang Tab Tạo Quiz</span>
            </button>
          </div>

          {/* Quick Dictionary Lookup Search Bar */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 shadow-sm">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tra Cứu Từ Điển & Lưu Sổ Từ Vựng</h2>
            <form onSubmit={handleLookupWord} className="flex gap-2.5">
              <input
                type="text"
                placeholder="Nhập từ tiếng Anh (VD: deterioration, exacerbate, indispensable)..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isSearching || !searchWord.trim()}
                className="px-5 py-2.5 rounded-2xl btn-glossy-emerald font-black text-xs transition cursor-pointer flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-white" />
                <span>{isSearching ? 'Đang tra...' : 'Tra & Lưu Từ Vựng'}</span>
              </button>
            </form>

            {lookupResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-black text-slate-900">{lookupResult.word}</h3>
                  <span className="text-slate-500 font-mono font-medium">{lookupResult.ipa}</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md uppercase">
                    {lookupResult.part_of_speech}
                  </span>
                </div>
                <p className="text-slate-800 font-medium">Nghĩa: <strong className="text-emerald-700 font-bold">{lookupResult.meaning_vi}</strong></p>
                <p className="text-slate-700 italic font-serif">"{lookupResult.example_sentence}"</p>
                <div className="pt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã tự động lưu vào Sổ từ vựng cá nhân!</span>
                </div>
              </div>
            )}
          </div>

          {/* User's Vocabulary Notebook List */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                Từ Vựng Đã Lưu Trong Sổ Tay ({vocabWords.length} từ)
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportVocabToGoogleSheets()}
                  disabled={isExportingSheet || vocabWords.length === 0}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs disabled:opacity-50"
                  title="Xuất danh sách sổ từ vựng thành bảng tính Google Sheets"
                >
                  {isExportingSheet ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                      <span>Đang xuất sang Google Sheets...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Xuất Bảng Từ Vựng Sang Google Sheets</span>
                    </>
                  )}
                </button>

                {exportedSheetUrl && (
                  <a
                    href={exportedSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở Google Sheets ↗</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    setActiveSubTab('QUIZ');
                    handleGenerateQuizizz();
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Luyện Quiz từ vựng này</span>
                </button>
              </div>
            </div>

            {sheetExportSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{sheetExportSuccess}</span>
                </div>
                {exportedSheetUrl && (
                  <a
                    href={exportedSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline text-emerald-800 hover:text-emerald-950 shrink-0 flex items-center gap-1"
                  >
                    <span>Xem bảng tính Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vocabWords.map((vw) => (
                <div key={vw.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900">{vw.word}</h3>
                    <span className="text-xs font-mono text-slate-500 font-medium">{vw.ipa}</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-bold">{vw.meaning_vi}</p>
                  {vw.example_sentence && (
                    <p className="text-[11px] text-slate-600 italic pt-1 font-serif">"{vw.example_sentence}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: QUIZ GENERATOR & ARENA */}
      {activeSubTab === 'QUIZ' && (
        <div className="space-y-6">
          {/* Quiz Generator Header Controls */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-amber-500" />
                  Công Cụ Sinh Quiz Từ Vựng AI & Đấu Trí
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tạo nhanh bộ trắc nghiệm 8 câu hỏi chuẩn định dạng Quiz từ từ vựng cá nhân hoặc theo chủ đề IELTS.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  disabled={!quizData}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Xuất Đề Quiz</span>
                </button>

                <button
                  onClick={startQuizGame}
                  disabled={isGeneratingQuiz || !quizData}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-white" />
                  <span>Bắt Đầu Chơi Quiz</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setQuizSourceMode('GOOGLE_SHEET')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  quizSourceMode === 'GOOGLE_SHEET'
                    ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>📊 Nhập Từ Google Sheet</span>
              </button>

              <button
                onClick={() => setQuizSourceMode('FILE_OCR')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  quizSourceMode === 'FILE_OCR'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ScanText className="w-4 h-4" />
                <span>📸 Tải Tệp / Ảnh OCR</span>
              </button>

              <button
                onClick={() => setQuizSourceMode('MANUAL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  quizSourceMode === 'MANUAL'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>✏️ Nhập Tay Từ Vựng</span>
              </button>

              <button
                onClick={() => setQuizSourceMode('PRESETS')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  quizSourceMode === 'PRESETS'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>📚 Từ Sổ Tay / Preset</span>
              </button>
            </div>

            {/* Mode 0: GOOGLE SHEETS IMPORT */}
            {quizSourceMode === 'GOOGLE_SHEET' && (
              <div className="p-4 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Nhập Từ Vựng Trực Tiếp Từ Google Sheets Để Tạo Quiz</span>
                  </div>

                  <button
                    onClick={handleLoadDriveSheets}
                    disabled={isLoadingDriveSheets}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[11px] rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-xs w-fit"
                  >
                    {isLoadingDriveSheets ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>Đang duyệt Google Drive...</span>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Duyệt Sheets Từ Google Drive</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-600">
                  Dán link bất kỳ file Google Sheets nào chứa danh sách từ vựng IELTS của bạn (hoặc chọn từ Drive). AI sẽ tự động đọc các cột <em>Từ vựng, Phiên âm, Nghĩa tiếng Việt, Ví dụ</em> để biên soạn bộ câu hỏi Quiz trắc nghiệm chuẩn chỉnh!
                </p>

                {/* URL Input Form */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={sheetUrlOrId}
                        onChange={(e) => setSheetUrlOrId(e.target.value)}
                        placeholder="Dán link Google Sheet (e.g. https://docs.google.com/spreadsheets/d/...)"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-xs"
                      />
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>

                    <button
                      onClick={() => handleFetchGoogleSheetVocab()}
                      disabled={isFetchingSheet || !sheetUrlOrId.trim()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      {isFetchingSheet ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang Đọc Sheet...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Đọc Từ Vựng</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sheetParseError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 flex items-start gap-2">
                      <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{sheetParseError}</span>
                    </div>
                  )}
                </div>

                {/* Drive Sheets Picker Modal / Dropdown */}
                {showDriveSheetsPicker && userDriveSheets.length > 0 && (
                  <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Chọn bảng tính từ Google Drive của bạn:</span>
                      <button
                        onClick={() => setShowDriveSheetsPicker(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-slate-100">
                      {userDriveSheets.map((sh) => (
                        <div
                          key={sh.id}
                          onClick={() => {
                            setSheetUrlOrId(sh.id);
                            handleFetchGoogleSheetVocab(sh.id);
                            setShowDriveSheetsPicker(false);
                          }}
                          className="p-2 hover:bg-emerald-50 rounded-lg cursor-pointer flex items-center justify-between text-xs transition"
                        >
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate max-w-[280px]">{sh.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">Chọn file này</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parsed Vocabulary Preview Table */}
                {parsedSheetData && (
                  <div className="space-y-3 pt-2 border-t border-emerald-200/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Đã nạp {parsedSheetData.words.length} từ vựng từ "{parsedSheetData.title}"
                        </span>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveSheetWordsToNotebook}
                          onChange={(e) => setSaveSheetWordsToNotebook(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded-md focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Lưu vào Sổ Tay Từ Vựng Cá Nhân</span>
                      </label>
                    </div>

                    {/* Compact preview list */}
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 shadow-xs">
                      {parsedSheetData.words.slice(0, 10).map((w, idx) => (
                        <div key={idx} className="p-2.5 text-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                            <span className="font-bold text-slate-900">{w.word}</span>
                            {w.ipa && <span className="text-[11px] text-amber-600 font-mono">{w.ipa}</span>}
                            <span className="text-slate-600 truncate">{w.meaning_vi}</span>
                          </div>
                          {w.example_sentence && (
                            <span className="text-[10px] text-slate-400 italic hidden md:inline truncate max-w-xs">
                              "{w.example_sentence}"
                            </span>
                          )}
                        </div>
                      ))}
                      {parsedSheetData.words.length > 10 && (
                        <div className="p-2 text-center text-[10px] font-bold text-slate-400 bg-slate-50">
                          + {parsedSheetData.words.length - 10} từ vựng khác trong Sheet...
                        </div>
                      )}
                    </div>

                    {/* Action Button: Generate Quiz from Sheet */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleGenerateQuizFromSheet}
                        disabled={isGeneratingQuiz}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingQuiz ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>AI Đang Biên Soạn Quiz Từ Sheet...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-emerald-200" />
                            <span>AI Tạo Bộ Quiz (8 câu) Từ Google Sheet Này</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 1: File Upload OCR */}
            {quizSourceMode === 'FILE_OCR' && (
              <div className="p-4 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-slate-50 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI OCR Trích Xuất Từ Vựng Từ Tệp (Ảnh, PDF, TXT, DOCX)</span>
                </div>

                <p className="text-[11px] text-slate-600">
                  Hỗ trợ tải lên ảnh chụp sách, bài học, tài liệu PDF, file văn bản... AI Gemini sẽ tự động dùng công nghệ <strong>OCR quang học</strong> để đọc nội dung, lọc từ vựng IELTS chất lượng và tạo bộ Quiz 8 câu hỏi tương tác!
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white p-3.5 rounded-xl text-center space-y-1 transition">
                      <div className="flex items-center justify-center gap-2 text-slate-700 font-bold text-xs">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>{uploadFile ? uploadFile.name : 'Nhấp để chọn tệp hoặc kéo thả vào đây...'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Chấp nhận .jpg, .png, .pdf, .txt, .docx (Tối đa 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf,.txt,.docx,.csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {uploadFile && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFileUploadAndGenerateQuiz}
                        disabled={isUploadingFile || isGeneratingQuiz}
                        className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        {isUploadingFile ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>OCR Đang Đọc Tệp...</span>
                          </>
                        ) : (
                          <>
                            <ScanText className="w-4 h-4" />
                            <span>AI Đọc Tệp & Tạo Quiz</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setUploadFile(null)}
                        className="p-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl cursor-pointer text-xs"
                        title="Xóa tệp"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Manual Word Input */}
            {quizSourceMode === 'MANUAL' && (
              <div className="p-4 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-slate-50 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <span>Nhập Tay Danh Sách Từ Vựng Cần Export/Tạo Quiz</span>
                </div>

                <p className="text-[11px] text-slate-600">
                  Nhập hoặc dán danh sách các từ vựng / cụm từ tiếng Anh bạn muốn ôn (phân cách bằng dấu phẩy, phẩy chấm hoặc xuống dòng). AI sẽ biên soạn ngay bộ câu hỏi Quiz trắc nghiệm riêng cho danh sách từ của bạn!
                </p>

                <div className="space-y-3">
                  <textarea
                    value={manualWordsInput}
                    onChange={(e) => setManualWordsInput(e.target.value)}
                    rows={3}
                    placeholder="Ví dụ: exacerbate, deterioration, unsustainable, mitigation, digital transformation, artificial intelligence..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-y"
                  />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveManualToNotebook}
                        onChange={(e) => setSaveManualToNotebook(e.target.checked)}
                        className="w-4 h-4 text-amber-600 border-slate-300 rounded-md focus:ring-amber-500 cursor-pointer"
                      />
                      <span>Tự động lưu từ nhập tay vào Sổ Tay Từ Vựng Cá Nhân</span>
                    </label>

                    <button
                      onClick={handleManualWordsGenerateQuiz}
                      disabled={isGeneratingQuiz || !manualWordsInput.trim()}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang Biên Soạn Quiz...</span>
                        </>
                      ) : (
                        <>
                          <ListPlus className="w-4 h-4" />
                          <span>Tạo Quizizz Từ Từ Vựng Nhập Tay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Topic Presets */}
            {quizSourceMode === 'PRESETS' && (
              <div className="pt-2 space-y-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Chọn Nguồn Từ Vựng / Chủ Đề Tạo Quizizz:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setQuizTopic('Personal Notebook')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                      quizTopic === 'Personal Notebook'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-extrabold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>Từ Sổ Từ Vựng ({vocabWords.length} từ)</span>
                  </button>

                  {[
                    'Environment & Climate',
                    'Technology & AI',
                    'Education & Career',
                    'Health & Society',
                    'Economy & Globalisation'
                  ].map((tp) => (
                    <button
                      key={tp}
                      onClick={() => setQuizTopic(tp)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        quizTopic === tp
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-extrabold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tp}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleGenerateQuizizz(quizTopic)}
                    disabled={isGeneratingQuiz}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang Biên Soạn Quiz...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Tạo Quiz Từ Chủ Đề "{quizTopic === 'Personal Notebook' ? 'Sổ từ vựng cá nhân' : quizTopic}"</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isGeneratingQuiz && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-800">AI đang thiết kế bộ câu hỏi Quiz tương tác...</p>
              <p className="text-xs text-slate-500">Tạo 4 phương án lựa chọn, gài bẫy từ vựng & soạn lời giải thích chi tiết.</p>
            </div>
          )}

          {/* INITIAL STATE BEFORE QUIZ GENERATION */}
          {!isGeneratingQuiz && gameState === 'IDLE' && !quizData && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Chưa Có Bộ Quiz Nào Được Tạo</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Vui lòng chọn 1 trong 3 phương thức ở trên (<strong>Tải tệp/ảnh OCR</strong>, <strong>Nhập tay từ vựng</strong>, hoặc <strong>Chọn chủ đề/Sổ từ vựng</strong>) rồi nhấn nút <strong>"Tạo Quiz"</strong> để AI tiến hành tạo câu hỏi.
              </p>
            </div>
          )}

          {/* GAME STATE 1: IDLE - PREVIEW QUIZ QUESTIONS */}
          {!isGeneratingQuiz && gameState === 'IDLE' && quizData && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{quizData.title}</h3>
                  <p className="text-xs text-slate-500">Bộ câu hỏi đã sẵn sàng ({quizData.questions?.length || 0} câu trắc nghiệm)</p>
                </div>

                <button
                  onClick={startQuizGame}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-2xl shadow-lg cursor-pointer transition flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Vào Đấu Trí Quiz Ngay</span>
                </button>
              </div>

              {/* Extracted Words Banner if Quiz was generated from OCR File */}
              {extractedWords.length > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI OCR đã trích xuất thành công {extractedWords.length} từ vựng từ tệp và tự động lưu vào Sổ tay của bạn:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {extractedWords.map((ew, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 shadow-2xs">
                        {ew.word} <span className="text-[10px] text-slate-500 font-normal">({ew.meaning_vi})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Preview List */}
              <div className="space-y-3">
                {quizData.questions?.map((q: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs">
                        Câu {idx + 1}: {q.question}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                        Target: {q.word_target}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt: string, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs font-medium ${
                            optIdx === q.correct_index
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GAME STATE 2: PLAYING LIVE QUIZ GAME */}
          {!isGeneratingQuiz && gameState === 'PLAYING' && quizData && (
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
              {/* Quiz Live Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 font-extrabold text-xs flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4" />
                    <span>QUIZ LIVE</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-300">
                    Câu {currentQuestionIndex + 1} / {quizData.questions.length}
                  </span>
                </div>

                {/* Score & Combo Multiplier */}
                <div className="flex items-center gap-4">
                  {streak >= 2 && (
                    <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 animate-bounce shadow-lg">
                      <Flame className="w-4 h-4 fill-slate-950" />
                      <span>{streak}x COMBO STREAK!</span>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Điểm Số</span>
                    <span className="text-lg font-black text-amber-400">{score}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                />
              </div>

              {/* Current Question */}
              {quizData.questions[currentQuestionIndex] && (
                <div className="space-y-6 py-2">
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 text-center space-y-2 shadow-inner">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                      Từ Vựng Mục Tiêu: {quizData.questions[currentQuestionIndex].word_target}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold leading-relaxed text-white">
                      {quizData.questions[currentQuestionIndex].question}
                    </h3>
                  </div>

                  {/* 4 Quiz Color Option Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizData.questions[currentQuestionIndex].options.map((opt: string, optIdx: number) => {
                      const isCorrectOpt = optIdx === quizData.questions[currentQuestionIndex].correct_index;
                      const isSelected = selectedOption === optIdx;

                      let btnStyle = `bg-gradient-to-r ${quizOptionColors[optIdx % 4]} opacity-90 hover:opacity-100 shadow-md`;
                      if (isAnswered) {
                        if (isCorrectOpt) {
                          btnStyle = 'bg-emerald-600 text-white ring-4 ring-emerald-400 font-bold shadow-lg';
                        } else if (isSelected && !isCorrectOpt) {
                          btnStyle = 'bg-rose-600 text-white opacity-60 line-through';
                        } else {
                          btnStyle = 'bg-slate-800 text-slate-400 opacity-40';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`p-4 rounded-2xl text-left text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-xs font-black">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </span>

                          {isAnswered && isCorrectOpt && (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instant Explanation & Next Button */}
                  {isAnswered && (
                    <div className="p-5 bg-slate-800/90 border border-slate-700 rounded-2xl space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedOption === quizData.questions[currentQuestionIndex].correct_index ? (
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Chính xác! (+100 điểm)
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold">
                              ❌ Chưa chính xác
                            </span>
                          )}
                        </div>

                        <button
                          onClick={handleNextQuestion}
                          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <span>{currentQuestionIndex + 1 < quizData.questions.length ? 'Câu Tiếp Theo' : 'Xem Kết Quả Đấu Trí'}</span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 font-medium">
                        <strong className="text-amber-300">Giải thích AI:</strong> {quizData.questions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GAME STATE 3: FINISHED - FINAL SUMMARY SCOREBOARD */}
          {!isGeneratingQuiz && gameState === 'FINISHED' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-6 shadow-sm">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <Trophy className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-black text-slate-900">Hoàn Thành Đấu Trí Quiz!</h2>
                <p className="text-xs text-slate-500">
                  Bạn đã xuất sắc hoàn thành bộ trắc nghiệm từ vựng IELTS.
                </p>

                {/* Score Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Tổng Điểm</span>
                    <span className="text-lg font-black text-amber-600">{score}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Max Streak</span>
                    <span className="text-lg font-black text-orange-600">🔥 {maxStreak}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Độ Chính Xác</span>
                    <span className="text-lg font-black text-emerald-600">
                      {Math.round((userAnswers.filter(a => a.isCorrect).length / (quizData?.questions?.length || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={startQuizGame}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer hover:from-amber-600 hover:to-orange-700 transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Chơi Lại Bài Quiz Này</span>
                </button>

                <button
                  onClick={() => setShowExportModal(true)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl border border-slate-200 transition cursor-pointer flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span>Xuất Mã Đề Quiz</span>
                </button>
              </div>
            </div>
          )}

          {/* QUIZ FORMAT EXPORT MODAL */}
          {showExportModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-extrabold text-slate-900">Mã Xuất Đề Định Dạng Quiz</h3>
                  </div>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer text-xs font-bold"
                  >
                    ✕ Đóng
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Sao chép đoạn mã dưới đây để dán trực tiếp vào công cụ trắc nghiệm, tạo đề thi hoặc lưu trữ trong **Google Sheets / Excel**:
                </p>

                <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto max-h-64 whitespace-pre border border-slate-800 shadow-inner">
                  {getQuizCopyText()}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-500 font-medium">Đã sẵn sàng {quizData?.questions?.length || 0} câu hỏi trắc nghiệm</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!quizData?.questions) return;
                        const rows = [
                          ['STT', 'Câu Hỏi (Question Prompt)', 'Đáp Án A', 'Đáp Án B', 'Đáp Án C', 'Đáp Án D', 'Đáp Án Đúng (Correct Answer)', 'Giải Thích (Explanation)', 'Từ Mục Tiêu (Word Target)'],
                          ...quizData.questions.map((q: any, i: number) => {
                            const correctIdx = q.correct_index ?? 0;
                            const correctText = q.options?.[correctIdx] || `Đáp án #${correctIdx + 1}`;
                            return [
                              String(i + 1),
                              q.question || q.prompt || '',
                              q.options?.[0] || '',
                              q.options?.[1] || '',
                              q.options?.[2] || '',
                              q.options?.[3] || '',
                              correctText,
                              q.explanation || '',
                              q.word_target || ''
                            ];
                          })
                        ];
                        try {
                          setIsExportingSheet(true);
                          let token = await getAccessToken();
                          if (!token) {
                            const signInRes = await googleSignIn();
                            token = signInRes?.accessToken || null;
                          }
                          if (!token) throw new Error('Vui lòng đăng nhập Google.');
                          const res = await createVocabSheetInGoogleSheets(token, `IELTS AI Quiz Question Bank - ${quizTopic || 'Vocabulary'}`, rows);
                          setExportedSheetUrl(res.url);
                          setSheetExportSuccess('Đã xuất toàn bộ câu hỏi trắc nghiệm Quiz sang Google Sheets thành công!');
                          window.open(res.url, '_blank');
                        } catch (e: any) {
                          alert(`Lỗi xuất sang Google Sheets: ${e.message || e}`);
                        } finally {
                          setIsExportingSheet(false);
                        }
                      }}
                      disabled={isExportingSheet}
                      className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      <span>{isExportingSheet ? 'Đang xuất Sheet...' : 'Xuất Ra Google Sheets'}</span>
                    </button>

                    <button
                      onClick={handleCopyQuizFormat}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5"
                    >
                      {isCopiedFormat ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Đã Sao Chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-white" />
                          <span>Sao Chép Định Dạng</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
