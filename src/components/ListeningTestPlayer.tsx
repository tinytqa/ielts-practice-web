import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, 
  Rewind, Radio, Eye, EyeOff, Headphones, Sparkles, Clock, Check
} from 'lucide-react';
import { AudioTranscriptLine } from '../types';

interface ListeningTestPlayerProps {
  sectionTitle: string;
  sectionNumber: number;
  durationSeconds?: number;
  transcriptLines?: AudioTranscriptLine[];
  onTimeUpdate?: (currentTime: number) => void;
  isSimulationMode?: boolean;
}

export const ListeningTestPlayer: React.FC<ListeningTestPlayerProps> = ({
  sectionTitle,
  sectionNumber,
  durationSeconds = 360,
  transcriptLines = [],
  onTimeUpdate,
  isSimulationMode = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showScript, setShowScript] = useState<boolean>(!isSimulationMode);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Initialize Speech Synthesis and Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        voicesRef.current = voices;
      };

      loadVoices();
      if (synthRef.current?.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    } else {
      setIsSpeechSupported(false);
    }

    return () => {
      stopAudio();
    };
  }, []);

  // Stop audio and reset state when section changes
  useEffect(() => {
    stopAudio();
    setCurrentTime(0);
    setActiveLineIndex(-1);
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [sectionNumber]);

  const getVoiceForSpeaker = (speaker?: string): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    const lower = (speaker || '').toLowerCase();
    if (lower.includes('peter') || lower.includes('eric')) {
      // Male voice preference
      const maleVoice = pool.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('guy'));
      if (maleVoice) return maleVoice;
    } else if (lower.includes('mary') || lower.includes('harris') || lower.includes('cathy') || lower.includes('bella') || lower.includes('andrea') || lower.includes('speaker')) {
      // Female voice preference
      const femaleVoice = pool.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('susan') || v.name.toLowerCase().includes('samantha'));
      if (femaleVoice) return femaleVoice;
    } else if (lower.includes('lecturer')) {
      // Academic / British voice preference
      const ukVoice = pool.find(v => v.lang === 'en-GB' || v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('british'));
      if (ukVoice) return ukVoice;
    }

    // Default to GB or US voice
    return pool.find(v => v.lang === 'en-GB') || pool[0] || null;
  };

  const playLineAtIndex = (index: number) => {
    if (!transcriptLines || index < 0 || index >= transcriptLines.length) {
      stopAudio();
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    const line = transcriptLines[index];
    setActiveLineIndex(index);
    setCurrentTime(line.seconds);
    if (onTimeUpdate) onTimeUpdate(line.seconds);

    if (synthRef.current && isSpeechSupported && !isMuted) {
      synthRef.current.cancel();

      const utter = new SpeechSynthesisUtterance(line.text);
      utter.rate = playbackSpeed;
      
      const speakerLower = (line.speaker || '').toLowerCase();
      if (speakerLower.includes('peter') || speakerLower.includes('eric')) {
        utter.pitch = 0.9;
      } else if (speakerLower.includes('mary') || speakerLower.includes('harris') || speakerLower.includes('speaker')) {
        utter.pitch = 1.15;
      } else if (speakerLower.includes('narrator')) {
        utter.pitch = 1.0;
      }

      const assignedVoice = getVoiceForSpeaker(line.speaker);
      if (assignedVoice) {
        utter.voice = assignedVoice;
      }

      utter.onend = () => {
        if (isPlayingRef.current) {
          // Add natural slight pause between speakers
          setTimeout(() => {
            if (isPlayingRef.current) {
              playLineAtIndex(index + 1);
            }
          }, 450 / playbackSpeed);
        }
      };

      utter.onerror = (e) => {
        console.warn('Speech synth error:', e);
        if (isPlayingRef.current) {
          setTimeout(() => {
            if (isPlayingRef.current) {
              playLineAtIndex(index + 1);
            }
          }, 500);
        }
      };

      utteranceRef.current = utter;
      synthRef.current.speak(utter);
    }
  };

  const startAudio = () => {
    setIsPlaying(true);
    isPlayingRef.current = true;

    // Find closest line index to current time
    let targetIndex = 0;
    if (currentTime > 0 && transcriptLines.length > 0) {
      const idx = transcriptLines.findIndex(l => l.seconds >= currentTime);
      targetIndex = idx > 0 ? idx - 1 : (idx === 0 ? 0 : transcriptLines.length - 1);
    }

    playLineAtIndex(targetIndex);

    // Timeline progress tick
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 1;
        if (next >= durationSeconds) {
          stopAudio();
          return durationSeconds;
        }
        return next;
      });
    }, 1000 / playbackSpeed);
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopAudio = () => {
    pauseAudio();
  };

  const handleSeek = (newSeconds: number) => {
    setCurrentTime(newSeconds);
    if (transcriptLines.length > 0) {
      const idx = transcriptLines.findIndex(l => l.seconds >= newSeconds);
      const target = idx > 0 ? idx - 1 : (idx === 0 ? 0 : transcriptLines.length - 1);
      setActiveLineIndex(target);
      if (isPlaying) {
        playLineAtIndex(target);
      }
    }
  };

  const handleJump = (delta: number) => {
    const newTime = Math.max(0, Math.min(durationSeconds, currentTime + delta));
    handleSeek(newTime);
  };

  const handleRestart = () => {
    handleSeek(0);
    if (!isPlaying) {
      startAudio();
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / (durationSeconds || 1)) * 100));

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-4">
      {/* Top Header info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Headphones className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-mono tracking-wider">
                Section {sectionNumber} Audio
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {formatSecs(currentTime)} / {formatSecs(durationSeconds)}
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-white mt-0.5">{sectionTitle}</h4>
          </div>
        </div>

        {/* Audio script visibility toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowScript(!showScript)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              showScript
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {showScript ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showScript ? 'Ẩn Audio Script' : 'Xem Audio Script & Trích dẫn'}</span>
          </button>
        </div>
      </div>

      {/* Waveform & Timeline Progress Slider */}
      <div className="space-y-2">
        <div className="relative flex items-center h-8 bg-slate-950/80 rounded-2xl px-3 border border-slate-800 overflow-hidden">
          {/* Animated live waveform bars */}
          <div className="absolute inset-0 flex items-center justify-around px-4 opacity-25 pointer-events-none">
            {Array.from({ length: 48 }).map((_, i) => {
              const isActive = (i / 48) * 100 <= progressPercent;
              const height = isPlaying 
                ? `${Math.max(20, Math.sin(i * 0.4 + currentTime) * 80 + 20)}%` 
                : `${Math.max(20, Math.sin(i * 0.4) * 50 + 20)}%`;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isActive ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                  style={{ height }}
                />
              );
            })}
          </div>

          <input
            type="range"
            min={0}
            max={durationSeconds}
            step={1}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full relative z-10 accent-emerald-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span>{formatSecs(currentTime)}</span>
          <span className="text-emerald-400 font-bold">{Math.round(progressPercent)}% Hoàn thành</span>
          <span>{formatSecs(durationSeconds)}</span>
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Phát lại từ đầu section"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Rewind 5s */}
          <button
            type="button"
            onClick={() => handleJump(-5)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer flex items-center gap-1"
            title="Lùi lại 5 giây"
          >
            <Rewind className="w-3.5 h-3.5" />
            <span>-5s</span>
          </button>

          {/* Play/Pause Main Button */}
          <button
            type="button"
            onClick={isPlaying ? pauseAudio : startAudio}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>TẠM DỪNG</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{currentTime > 0 ? 'TIẾP TỤC NGHE' : 'BẮT ĐẦU NGHE SECTION'}</span>
              </>
            )}
          </button>

          {/* Fast forward 5s */}
          <button
            type="button"
            onClick={() => handleJump(5)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer flex items-center gap-1"
            title="Tua tới 5 giây"
          >
            <span>+5s</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed & Volume */}
        <div className="flex items-center gap-3">
          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <span className="text-slate-500 px-1 text-[10px]">Tốc độ:</span>
            {[0.8, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => {
                  setPlaybackSpeed(spd);
                  if (utteranceRef.current) utteranceRef.current.rate = spd;
                }}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted && synthRef.current) {
                synthRef.current.cancel();
              }
            }}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Transcript Karaoke / Line-by-Line Viewer (Optional toggle) */}
      {showScript && transcriptLines && transcriptLines.length > 0 && (
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 max-h-64 overflow-y-auto pr-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
              Live Interactive Audio Script (Nhấp vào bất kỳ dòng nào để nghe ngay)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {transcriptLines.length} câu hội thoại
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {transcriptLines.map((line, idx) => {
              const isCurrent = activeLineIndex === idx;
              const speakerBadge = line.speaker ? (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                  line.speaker.toLowerCase().includes('narrator')
                    ? 'bg-slate-800 text-slate-300'
                    : line.speaker.toLowerCase().includes('mary') || line.speaker.toLowerCase().includes('harris')
                    ? 'bg-pink-900/60 text-pink-300 border border-pink-700/50'
                    : line.speaker.toLowerCase().includes('peter') || line.speaker.toLowerCase().includes('eric')
                    ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                    : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                }`}>
                  {line.speaker}
                </span>
              ) : null;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    handleSeek(line.seconds);
                    if (!isPlaying) startAudio();
                  }}
                  className={`flex items-start gap-2.5 p-2 rounded-xl transition cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-white font-medium shadow-xs'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 mt-0.5 w-9">
                    {line.time}
                  </span>
                  {speakerBadge}
                  <p className="flex-1 leading-relaxed">{line.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
