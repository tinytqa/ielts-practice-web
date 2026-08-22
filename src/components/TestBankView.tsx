import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Clock, CheckCircle2, AlertCircle, Play, Pause, 
  RotateCcw, ArrowLeft, ArrowRight, Volume2, Bookmark, Check, 
  X, Filter, Layers, Zap, Award, Sparkles, ChevronRight, HelpCircle,
  Edit3, Copy, Trash2, Image as ImageIcon, Compass
} from 'lucide-react';
import { TestItem, TestSection, Question } from '../types';
import { Task1MapDiagram } from './Task1MapDiagram';
import { Task1BandDescriptorsModal } from './Task1BandDescriptorsModal';
import { EssayErrorHighlightViewer } from './EssayErrorHighlightViewer';
import { SpeakingGraderView } from './SpeakingGraderView';
import { ListeningTestPlayer } from './ListeningTestPlayer';
import { ListeningScoreTableModal } from './ListeningScoreTableModal';

interface TestBankViewProps {
  initialSkill?: string;
  onTestCompleted: () => void;
}

const DEFAULT_TASK1_SAMPLE_ESSAY_BAND9 =
  `The two maps delineate the archaeological excavations and infrastructural developments carried out at a designated historic site over a ten-year period from 2004 to 2014.

Overall, the site underwent extensive transformation, characterized by significant archaeological discoveries, the expansion of residential dwellings, and the conversion of natural features into newly excavated ancient amenities, whilst the coastal temple remained entirely undisturbed.

In 2004, the western portion of the area was dominated by woodland, and the northern boundary was defined by a mountain range. The archaeological remnants were relatively sparse, comprising only two ancient houses in the northeast and an ancient temple situated along the eastern coastline.

A decade later, comprehensive excavations markedly reshaped the topography. In the north, the mountains were leveled to accommodate an extensive cluster of ancient houses, supplemented by the discovery of an ancient toilet facility in the north-central sector. The woodland in the west was cleared to make way for a newly unearthed ancient stadium in the northwest, with a smaller grove of trees being replanted toward the southwest. Furthermore, an ancient palace was excavated in the south-central zone. Throughout this period of excavation and reorganization, the ancient temple on the eastern coast was preserved in its original location.`;

const DEFAULT_TASK1_SAMPLE_ESSAY_BAND8 =
  `The two maps illustrate the developments and archaeological findings that took place at a historic site between 2004 and 2014.

Overall, the historic area witnessed considerable expansion and modernisation over the ten-year period. Most notably, several new ancient facilities were excavated, the number of residential dwellings increased significantly, and open green spaces were replaced by newly uncovered structures, while the ancient temple remained unchanged.

In 2004, the western portion of the site was primarily occupied by a cluster of trees, while the northern section featured natural mountain peaks. To the northeast, only two ancient houses had been unearthed, and an ancient temple stood in the central-eastern zone bordering the sea to the east.

By 2014, substantial archaeological discoveries were made across the site. In the northwest, the trees were replaced by an ancient stadium, and an ancient toilet was discovered in the north-central area. The mountain area in the north was cleared, making way for a large cluster of ancient houses. Furthermore, an ancient palace was excavated in the south-central sector, and a smaller group of trees was relocated to the southwest. Meanwhile, the ancient temple on the eastern coast remained in its original location throughout the decade.`;

const DEFAULT_TASK2_SAMPLE_ESSAY_BAND9 =
  `In contemporary society, disparities in work ethic and diligence are conspicuous across both educational and occupational spheres. While some individuals demonstrate an extraordinary commitment to industriousness, others adopt a more moderate approach. This divergence is driven primarily by internal aspirations and socioeconomic competition; furthermore, although hard work is fundamentally advantageous, unmitigated industriousness can precipitate detrimental personal consequences.

The disparity in exertion among individuals stems from a confluence of psychological motivation and external pressures. Internally, individuals propelled by profound intrinsic ambition or distinct vocational targets exhibit elevated levels of perseverance. For instance, scholars vying for elite academic fellowships or professionals pursuing rapid vertical career mobility often display remarkable self-discipline and an innate willingness to endure rigorous workloads. Externally, intensified market competitiveness and familial or socioeconomic expectations frequently exert compelling pressure on individuals, forcing them to outwork their peers in order to secure fiscal security and social distinction.

Nonetheless, relentless exertion is not unequivocally positive and must be approached with caution. On the one hand, sustained diligence is undeniably the cornerstone of mastery, innovation, and socioeconomic advancement, fostering individual resilience and collective prosperity. On the other hand, chronic overexertion invariably compromises physical health and psychological equilibrium. When industriousness deteriorates into workaholism—characterized by pervasive sleep deprivation, chronic stress, and the erosion of interpersonal connections—it often triggers burnout and paradoxically diminishes long-term productivity. Consequently, the virtue of diligence must be harmonized with restorative rest and holistic well-being to remain sustainable.

In conclusion, personal ambition and prevailing societal competition explain why certain individuals labor more intensely than others. While hard work remains an indispensable catalyst for personal and societal achievement, it should not be pursued unconditionally at the expense of mental and physical health.`;

const DEFAULT_TASK2_SAMPLE_ESSAY_BAND8 =
  `In contemporary society, variations in work ethic are evident in both academic institutions and professional environments, with some individuals demonstrating significantly higher levels of diligence than their peers. This disparity can be attributed to several psychological and socio-economic factors, and while industriousness generally brings substantial benefits, excessive diligence is not always advantageous.

To begin with, the inclination to work harder stems primarily from intrinsic motivation and external competitive pressures. From an internal perspective, individuals with clear long-term career aspirations or academic goals often exhibit stronger discipline and self-drive. For instance, ambitious students striving for prestigious university scholarships are naturally willing to dedicate long hours to their studies. Externally, high socio-economic expectations and intense job market competition compel people to exert relentless effort to secure employment stability or accelerate career advancement.

However, working excessively hard is not invariably positive and can lead to severe personal repercussions. On the one hand, perseverance and diligence are indispensable for mastering complex skills, achieving professional excellence, and boosting economic productivity. On the other hand, chronic overwork frequently causes physical exhaustion and mental burnout. When individuals sacrifice sleep, leisure, and family relationships in pursuit of occupational success, their overall well-being deteriorates, ultimately leading to diminished productivity and chronic stress. Therefore, maintaining a sustainable work-life balance is crucial.

In conclusion, personal ambition and external socioeconomic competitiveness drive some people to work harder than others. While hard work is a fundamental prerequisite for success, it must be balanced with adequate rest and well-being to avoid detrimental consequences.`;

