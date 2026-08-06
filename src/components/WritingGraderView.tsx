import React, { useState } from 'react';
import { Edit3, Sparkles, AlertCircle, CheckCircle2, FileText, ArrowRight, BookOpen, Layers } from 'lucide-react';

export const WritingGraderView: React.FC = () => {
  const [taskType, setTaskType] = useState<'TASK_1' | 'TASK_2'>('TASK_2');
  const [promptTitle, setPromptTitle] = useState<string>(
    'Some people believe that artificial intelligence will create more job opportunities in the future, while others fear it will cause widespread unemployment. Discuss both views and give your opinion.'
  );
  const [essayText, setEssayText] = useState<string>(
    `In recent years, artificial intelligence progressed rapidly and transformed many industries. On the one hand, some people fear that AI automation will make homework and manual jobs obsolete, leading to widespread job displacement. On the other hand, proponents argue that technological innovation creates new opportunities in data science and software engineering.

In my opinion, although some traditional roles will disappear, AI will ultimately foster new career paths. Therefore, governments should upskill workers to prepare for the future economy.`
  );
  const [targetBand, setTargetBand] = useState<number>(7.0);

  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<any | null>(null);

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

  const handleGradeEssay = async () => {
    if (!essayText.trim() || isGrading) return;
    setIsGrading(true);

    try {
      const res = await fetch('/api/grading/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          task_type: taskType,
          prompt_title: promptTitle,
          essay_text: essayText,
          target_band: targetBand
        })
      });
      const data = await res.json();
      setGradingResult(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-amber-500" />
            AI Writing Evaluator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grading against official IELTS Band Descriptors: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setTaskType('TASK_1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              taskType === 'TASK_1' ? 'bg-[#C7F3C7] text-emerald-950 font-black border border-[#A5E0A5] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Task 1
          </button>
          <button
            onClick={() => setTaskType('TASK_2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              taskType === 'TASK_2' ? 'bg-[#C7F3C7] text-emerald-950 font-black border border-[#A5E0A5] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Task 2
          </button>
        </div>
      </div>

      {/* Main Grid: Input Column & AI Feedback Output Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Essay Input & Prompt */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3.5 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Đề bài IELTS Writing ({taskType})
              </label>
              <textarea
                rows={2}
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                placeholder="Nhập hoặc dán đề bài IELTS Writing..."
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-bold">Nội dung bài viết</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">Số từ: <strong className={`font-bold ${wordCount >= 250 ? 'text-emerald-700' : 'text-amber-600'}`}>{wordCount} từ</strong></span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">Mục tiêu:</span>
                  <select
                    value={targetBand}
                    onChange={(e) => setTargetBand(parseFloat(e.target.value))}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg px-2 py-0.5 text-xs font-bold"
                  >
                    {[6.0, 6.5, 7.0, 7.5, 8.0].map((b) => (
                      <option key={b} value={b}>{b} Band</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <textarea
              rows={12}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
              placeholder="Dán bài làm của bạn vào đây để AI chấm ngay..."
            />

            <button
              onClick={handleGradeEssay}
              disabled={isGrading || !essayText.trim()}
              className="w-full py-3 rounded-2xl bg-[#C7F3C7] hover:bg-[#b2ebb2] text-emerald-950 font-black text-xs shadow-2xs border border-[#A5E0A5] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-900" />
              <span>{isGrading ? 'Đang phân tích bài...' : 'Chấm Bài Viết Với AI'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Grading Results & Criteria */}
        <div className="space-y-6">
          {gradingResult ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-5 shadow-xs">
              {/* Band Score Overview */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div>
                  <span className="text-xs text-emerald-900 font-bold uppercase tracking-wider">Overall Band Score</span>
                  <h2 className="text-2xl font-black text-emerald-950 mt-0.5">
                    Band {gradingResult.overall_band?.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 9.0</span>
                  </h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                  {gradingResult.overall_band >= targetBand ? 'Đạt mục tiêu ✓' : `Cần +${(targetBand - gradingResult.overall_band).toFixed(1)} band`}
                </div>
              </div>

              {/* 4 Criteria Scores */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">4 Assessment Criteria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gradingResult.criteria?.map((crit: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{crit.name}</span>
                        <span className="text-sm font-black text-indigo-600">{crit.score?.toFixed(1)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{crit.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Notebook Integration Highlights */}
              {gradingResult.errors && gradingResult.errors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Corrected Errors (Auto-saved to Error Notebook)
                  </h3>
                  <div className="space-y-2">
                    {gradingResult.errors.map((err: any, idx: number) => (
                      <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 font-bold">
                            [{err.error_tag_code}]
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium">Error: <span className="line-through text-rose-700">{err.original_text}</span> → <strong className="text-emerald-700 font-bold">{err.corrected_text}</strong></p>
                        <p className="text-slate-600 text-[11px]">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Suggestions (Band 7.5+ Upgrades) */}
              {gradingResult.suggestions && gradingResult.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Vocabulary & Structure Upgrades (Band 7.5+)
                  </h3>
                  <div className="space-y-2">
                    {gradingResult.suggestions.map((sug: any, idx: number) => (
                      <div key={idx} className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs space-y-1">
                        <p className="text-slate-800 font-medium">
                          Original: <span className="text-slate-500 font-mono">"{sug.original_phrase}"</span> → <strong className="text-indigo-700 font-bold">"{sug.suggested_phrase}"</strong>
                        </p>
                        <p className="text-slate-600 text-[11px]">{sug.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Feedback & Sample Comparison */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Examiner Overall Feedback:</h4>
                <p className="text-slate-700 leading-relaxed">{gradingResult.general_feedback}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Evaluation Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter your essay in the box on the left and click "Evaluate Essay with AI" for feedback on all 4 criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
