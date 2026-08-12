import React, { useState, useEffect } from 'react';
import { FileText, Search, BookMarked, Volume2, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { KnowledgeArticle, VocabWord } from '../types';

export const KnowledgeVocabView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'KNOWLEDGE' | 'VOCAB'>('KNOWLEDGE');
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [vocabWords, setVocabWords] = useState<VocabWord[]>([]);

  // Dictionary Lookup State
  const [searchWord, setSearchWord] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  useEffect(() => {
    fetchArticles();
    fetchVocab();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/knowledge');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error(err);
    }
  };

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Thư Viện Kiến Thức & Sổ Từ Vựng Cá Nhân
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tra cứu từ vựng IELTS kèm phiên âm IPA, lưu tự động vào sổ từ vựng & đọc bí quyết luyện thi từ các giảng viên.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('KNOWLEDGE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
              activeSubTab === 'KNOWLEDGE' ? 'btn-glossy-emerald font-extrabold text-white' : 'btn-glossy-dark font-medium text-slate-700'
            }`}
          >
            Bài Viết Kiến Thức
          </button>
          <button
            onClick={() => setActiveSubTab('VOCAB')}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
              activeSubTab === 'VOCAB' ? 'btn-glossy-emerald font-extrabold text-white' : 'btn-glossy-dark font-medium text-slate-700'
            }`}
          >
            Từ Điển & Sổ Từ Vựng
          </button>
        </div>
      </div>

      {/* SubTab 1: Knowledge Base Articles */}
      {activeSubTab === 'KNOWLEDGE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((art) => (
              <div key={art.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                    {art.skill_type}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{art.title}</h3>
                  <div className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {art.content}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Author: Ms. Nga (IELTS 8.5)</span>
                  <span>{new Date(art.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 2: Vocab Lookup & Vocab Notebook */}
      {activeSubTab === 'VOCAB' && (
        <div className="space-y-6">
          {/* Quick Dictionary Lookup Search Bar */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 shadow-sm">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tra Cứu Từ Điển & Lưu Sổ Từ Vựng</h2>
            <form onSubmit={handleLookupWord} className="flex gap-2.5">
              <input
                type="text"
                placeholder="Nhập từ tiếng Anh (VD: deterioration, exacerbate)..."
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
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-emerald-600" />
              Saved Vocabulary ({vocabWords.length} words)
            </h2>

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
    </div>
  );
};