export const TestBankView: React.FC<TestBankViewProps> = ({ initialSkill = 'ALL', onTestCompleted }) => {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>(initialSkill);
  
  // Selected Test for Modal or Active Practice
  const [activeTest, setActiveTest] = useState<TestItem | null>(null);
  const [sections, setSections] = useState<TestSection[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [mode, setMode] = useState<'SIMULATION' | 'PRACTICE'>('PRACTICE');
  
  // Practice specific config
  const [practiceSectionId, setPracticeSectionId] = useState<string | 'ALL'>('ALL');
  const [practiceTimeMinutes, setPracticeTimeMinutes] = useState<number>(20);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState<boolean>(false);
  const [modalTestTarget, setModalTestTarget] = useState<TestItem | null>(null);
  const [modalSections, setModalSections] = useState<TestSection[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState<boolean>(false);

  // Score Conversion Table Modal
  const [isScoreTableModalOpen, setIsScoreTableModalOpen] = useState<boolean>(false);
  const [isListeningScoreModalOpen, setIsListeningScoreModalOpen] = useState<boolean>(false);
  const [isWritingCriteriaModalOpen, setIsWritingCriteriaModalOpen] = useState<boolean>(false);

  // Active Test State
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [writingTask1Essay, setWritingTask1Essay] = useState<string>('');
  const [writingTask2Essay, setWritingTask2Essay] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(3600);
  const [initialTimeSeconds, setInitialTimeSeconds] = useState<number>(3600);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'WRONG_ONLY'>('ALL');
  const [writingResultTab, setWritingResultTab] = useState<'OVERVIEW' | 'TASK_1' | 'TASK_2'>('OVERVIEW');

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handlePasteClipboard = async (orderIndex: number) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (orderIndex === 1) setWritingTask1Essay(text);
        else setWritingTask2Essay(text);
      }
    } catch (err) {
      console.warn("Could not read clipboard:", err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [selectedSkillFilter]);

  const fetchTests = async () => {
    try {
      const res = await fetch(`/api/tests?skill=${selectedSkillFilter}`);
      const data = await res.json();
      setTests(data.tests || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Practice Setup Modal
  const handleOpenPracticeModal = async (test: TestItem) => {
    setModalTestTarget(test);
    setIsLoadingSections(true);
    setIsSectionModalOpen(true);
    try {
      const res = await fetch(`/api/tests/${test.id}`);
      const data = await res.json();
      const loadedSections: TestSection[] = data.sections || [];
      setModalSections(loadedSections);
      if (loadedSections.length > 0) {
        setPracticeSectionId(loadedSections[0].id); // default first passage / part
        if (test.skill_type === 'WRITING') {
          setPracticeTimeMinutes(loadedSections[0].order_index === 1 ? 20 : 40);
        } else if (test.skill_type === 'SPEAKING') {
          setPracticeTimeMinutes(loadedSections[0].order_index === 2 ? 4 : 5);
        } else if (test.skill_type === 'LISTENING') {
          setPracticeTimeMinutes(8);
        } else {
          setPracticeTimeMinutes(20);
        }
      } else {
        setPracticeSectionId('ALL');
        setPracticeTimeMinutes(test.time_limit_minutes || (test.skill_type === 'LISTENING' ? 30 : 60));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSections(false);
    }
  };

  // Direct start for specific Speaking Part
  const handleStartDirectSpeakingPart = (test: TestItem, part: 'PART_1' | 'PART_2' | 'PART_3') => {
    setActiveTest(test);
    setMode('PRACTICE');
    setPracticeSectionId(part === 'PART_1' ? 'ts_s1_p1' : part === 'PART_2' ? 'ts_s1_p2' : 'ts_s1_p3');
  };

  // Start Practice with Selected Section
  const handleStartPracticeSection = () => {
    if (!modalTestTarget) return;

    let targetSections = modalSections;
    if (practiceSectionId !== 'ALL') {
      const targetSec = modalSections.find(s => s.id === practiceSectionId);
      targetSections = targetSec ? [targetSec] : modalSections;
    }

    const durationSeconds = practiceTimeMinutes > 0 ? practiceTimeMinutes * 60 : 999999;
    
    setActiveTest(modalTestTarget);
    setSections(targetSections);
    setActiveSectionIndex(0);
    setMode('PRACTICE');
    setUserAnswers({});
    setWritingTask1Essay('');
    setWritingTask2Essay('');
    setSubmissionResult(null);
    setReviewFilter('ALL');
    setTimeRemaining(durationSeconds);
    setInitialTimeSeconds(durationSeconds);
    setIsTimerPaused(false);
    setIsSectionModalOpen(false);
  };

  // Start Full Simulation Exam (All Sections, Strict 60 Mins)
  const handleStartSimulationExam = async (test: TestItem) => {
    try {
      const res = await fetch(`/api/tests/${test.id}`);
      const data = await res.json();
      const loadedSections: TestSection[] = data.sections || [];
      const totalTime = (test.time_limit_minutes || 60) * 60;

      setActiveTest(test);
      setSections(loadedSections);
      setActiveSectionIndex(0);
      setMode('SIMULATION');
      setPracticeSectionId('ALL');
      setUserAnswers({});
      setWritingTask1Essay('');
      setWritingTask2Essay('');
      setSubmissionResult(null);
      setReviewFilter('ALL');
      setTimeRemaining(totalTime);
      setInitialTimeSeconds(totalTime);
      setIsTimerPaused(false);
      setIsSectionModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!activeTest || submissionResult || isTimerPaused) return;
    if (timeRemaining > 900000) return; // Unlimited mode

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTest, submissionResult, isTimerPaused, timeRemaining]);

  const handleAnswerChange = (questionId: string, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const timeSpent = Math.max(1, initialTimeSeconds - timeRemaining);
      const isSingleSection = mode === 'PRACTICE' && practiceSectionId !== 'ALL' && sections.length === 1;

      // Handle Writing Test Submission via Dedicated AI Evaluator
      if (activeTest.skill_type === 'WRITING') {
        const isTask1Only = isSingleSection && sections[0]?.order_index === 1;
        const isTask2Only = isSingleSection && sections[0]?.order_index === 2;

        if (isTask1Only || isTask2Only) {
          const taskType = isTask1Only ? 'TASK_1' : 'TASK_2';
          const essayText = isTask1Only ? writingTask1Essay : writingTask2Essay;
          const prompt = sections[0]?.content_passage || sections[0]?.title;

          const res = await fetch('/api/grading/writing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: 'u_student',
              task_type: taskType,
              prompt_title: prompt,
              essay_text: essayText,
              target_band: 7.0
            })
          });
          const data = await res.json();
          const band = typeof data.result?.overall_band === 'number' ? data.result.overall_band : (data.result?.estimated_band ?? 0.0);
          setSubmissionResult({
            is_writing: true,
            single_task: true,
            task_type: taskType,
            band_score: band,
            result: data.result
          });
        } else {
          // Full Dual Task Writing Exam
          const task1Sec = sections.find(s => s.order_index === 1) || sections[0];
          const task2Sec = sections.find(s => s.order_index === 2) || sections[1];

          const res = await fetch('/api/grading/writing-full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: 'u_student',
              task1_prompt: task1Sec?.content_passage || 'Archaeological findings 2004 vs 2014',
              task1_essay: writingTask1Essay,
              task2_prompt: task2Sec?.content_passage || 'Hard work in education and employment',
              task2_essay: writingTask2Essay,
              target_band: 7.0
            })
          });
          const data = await res.json();
          const band = typeof data.result?.overall_band === 'number' ? data.result.overall_band : (data.result?.overall_writing_band ?? 0.0);
          setSubmissionResult({
            is_writing: true,
            full_exam: true,
            band_score: band,
            result: data.result
          });
        }
        onTestCompleted();
        return;
      }

      // Handle Reading / Listening Test Submission
      const res = await fetch(`/api/tests/${activeTest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          answers: userAnswers,
          time_spent_seconds: timeSpent,
          mode,
          section_id: isSingleSection ? sections[0].id : undefined
        })
      });
      const data = await res.json();
      setSubmissionResult(data);
      onTestCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds > 900000) return '∞ Không giới hạn';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Jump to specific question
  const scrollToQuestion = (qId: string, sectionIndex: number) => {
    setActiveSectionIndex(sectionIndex);
    setTimeout(() => {
      const el = questionRefs.current[qId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Move to next section in practice mode if available
  const handlePracticeNextPassage = async () => {
    if (!activeTest || !modalSections.length) {
      setActiveTest(null);
      return;
    }
    const currentId = sections[0]?.id;
    const currentIndex = modalSections.findIndex(s => s.id === currentId);
    if (currentIndex >= 0 && currentIndex < modalSections.length - 1) {
      const nextSec = modalSections[currentIndex + 1];
      setSections([nextSec]);
      setPracticeSectionId(nextSec.id);
      setActiveSectionIndex(0);
      setUserAnswers({});
      setWritingTask1Essay('');
      setWritingTask2Essay('');
      setSubmissionResult(null);
      setReviewFilter('ALL');
      setTimeRemaining(practiceTimeMinutes > 0 ? practiceTimeMinutes * 60 : 999999);
      setIsTimerPaused(false);
    } else {
      setActiveTest(null);
    }
  };

  // Render Test List View
  if (!activeTest) {
    return (
      <div className="space-y-6">
        {/* Header & Skill Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              IELTS Mock Test Bank
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kho đề thi chuẩn Cambridge IELTS Academic với chế độ <strong>Thi Thật (60 Phút)</strong> và <strong>Luyện Tập Từng Passage/Section</strong>.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
            {['ALL', 'READING', 'LISTENING', 'WRITING', 'SPEAKING'].map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill)}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                  selectedSkillFilter === skill
                    ? 'btn-glossy-emerald font-extrabold text-white'
                    : 'btn-glossy-dark font-medium text-slate-700'
                }`}
              >
                {skill === 'ALL' ? 'Tất cả Kỹ Năng' : skill}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Mode Explanation Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
              <Layers className="w-4 h-4 text-emerald-600" />
              Chế Độ Luyện Tập (Practice Mode)
            </div>
            <p className="text-xs text-emerald-950/80 leading-relaxed font-medium">
              • Cho phép <strong>tách nhỏ & chọn riêng từng Section / Passage</strong> (Passage 1, Passage 2 hoặc Passage 3 / Task 1, Task 2).<br />
              • Tùy chỉnh thời gian (20 phút / passage hoặc không giới hạn), có thể tạm dừng và xem lời giải chi tiết ngay sau khi nộp.
            </p>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-2 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <Award className="w-4 h-4 text-emerald-400" />
              Chế Độ Thi Thật (Exam Simulation)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              • <strong>Làm trọn vẹn toàn bộ đề thi</strong> (Tất cả 3 Passages & 40 câu hỏi Reading / 2 Tasks Writing).<br />
              • Đếm ngược liên tục 60 phút mô phỏng bài thi máy tính CD-IELTS chuẩn, tính điểm IELTS Band 1.0 - 9.0.
            </p>
          </div>
        </div>

        {/* Tests List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-slate-200/80 hover:border-emerald-400 rounded-3xl p-6 space-y-4 shadow-sm transition flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    test.skill_type === 'READING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    test.skill_type === 'LISTENING' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                    test.skill_type === 'WRITING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    IELTS {test.skill_type}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Toàn bài: {test.time_limit_minutes} phút</span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{test.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {test.skill_type === 'READING'
                    ? 'Đề thi chuẩn Academic gồm 3 Passages (Passage 1: Q1-13, Passage 2: Q14-26, Passage 3: Q27-40) đầy đủ dạng câu hỏi.'
                    : test.skill_type === 'WRITING'
                    ? 'Đề thi chuẩn IELTS Writing gồm Task 1 (Bản đồ Archaeological Maps 2004 vs 2014) và Task 2 (Nghị luận xã hội Hard Work) với chấm điểm 4 tiêu chí.'
                    : test.skill_type === 'SPEAKING'
                    ? 'Đề thi chuẩn Speaking 3 Parts: Part 1 (Weather), Part 2 (Unforgettable Advertisement Cue Card), Part 3 (Art & Society). Cho phép luyện từng Part hoặc thi thật cả 3 Part.'
                    : 'Đề thi mô phỏng chuẩn Cambridge Academic với chấm điểm tự động & lưu sổ lỗi sai.'}
                </p>

                {/* Quick Direct Part Selection for Speaking */}
                {test.skill_type === 'SPEAKING' && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">Luyện nhanh:</span>
                    <button
                      onClick={() => handleStartDirectSpeakingPart(test, 'PART_1')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Part 1 (Weather)</span>
                    </button>
                    <button
                      onClick={() => handleStartDirectSpeakingPart(test, 'PART_2')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-extrabold border border-amber-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Part 2 (Cue Card)</span>
                    </button>
                    <button
                      onClick={() => handleStartDirectSpeakingPart(test, 'PART_3')}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-extrabold border border-purple-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Part 3 (Art & Society)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Start Buttons with Distinct Mode Selection */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleOpenPracticeModal(test)}
                  className="py-2.5 px-3 rounded-xl btn-glossy-dark text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {test.skill_type === 'SPEAKING' ? 'Chọn Part Luyện Tập' : 'Luyện Tập Từng Phần'}
                  </span>
                </button>
                <button
                  onClick={() => handleStartSimulationExam(test)}
                  className="py-2.5 px-3 rounded-xl btn-glossy-emerald font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span>
                    {test.skill_type === 'SPEAKING' 
                      ? 'Thi Thật Speaking (15P)' 
                      : test.skill_type === 'WRITING' 
                      ? 'Thi Thật Writing (60P)' 
                      : 'Thi Thật Cả Đề (60P)'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Practice Section Selection Modal */}
        {isSectionModalOpen && modalTestTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                    Cấu Hình Chế Độ Luyện Tập
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {modalTestTarget.title}
                  </h3>
                </div>
                <button
                  onClick={() => setIsSectionModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoadingSections ? (
                <div className="py-12 text-center text-xs text-slate-500 font-medium">
                  Đang tải danh sách sections...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      {modalTestTarget.skill_type === 'SPEAKING' 
                        ? '1. Chọn Part Speaking bạn muốn luyện tập:' 
                        : '1. Chọn Section / Passage bạn muốn luyện tập:'}
                    </label>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {modalSections.map((sec) => (
                        <label
                          key={sec.id}
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                            practiceSectionId === sec.id
                              ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                              : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 text-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="practice_section"
                            value={sec.id}
                            checked={practiceSectionId === sec.id}
                            onChange={() => {
                              setPracticeSectionId(sec.id);
                              if (modalTestTarget.skill_type === 'WRITING') {
                                setPracticeTimeMinutes(sec.order_index === 2 ? 40 : 20);
                              } else if (modalTestTarget.skill_type === 'SPEAKING') {
                                setPracticeTimeMinutes(sec.order_index === 2 ? 4 : 5);
                              } else if (modalTestTarget.skill_type === 'LISTENING') {
                                setPracticeTimeMinutes(8);
                              } else {
                                setPracticeTimeMinutes(20);
                              }
                            }}
                            className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-extrabold text-slate-900">
                              {sec.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              {sec.questions && sec.questions.length > 0 && (
                                <>
                                  <span>Số câu: <strong>{sec.questions.length} câu</strong></span>
                                  <span>•</span>
                                </>
                              )}
                              <span>
                                Gợi ý: ~{
                                  modalTestTarget.skill_type === 'SPEAKING'
                                    ? (sec.order_index === 2 ? '3-4' : '4-5')
                                    : (sec.order_index === 2 && modalTestTarget.skill_type === 'WRITING' ? '40' : '20')
                                } phút
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}

                      {/* Option to practice ALL in practice mode */}
                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                          practiceSectionId === 'ALL'
                            ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 text-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="practice_section"
                          value="ALL"
                          checked={practiceSectionId === 'ALL'}
                          onChange={() => {
                            setPracticeSectionId('ALL');
                            setPracticeTimeMinutes(modalTestTarget.skill_type === 'SPEAKING' ? 15 : modalTestTarget.skill_type === 'LISTENING' ? 30 : 60);
                          }}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1 text-xs">
                          <div className="font-extrabold text-slate-900">
                            {modalTestTarget.skill_type === 'SPEAKING' 
                              ? 'Tất Cả 3 Part (Luyện tập toàn bài)' 
                              : 'Tất Cả Các Phần (Toàn bộ đề thi)'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Luyện tập tự do không áp lực thi thật (tự do xem bài mẫu & hỗ trợ)
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Practice Time Limit Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      2. Cài đặt thời gian làm bài:
                    </label>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {(modalTestTarget.skill_type === 'SPEAKING' 
                        ? [
                            { label: '5 Phút', val: 5 },
                            { label: '10 Phút', val: 10 },
                            { label: '15 Phút', val: 15 },
                            { label: 'Không giới hạn', val: 0 }
                          ]
                        : [
                            { label: '15 Phút', val: 15 },
                            { label: '20 Phút', val: 20 },
                            { label: '40 Phút', val: 40 },
                            { label: 'Không giới hạn', val: 0 }
                          ]
                      ).map((t) => (
                        <button
                          key={t.val}
                          type="button"
                          onClick={() => setPracticeTimeMinutes(t.val)}
                          className={`py-2 px-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                            practiceTimeMinutes === t.val
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleStartPracticeSection}
                  disabled={isLoadingSections}
                  className="btn-glossy-emerald font-extrabold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span>Bắt Đầu Luyện Tập</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Test Execution View
  const isSpeakingSkill = activeTest.skill_type === 'SPEAKING';
  if (isSpeakingSkill) {
    let initialPart: 'PART_1' | 'PART_2' | 'PART_3' = 'PART_1';
    if (practiceSectionId && (
      practiceSectionId.includes('p2') || 
      practiceSectionId.includes('PART_2') || 
      practiceSectionId.includes('Part 2') ||
      practiceSectionId.includes('ts_s1_p2')
    )) {
      initialPart = 'PART_2';
    } else if (practiceSectionId && (
      practiceSectionId.includes('p3') || 
      practiceSectionId.includes('PART_3') || 
      practiceSectionId.includes('Part 3') ||
      practiceSectionId.includes('ts_s1_p3')
    )) {
      initialPart = 'PART_3';
    }

    return (
      <SpeakingGraderView
        initialMode={mode}
        initialPart={initialPart}
        onExit={() => setActiveTest(null)}
        onCompleted={onTestCompleted}
      />
    );
  }

  const allQuestions: Question[] = sections.flatMap((sec) => sec.questions || []);
  const currentSection = sections[activeSectionIndex] || sections[0];
  const currentQuestions = currentSection?.questions || [];
  const isSingleSectionPractice = mode === 'PRACTICE' && practiceSectionId !== 'ALL';
  const isWritingSkill = activeTest.skill_type === 'WRITING';

  const task1WordCount = writingTask1Essay.trim() ? writingTask1Essay.trim().split(/\s+/).filter(Boolean).length : 0;
  const task2WordCount = writingTask2Essay.trim() ? writingTask2Essay.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-4 pb-20">
      {/* Test Control Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTest(null)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
            title="Thoát bài thi"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                mode === 'SIMULATION'
                  ? 'bg-slate-900 text-emerald-400 border border-slate-800'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {mode === 'SIMULATION' ? 'Thi Thật Cả Đề (Full Test)' : 'Chế Độ Luyện Tập (Section Practice)'}
              </span>
              {isSingleSectionPractice && (
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {currentSection?.title?.split(':')[0] || 'Section'}
                </span>
              )}
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 truncate max-w-md mt-0.5">{activeTest.title}</h2>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-2.5">
          {activeTest.skill_type === 'READING' && (
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsScoreTableModalOpen(true)}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Bảng quy đổi số câu đúng sang Band điểm IELTS Reading"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Quy Đổi Điểm Reading</span>
                <span className="sm:hidden">Quy Đổi</span>
              </button>

              {/* Tooltip on hover */}
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-xl text-[11px] space-y-1.5 pointer-events-none animate-in fade-in duration-150 border border-slate-800">
                <div className="font-extrabold text-emerald-400 flex items-center justify-between border-b border-slate-700 pb-1">
                  <span>Quy đổi Band Reading</span>
                  <span>Thang 40 câu</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
                  <div>• 39-40: <strong className="text-emerald-300">Band 9.0</strong></div>
                  <div>• 37-38: <strong className="text-emerald-300">Band 8.5</strong></div>
                  <div>• 35-36: <strong className="text-emerald-300">Band 8.0</strong></div>
                  <div>• 33-34: <strong className="text-emerald-300">Band 7.5</strong></div>
                  <div>• 30-32: <strong className="text-emerald-300">Band 7.0</strong></div>
                  <div>• 27-29: <strong className="text-emerald-300">Band 6.5</strong></div>
                  <div>• 23-26: <strong className="text-emerald-300">Band 6.0</strong></div>
                  <div>• 16-19: <strong className="text-emerald-300">Band 5.0</strong></div>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                  Nhấp để xem toàn bộ bảng quy đổi chi tiết.
                </p>
              </div>
            </div>
          )}

          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
            timeRemaining < 300 && timeRemaining > 0
              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
              : mode === 'SIMULATION'
              ? 'bg-slate-900 border-slate-800 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemaining)}</span>
            {mode === 'PRACTICE' && !submissionResult && timeRemaining < 900000 && (
              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="ml-2 text-slate-500 hover:text-slate-800 cursor-pointer"
                title={isTimerPaused ? 'Tiếp tục' : 'Tạm dừng'}
              >
                {isTimerPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {!submissionResult ? (
            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="btn-glossy-emerald font-extrabold text-xs px-5 py-2 rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{isSubmitting ? 'AI Đang Chấm Bài...' : (isSingleSectionPractice ? 'Nộp Phần Này' : 'Nộp Toàn Bộ Bài')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {isSingleSectionPractice && modalSections.length > 1 && (
                <button
                  onClick={handlePracticeNextPassage}
                  className="btn-glossy-emerald font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Luyện Phần Tiếp Theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setActiveTest(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Quay lại Test Bank
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WRITING SUBMISSION RESULTS BANNER & COMPREHENSIVE AI GRADER */}
      {submissionResult && submissionResult.is_writing && (
        <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 text-slate-900 space-y-6 shadow-lg">
          {/* Header Score & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                {submissionResult.full_exam ? 'Kết Quả Thi Thật Full IELTS Writing Exam (60 Phút)' : `Kết Quả Chấm Điểm Chi Tiết ${submissionResult.task_type}`}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-2xl font-black text-slate-900">Estimated Band Score:</h2>
                <span className={`text-4xl font-black ${submissionResult.band_score === 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {submissionResult.band_score.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-500">/ 9.0</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWritingCriteriaModalOpen(true)}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 w-fit shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Xem 4 Tiêu Chí Chấm Thi IELTS Writing Chuẩn (Band 0-9)</span>
              </button>
            </div>
          </div>

          {/* Full Exam Sub-Tabs Switcher */}
          {submissionResult.full_exam && submissionResult.result && (
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setWritingResultTab('OVERVIEW')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  writingResultTab === 'OVERVIEW'
                    ? 'btn-glossy-emerald text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 font-bold'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Tổng Quan Cả Bài (Band {submissionResult.band_score?.toFixed(1)})</span>
              </button>
              
              <button
                type="button"
                onClick={() => setWritingResultTab('TASK_1')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  writingResultTab === 'TASK_1'
                    ? 'btn-glossy-emerald text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 font-bold'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Chi Tiết Sửa Lỗi Task 1: Bản Đồ (Band {submissionResult.result.task1_band?.toFixed(1) || '0.0'})</span>
              </button>

              <button
                type="button"
                onClick={() => setWritingResultTab('TASK_2')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  writingResultTab === 'TASK_2'
                    ? 'btn-glossy-emerald text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 font-bold'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chi Tiết Sửa Lỗi Task 2: Bài Luận (Band {submissionResult.result.task2_band?.toFixed(1) || '0.0'})</span>
              </button>
            </div>
          )}

          {/* Feedback & Examiner Comments (For Single Task or Full Exam Overview) */}
          {(!submissionResult.full_exam || writingResultTab === 'OVERVIEW') && (submissionResult.result?.general_feedback || submissionResult.result?.general_verdict) && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              submissionResult.band_score === 0 
                ? 'bg-rose-50 border-rose-200 text-rose-950' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <strong className="block font-bold">
                {submissionResult.band_score === 0 ? '⚠️ Nhận xét của Giám khảo AI (Bài thi 0.0 Band):' : 'Nhận xét tổng quan của Giám khảo AI:'}
              </strong>
              <p className="leading-relaxed whitespace-pre-line">
                {submissionResult.result.general_feedback || submissionResult.result.general_verdict}
              </p>
            </div>
          )}

          {/* 4 Standard Criteria Breakdown (For Single Task or Full Exam Overview) */}
          {(!submissionResult.full_exam || writingResultTab === 'OVERVIEW') && submissionResult.result?.criteria && Array.isArray(submissionResult.result.criteria) && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Đánh giá chi tiết 4 Tiêu chí IELTS Writing (IELTS Band Descriptors):
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {submissionResult.result.criteria.map((crit: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{crit.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-black ${
                        crit.score === 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Band {typeof crit.score === 'number' ? crit.score.toFixed(1) : crit.score}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{crit.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dual Task Summary Boxes (Overview Tab) */}
          {submissionResult.full_exam && writingResultTab === 'OVERVIEW' && submissionResult.result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Task 1 Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">Task 1 (Chiếm 1/3 điểm): Bản đồ Archaeological Map</span>
                  <span className={`font-black text-xs px-2 py-0.5 rounded ${
                    submissionResult.result.task1_band === 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Band {submissionResult.result.task1_band?.toFixed(1) ?? '0.0'}
                  </span>
                </div>
                {submissionResult.result.task1_result?.criteria && (
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {submissionResult.result.task1_result.criteria.map((c: any, i: number) => (
                      <div key={i} className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-medium block truncate">{c.name}</span>
                        <strong className="text-slate-800 font-bold">Band {c.score}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setWritingResultTab('TASK_1')}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Xem Chi Tiết Sửa Lỗi Task 1</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task 2 Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">Task 2 (Chiếm 2/3 điểm): Nghị luận Hard Work</span>
                  <span className={`font-black text-xs px-2 py-0.5 rounded ${
                    submissionResult.result.task2_band === 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Band {submissionResult.result.task2_band?.toFixed(1) ?? '0.0'}
                  </span>
                </div>
                {submissionResult.result.task2_result?.criteria && (
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {submissionResult.result.task2_result.criteria.map((c: any, i: number) => (
                      <div key={i} className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-medium block truncate">{c.name}</span>
                        <strong className="text-slate-800 font-bold">Band {c.score}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setWritingResultTab('TASK_2')}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Xem Chi Tiết Sửa Lỗi Task 2</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Single Task EssayErrorHighlightViewer */}
          {submissionResult.single_task && submissionResult.result && (
            <div className="pt-2">
              <EssayErrorHighlightViewer
                essayText={submissionResult.task_type === 'TASK_1' ? writingTask1Essay : writingTask2Essay}
                result={submissionResult.result}
                taskTitle={sections[0]?.content_passage || sections[0]?.title || 'IELTS Writing Prompt'}
                taskLabel={submissionResult.task_type === 'TASK_1' ? 'Task 1 (Map Analysis)' : 'Task 2 (Hard Work Essay)'}
              />
            </div>
          )}

          {/* Full Exam Task 1 Error Viewer */}
          {submissionResult.full_exam && writingResultTab === 'TASK_1' && submissionResult.result?.task1_result && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Task 1: Phân Tích Bản Đồ Khảo Cổ Học (2004 vs 2014)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Thời gian đề xuất: 20 phút • Tiêu chuẩn 150 từ</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Điểm Task 1</span>
                  <span className="text-xl font-black text-emerald-600">
                    Band {(submissionResult.result.task1_band || submissionResult.result.task1_result.overall_band || 0).toFixed(1)}
                  </span>
                </div>
              </div>

              <EssayErrorHighlightViewer
                essayText={writingTask1Essay}
                result={submissionResult.result.task1_result}
                taskTitle={sections.find(s => s.order_index === 1)?.content_passage || 'Archaeological findings 2004 vs 2014'}
                taskLabel="Task 1 (Map Analysis)"
              />
            </div>
          )}

          {/* Full Exam Task 2 Error Viewer */}
          {submissionResult.full_exam && writingResultTab === 'TASK_2' && submissionResult.result?.task2_result && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Task 2: Nghị Luận Xã Hội (Hard Work in Education & Employment)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Thời gian đề xuất: 40 phút • Tiêu chuẩn 250 từ</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Điểm Task 2</span>
                  <span className="text-xl font-black text-emerald-600">
                    Band {(submissionResult.result.task2_band || submissionResult.result.task2_result.overall_band || 0).toFixed(1)}
                  </span>
                </div>
              </div>

              <EssayErrorHighlightViewer
                essayText={writingTask2Essay}
                result={submissionResult.result.task2_result}
                taskTitle={sections.find(s => s.order_index === 2)?.content_passage || 'Hard work in education and employment'}
                taskLabel="Task 2 (Hard Work Essay)"
              />
            </div>
          )}
        </div>
      )}

      {/* READING / LISTENING SUBMISSION RESULTS BANNER */}
      {submissionResult && !submissionResult.is_writing && (
        <div className="bg-white border border-emerald-300 rounded-3xl p-6 text-slate-900 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {isSingleSectionPractice ? 'Kết Quả Luyện Tập Section' : 'Kết Quả Bài Thi IELTS Reading Full'}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                {isSingleSectionPractice ? (
                  <>Độ chính xác: <span className="text-emerald-600 font-black text-3xl">{Math.round((submissionResult.correct_count / submissionResult.total_questions) * 100)}%</span> ({submissionResult.correct_count}/{submissionResult.total_questions} câu)</>
                ) : (
                  <>Estimated Band Score: <span className="text-emerald-600 font-black text-3xl">{submissionResult.band_score}</span> / 9.0</>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium">Số câu đúng</p>
                <p className="text-lg font-extrabold text-emerald-600">
                  {submissionResult.correct_count} / {submissionResult.total_questions}
                </p>
              </div>

              {/* Filter toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setReviewFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    reviewFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Tất cả ({allQuestions.length})
                </button>
                <button
                  onClick={() => setReviewFilter('WRONG_ONLY')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    reviewFilter === 'WRONG_ONLY' ? 'bg-rose-50 text-rose-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Câu sai ({submissionResult.total_questions - submissionResult.correct_count})
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <p className="text-slate-600 font-medium leading-relaxed">
              Xem chi tiết bài giải và trích đoạn bài đọc bên dưới. Các câu trả lời chưa đúng đã được tự động phân tích và lưu vào <span className="text-emerald-700 font-bold">Sổ Lỗi Sai (Error Notebook)</span> để ôn tập lại.
            </p>
            <button
              onClick={() => setIsScoreTableModalOpen(true)}
              className="shrink-0 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 w-fit"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Xem Bảng Quy Đổi Điểm IELTS Reading</span>
            </button>
          </div>
        </div>
      )}

      {/* Section/Passage Selector Tabs (Only when multi sections are active) */}
      {sections.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {sections.map((sec, idx) => {
            const secQuestions = sec.questions || [];
            const answeredCount = secQuestions.filter(q => !!userAnswers[q.id]).length;
            const isCurrent = activeSectionIndex === idx;

            return (
              <button
                key={sec.id}
                onClick={() => setActiveSectionIndex(idx)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  isCurrent
                    ? 'btn-glossy-emerald text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{sec.title.split(':')[0] || `Section ${idx + 1}`}</span>
                {isWritingSkill ? (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isCurrent ? 'bg-emerald-700/80 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx === 0 ? `${task1WordCount}/150w` : `${task2WordCount}/250w`}
                  </span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isCurrent ? 'bg-emerald-700/80 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {answeredCount}/{secQuestions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* DEDICATED COMPUTER-DELIVERED WRITING SUITE VIEW */}
      {isWritingSkill ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
          {/* Left Pane: Prompt & Map Diagram (for Task 1) or Topic (for Task 2) */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 overflow-y-auto space-y-4 shadow-sm max-h-[80vh]">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">{currentSection?.title}</h3>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                  {currentSection?.order_index === 1 ? 'Task 1 (Report/Map)' : 'Task 2 (Essay)'}
                </span>
              </div>

              {/* Task 1 Map Visual Illustration */}
              {currentSection?.order_index === 1 && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {currentSection?.content_passage}
                  </div>
                  <Task1MapDiagram />
                </div>
              )}

              {/* Task 2 Topic & Band Descriptors Strategy */}
              {currentSection?.order_index === 2 && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Đề bài IELTS Writing Task 2:</strong>
                    {currentSection?.content_passage}
                  </div>

                  {/* Official Band Descriptors Checklist for Task 2 */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-700" />
                        <strong className="font-extrabold text-emerald-950">
                          Khung Tiêu Chí Chấm Điểm Task 2 (IELTS Official Band Descriptors):
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsWritingCriteriaModalOpen(true)}
                        className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Xem chi tiết Band 0-9</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                      {/* TR */}
                      <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 space-y-1">
                        <span className="font-bold text-rose-700 block">1. Task Response (TR)</span>
                        <p className="text-slate-600 leading-snug">
                          Trả lời đầy đủ cả 2 vế của đề bài. Lập trường (Position) rõ ràng xuyên suốt Mở bài, 2 Thân bài và Kết luận. Đạt tối thiểu 250 từ.
                        </p>
                      </div>

                      {/* CC */}
                      <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 space-y-1">
                        <span className="font-bold text-blue-700 block">2. Coherence & Cohesion (CC)</span>
                        <p className="text-slate-600 leading-snug">
                          Cấu trúc 4 đoạn chuẩn mực. Mỗi đoạn thân bài có 1 câu chủ đề (Topic Sentence) rõ ràng. Dùng liên từ tự nhiên, mạch lạc.
                        </p>
                      </div>

                      {/* LR */}
                      <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 space-y-1">
                        <span className="font-bold text-amber-700 block">3. Lexical Resource (LR)</span>
                        <p className="text-slate-600 leading-snug">
                          Sử dụng collocations học thuật (e.g. <em>intrinsic motivation, professional excellence, chronic burnout, work-life balance</em>).
                        </p>
                      </div>

                      {/* GRA */}
                      <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 space-y-1">
                        <span className="font-bold text-emerald-700 block">4. Grammatical Range & Accuracy (GRA)</span>
                        <p className="text-slate-600 leading-snug">
                          Đa dạng câu phức (mệnh đề quan hệ, câu điều kiện, câu bị động, phân từ). Kiểm soát tốt dấu câu và thì động từ.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                      <span className="text-emerald-900 font-medium">
                        ⏱ Thời gian đề xuất: <strong>40 phút</strong> • Chiếm <strong>67%</strong> tổng điểm Writing
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const outlineTemplate = `[Introduction]
- Paraphrase prompt: Variations in diligence are noticeable across academia and careers...
- Thesis statement: While personal drive and competitiveness foster hard work, excessive work is detrimental.

[Body 1: Why some work harder]
- Topic sentence: Two primary drivers are internal ambition and external market competition.
- Explanation & Example: Career goals, scholarship competition, socio-economic demands.

[Body 2: Is it always a good thing?]
- Topic sentence: Diligence leads to success, but chronic overwork causes severe physical and mental burnout.
- Explanation & Example: Sacrifice of health and relationships, necessity of sustainable work-life balance.

[Conclusion]
- Restatement of position: Hard work is crucial for achievement but must be tempered with rest and well-being.`;
                          setWritingTask2Essay(outlineTemplate);
                        }}
                        className="text-emerald-800 font-bold hover:text-emerald-950 underline cursor-pointer"
                      >
                        Chèn dàn ý gợi ý (4-Paragraph Outline)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Interactive Writing Essay Textarea & Controls */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 overflow-y-auto space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                  Soạn thảo bài viết {currentSection?.order_index === 1 ? 'Task 1' : 'Task 2'}:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingCriteriaModalOpen(true)}
                    className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3 text-rose-600" />
                    <span>Tiêu chí Band 0-9</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePasteClipboard(currentSection?.order_index || 1)}
                    className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                    title="Dán nội dung từ clipboard"
                  >
                    <Copy className="w-3 h-3 text-slate-600" />
                    <span>Dán Clipboard</span>
                  </button>

                  {/* Sample Essay Buttons: Band 9.0 and Band 8.0 */}
                  <div className="flex items-center gap-1 bg-emerald-50/80 p-0.5 rounded-xl border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentSection?.order_index === 1) setWritingTask1Essay(DEFAULT_TASK1_SAMPLE_ESSAY_BAND9);
                        else setWritingTask2Essay(DEFAULT_TASK2_SAMPLE_ESSAY_BAND9);
                      }}
                      className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Tải bài mẫu chuẩn Band 9.0 (C1/C2 Lexicon & Flawless Cohesion)"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-700" />
                      <span>Bài mẫu Band 9.0</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (currentSection?.order_index === 1) setWritingTask1Essay(DEFAULT_TASK1_SAMPLE_ESSAY_BAND8);
                        else setWritingTask2Essay(DEFAULT_TASK2_SAMPLE_ESSAY_BAND8);
                      }}
                      className="text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100/60 px-2 py-1 rounded-lg transition cursor-pointer"
                      title="Tải bài mẫu tham khảo Band 8.0"
                    >
                      <span>Band 8.0</span>
                    </button>
                  </div>

                  {((currentSection?.order_index === 1 && writingTask1Essay) || (currentSection?.order_index === 2 && writingTask2Essay)) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentSection?.order_index === 1) setWritingTask1Essay('');
                        else setWritingTask2Essay('');
                      }}
                      className="text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa trắng</span>
                    </button>
                  )}

                  <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                    (currentSection?.order_index === 1 ? task1WordCount >= 150 : task2WordCount >= 250)
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {currentSection?.order_index === 1 ? `${task1WordCount} / 150 từ` : `${task2WordCount} / 250 từ`}
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={18}
                  value={currentSection?.order_index === 1 ? writingTask1Essay : writingTask2Essay}
                  onChange={(e) => {
                    if (currentSection?.order_index === 1) setWritingTask1Essay(e.target.value);
                    else setWritingTask2Essay(e.target.value);
                  }}
                  disabled={!!submissionResult}
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-2xl p-4 text-xs text-slate-900 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 shadow-inner"
                  placeholder={
                    currentSection?.order_index === 1
                      ? 'Bắt đầu gõ bài phân tích bản đồ Task 1 tại đây... (The two maps illustrate the developments and archaeological findings at a historic site between 2004 and 2014...)'
                      : 'Bắt đầu gõ bài luận Task 2 tại đây... (In contemporary society, variations in work ethic are evident...)'
                  }
                />
              </div>
            </div>

            {/* Bottom Tip */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <span>💡 Bạn có thể nhập bài viết trực tiếp, chèn khung dàn ý hoặc tải bài mẫu Band 9.0 (hoặc Band 8.0) để tham khảo.</span>
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveSectionIndex(activeSectionIndex === 0 ? 1 : 0)}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Chuyển sang {activeSectionIndex === 0 ? 'Task 2 (Essay)' : 'Task 1 (Map)'} →
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD READING / LISTENING COMPUTER-DELIVERED VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-270px)] min-h-[550px]">
          {/* Left Pane: Current Passage */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 overflow-y-auto space-y-4 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{currentSection?.title}</h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {sections.length > 1 ? `Passage ${activeSectionIndex + 1} / ${sections.length}` : 'Section Practice'}
                  </span>
                </div>
                {activeTest.skill_type === 'READING' && (
                  <button
                    type="button"
                    onClick={() => setIsScoreTableModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Tra cứu bảng quy đổi số câu đúng sang Band điểm IELTS Reading"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Bảng quy đổi Band</span>
                  </button>
                )}
              </div>

              {currentSection?.audio_url && (
                <div className="p-3 bg-emerald-50 rounded-2xl flex items-center gap-3 border border-emerald-200 text-emerald-800">
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Audio Script - IELTS Listening Audio Recording</span>
                </div>
              )}

              <div className="text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-200 selection:bg-emerald-200">
                {currentSection?.content_passage}
              </div>
            </div>
          </div>

          {/* Right Pane: Questions & Explanations */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 overflow-y-auto space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {currentSection?.title?.split(':')[0] || `Passage ${activeSectionIndex + 1}`} Questions ({currentQuestions.length} câu)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Đã làm: {currentQuestions.filter(q => !!userAnswers[q.id]).length} / {currentQuestions.length}
              </span>
            </div>

            <div className="space-y-6">
              {currentQuestions.map((q) => {
                const userAns = userAnswers[q.id] || '';
                const evalInfo = submissionResult?.evaluatedAnswers?.find((e: any) => e.question_id === q.id);

                if (submissionResult && reviewFilter === 'WRONG_ONLY' && evalInfo?.is_correct) {
                  return null;
                }

                return (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    ref={(el) => { questionRefs.current[q.id] = el; }}
                    className={`p-5 rounded-2xl border transition ${
                      evalInfo
                        ? evalInfo.is_correct
                          ? 'bg-emerald-50/80 border-emerald-300'
                          : 'bg-rose-50/80 border-rose-300'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <span className="font-bold text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                        Question {q.question_number}
                      </span>
                      {evalInfo && (
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          evalInfo.is_correct ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {evalInfo.is_correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {evalInfo.is_correct ? 'Đúng' : 'Chưa đúng'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-900 mb-3.5 leading-snug">{q.prompt}</p>

                    {/* Question Options or Input */}
                    {q.question_type === 'MULTIPLE_CHOICE' || q.question_type === 'TRUE_FALSE_NOT_GIVEN' || (q.options && q.options.length > 0) ? (
                      <div className="space-y-2">
                        {q.options?.map((opt, idx) => {
                          const isSelected = userAns === opt || userAns.toLowerCase() === opt.toLowerCase() || (userAns && opt.startsWith(userAns + ' '));
                          return (
                            <label
                              key={idx}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                                isSelected
                                  ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                value={opt}
                                checked={!!isSelected}
                                onChange={() => handleAnswerChange(q.id, opt)}
                                disabled={!!submissionResult}
                                className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="leading-snug">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          placeholder="Nhập 1 từ (ONE WORD ONLY)..."
                          value={userAns}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          disabled={!!submissionResult}
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium placeholder:text-slate-400"
                        />
                      </div>
                    )}

                    {/* Detailed Explanation upon submission */}
                    {evalInfo && (
                      <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1.5">
                        <p className="text-emerald-800 font-bold">
                          Đáp án đúng: <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">{q.correct_answer}</span>
                        </p>
                        <div className="text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/80">
                          <strong className="text-emerald-800">Giải thích chi tiết & Trích dẫn: </strong>
                          {q.explanation_text}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Question Palette Navigator (Only for Reading/Listening with questions) */}
      {!isWritingSkill && allQuestions.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
              Bảng điều hướng ({Object.keys(userAnswers).length}/{allQuestions.length} câu đã trả lời)
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Đã chọn</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block"></span> Chưa chọn</span>
              {submissionResult && (
                <>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Đúng</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Sai</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {sections.map((sec, secIdx) => (
              <div key={sec.id} className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
                <span className="text-[10px] font-extrabold text-slate-400 px-1">
                  {sections.length > 1 ? `P${secIdx + 1}` : 'Passage'}
                </span>
                {sec.questions?.map((q) => {
                  const isAnswered = !!userAnswers[q.id];
                  const evalInfo = submissionResult?.evaluatedAnswers?.find((e: any) => e.question_id === q.id);

                  let btnClass = 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100';
                  if (submissionResult && evalInfo) {
                    btnClass = evalInfo.is_correct
                      ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                      : 'bg-rose-500 text-white font-bold border-rose-500';
                  } else if (isAnswered) {
                    btnClass = 'bg-emerald-500 text-white font-bold border-emerald-500';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(q.id, secIdx)}
                      className={`w-7 h-7 rounded-lg text-[11px] border transition cursor-pointer flex items-center justify-center shrink-0 ${btnClass}`}
                    >
                      {q.question_number}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official IELTS Writing Band Descriptors Modal (Public Version) */}
      <Task1BandDescriptorsModal
        isOpen={isWritingCriteriaModalOpen}
        onClose={() => setIsWritingCriteriaModalOpen(false)}
        initialTaskType={currentSection?.order_index === 1 ? 'TASK_1' : 'TASK_2'}
      />

      {/* Score Conversion Table Modal */}
      {isScoreTableModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Bảng Quy Đổi Điểm IELTS Reading Academic
                </h3>
              </div>
              <button
                onClick={() => setIsScoreTableModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto pr-1">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-emerald-50 text-emerald-950 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Số câu trả lời đúng (Correct answers)</th>
                    <th className="p-2.5 text-center">Band Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { min: 39, max: 40, band: 9.0 },
                    { min: 37, max: 38, band: 8.5 },
                    { min: 35, max: 36, band: 8.0 },
                    { min: 33, max: 34, band: 7.5 },
                    { min: 30, max: 32, band: 7.0 },
                    { min: 27, max: 29, band: 6.5 },
                    { min: 23, max: 26, band: 6.0 },
                    { min: 20, max: 22, band: 5.5 },
                    { min: 16, max: 19, band: 5.0 },
                    { min: 13, max: 15, band: 4.5 },
                    { min: 10, max: 12, band: 4.0 },
                    { min: 7, max: 9, band: 3.5 },
                    { min: 5, max: 6, band: 3.0 },
                    { min: 3, max: 4, band: 2.5 },
                    { min: 0, max: 2, band: 2.0 },
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="p-2.5 font-medium text-slate-700">
                        {row.min === row.max ? `${row.min} câu` : `${row.min} – ${row.max} câu`}
                      </td>
                      <td className="p-2.5 text-center font-extrabold text-emerald-700 bg-emerald-50/40">
                        {row.band.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              Thang điểm trên được áp dụng trực tiếp để tính điểm Band tự động khi bạn nộp bài thi IELTS Reading.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
