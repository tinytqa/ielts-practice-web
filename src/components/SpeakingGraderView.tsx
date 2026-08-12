import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Sparkles, Volume2, Clock, RotateCcw, AlertCircle } from 'lucide-react';

export const SpeakingGraderView: React.FC = () => {
  const [part, setPart] = useState<'PART_1' | 'PART_2' | 'PART_3'>('PART_2');
  const [promptTitle, setPromptTitle] = useState<string>(
    'Describe a memorable journey you went on. You should say: where you went, who you went with, what you did there, and explain why it was memorable.'
  );
  const [transcript, setTranscript] = useState<string>(
    `I would like to talk about a memorable trip to Da Lat that I took with my close friends last year. Da Lat is a charming city located in the Central Highlands of Vietnam, famous for its temperate climate and pine forests. 

We stayed at a cozy homestay and explored many famous landmarks like Xuan Huong Lake and the night market. What made this journey truly unforgettable was the breathtaking sunrise we watched together at Tuyen Lam Lake. The environment was peaceful and relaxing.`
  );

  // Audio Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(60);
  const [isPrepActive, setIsPrepActive] = useState<boolean>(false);

  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<any | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cue card prep timer effect
  useEffect(() => {
    if (!isPrepActive || prepTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setPrepTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPrepActive, prepTimeLeft]);

  const handleStartPrep = () => {
    setPrepTimeLeft(60);
    setIsPrepActive(true);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Không thể truy cập Microphone. Bạn vẫn có thể nhập transcript dạng văn bản bên dưới.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGradeSpeaking = async () => {
    if (!transcript.trim() || isGrading) return;
    setIsGrading(true);

    try {
      const res = await fetch('/api/grading/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          part,
          prompt_title: promptTitle,
          transcript
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
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Mic className="w-6 h-6 text-emerald-600" />
            AI Speaking Tutor & Evaluator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluates 4 official criteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation & Intonation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {['PART_1', 'PART_2', 'PART_3'].map((p) => (
            <button
              key={p}
              onClick={() => setPart(p as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                part === p ? 'btn-glossy-emerald font-extrabold text-white' : 'btn-glossy-dark font-medium text-slate-700'
              }`}
            >
              Speaking {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recording & Transcript */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Speaking Topic ({part})
              </label>
              <textarea
                rows={3}
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Cue Card Prep Timer for Part 2 */}
            {part === 'PART_2' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">1 Minute Cue Card Prep</p>
                    <p className="text-[11px] text-slate-500">Time remaining: <strong className="text-emerald-700 font-mono font-bold">{prepTimeLeft}s</strong></p>
                  </div>
                </div>
                <button
                  onClick={handleStartPrep}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  Start Timer
                </button>
              </div>
            )}

            {/* Audio Recorder Controls */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md transition cursor-pointer hover:scale-105"
                  >
                    <Mic className="w-7 h-7" />
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition cursor-pointer animate-pulse"
                  >
                    <Square className="w-6 h-6" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 font-bold">
                {isRecording ? 'Recording audio speech...' : 'Click Microphone icon to start recording'}
              </p>

              {recordedAudioUrl && (
                <div className="pt-2">
                  <audio controls src={recordedAudioUrl} className="w-full max-w-sm mx-auto h-8" />
                </div>
              )}
            </div>

            {/* Transcript Input / Edit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Speech Transcript (Auto-transcribed or paste manually)
              </label>
              <textarea
                rows={6}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={handleGradeSpeaking}
              disabled={isGrading || !transcript.trim()}
              className="w-full py-3.5 rounded-2xl btn-glossy-emerald font-black text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isGrading ? 'Đang phân tích Speaking...' : 'Chấm Bài Speaking Với AI'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Speaking Feedback */}
        <div className="space-y-6">
          {gradingResult ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-5 shadow-sm">
              {/* Overall Band */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div>
                  <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Overall Speaking Band</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                    Band {gradingResult.overall_band?.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 9.0</span>
                  </h2>
                </div>
              </div>

              {/* 4 Criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gradingResult.criteria?.map((crit: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{crit.name}</span>
                      <span className="text-sm font-black text-emerald-700">{crit.score?.toFixed(1)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{crit.comment}</p>
                  </div>
                ))}
              </div>

              {/* Pronunciation & Stress Errors */}
              {gradingResult.errors && gradingResult.errors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Pronunciation & Stress Correction
                  </h3>
                  <div className="space-y-2">
                    {gradingResult.errors.map((err: any, idx: number) => (
                      <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                        <p className="text-slate-800 font-medium">Issue: <span className="line-through text-rose-600">{err.original_text}</span> → <strong className="text-emerald-700 font-bold">{err.corrected_text}</strong></p>
                        <p className="text-slate-600 text-[11px]">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Suggestions */}
              {gradingResult.suggestions && gradingResult.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Collocation & Fluency Boosters
                  </h3>
                  <div className="space-y-2">
                    {gradingResult.suggestions.map((sug: any, idx: number) => (
                      <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <p className="text-slate-800 font-medium">
                          Original: <span className="text-slate-500 font-mono">"{sug.original_phrase}"</span> → <strong className="text-emerald-800 font-bold">"{sug.suggested_phrase}"</strong>
                        </p>
                        <p className="text-slate-600 text-[11px]">{sug.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-3 shadow-sm">
              <Mic className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Evaluation Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Record your speech or enter transcript on the left and click "Chấm Bài Speaking Với AI" for feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
