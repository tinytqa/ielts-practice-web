import React, { useState } from 'react';
import { Brain, Sparkles, Layers, BookOpen, CheckCircle2 } from 'lucide-react';

export const BrainstormView: React.FC = () => {
  const [topic, setTopic] = useState<string>(
    'Some people believe that university education should be free for everyone. To what extent do you agree or disagree?'
  );
  const [taskType, setTaskType] = useState<string>('Writing Task 2');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [brainstormResult, setBrainstormResult] = useState<any | null>(null);

  const handleGenerateIdeas = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, task_type: taskType })
      });
      const data = await res.json();
      setBrainstormResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">AI Brainstorming & Ý Tưởng Bài Viết</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tạo dàn ý chi tiết (Nguyên nhân - Kết quả - Giải pháp) & Bộ từ vựng Band 7.5+ chuẩn Academic.
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Chủ Đề / Đề Bài IELTS
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium placeholder:text-slate-400"
              placeholder="Nhập đề bài Writing Task 2 hoặc Speaking Part 3..."
            />
          </div>

          <button
            onClick={handleGenerateIdeas}
            disabled={isLoading || !topic.trim()}
            className="w-full py-3.5 rounded-2xl btn-glossy-emerald font-black text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{isLoading ? 'Đang Lập Dàn Ý...' : 'Tạo Dàn Ý & Từ Vựng AI'}</span>
          </button>
        </div>
      </div>

      {brainstormResult && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-5 shadow-sm">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Phân Tích Đề Bài</h3>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">{brainstormResult.topic_analysis}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black rounded-full shadow-2xs">
              Bố Cục Gợi Ý: {brainstormResult.structure_type}
            </span>
          </div>

          {/* Dàn Ý Sections */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dàn Ý Chi Tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brainstormResult.sections?.map((sec: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-700">{sec.heading}</h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {sec.bullet_points?.map((bp: string, bIdx: number) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Key Vocab */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">High-scoring Vocabulary & Collocations (Band 7.5+)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {brainstormResult.key_vocabulary?.map((vocab: any, idx: number) => (
                <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-emerald-800">{vocab.term}</p>
                  <p className="text-slate-700 text-[11px]">{vocab.meaning}</p>
                  <p className="text-slate-500 text-[10px] font-mono italic">"{vocab.collocation_example}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
