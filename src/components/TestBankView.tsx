import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle2, AlertCircle, Play, Pause, RotateCcw, ArrowLeft, ArrowRight, Volume2 } from 'lucide-react';
import { TestItem, TestSection, Question } from '../types';

interface TestBankViewProps {
  onTestCompleted: () => void;
}

export const TestBankView: React.FC<TestBankViewProps> = ({ onTestCompleted }) => {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');
  const [activeTest, setActiveTest] = useState<TestItem | null>(null);
  const [sections, setSections] = useState<TestSection[]>([]);
  const [mode, setMode] = useState<'SIMULATION' | 'PRACTICE'>('PRACTICE');

  // Active Test State
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(1200); // 20 mins default
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleStartTest = async (test: TestItem, selectedMode: 'SIMULATION' | 'PRACTICE') => {
    try {
      const res = await fetch(`/api/tests/${test.id}`);
      const data = await res.json();
      setActiveTest(test);
      setSections(data.sections || []);
      setMode(selectedMode);
      setUserAnswers({});
      setSubmissionResult(null);
      setTimeRemaining((test.time_limit_minutes || 20) * 60);
      setIsTimerPaused(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!activeTest || submissionResult || isTimerPaused) return;

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
  }, [activeTest, submissionResult, isTimerPaused]);

  const handleAnswerChange = (questionId: string, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/tests/${activeTest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          answers: userAnswers,
          time_spent_seconds: (activeTest.time_limit_minutes * 60) - timeRemaining,
          mode
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
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
              Simulated computer-delivered test environment with detailed answer keys and Error Notebook integration
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

        {/* Tests List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-slate-200/80 hover:border-emerald-400 rounded-3xl p-5 space-y-3 shadow-sm transition flex flex-col justify-between"
            >
              <div className="space-y-2">
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
                    <span>{test.time_limit_minutes} phút</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{test.title}</h3>
                <p className="text-xs text-slate-500">Đề thi mô phỏng chuẩn Academic với chấm điểm tự động & lưu sổ lỗi sai.</p>
              </div>

              {/* Start Buttons with Mode Selection */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => handleStartTest(test, 'PRACTICE')}
                  className="w-full sm:flex-1 py-2 px-3 rounded-xl btn-glossy-dark text-xs font-bold transition cursor-pointer text-center"
                >
                  Chế Độ Luyện Tập
                </button>
                <button
                  onClick={() => handleStartTest(test, 'SIMULATION')}
                  className="w-full sm:flex-1 py-2 px-3 rounded-xl btn-glossy-emerald font-extrabold text-xs transition cursor-pointer text-center"
                >
                  Thi Mô Phỏng Thật
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Test Execution View (Computer-delivered IELTS Layout)
  const allQuestions: Question[] = sections.flatMap((sec) => sec.questions || []);

  return (
    <div className="space-y-4">
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
            <h2 className="text-sm font-extrabold text-slate-900 truncate max-w-md">{activeTest.title}</h2>
            <p className="text-[11px] text-slate-500 font-medium">Mode: <span className="text-emerald-700 font-bold">{mode === 'SIMULATION' ? 'Full Simulation (No Pause)' : 'Practice Mode'}</span></p>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{formatTime(timeRemaining)}</span>
            {mode === 'PRACTICE' && (
              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="ml-2 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {isTimerPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {!submissionResult && (
            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="btn-glossy-emerald font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
          )}
        </div>
      </div>

      {/* Submission Results Banner */}
      {submissionResult && (
        <div className="bg-white border border-emerald-300 rounded-3xl p-6 text-slate-900 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Test Results</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Estimated Band Score: <span className="text-emerald-600 font-black">{submissionResult.band_score}</span> / 9.0
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium">Correct Answers</p>
                <p className="text-lg font-extrabold text-emerald-600">{submissionResult.correct_count} / {submissionResult.total_questions}</p>
              </div>
              <button
                onClick={() => setActiveTest(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Back to Test Bank
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Review detailed explanations for each question below. Incorrect answers have been automatically logged into your Error Notebook.
          </p>
        </div>
      )}

      {/* Computer-delivered Split View: Left Passage, Right Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left Pane: Passage or Listening Script */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 overflow-y-auto space-y-4 shadow-sm">
          {sections.map((sec) => (
            <div key={sec.id} className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">{sec.title}</h3>

              {sec.audio_url && (
                <div className="p-3 bg-emerald-50 rounded-2xl flex items-center gap-3 border border-emerald-200 text-emerald-800">
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Audio Script - IELTS Listening Audio Recording</span>
                </div>
              )}

              <div className="text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200">
                {sec.content_passage}
              </div>
            </div>
          ))}
        </div>

        {/* Right Pane: Questions & Explanations */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 overflow-y-auto space-y-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            Questions List ({allQuestions.length} questions)
          </h3>

          <div className="space-y-6">
            {allQuestions.map((q) => {
              const userAns = userAnswers[q.id] || '';
              const evalInfo = submissionResult?.evaluatedAnswers?.find((e: any) => e.question_id === q.id);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition ${
                    evalInfo
                      ? evalInfo.is_correct
                        ? 'bg-emerald-50/80 border-emerald-300'
                        : 'bg-rose-50/80 border-rose-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                      Question {q.question_number}
                    </span>
                    {evalInfo && (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        evalInfo.is_correct ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {evalInfo.is_correct ? 'Correct ✓' : 'Incorrect ✕'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900 mb-3">{q.prompt}</p>

                  {/* Question Options or Input */}
                  {q.question_type === 'MULTIPLE_CHOICE' || q.question_type === 'TRUE_FALSE_NOT_GIVEN' ? (
                    <div className="space-y-2">
                      {q.options?.map((opt, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                            userAns === opt
                              ? 'bg-emerald-100/80 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={userAns === opt}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            disabled={!!submissionResult}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="Type your answer here..."
                        value={userAns}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        disabled={!!submissionResult}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium placeholder:text-slate-400"
                      />
                    </div>
                  )}

                  {/* Detailed Explanation upon submission */}
                  {evalInfo && (
                    <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1">
                      <p className="text-emerald-700 font-bold">Correct Answer: {q.correct_answer}</p>
                      <p className="text-slate-700 leading-relaxed"><strong className="text-emerald-800">Explanation:</strong> {q.explanation_text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
