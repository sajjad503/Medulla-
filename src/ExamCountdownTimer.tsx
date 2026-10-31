import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertTriangle, CheckCircle2, Volume2, VolumeX, ShieldAlert, Clock } from 'lucide-react';

export interface ExamCountdownTimerProps {
  totalSeconds: number;
  isFinished: boolean;
  onTimeUp: () => void;
  onManualSubmit?: () => void;
  examTitle?: string;
  autoSubmitNoticeText?: string;
  sticky?: boolean;
}

export default function ExamCountdownTimer({
  totalSeconds,
  isFinished,
  onTimeUp,
  onManualSubmit,
  examTitle = 'آزمون جاری',
  autoSubmitNoticeText = 'زمان آزمون به پایان رسید! پاسخبرگ به صورت خودکار ثبت و قفل گردید.',
  sticky = false
}: ExamCountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasTriggeredAutoSubmit, setHasTriggeredAutoSubmit] = useState(false);
  const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
  const [isWarningActive, setIsWarningActive] = useState(false);

  // Sync if totalSeconds changes (e.g. new exam selected)
  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setHasTriggeredAutoSubmit(false);
    setShowAutoSubmitModal(false);
    setIsWarningActive(false);
  }, [totalSeconds]);

  // Audio warning sound via Web Audio API (zero external assets)
  const playChime = (type: 'warning' | 'timeup') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'warning') {
        // Double soft pip
        [0, 0.2].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now + offset); // D5
          gain.gain.setValueAtTime(0.12, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.15);
        });
      } else {
        // Triple urgent descent for time-up
        [0, 0.25, 0.5, 0.75].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const freqs = [659.25, 587.33, 523.25, 440];
          osc.frequency.setValueAtTime(freqs[idx] || 440, now + offset);
          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.22);
        });
      }
    } catch (_) {}
  };

  // Main countdown tick
  useEffect(() => {
    if (isFinished || hasTriggeredAutoSubmit) return;

    if (secondsLeft <= 0) {
      if (!hasTriggeredAutoSubmit) {
        setHasTriggeredAutoSubmit(true);
        setShowAutoSubmitModal(true);
        playChime('timeup');
        onTimeUp();
      }
      return;
    }

    // 1-minute warning chime
    if (secondsLeft === 60 && !isWarningActive) {
      setIsWarningActive(true);
      playChime('warning');
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, isFinished, hasTriggeredAutoSubmit, onTimeUp, soundEnabled, isWarningActive]);

  // Calculations for format & progress
  const progressPercent = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0;
  
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Urgency states
  const isUrgent = secondsLeft <= 60 && !isFinished;
  const isWarning = secondsLeft <= 180 && secondsLeft > 60 && !isFinished;

  const statusColor = isFinished
    ? 'var(--text-muted)'
    : isUrgent
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : '#10b981';

  const statusBg = isFinished
    ? 'rgba(107, 114, 128, 0.1)'
    : isUrgent
    ? 'rgba(239, 68, 68, 0.12)'
    : isWarning
    ? 'rgba(245, 158, 11, 0.12)'
    : 'rgba(16, 185, 129, 0.1)';

  // Circular progress math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: statusBg,
          border: `1.5px solid ${statusColor}`,
          padding: '8px 14px',
          borderRadius: '14px',
          transition: 'all 0.3s ease',
          boxShadow: isUrgent ? '0 0 16px rgba(239, 68, 68, 0.35)' : '0 2px 8px rgba(0,0,0,0.05)',
          animation: isUrgent ? 'pulse 1.5s infinite' : 'none',
          position: sticky ? 'sticky' : 'relative',
          top: sticky ? '10px' : 'auto',
          zIndex: sticky ? 40 : 'auto',
          direction: 'rtl'
        }}
      >
        {/* Progress Ring */}
        <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="var(--border-color)"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke={statusColor}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: statusColor
          }}>
            {isFinished ? (
              <CheckCircle2 size={20} />
            ) : isUrgent ? (
              <AlertTriangle size={20} className="spin-slow" />
            ) : (
              <Timer size={20} />
            )}
          </div>
        </div>

        {/* Text information */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '95px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            {isFinished ? 'آزمون به پایان رسید' : isUrgent ? '⚠️ زمان رو به اتمام' : 'زمان باقیمانده'}
          </span>
          <span
            className="mono-num"
            style={{
              fontSize: '22px',
              fontWeight: '900',
              color: statusColor,
              letterSpacing: '1px',
              lineHeight: 1.1,
              marginTop: '2px'
            }}
          >
            {formattedTime}
          </span>
        </div>

        {/* Audio Toggle & Quick Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: soundEnabled ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={soundEnabled ? 'هشدار صوتی فعال است' : 'هشدار صوتی غیرفعال است'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {!isFinished && onManualSubmit && (
            <button
              type="button"
              onClick={onManualSubmit}
              style={{
                background: 'var(--danger)',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              ثبت پاسخبرگ
            </button>
          )}
        </div>
      </div>

      {/* Auto-Submit Notification Modal (Zero window.alert) */}
      {showAutoSubmitModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(12, 29, 63, 0.85)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            direction: 'rtl',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '2px solid var(--gold)',
              borderRadius: '24px',
              padding: '35px 25px',
              maxWidth: '460px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '2px solid var(--danger)'
              }}
            >
              <Clock size={34} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)', margin: '0 0 10px 0' }}>
              ⏰ زمان آزمون به پایان رسید!
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.8, marginBottom: '25px' }}>
              {autoSubmitNoticeText}
            </p>

            <div
              style={{
                background: 'var(--bg-main)',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}
            >
              آزمون: <strong style={{ color: 'var(--primary)' }}>{examTitle}</strong>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>
                ✓ تمام پاسخ‌های شما با موفقیت ذخیره و در سیستم نمره‌دهی ثبت شدند.
              </div>
            </div>

            <button
              onClick={() => setShowAutoSubmitModal(false)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '12px',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              مشاهده کارنامه و نتایج آزمون
            </button>
          </div>
        </div>
      )}
    </>
  );
}
