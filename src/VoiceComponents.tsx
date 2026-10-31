import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, Mic, Square, RotateCcw, Send, Check, X, AlertCircle 
} from 'lucide-react';
import { 
  globalVoiceSynthesizer, 
  VoiceRecorderManager, 
  toPersianDigits, 
  formatDurationToPersian,
  VoiceRecordingResult
} from './voiceService';

// ==========================================
// 1. Sleek Toast Notification System
// ==========================================
let toastListener: ((msg: { text: string; type: 'success' | 'info' | 'error' } | null) => void) | null = null;

export function showVoiceToast(text: string, type: 'success' | 'info' | 'error' = 'success') {
  if (toastListener) {
    toastListener({ text, type });
    setTimeout(() => {
      if (toastListener) toastListener(null);
    }, 3800);
  }
}

export const VoiceToastContainer: React.FC = () => {
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    toastListener = setToast;
    return () => {
      toastListener = null;
    };
  }, []);

  if (!toast) return null;

  const bg = toast.type === 'success' 
    ? '#10B981' 
    : toast.type === 'error' 
      ? '#EF4444' 
      : '#0C1D3F';

  return (
    <div style={{
      position: 'fixed',
      bottom: '95px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: bg,
      color: '#FFFFFF',
      padding: '12px 22px',
      borderRadius: '50px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      fontWeight: 'bold',
      direction: 'rtl',
      animation: 'fadeIn 0.25s ease-out',
      maxWidth: '90vw'
    }}>
      {toast.type === 'success' && <Check size={18} />}
      {toast.type === 'error' && <AlertCircle size={18} />}
      {toast.type === 'info' && <Volume2 size={18} />}
      <span>{toast.text}</span>
    </div>
  );
};

