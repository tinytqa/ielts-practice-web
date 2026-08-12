import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Filter, BookOpen, Clock } from 'lucide-react';
import { ErrorInstance } from '../types';

export const ErrorNotebookView: React.FC = () => {
  const [errors, setErrors] = useState<ErrorInstance[]>([]);
  const [frequentErrors, setFrequentErrors] = useState<any[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      const res = await fetch('/api/error-notebook?user_id=u_student');
      const data = await res.json();
      setErrors(data.errors || []);
      setFrequentErrors(data.frequent_errors || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredErrors = selectedTagFilter === 'ALL'
    ? errors
    : errors.filter((e: any) => e.error_tag_code === selectedTagFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Sổ Tay Lỗi Sai Tự Động</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tự động tổng hợp và phân loại lỗi sai từ các bài thi Writing, Speaking, Reading và Listening.
            </p>
          </div>
        </div>

        {/* Tag Frequency Badges */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTagFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
              selectedTagFilter === 'ALL' ? 'btn-glossy-emerald font-extrabold text-white' : 'btn-glossy-dark font-medium text-slate-700'
            }`}
          >
            Tất Cả Lỗi ({errors.length})
          </button>
          {frequentErrors.map((fe) => (
            <button
              key={fe.code}
              onClick={() => setSelectedTagFilter(fe.code)}
              className={`px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                selectedTagFilter === fe.code ? 'btn-glossy-emerald font-extrabold text-white' : 'btn-glossy-dark font-medium text-slate-700'
              }`}
            >
              {fe.name} ({fe.count})
            </button>
          ))}
        </div>
      </div>

      {/* Errors List */}
      <div className="space-y-4">
        {filteredErrors.length > 0 ? (
          filteredErrors.map((err: any) => (
            <div key={err.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    [{err.error_tag_code}] {err.error_tag_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Source: {err.source_type}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{new Date(err.created_at).toLocaleDateString()}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p className="text-slate-800 font-medium">
                  Original: <span className="text-rose-600 line-through">{err.original_text}</span>
                </p>
                <p className="text-slate-800 font-medium">
                  Corrected: <strong className="text-emerald-700 font-bold">{err.corrected_text}</strong>
                </p>
                <p className="text-slate-600 text-[11px] pt-1"><strong className="text-emerald-800 font-bold">Explanation:</strong> {err.explanation}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 text-xs space-y-2 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-900">No errors match the selected filter</p>
            <p className="text-slate-500">Whenever you take tests or evaluate work with AI, detected errors will automatically appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
