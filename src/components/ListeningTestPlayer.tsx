import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, 
  Rewind, Radio, Eye, EyeOff, Headphones, Sparkles, Clock, Check,
  Upload, FileAudio, AlertCircle, RefreshCw, Search, Sliders, CheckCircle2
} from 'lucide-react';
import { AudioTranscriptLine } from '../types';

interface ListeningTestPlayerProps {
  sectionTitle: string;
  sectionNumber: number;
  testId?: string;
  sectionId?: string;
  audioUrl?: string;
  durationSeconds?: number;
  transcriptLines?: AudioTranscriptLine[];
  onTimeUpdate?: (currentTime: number) => void;
  onAudioUploaded?: (newAudioUrl: string) => void;
  isSimulationMode?: boolean;
  isSubmitted?: boolean;
  seekToTimestamp?: number | null;
}

export const ListeningTestPlayer: React.FC<ListeningTestPlayerProps> = ({
  sectionTitle,
  sectionNumber,
  testId,
  sectionId,
  audioUrl,
  durationSeconds = 360,
  transcriptLines = [],
  onTimeUpdate,
  onAudioUploaded,
  isSimulationMode = false,
  isSubmitted = false,
  seekToTimestamp = null,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(durationSeconds);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showScript, setShowScript] = useState<boolean>(isSubmitted);
  const [scriptSearchQuery, setScriptSearchQuery] = useState<string>('');
  const [audioSourceMode, setAudioSourceMode] = useState<'FILE' | 'TTS'>('FILE');
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(audioUrl || null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  const pauseAudio = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopAudio = () => {
    pauseAudio();
  };

  // Sync script visibility & stop audio immediately when test is submitted
  useEffect(() => {
    if (isSubmitted) {
      stopAudio();
      setShowScript(true);
    } else {
      setShowScript(false);
    }
  }, [isSubmitted]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (audioUrl) {
      setLocalAudioUrl(audioUrl);
      setAudioSourceMode('FILE');
    }
  }, [audioUrl]);

  useEffect(() => {
    if (durationSeconds) {
      setDuration(durationSeconds);
    }
  }, [durationSeconds]);

  // Handle external seek requests (e.g. user clicked a timestamp [01:40] in question explanation)
  useEffect(() => {
    if (seekToTimestamp !== null && seekToTimestamp !== undefined) {
      handleSeek(seekToTimestamp);
      if (!isPlaying) {
        startAudio();
      }
    }
  }, [seekToTimestamp]);

  // Initialize Speech Synthesis and Voices as fallback
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
  }, [sectionNumber, sectionId]);

  // Auto-scroll transcript to active line
  useEffect(() => {
    if (activeLineIndex >= 0 && transcriptContainerRef.current && showScript) {
      const activeElement = transcriptContainerRef.current.querySelector(`[data-line-index="${activeLineIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeLineIndex, showScript]);

  // Synchronize active transcript line with current time
  useEffect(() => {
    if (transcriptLines && transcriptLines.length > 0) {
      // Find the latest line whose timestamp <= currentTime
      let foundIndex = -1;
      for (let i = 0; i < transcriptLines.length; i++) {
        if (currentTime >= transcriptLines[i].seconds) {
          foundIndex = i;
        } else {
          break;
        }
      }
      setActiveLineIndex(foundIndex);
    }
    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }
  }, [currentTime, transcriptLines]);

  const getVoiceForSpeaker = (speaker?: string): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    const lower = (speaker || '').toLowerCase();
    if (lower.includes('peter') || lower.includes('eric')) {
      const maleVoice = pool.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('guy'));
      if (maleVoice) return maleVoice;
    } else if (lower.includes('mary') || lower.includes('harris') || lower.includes('cathy') || lower.includes('bella') || lower.includes('andrea') || lower.includes('speaker')) {
      const femaleVoice = pool.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('susan') || v.name.toLowerCase().includes('samantha'));
      if (femaleVoice) return femaleVoice;
    } else if (lower.includes('lecturer')) {
      const ukVoice = pool.find(v => v.lang === 'en-GB' || v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('british'));
      if (ukVoice) return ukVoice;
    }

    return pool.find(v => v.lang === 'en-GB') || pool[0] || null;
  };

  const playTTSLineAtIndex = (index: number, isManualSeek = false) => {
    if (!transcriptLines || index < 0 || index >= transcriptLines.length) {
      stopAudio();
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    const line = transcriptLines[index];
    setActiveLineIndex(index);
    if (isManualSeek) {
      setCurrentTime(line.seconds);
    }

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
          setTimeout(() => {
            if (isPlayingRef.current) {
              playTTSLineAtIndex(index + 1, false);
            }
          }, 350 / playbackSpeed);
        }
      };

      utter.onerror = (e: any) => {
        // Do not auto-advance if canceled or interrupted by pause/stop
        if (e?.error === 'canceled' || e?.error === 'interrupted') {
          return;
        }
        console.warn('Speech synth error:', e);
        if (isPlayingRef.current) {
          setTimeout(() => {
            if (isPlayingRef.current) {
              playTTSLineAtIndex(index + 1, false);
            }
          }, 400);
        }
      };

      utteranceRef.current = utter;
      synthRef.current.speak(utter);
    }
  };

  const startAudio = () => {
    setIsPlaying(true);
    isPlayingRef.current = true;

    if (localAudioUrl && audioRef.current && audioSourceMode === 'FILE') {
      audioRef.current.play().catch(err => {
        console.warn("Audio element play error, falling back to TTS:", err);
        setAudioSourceMode('TTS');
        startTTSAudio();
      });
      return;
    }

    startTTSAudio();
  };

  const startTTSAudio = () => {
    let targetIndex = 0;
    if (currentTime > 0 && transcriptLines.length > 0) {
      // Find line closest to current time
      for (let i = 0; i < transcriptLines.length; i++) {
        if (currentTime >= transcriptLines[i].seconds) {
          targetIndex = i;
        } else {
          break;
        }
      }
    }

    playTTSLineAtIndex(targetIndex, false);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 1;
        if (next >= duration) {
          stopAudio();
          return duration;
        }
        return next;
      });
    }, 1000 / playbackSpeed);
  };

  const isLockedForSimulation = isSimulationMode && !isSubmitted;

  const handleSeek = (newSeconds: number) => {
    if (isLockedForSimulation) return;
    const clamped = Math.max(0, Math.min(duration || durationSeconds, newSeconds));
    setCurrentTime(clamped);

    if (audioRef.current && audioSourceMode === 'FILE' && localAudioUrl) {
      audioRef.current.currentTime = clamped;
    } else if (transcriptLines.length > 0) {
      let target = 0;
      for (let i = 0; i < transcriptLines.length; i++) {
        if (clamped >= transcriptLines[i].seconds) {
          target = i;
        } else {
          break;
        }
      }
      setActiveLineIndex(target);
      if (isPlayingRef.current) {
        playTTSLineAtIndex(target, false);
      }
    }
  };

  const handleJump = (delta: number) => {
    if (isLockedForSimulation) return;
    const newTime = Math.max(0, Math.min(duration || durationSeconds, currentTime + delta));
    handleSeek(newTime);
  };

  const handleRestart = () => {
    if (isLockedForSimulation) return;
    handleSeek(0);
    if (!isPlaying) {
      startAudio();
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (isLockedForSimulation) return;
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    if (utteranceRef.current) {
      utteranceRef.current.rate = speed;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
    if (nextMute && synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleProcessFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i)) {
      setUploadErrorMsg('Vui lòng chọn file âm thanh định dạng MP3, WAV, M4A, AAC hoặc OGG.');
      setTimeout(() => setUploadErrorMsg(null), 4000);
      return;
    }

    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);

    // Instant local playback using URL.createObjectURL
    const localBlobUrl = URL.createObjectURL(file);
    setLocalAudioUrl(localBlobUrl);
    setAudioSourceMode('FILE');
    setCurrentTime(0);

    // If server IDs exist, also upload to server database
    if (testId && sectionId) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('audio', file);

        const res = await fetch(`/api/tests/${testId}/sections/${sectionId}/audio`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audio_url) {
            setLocalAudioUrl(data.audio_url);
            if (onAudioUploaded) onAudioUploaded(data.audio_url);
          }
          setUploadSuccessMsg(`Đã lưu file âm thanh gốc "${file.name}" làm mặc định cho Section ${sectionNumber}!`);
          setTimeout(() => setUploadSuccessMsg(null), 5000);
        } else {
          setUploadSuccessMsg(`Đã nạp file nghe "${file.name}" vào trình phát.`);
          setTimeout(() => setUploadSuccessMsg(null), 4000);
        }
      } catch (err: any) {
        console.warn("Upload to server failed, using local blob:", err);
        setUploadSuccessMsg(`Đã nạp file nghe "${file.name}" vào trình phát.`);
        setTimeout(() => setUploadSuccessMsg(null), 4000);
      } finally {
        setIsUploading(false);
      }
    } else {
      setUploadSuccessMsg(`Đã nạp file "${file.name}" vào trình phát.`);
      setTimeout(() => setUploadSuccessMsg(null), 4000);
    }
  };

  // Handle local audio file upload (MP3, WAV, M4A, OGG)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (localAudioUrl) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (localAudioUrl) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (localAudioUrl) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100));

  const filteredTranscript = transcriptLines.filter(line => {
    if (!scriptSearchQuery.trim()) return true;
    const query = scriptSearchQuery.toLowerCase();
    return line.text.toLowerCase().includes(query) || (line.speaker && line.speaker.toLowerCase().includes(query));
  });

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border transition duration-200 space-y-4 ${
        isDragOver ? 'border-emerald-400 bg-slate-850 ring-2 ring-emerald-400/50' : 'border-slate-800'
      }`}
    >
      {/* Visual Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-emerald-950/90 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-emerald-400 p-6 text-center animate-in fade-in duration-150 pointer-events-none">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-lg">
            <Upload className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white">Thả file audio MP3 vào đây</h4>
            <p className="text-xs text-emerald-200 mt-1">File sẽ được lưu làm audio gốc mặc định cho Section {sectionNumber}</p>
          </div>
        </div>
      )}
      {/* Hidden Native Audio Element */}
      {localAudioUrl && (
        <audio
          ref={audioRef}
          src={localAudioUrl}
          preload="auto"
          onTimeUpdate={(e) => {
            if (audioSourceMode === 'FILE') {
              const cur = (e.target as HTMLAudioElement).currentTime;
              setCurrentTime(cur);
            }
          }}
          onLoadedMetadata={(e) => {
            const audDur = (e.target as HTMLAudioElement).duration;
            if (audDur && !isNaN(audDur) && audDur > 0) {
              setDuration(audDur);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            isPlayingRef.current = false;
          }}
          onError={() => {
            console.warn("Audio playback error, falling back to TTS mode");
            setAudioSourceMode('TTS');
          }}
        />
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
        className="hidden"
      />

      {/* Top Header info & Upload actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Headphones className={`w-5 h-5 ${isPlaying ? 'animate-bounce text-emerald-300' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-mono tracking-wider shadow-xs">
                Section {sectionNumber} Audio Player
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {formatSecs(currentTime)} / {formatSecs(duration)}
              </span>
              {localAudioUrl ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  File Audio Sẵn Sàng
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-300 border border-teal-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  Giọng Đọc AI Hội Thoại
                </span>
              )}
            </div>
            <h4 className="text-sm font-extrabold text-white mt-0.5 truncate max-w-md">{sectionTitle}</h4>
          </div>
        </div>

        {/* Action Controls (Upload Audio & Script Toggle) */}
        <div className="flex items-center gap-2 flex-wrap">
          {!localAudioUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 shadow-2xs hover:border-emerald-500/50"
              title="Tải lên file âm thanh MP3/WAV/M4A cho section này"
            >
              {isUploading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isUploading ? 'Đang nạp file...' : 'Tải File Audio (MP3/WAV)'}</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/70 flex items-center gap-1.5 select-none shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audio Gốc Chuẩn</span>
            </div>
          )}

          {isSubmitted ? (
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
              <span>{showScript ? 'Ẩn Audio Script' : 'Hiện Script & Timestamp'}</span>
            </button>
          ) : (
            <div
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 text-slate-400 border border-slate-700/80 flex items-center gap-1.5 select-none"
              title="Script đang bị khóa trong lúc làm bài thi theo đúng quy chế IELTS. Nộp bài xong để mở khóa bản Script & Trích dẫn!"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              <span>Script mở sau khi nộp bài</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification message */}
      {uploadSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Test-taking Notice: Script & Audio locked in Simulation Mode */}
      {!isSubmitted && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2.5 shadow-inner">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-slate-200">Quy chế phòng thi IELTS Listening (Chế độ thi thật): </span>
            {isSimulationMode 
              ? 'Khóa toàn bộ tính năng tua bài, tua lùi, đổi tốc độ và xem script theo chuẩn phòng thi thực tế. Sau khi nộp bài, toàn bộ thanh điều khiển & Audio Script kèm timestamp sẽ tự động mở khóa.'
              : 'Bản Script hội thoại được ẩn trong suốt thời gian làm bài thi. Toàn bộ Audio Script kèm trích dẫn đáp án & timestamp sẽ tự động mở khóa sau khi bạn hoàn thành và nộp bài.'
            }
          </div>
        </div>
      )}

      {/* Waveform & Timeline Progress Slider */}
      <div className="space-y-2">
        <div className="relative flex items-center h-9 bg-slate-950/90 rounded-2xl px-3 border border-slate-800 overflow-hidden shadow-inner">
          {/* Animated live waveform bars */}
          <div className="absolute inset-0 flex items-center justify-around px-3 opacity-30 pointer-events-none">
            {Array.from({ length: 54 }).map((_, i) => {
              const isActive = (i / 54) * 100 <= progressPercent;
              const height = isPlaying 
                ? `${Math.max(18, Math.sin(i * 0.35 + currentTime * 2) * 82 + 18)}%` 
                : `${Math.max(18, Math.sin(i * 0.35) * 45 + 18)}%`;
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
            max={duration || durationSeconds}
            step={0.5}
            value={currentTime}
            disabled={isLockedForSimulation}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className={`w-full relative z-10 h-2 bg-slate-700/70 rounded-lg ${
              isLockedForSimulation 
                ? 'accent-slate-500 cursor-not-allowed opacity-60' 
                : 'accent-emerald-400 cursor-pointer'
            }`}
            title={isLockedForSimulation ? 'Không thể tua audio trong chế độ thi thật' : undefined}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span className="text-white font-bold">{formatSecs(currentTime)}</span>
          <span className="text-emerald-400 font-bold tracking-wide">
            {Math.round(progressPercent)}% • Section {sectionNumber}
          </span>
          <span>{formatSecs(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 shadow-md">
        {/* Left Playback Buttons */}
        <div className="flex items-center gap-2">
          {/* Restart */}
          {!isLockedForSimulation && (
            <button
              type="button"
              onClick={handleRestart}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
              title="Phát lại từ 00:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Rewind 5s */}
          {!isLockedForSimulation && (
            <button
              type="button"
              onClick={() => handleJump(-5)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer flex items-center gap-1 border border-slate-700 hover:border-slate-600"
              title="Lùi lại 5 giây"
            >
              <Rewind className="w-3.5 h-3.5" />
              <span>-5s</span>
            </button>
          )}

          {/* Play/Pause Main Button */}
          <button
            type="button"
            onClick={isPlaying ? pauseAudio : startAudio}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-98"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>TẠM DỪNG</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{currentTime > 0 ? 'TIẾP TỤC NGHE' : 'BẮT ĐẦU NGHE AUDIO'}</span>
              </>
            )}
          </button>

          {/* Fast forward 5s */}
          {!isLockedForSimulation && (
            <button
              type="button"
              onClick={() => handleJump(5)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer flex items-center gap-1 border border-slate-700 hover:border-slate-600"
              title="Tua tới 5 giây"
            >
              <span>+5s</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          )}

          {isLockedForSimulation && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Khóa tua (Chế độ thi thật)</span>
            </div>
          )}
        </div>

        {/* Right Controls: Speed & Volume */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Speed selector */}
          {!isLockedForSimulation ? (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <span className="text-slate-500 px-1 text-[10px]">Tốc độ:</span>
              {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => handleSpeedChange(spd)}
                  className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 font-bold">
              Tốc độ: 1.0x (Chuẩn)
            </div>
          )}

          {/* Volume Slider & Mute Toggle */}
          <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1 rounded-lg transition cursor-pointer ${
                isMuted ? 'text-rose-400' : 'text-slate-400 hover:text-white'
              }`}
              title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-16 h-1 accent-emerald-400 cursor-pointer bg-slate-700 rounded-lg"
              title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>
      </div>

      {/* Synchronized Transcript / Audio Script Viewer (Only displayed after submitting the test) */}
      {isSubmitted && showScript && transcriptLines && transcriptLines.length > 0 && (
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase text-xs text-emerald-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Audio Script Đồng Bộ (Bấm vào câu bất kỳ để nghe ngay)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({filteredTranscript.length}/{transcriptLines.length} câu)
              </span>
            </div>

            {/* Script Search Filter */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={scriptSearchQuery}
                onChange={(e) => setScriptSearchQuery(e.target.value)}
                placeholder="Tìm từ khóa trong script..."
                className="w-full bg-slate-900 border border-slate-800 text-[11px] text-white pl-7 pr-3 py-1 rounded-xl focus:outline-none focus:border-emerald-500/60 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div
            ref={transcriptContainerRef}
            className="space-y-1.5 text-xs max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700"
          >
            {filteredTranscript.map((line, idx) => {
              const originalIndex = transcriptLines.indexOf(line);
              const isCurrent = activeLineIndex === originalIndex;
              const speakerBadge = line.speaker ? (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                  line.speaker.toLowerCase().includes('narrator')
                    ? 'bg-slate-800 text-slate-300'
                    : line.speaker.toLowerCase().includes('mary') || line.speaker.toLowerCase().includes('harris')
                    ? 'bg-pink-950/80 text-pink-300 border border-pink-800/50'
                    : line.speaker.toLowerCase().includes('peter') || line.speaker.toLowerCase().includes('eric')
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-800/50'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                }`}>
                  {line.speaker}
                </span>
              ) : null;

              return (
                <div
                  key={idx}
                  data-line-index={originalIndex}
                  onClick={() => {
                    handleSeek(line.seconds);
                    if (!isPlaying) startAudio();
                  }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl transition cursor-pointer border ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-white font-medium shadow-sm scale-[1.005]'
                      : 'hover:bg-slate-900/90 border-transparent text-slate-300'
                  }`}
                >
                  <span className={`text-[10px] font-mono shrink-0 mt-0.5 w-10 font-bold ${isCurrent ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {line.time}
                  </span>
                  {speakerBadge}
                  <p className="flex-1 leading-relaxed text-xs">
                    {line.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