// ==========================================
// 2. Universal Voice Player Component
// ==========================================
interface VoicePlayerProps {
  audioUrl?: string;
  durationSec?: number;
  label?: string;
  speechText?: string;
  compact?: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioUrl,
  durationSec = 25,
  label = 'ویس ضبط‌شده مشاور',
  speechText = 'تحلیل مشاور برای بررسی کارنامه و وضعیت درسی شما',
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // If audioUrl is an actual Blob or HTTP URL
  const isBlobOrHttp = audioUrl && (audioUrl.startsWith('blob:') || audioUrl.startsWith('http'));

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      globalVoiceSynthesizer.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (isBlobOrHttp && audioRef.current) {
        audioRef.current.pause();
      } else {
        globalVoiceSynthesizer.stop();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (isBlobOrHttp && audioRef.current) {
        audioRef.current.play().catch(() => {
          // Fallback if browser blocks media
          globalVoiceSynthesizer.playVoiceNote(speechText, durationSec, (prog, curSec) => {
            setProgress(prog);
            setCurrentTime(curSec);
          }, () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
          });
        });
      } else {
        globalVoiceSynthesizer.playVoiceNote(
          speechText,
          durationSec,
          (prog, curSec) => {
            setProgress(prog);
            setCurrentTime(curSec);
          },
          () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
          }
        );
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || durationSec;
      setCurrentTime(cur);
      setProgress((cur / dur) * 100);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    // In RTL, left is 0 to width, or calculate percentage
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * durationSec;
    setProgress(percent * 100);
    setCurrentTime(targetTime);
    if (isBlobOrHttp && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(230,194,135,0.15)', padding: '5px 12px', borderRadius: '50px', border: '1px solid var(--gold-dark)' }}>
        {isBlobOrHttp && (
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onTimeUpdate={handleAudioTimeUpdate} 
            onEnded={handleAudioEnded} 
          />
        )}
        <button
          onClick={handleTogglePlay}
          style={{ background: 'var(--navy-base)', color: '#E6C287', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          title={isPlaying ? 'توقف' : 'پخش'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginRight: '-1px' }} />}
        </button>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--navy-base)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Volume2 size={13} color="#C5A880" /> {label}
        </span>
        <span className="mono-num" style={{ fontSize: '11px' }}>
          {formatDurationToPersian(isPlaying ? currentTime : durationSec)}
        </span>
      </div>
    );
  }

  // Waveform bars simulation
  const waveformHeights = [25, 45, 80, 60, 95, 40, 70, 85, 50, 90, 65, 40, 80, 55, 30];

  return (
    <div style={{
      background: 'var(--bg-panel)',
      padding: '14px 18px',
      borderRadius: '14px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 4px 15px rgba(12, 29, 63, 0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flexWrap: 'wrap',
      direction: 'rtl'
    }}>
      {isBlobOrHttp && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onTimeUpdate={handleAudioTimeUpdate} 
          onEnded={handleAudioEnded} 
        />
      )}

      {/* Play / Pause Round Button */}
      <button
        onClick={handleTogglePlay}
        className="btn btn-primary"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          boxShadow: isPlaying ? '0 0 15px rgba(230,194,135,0.6)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginRight: '-2px' }} />}
      </button>

      {/* Track & Waveform */}
      <div style={{ flexGrow: 1, minWidth: '180px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 'bold' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={16} color="var(--gold-dark)" /> {label}
          </span>
          <span className="mono-num" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {formatDurationToPersian(currentTime)} / {formatDurationToPersian(durationSec)}
          </span>
        </div>

        {/* Dynamic Waveform Visualizer + Progress Scrubber */}
        <div 
          onClick={handleScrub}
          style={{ 
            height: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '3px', 
            cursor: 'pointer',
            padding: '2px 0'
          }}
          title="جهت جلو/عقب زدن ویس کلیک کنید"
        >
          {waveformHeights.map((h, i) => {
            const barPercent = (i / waveformHeights.length) * 100;
            const isFilled = progress >= barPercent;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: isPlaying ? `${Math.max(20, Math.min(100, h * (0.7 + Math.sin(Date.now() / 200 + i) * 0.3)))}%` : `${h}%`,
                  background: isFilled ? 'var(--gold-dark)' : 'var(--border-color)',
                  borderRadius: '3px',
                  transition: 'height 0.15s ease, background 0.2s ease'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. Interactive Voice Recorder Widget / Modal
// ==========================================
interface VoiceRecorderWidgetProps {
  studentName?: string;
  onSendVoice: (result: VoiceRecordingResult) => void;
  onCancel?: () => void;
  title?: string;
  placeholder?: string;
}

export const VoiceRecorderWidget: React.FC<VoiceRecorderWidgetProps> = ({
  studentName = 'دانش‌آموز',
  onSendVoice,
  onCancel,
  title = 'ضبط و ارسال ویس تحلیلی',
  placeholder = 'دکمه ضبط را بزنید و پیام صوتی خود را بیان کنید...'
}) => {
  const [recorderState, setRecorderState] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [recordSec, setRecordSec] = useState(0);
  const [recordedResult, setRecordedResult] = useState<VoiceRecordingResult | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewSec, setPreviewSec] = useState(0);

  const recorderRef = useRef<VoiceRecorderManager>(new VoiceRecorderManager());
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up
  useEffect(() => {
    return () => {
      globalVoiceSynthesizer.stop();
      if (previewAudioRef.current) previewAudioRef.current.pause();
    };
  }, []);

  const handleStartRecord = async () => {
    setRecorderState('recording');
    setRecordSec(0);
    setRecordedResult(null);

    await recorderRef.current.start(
      (sec) => setRecordSec(sec),
      () => {
        // Microphone access warning or simulation
        showVoiceToast('دسترسی میکروفون یا محیط شبیه‌ساز فعال است', 'info');
      }
    );
  };

  const handleStopRecord = async () => {
    const result = await recorderRef.current.stop();
    setRecordedResult(result);
    setRecorderState('preview');
  };

  const handleCancel = () => {
    if (recorderState === 'recording') {
      recorderRef.current.stop();
    }
    globalVoiceSynthesizer.stop();
    setRecorderState('idle');
    setRecordedResult(null);
    if (onCancel) onCancel();
  };

  const handleTogglePreviewPlay = () => {
    if (!recordedResult) return;

    if (isPlayingPreview) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      globalVoiceSynthesizer.stop();
      setIsPlayingPreview(false);
    } else {
      setIsPlayingPreview(true);
      if (recordedResult.blob && previewAudioRef.current) {
        previewAudioRef.current.play().catch(() => {
          globalVoiceSynthesizer.playVoiceNote('ویس ضبط شده مشاور', recordedResult.durationSec, (_, sec) => {
            setPreviewSec(sec);
          }, () => {
            setIsPlayingPreview(false);
            setPreviewSec(0);
          });
        });
      } else {
        globalVoiceSynthesizer.playVoiceNote('ویس ضبط شده مشاور', recordedResult.durationSec, (_, sec) => {
          setPreviewSec(sec);
        }, () => {
          setIsPlayingPreview(false);
          setPreviewSec(0);
        });
      }
    }
  };

  const handleSend = () => {
    if (!recordedResult) return;
    onSendVoice(recordedResult);
    showVoiceToast(`🎙️ ویس تحلیلی با موفقیت برای ${studentName} ارسال شد!`, 'success');
    setRecorderState('idle');
    setRecordedResult(null);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(12, 29, 63, 0.05) 0%, rgba(230, 194, 135, 0.15) 100%)',
      border: '1.5px solid var(--gold)',
      borderRadius: '16px',
      padding: '18px 20px',
      direction: 'rtl',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {recordedResult?.audioUrl && recordedResult.audioUrl.startsWith('blob:') && (
        <audio
          ref={previewAudioRef}
          src={recordedResult.audioUrl}
          onEnded={() => {
            setIsPlayingPreview(false);
            setPreviewSec(0);
          }}
          onTimeUpdate={() => {
            if (previewAudioRef.current) setPreviewSec(previewAudioRef.current.currentTime);
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic size={18} color="#C5A880" /> {title}
        </div>
        {onCancel && (
          <button onClick={handleCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'gray' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* State 1: Idle (Ready to record) */}
      {recorderState === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '15px 0' }}>
          <button
            onClick={handleStartRecord}
            className="gold-glow-btn"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: '0 8px 25px rgba(230,194,135,0.5)',
              cursor: 'pointer'
            }}
            title="شروع ضبط صدا"
          >
            <Mic size={28} />
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            {placeholder}
          </span>
        </div>
      )}

      {/* State 2: Recording (Live pulsing) */}
      {recorderState === 'recording' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#EF4444',
              boxShadow: '0 0 12px #EF4444',
              animation: 'pulse 1s infinite'
            }} />
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0C1D3F' }}>در حال ضبط صدا...</span>
            <span className="mono-num" style={{ fontSize: '16px', color: '#EF4444', fontWeight: '900' }}>
              {formatDurationToPersian(recordSec)}
            </span>
          </div>

          {/* Dynamic Audio Waves */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '36px', width: '100%', maxWidth: '280px', justifyContent: 'center' }}>
            {[40, 85, 60, 100, 75, 90, 45, 95, 65, 80, 50, 85, 70].map((h, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: `${Math.max(20, Math.min(100, h * (0.6 + Math.sin(recordSec * 3 + i) * 0.4)))}%`,
                  background: i % 2 === 0 ? '#C5A880' : '#0C1D3F',
                  borderRadius: '3px',
                  transition: 'height 0.15s ease'
                }}
              />
            ))}
          </div>

          <button
            onClick={handleStopRecord}
            style={{
              background: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '50px',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(239, 68, 68, 0.35)'
            }}
          >
            <Square size={16} /> اتمام و بررسی ویس
          </button>
        </div>
      )}

      {/* State 3: Preview & Send */}
      {recorderState === 'preview' && recordedResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{
            background: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleTogglePreviewPlay}
                style={{
                  background: '#0C1D3F',
                  color: '#E6C287',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isPlayingPreview ? <Pause size={16} /> : <Play size={16} style={{ marginRight: '-1px' }} />}
              </button>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0C1D3F' }}>پیش‌نمایش ویس ضبط‌شده</div>
                <div className="mono-num" style={{ fontSize: '11px', color: '#C5A880' }}>
                  مدت زمان: {recordedResult.formattedDuration}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartRecord}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="ضبط مجدد"
            >
              <RotateCcw size={13} /> ضبط مجدد
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSend}
              className="gold-glow-btn"
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <Send size={16} /> ارسال ویس به {studentName}
            </button>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: '#0C1D3F',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
